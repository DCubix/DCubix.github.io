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
	keyword: /(rdi|lda|add|stm|sub|jnz|jmp|out|mod|sys)/,
	variable: /AC|[\$\%\@](\->|\w)+(?!\w)|\${\w*}?/,
	op: /[\+\-\*\/=<>!]=?|[\(\)\{\}\[\]\.\|]/,
	label: /.*:/,
	other: /\S+/,
});
let decorator;
//

/// Screen
let SCREEN_WIDTH = 40;
let SCREEN_HEIGHT = 24;
let crtEffect = true;

// Setup rendering
let SCR = document.getElementById("screen");
let GL = SCR.getContext("webgl");
let BUF = document.createElement("canvas");
BUF.width = 256;
BUF.height = 256;
let bufCtx = BUF.getContext("2d");

GL.clearColor(0.0, 0.0, 0.0, 1.0);
GL.clear(GL.COLOR_BUFFER_BIT);

let plane = [
	0.0, 0.0,
	1.0, 0.0,
	1.0, 1.0,
	1.0, 1.0,
	0.0, 1.0,
	0.0, 0.0
];

let planeBuf = GL.createBuffer();
GL.bindBuffer(GL.ARRAY_BUFFER, planeBuf);
GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(plane), GL.STATIC_DRAW);
GL.bindBuffer(GL.ARRAY_BUFFER, null);

let screenTex = GL.createTexture();
GL.bindTexture(GL.TEXTURE_2D, screenTex);
GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
GL.pixelStorei(GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, BUF.width, BUF.height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
GL.generateMipmap(GL.TEXTURE_2D);
GL.bindTexture(GL.TEXTURE_2D, null);

let vCode = `precision highp float;
attribute vec2 vPos;
varying vec2 texCoord;
void main() {
	gl_Position = vec4(vPos * 2.0 - 1.0, 0.0, 1.0);
	texCoord = vPos;
}`;
let fCode = `precision mediump float;
uniform sampler2D tex;
uniform float crt;
varying vec2 texCoord;

void main() {
		float scale = 0.85;
		float iscale = 1.0 - scale;
	vec2 uv = texCoord * scale + (iscale * 0.5);
	// lens distortion coefficient (between
		float k = 0.2;
	// cubic distortion value
		float kcube = 0.6;
	float r2 = (uv.x-0.5)*(uv.x-0.5) + (uv.y-0.5)*(uv.y-0.5);
	float f = 0.0;

	if (kcube == 0.0) {
		f = 1.0 + r2 * k;
	} else {
		f = 1.0 + r2 * (k + kcube * sqrt(r2));
	}
	float x = f*(uv.x-0.5)+0.5;
	float y = f*(uv.y-0.5)+0.5;

	vec2 tuv = texCoord;
	if (crt >= 0.5) {
		tuv = vec2(x, y);
	}

	vec4 col = texture2D(tex, tuv);
	gl_FragColor = col;
}`;

let vs = GL.createShader(GL.VERTEX_SHADER);
GL.shaderSource(vs, vCode);
GL.compileShader(vs);

let fs = GL.createShader(GL.FRAGMENT_SHADER);
GL.shaderSource(fs, fCode);
GL.compileShader(fs);

let prog = GL.createProgram();
GL.attachShader(prog, vs);
GL.attachShader(prog, fs);
GL.linkProgram(prog);

let vPos = GL.getAttribLocation(prog, "vPos");
let tex = GL.getUniformLocation(prog, "tex");
let crt = GL.getUniformLocation(prog, "crt");
//

let SCREEN = new Array(SCREEN_HEIGHT);
let CX = 0, CY = 0, SX = 0, SY = 0;
let BLINK = false;

/// Input
let PROMPT_NORMAL = 1;
let PROMPT_PASSWORD = 2;
let PROMPT_X = 0;
let PROMPT = 0;
let PROMPT_TEXT = [];
let PROMPT_CALLBACK = null;
let CMD_HISTORY = [];
let HPTR = 0;

/// Assembler
let PROG = [];
let PROG_DATA = [];
let PROG_OUT = [];
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
}

let blinkTime = 0.0;
let lastTime = Date.now() / 1000.0;
let timeStep = 1.0 / 120;
function main() {
	let canRender = false;
	let current = Date.now() / 1000.0;
	let delta = current - lastTime;
	lastTime = current;

	while (delta >= 0) {
		let dt = Math.min(delta, timeStep);

		blinkTime += dt;
		if (blinkTime >= 0.5) {
			BLINK = !BLINK;
			blinkTime = 0.0;
		}

		canRender = true;
		delta -= timeStep;
	}

	if (canRender) {
		updateScreen();

		bufCtx.fillStyle = "#000";
		bufCtx.fillRect(0, 0, BUF.width, BUF.height);
		bufCtx.font = "10px Terminal, monospace";
		bufCtx.fillStyle = "#87bafd";
		bufCtx.imageSmoothingEnabled = false;

		let ox = 16;//27;
		let oy = 16;//23;
		let h = 9.45;
		let ty = h/2 + oy;
		for (let i = 0; i < SCREEN_HEIGHT; i++) {
			let txt = SCREEN[i];
			if (CY === i && BLINK) {
				txt = [txt.slice(0, CX), "_", txt.slice(CX)].join("");
			}
			bufCtx.fillText(txt, ox, ty);
			ty += h;
		}

		GL.viewport(0, 0, SCR.width, SCR.height);
		GL.clear(GL.COLOR_BUFFER_BIT);

		GL.activeTexture(GL.TEXTURE0);
		GL.bindTexture(GL.TEXTURE_2D, screenTex);

		GL.useProgram(prog);
		GL.uniform1i(tex, 0);
		GL.uniform1f(crt, crtEffect ? 1.0 : 0.0);

		GL.bindBuffer(GL.ARRAY_BUFFER, planeBuf);
		GL.enableVertexAttribArray(vPos);
		GL.vertexAttribPointer(vPos, 2, GL.FLOAT, false, 0, 0);

		GL.drawArrays(GL.TRIANGLES, 0, 6);

		GL.bindTexture(GL.TEXTURE_2D, null);
	}

	window.requestAnimationFrame(main);
}

function updateScreen() {
	GL.bindTexture(GL.TEXTURE_2D, screenTex);
	GL.texSubImage2D(GL.TEXTURE_2D, 0, 0, 0, GL.RGBA, GL.UNSIGNED_BYTE, BUF);
	GL.generateMipmap(GL.TEXTURE_2D);
	GL.bindTexture(GL.TEXTURE_2D, null);
}

function ledBlink(id) {
	let elem = document.getElementById(id);
	elem.style.backgroundPositionY = "-12px";
	setTimeout(function() {
		elem.style.backgroundPositionY = "0";
	}, 30);
}

function Reader(input) {
	this.input = input || [];

	this.peek = function() {
		if (this.input.length <= 0) return "\0";
		return this.input[0];
	};

	this.read = function() {
		if (this.input.length <= 0) return "\0";
		return this.input.shift();
	};

	this.read_while = function(cond) {
		let ret = [];
		while (this.input.length > 0 && cond(this.peek())) {
			ret.push(this.read());
		}
		return ret.join("");
	};
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
	_put: function(char, replace) {
		if (char === "\n" || char === "\r") {
			CX = 0;
			HV1._nextline();
		} else {
			if (CY > SCREEN_HEIGHT-1) {
				CY--;
			}
			if (replace) {
				SCREEN[CY] = SCREEN[CY].setCharAt(CX, char);
			} else {
				let txt = SCREEN[CY];
				txt = txt.insert(CX, char);
				SCREEN[CY] = txt;
			}
			CX++;
			HV1._cur();
		}
	},
	_backspace: function() {
		CX--;
		if (CX <= PROMPT_X) {
			CX = PROMPT_X;
		}
		SCREEN[CY] = SCREEN[CY].setCharAt(CX, " ");
		HPTR = 0;
		updateScreen();
	},
	print: function(msg, replace) {
		for (let c of msg) HV1._put(c, replace);
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
	cursor: function(x, y) {
		CX = x;
		CY = y;
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
	prog_help: function(args) {
		let cmd = args !== undefined && args.length > 0 ? args[0].toUpperCase() : "";

		if (cmd.length === 0) {
			HV1.println("┌──────────────────────────────────────┐");
			HV1.println("│  Commands                            │");
			HV1.println("└──────────────────────────────────────┘");
			HV1.println(" HELP:  Shows this message");
			HV1.println("   HELP HV1: HV1 Usage");
			HV1.println("   HELP ASM: ASM Cheat-Sheet");
			HV1.println(" LOAD:  Loads a program from disk");
			HV1.println(" LIST:  Lists the program source code");
			HV1.println(" STEP:  Steps the program");
			HV1.println(" RUN:   Executes the program");
			HV1.println(" MEM:   Shows the memory contents");
			HV1.println(" RESET: Resets the system");
			HV1.println(" CLEAR: Clears the screen");
			HV1.println(" CRT: Toggle CRT Effect");
		} else {
			if (cmd === "HV1") {
				HV1.println("┌──────────────────────────────────────┐");
				HV1.println("│  HV1 Usage                           │");
				HV1.println("└──────────────────────────────────────┘");
				HV1.println(" How to:");
				HV1.println(" 1. Click the Floppy Drive Button");
				HV1.println(" 2. Type in your program");
				HV1.println(" 3. In the console, type LOAD");
				HV1.println(" 4. And then RUN or STEP");
			} else if (cmd === "ASM") {
				HV1.println("┌──────────────────────────────────────┐");
				HV1.println("│  ASM Cheat-Sheet                     │");
				HV1.println("└──────────────────────────────────────┘");
				HV1.println(" rdi M: Reads user input into M");
				HV1.println(" out V: Outputs a value V");
				HV1.println(" lda V: Loads a value V into AC");
				HV1.println(" stm V: Stores a V into a memory. loc");
				HV1.println(" jmp T: Jumps to T");
				HV1.println(" jnz V T: Jumps to T if V is not zero");
				HV1.println(" add V: Adds a value V into AC");
				HV1.println(" sub V: Subtracts a value V from AC");
				HV1.println(" mod V: Modulo of AC with a value V");
				HV1.println(" sys SSPP: Exec. sys call S with arg P");
			} else {
				HV1.prog_help();
			}
		}
		updateScreen();
	},

	prog_load: function() {
		PROG_OUT = [];
		PROG = [];
		LABELS = {};
		PC = 0;
		AC = 0;
		MEM.fill(0);

		let code = DISK.value.split("");
		let rd = new Reader(code);

		let lnum = 0;
		let pos = 0;

		while (code.length > 0) {
			let c = rd.peek();
			if (/[a-zA-Z_\$:]/.test(c)) {
				let inst = rd.read_while(function(c) { return /[a-zA-Z_\$:0-9]/.test(c); });
				if (inst.endsWith(":")) {
					LABELS[inst.replace(":", "")] = pos;
				} else {
					PROG.push({ val: inst, ln: lnum }); pos++;
				}
			} else if (/[0-9]/.test(c)) {
				let num = rd.read_while(function(c) { return /[0-9xXa-fA-F]/.test(c); });
				PROG.push({ val: parseInt(num), ln: lnum }); pos++;
			} else if (c === "\n") {
				lnum++;
				rd.read();
			} else if (c === " ") {
				rd.read();
			} else if (c === ";") {
				while (rd.peek() !== "\n") {
					rd.read();
				}
			}
		}

		for (let line of DISK.value.split("\n")) {
			let ln = line.trim();
			PROG_DATA.push(ln);
		}
		console.log(PROG_DATA);

		HV1.println("Ok!");
		updateScreen();
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
		updateScreen();
	},

	prog_process: function(cmd) {
		let args = cmd.split(" ").map(function(v) { return v.trim(); });
		if (CMD_HISTORY.length >= 16) {
			CMD_HISTORY.shift();
		}
		if (cmd.trim().length > 0)
			CMD_HISTORY.push(cmd.trim());

		cmd = args[0].toUpperCase();
		args.shift();

		let reset = false;
		if (cmd.length > 0) {
			if (cmd === "HELP" || cmd === "?") {
				HV1.prog_help(args);
			} else if (cmd === "LOAD") {
				HV1.prog_load(args);
			} else if (cmd === "LIST") {
				HV1.prog_list(args);
			} else if (cmd === "RESET") {
				HV1.prog_reset(args);
				reset = true;
			} else if (cmd === "RUN") {
				reset = HV1.prog_run(args);
			} else if (cmd === "STEP") {
				reset = HV1.prog_step(true, false, args);
				if (PC >= PROG.length) {
					PC = 0;
					AC = 0;
					MEM.fill(0);
				}
			} else if (cmd === "CLEAR") {
				HV1.clear(args);
			} else if (cmd === "DIEGO" || cmd === "TWISTER") {
				HV1.println("Hello, I'm the creator! ☻");
			} else if (cmd === "CRT") {
				crtEffect = !crtEffect;
				updateScreen();
			} else if (cmd === "MEM") {
				HV1.prog_mem();
			} else {
				HV1.println("Invalid command \"" + cmd + "\"");
			}
		}
		if (!reset)	HV1.prompt(HV1.prog_process);
	},

	prog_reset: function(clr) {
		clr = clr === undefined ? true : clr;

		PC = 0;
		AC = 0;
		MEM.fill(0);
		PROMPT = 0;
		PROMPT_CALLBACK = null;
		PROMPT_X = 0;

		if (clr) {
			PROG_OUT = [];
			PROG = [];
			PROG_DATA = [];
			LABELS = {};
			HV1.clear();
			HV1.println("┌──────────────────────────────────────┐");
			HV1.println("│  HV-1 Computer System - v1.0         │");
			HV1.println("├──────────────────────────────────────┤");
			HV1.println("│  Type HELP or ? for a list           │");
			HV1.println("│  of commands.                        │");
			HV1.println("└──────────────────────────────────────┘");
		}
		HV1.prog_process("");
	},

	prog_step: function(pmt, hidemem) {
		if (PROG.length === 0) {
			HV1.println("No program loaded.");
			return false;
		}

		if (!hidemem) HV1.prog_mem();

		function read(addr) {
			if (addr[0] !== "$") {
				HV1.println("ERR(" + line() + "): Invalid address.");
				return 0xF;
			}
			addr = parseInt(addr.substring(1));
			if (addr > 0xF) {
				HV1.println("ERR(" + line() + "): Invalid address.");
				return 0xF;
			}
			ledBlink("mem");
			return parseInt(MEM[addr]);
		}
		function write(addr, v) {
			if (addr[0] !== "$") {
				HV1.println("ERR(" + line() + "): Invalid address.");
				return;
			}
			addr = parseInt(addr.substring(1));
			if (addr > 0xF) {
				HV1.println("ERR(" + line() + "): Invalid address.");
				return 0xF;
			}
			ledBlink("mem");
			MEM[addr] = v;
			if (MEM[addr] > 0xFFFF) {
				MEM[addr] = 0;
			} else if (MEM[addr] < 0) {
				MEM[addr] = 0xFFFF;
			}
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
						HV1.println("ERR(rdi): Expected a number.");
						if (pmt) HV1.prog_process("");
						return;
					}
					if (isNaN(tgt) && tgt[0] === "$") {
						write(tgt, parseInt(val));
					} else {
						HV1.println("ERR(" + line() + "): Expected a mem address.");
					}
					if (pmt) HV1.prog_process("");
				}, false, "P");
			},
			"out": function() { // Print
				let src = next();
				if (!isNaN(src)) src = parseInt(src);
				else if (src[0] === "$") src = read(src);
				else src = AC;
				PROG_OUT.push(src);
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
					AC = parseInt(from);
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
					AC += parseInt(from);
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
					AC -= parseInt(from);
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
			"jmp": function() { // Jumps
				let to = next();
				if (isNaN(to)) to = LABELS[to];
				else to = parseInt(to);
				PC = to;
				if (pmt) HV1.prog_process("");
			},
			"jnz": function() { // Jumps if value is not zero (jnz 0 loop, jnz AC lbl, jnz $2 lbl)
				let val = next();
				let to = next();
				if (isNaN(val)) {
					if (val === "AC") val = AC;
					else val = read(val);
				} else {
					val = parseInt(val);
				}

				if (isNaN(to)) to = LABELS[to];
				else to = parseInt(to);

				if (val !== 0) PC = to;
				if (pmt) HV1.prog_process("");
			},
			"mod": function() { // Calculates the modulo (rest of division) of a value between AC and X
				let x = next(); // And stores it in AC
				if (isNaN(x)) {
					if (x === "AC") x = AC;
					else x = read(x);
				} else {
					x = parseInt(x);
				}
				AC %= ~~x;
				if (pmt) HV1.prog_process("");
			},
			"sys": function() { // Perform a system call
				let call = next();
				if (isNaN(call)) {
					if (call == "AC") call = AC;
					else call = read(call);
				} else {
					call = parseInt(call);
				}

				// Command layout
				// 0xAABB
				// A = command
				// B = argument
				let cmd = (call & 0xFF00) >> 8;
				let arg = (call & 0x00FF);
				switch (cmd) {
					case 0x0: { // Clears the screen
						HV1.clear();
					} break;
					case 0x1: { // Put char
						HV1._put(String.fromCharCode(arg));
					} break;
					case 0x2: { // Set cursor X
						CX = arg;
					} break;
					case 0x3: { // Set cursor Y
						CY = arg;
					} break;
					case 0x4: { // Put char replace
						HV1._put(String.fromCharCode(arg), true);
					} break;
					default: HV1.println("ERR(" + line() + "): Unknown sys call."); break;
				}
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
		PROG_OUT = [];
		function run() {
			if (PC >= PROG.length && PROMPT === 0) {
				HV1.prog_reset(false);
				return;
			}
			if (PROMPT === 0) {
				HV1.prog_step(false, true);
			}
			setTimeout(run, 1);
		}

		run();
		return true;
	},

	prog_mem: function(infunc) {
		HV1.clear();
		HV1.cursor(0, 0);
		HV1.println("┌─────────────────────────┬────────────┐");
		HV1.println("│           PROG          │    MEM     │");
		HV1.println("├─────────────────────────┼────────────┤");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("│                         │            │");
		HV1.println("├─────────────────────────┤            │");
		HV1.println("│            AC           │            │");
		HV1.println("├─────────────────────────┤            │");
		HV1.println("│                         │            │");
		HV1.println("└─────────────────────────┴────────────┘");

		HV1.println("OUT> " + PROG_OUT.join(",").trim());

		// DRAW PROG
		let y = 3;
		if (PROG.length > 0) {
			let ln = PROG[PC].ln;
			let lni = (~~(ln / 12)) * 12;
			let len = PROG_DATA.length > 12 ? 12 : PROG_DATA.length;
			for (let i = lni; i < lni + len; i++) {
				let line;
				if (i >= PROG_DATA.length) line = "                     ";
				else line = PROG_DATA[i].trim();

				if (line.startsWith(";")) continue;
				HV1.cursor(2, y);
				let lns = line.substring(0, 22);
				if (!lns.endsWith(":")) lns = "  " + lns;
				HV1.print(lns, true);
				if (i === ln) {
					HV1.cursor(2, y);
					HV1._put(">", true);
				}
				y++;
			}
		}

		// DRAW MEM
		y = 3;
		for (let i = 0; i < MEM.length; i++) {
			HV1.cursor(28, y);
			HV1.print(i.toString(16).toUpperCase() + ": " + String("0000000" + MEM[i]).slice(-7), true);
			y++;
		}

		// DRAW AC
		HV1.cursor(2, 18);
		HV1.print("        " + String("0000000" + AC).slice(-7), true);

		HV1.cursor(0, 22);
		updateScreen();
	}
});

window.onkeydown = function(e) {
	if (document.activeElement !== SCR) return;

	if (e.key === "ArrowLeft" || e.which === "ArrowRight" ||
		e.key === "ArrowDown" ||
		e.key === "Tab" || e.key === "ContextMenu") {
		e.preventDefault();
	} else if (e.key === "ArrowUp") {
		e.preventDefault();
		if (CMD_HISTORY.length === 0) return;
		if (HPTR >= CMD_HISTORY.length) HPTR = 0;
		CX = 2;
		HV1.cursor(CX, CY);
		HV1.print("                                      ", true);
		CX = 2;
		HV1.cursor(CX, CY);
		let cmd = CMD_HISTORY[CMD_HISTORY.length - 1 - HPTR];
		PROMPT_TEXT = cmd.split("");
		HV1.print(cmd, true);
		HPTR++;
		updateScreen();
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
							HV1._put(c);
						else
							HV1._put("*");
						HPTR = 0;
					}
				} break;
			}
			updateScreen();
		}
	}
};

window.onkeyup = function(e) {
	if (document.activeElement !== SCR) return;

	if (PROMPT !== 0 && e.which === 13) {
		HV1._put("\n");
		updateScreen();
		PROMPT = 0;
		let txt = PROMPT_TEXT.join("");
		if (CMD_HISTORY.indexOf(txt) !== -1) {
			CMD_HISTORY.pop();
		}
		HPTR = 0;
		if (PROMPT_CALLBACK !== null) {
			PROMPT_CALLBACK(txt);
		}
	}
};

SCR.onclick = function() { SCR.focus(); };
SCR.focus();

/// Start
window.onload = function() {
	DISK.value =
`  ;; Print even values
  rdi $0
_check:
  lda $0
  mod 2
  jnz AC _sub
  out $0
_sub:
  lda $0
  sub 1
  stm $0
  jnz AC _check
  out $0`;
	decorator = new TextareaDecorator(DISK, parser);
	HV1.prog_reset();
	main();
};