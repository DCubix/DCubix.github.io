let DISK = document.getElementById("code");
let DISK_AREA = document.getElementById("floppy");
let CLOSE_CODE = document.getElementById("closeCode");
let CODE_AREA = document.getElementById("codeArea");
CODE_AREA.style.height = "0";
CODE_AREA.style.visibility = "hidden";

// UI logic
DISK_AREA.onclick = function() {
	setTimeout(function() {
		CODE_AREA.style.visibility = "visible";
		CODE_AREA.style.height = "300px";
	}, 2);
};

CLOSE_CODE.onclick = function() {
	CODE_AREA.style.height = "0";
	setTimeout(function() { CODE_AREA.style.visibility = "hidden"; }, 300);
};

// Syntax
let parser = new Parser({
	whitespace: /\s+/,
	comment: /;.*/,
	string: /"(\\.|[^"\r\n])*"?|'(\\.|[^'\r\n])*'?/,
	number: /0x[\dA-Fa-f]+|-?(\d+\.?\d*|\.\d+)/,
	keyword: /(rdi|lda|add|stm|sub|jnz|out)/,
	variable: /[\$\%\@](\->|\w)+(?!\w)|\${\w*}?/,
	op: /[\+\-\*\/=<>!]=?|[\(\)\{\}\[\]\.\|]/,
	other: /\S+/,
});
let decorator;
window.onload = function() {
	DISK.value =
`  rdi $0
  rdi $1
loop:
  lda $2
  add $1
  stm $2
  lda $0
  sub 1
  stm $0
  jnz $0 loop

  out $2`;
	decorator = new TextareaDecorator(DISK, parser);
}
//

/// Screen
let SCREEN_WIDTH = 40;
let SCREEN_HEIGHT = 24;

let SCR = document.getElementById("screen");
let SCREEN = new Array(SCREEN_HEIGHT);
let LINES = [];
let CX = 0, CY = 0;
let BLINK = false;

/// Input
let PROMPT_NORMAL = 1;
let PROMPT_PASSWORD = 2;
let PROMPT_X = 0;
let PROMPT = 0;
let PROMPT_TEXT = [];
let PROMPT_CALLBACK = null;

/// Assembler
let PROG = [];
let PROG_DATA = [];
let LABELS = {};
let PC = 0;
let AC = 0;
let MEM = new Array(16); MEM.fill(0);
///

String.prototype.setCharAt = function(index, chr) {
	if(index > this.length - 1) return this;
	return this.substr(0, index) + chr + this.substr(index + 1);
};

String.prototype.insert = function(index, chr) {
	if(index > this.length - 1) return this;
	return [this.slice(0, index), chr, this.slice(index)].join("");
};
String.prototype.remove = function(index) {
	if(index > this.length - 1) return this;
	return [this.slice(0, index), this.slice(index+1)].join("");
};

for (let i = 0; i < SCREEN_HEIGHT; i++) {
	SCREEN[i] = " ".repeat(SCREEN_WIDTH);
	let line = document.createElement("p");
	line.onclick = function() { SCR.focus(); };
	line.innerText = SCREEN[i];
	SCR.appendChild(line);
	LINES.push(line);
}

function updateScreen() {
	for (let i = 0; i < SCREEN_HEIGHT; i++) {
		let txt = SCREEN[i];
		if (CY === i && BLINK) {
			txt = [txt.slice(0, CX), "_", txt.slice(CX)].join("");
		}
		LINES[i].innerText = txt;
	}
}

function blink() {
	BLINK = !BLINK;
	updateScreen();
	setTimeout(blink, 500);
}
blink();

function ledBlink(id) {
	let elem = document.getElementById(id);
	elem.style.backgroundPositionY = "-12px";
	setTimeout(function() {
		elem.style.backgroundPositionY = "0";
	}, 40);
}

let HV1 = Object.freeze({
	clear: function() {
		CX = 0;
		CY = 0;
		for (let i = 0; i < SCREEN_HEIGHT; i++) {
			SCREEN[i] = " ".repeat(SCREEN_WIDTH);
		}
		updateScreen();
	},
	put: function(char) {
		if (char === "\n" || char === "\r") {
			CX = 0;
			HV1._nextline();
		} else {
			if (CY > SCREEN_HEIGHT-1) {
				CY--;
			}
			let txt = SCREEN[CY];
			txt = txt.insert(CX, char);
			SCREEN[CY] = txt;
			CX++;
			HV1._cur();
		}
		updateScreen();
	},
	_backspace: function() {
		CX--;
		if (CX <= PROMPT_X) {
			CX = PROMPT_X;
		}
		SCREEN[CY] = SCREEN[CY].setCharAt(CX, " ");
		updateScreen();
	},
	print: function(msg) {
		for (let c of msg) HV1.put(c);
	},
	println: function(msg) {
		HV1.print(msg + "\n");
	},
	prompt: function(onconfirm, password, tag) {
		tag = tag || "";
		onconfirm = onconfirm || null;
		PROMPT = password ? PROMPT_PASSWORD : PROMPT_NORMAL;
		HV1.print(tag+"> ");
		PROMPT_X = CX;
		PROMPT_TEXT = [];
		PROMPT_CALLBACK = onconfirm;
	},
	shift: function() {
		for (let y = 1; y < SCREEN_HEIGHT; y++) {
			SCREEN[y - 1] = SCREEN[y];
		}
		SCREEN[(SCREEN_HEIGHT-1)] = " ".repeat(SCREEN_WIDTH);
		updateScreen();
	},
	_cur: function() {
		if (CX > SCREEN_WIDTH) {
			CX = 0;
			HV1._nextline();
		}
	},
	_nextline: function() {
		if (CY >= SCREEN_HEIGHT-1) {
			HV1.shift();
			CY = SCREEN_HEIGHT-1;
		} else {
			CY++;
		}
	},

	// Builin programs
	prog_help: function() {
		HV1.println("╔══════════════════════════════════════╗");
		HV1.println("║  Commands                            ║");
		HV1.println("╚══════════════════════════════════════╝");
		HV1.println(" LOAD:  Loads a program from disk");
		HV1.println(" LIST:  Lists the program source code");
		HV1.println(" STEP:  Steps the program");
		HV1.println(" RUN:   Executes the program");
		HV1.println(" RESET: Resets the system");
		HV1.println(" CLEAR: Clears the screen");
	},

	prog_load: function() {
		PROG = [];
		LABELS = {};
		PC = 0;
		AC = 0;
		MEM.fill(0);

		let code = DISK.value.split("\n");
		let lnum = 0;
		let pos = 0;
		for (let line of code) {
			let ln = line.trim();
			PROG_DATA.push(ln);

			if (ln.length === 0) { lnum++; continue; }

			let toks = ln.split(" ");
			let inst = toks[0];

			if (inst.endsWith(":")) {
				LABELS[inst.replace(":", "")] = pos;
			} else {
				PROG.push({ val: inst, ln: lnum }); pos++;
			}

			if (toks.length > 1) {
				for (let i = 1; i < toks.length; i++) {
					if (isNaN(toks[i])) {
						PROG.push({ val: toks[i], ln: lnum }); pos++;
					} else {
						PROG.push({ val: Number(toks[i]), ln: lnum }); pos++;
					}
				}
			}
			lnum++;
		}

		HV1.println("Ok!");
	},

	prog_list: function() {
		if (PROG_DATA.length === 0) {
			HV1.println("Empty program.");
		} else {
			let lnum = 0;
			for (let ln of PROG_DATA) {
				if (ln.length === 0) { lnum++; continue; }
				if (!ln.endsWith(":")) ln = "  " + ln;
				let num = String("000" + lnum).slice(-3);
				HV1.println(num + ": " + ln);
				lnum++;
			}
		}
	},

	prog_process: function(cmd) {
		cmd = cmd.toUpperCase();
		let reset = false;
		if (cmd.length > 0) {
			if (cmd === "HELP" || cmd === "?") {
				HV1.prog_help();
			} else if (cmd === "LOAD") {
				HV1.prog_load();
			} else if (cmd === "LIST") {
				HV1.prog_list();
			} else if (cmd === "RESET") {
				HV1.prog_reset();
				reset = true;
			} else if (cmd === "RUN") {
				reset = HV1.prog_run();
			} else if (cmd === "STEP") {
				HV1.println("EXC: " + PROG_DATA[PROG[PC].ln]);
				reset = HV1.prog_step(true);
			} else if (cmd === "CLEAR") {
				HV1.clear();
			} else if (cmd === "DIEGO" || cmd === "TWISTER") {
				HV1.println("Hello, I'm the creator! ☻");
			} else {
				HV1.println("Invalid command \"" + cmd + "\"");
			}
		}
		if (!reset)	HV1.prompt(HV1.prog_process);
	},

	prog_reset: function(clr) {
		clr = clr === undefined ? true : clr;
		console.log(clr);

		PC = 0;
		AC = 0;
		MEM.fill(0);
		PROMPT = 0;
		PROMPT_CALLBACK = null;
		PROMPT_X = 0;

		if (clr) {
			PROG = [];
			PROG_DATA = [];
			LABELS = {};
			HV1.clear();
			HV1.println("╔══════════════════════════════════════╗");
			HV1.println("║  HV-1 Computer System - v1.0         ║");
			HV1.println("╠══════════════════════════════════════╣");
			HV1.println("║  Type HELP or ? for a list           ║");
			HV1.println("║  of commands.                        ║");
			HV1.println("╚══════════════════════════════════════╝");
		}
		HV1.prog_process("");
	},

	prog_step: function(pmt) {
		if (PROG.length === 0) {
			HV1.println("No program loaded.");
			return false;
		}

		function read(addr) {
			if (addr[0] !== "$") {
				HV1.println("ERR(" + line() + "): Invalid address.");
				return 0xF;
			}
			ledBlink("mem");
			return Number(MEM[addr.substring(1)]);
		}
		function write(addr, v) {
			if (addr[0] !== "$") {
				HV1.println("ERR(" + line() + "): Invalid address.");
				return;
			}
			ledBlink("mem");
			MEM[addr.substring(1)] = v;
		}
		function next() {
			return PROG[PC++].val;
		}
		function line() {
			return PROG[PC].ln;
		}

		let OPS = {
			"rdi": function() { // Read a value into a memory location
				let tgt = next();
				HV1.prompt(function(val) {
					if (isNaN(val)) {
						HV1.println("ERR(ler): Expected a number.");
						if (pmt) HV1.prog_process("");
						return;
					}
					if (isNaN(tgt) && tgt[0] === "$") {
						write(tgt, Number(val));
					} else {
						HV1.println("ERR(" + line() + "): Expected a mem address.");
					}
					if (pmt) HV1.prog_process("");
				}, false, "P");
			},
			"out": function() { // Print
				let src = next();
				if (!isNaN(src)) src = Number(src);
				else if (src[0] === "$") src = read(src);
				else src = AC;
				HV1.println(src);
				if (pmt) HV1.prog_process("");
			},
			"lda": function() { // Loads a value into AC (lda $0)
				let from = next();
				if (isNaN(from)) {
					if (from === "AC") HV1.println("ERR(" + line() + "): AC = AC?");
					else {
						AC = read(from);
					}
				} else {
					HV1.println("ERR(" + line() + "): Expected memory addr.");
				}
				if (pmt) HV1.prog_process("");
			},
			"add": function() { // Adds a value into AC (add 3)
				let from = next();
				if (isNaN(from)) {
					if (from === "AC") HV1.println("ERR(" + line() + "): AC = AC?");
					else {
						AC += read(from);
					}
				} else {
					AC += Number(from);
				}
				if (pmt) HV1.prog_process("");
			},
			"sub": function() { // Subtracts a value from AC (sub 3)
				let from = next();
				if (isNaN(from)) {
					if (from === "AC") HV1.println("ERR(" + line() + "): AC = AC?");
					else {
						AC -= read(from);
					}
				} else {
					AC -= Number(from);
				}
				if (pmt) HV1.prog_process("");
			},
			"stm": function() { // Stores the value of AC into MEM (stm $3)
				let to = next();
				if (isNaN(to)) {
					if (to === "AC") HV1.println("ERR(" + line() + "): AC = AC?");
					else {
						write(to, AC);
					}
				}
				if (pmt) HV1.prog_process("");
			},
			"jnz": function() { // Jumps if value is not zero (jnz 0 loop, jnz AC lbl, jnz $2 lbl)
				let val = next();
				let to = next();
				if (isNaN(val)) {
					if (val === "AC") val = AC;
					else val = read(val);
				} else {
					val = Number(val);
				}

				if (isNaN(to)) to = LABELS[to];
				else to = Number(to);

				if (val !== 0) PC = to;
				if (pmt) HV1.prog_process("");
			}
		};

		let op = next();
		OPS[op]();
		ledBlink("cpu");

		return true;
	},

	prog_run: function() {
		if (PROG.length === 0) {
			HV1.println("No program loaded.");
			return false;
		}
		function run() {
			if (PC >= PROG.length && PROMPT === 0) {
				HV1.prog_reset(false);
				return;
			}
			if (PROMPT === 0) {
				HV1.prog_step();
			}
			setTimeout(run, 32);
		}
		run();
		return true;
	}
});

window.onkeydown = function(e) {
	if (document.activeElement !== SCR) return;

	if (e.key === "ArrowLeft" || e.which === "ArrowRight" ||
		e.key === "ArrowUp" || e.key === "ArrowDown" ||
		e.key === "Tab" || e.key === "ContextMenu") {
		e.preventDefault()
	} else {
		if (PROMPT !== 0 && e.which !== 13) {
			BLINK = true;
			switch (e.which) {
				case 8: { // Backspace
					HV1._backspace();
					PROMPT_TEXT.splice(CX - PROMPT_X, 1);
				} break;
				default: {
					let c = e.key.trim();
					if (c.length === 0) c = " ";

					if (c.length === 1) {
						PROMPT_TEXT.splice(CX - PROMPT_X, 0, c);
						if (PROMPT !== PROMPT_PASSWORD)
							HV1.put(c);
						else
							HV1.put("*");
					}
				} break;
			}
		}
	}
};

window.onkeyup = function(e) {
	if (document.activeElement !== SCR) return;

	if (PROMPT !== 0 && e.which === 13) {
		HV1.put("\n");
		PROMPT = 0;
		let txt = PROMPT_TEXT.join("");
		if (PROMPT_CALLBACK !== null) {
			PROMPT_CALLBACK(txt);
		}
	}
};

SCR.onclick = function() { SCR.focus(); };
SCR.focus();

/// Tela de Inicio
HV1.prog_reset();