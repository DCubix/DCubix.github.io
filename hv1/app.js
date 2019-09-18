let editor = null;
window.onload = function() {
	CodeMirror.defineSimpleMode("hv1", {
		start: [
			{regex: /\;.*/, token: "comment"},
			{regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
			{regex: /\b(nop|halt|ldi|adm|ldm|stm|add|adm|sub|sbm|out|jmp|cmp|cmm|jne|jeq|jgt|jlt|jge|jle)\b/i, token: "keyword"},
			{regex: /(.*:)\b/, token: "variable"},
			{regex: /\$[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"}
		],
		comment: [
			{regex: /.*?\*\//, token: "comment", next: "start"},
			{regex: /.*/, token: "comment"}
		]
	});
	editor = CodeMirror.fromTextArea(document.getElementById("asm"), {
		lineNumbers: true,
		theme: "erlang-dark"
	});
};

String.prototype.format = function() {
	a = this;
	for (k in arguments) {
		a = a.replace("{" + k + "}", arguments[k])
	}
	return a
};

Array.prototype.insert = function ( index, item ) {
	this.splice( index, 0, item );
};

const sw = 255;
const sh = 240;
const cw = 6;
const ch = 8;
const cbw = ~~(sw / cw);
const cbh = ~~(sh / ch);
let Video = {
	_ctx: null,
	_bctx: null,
	_canvas: null,
	_buffer: null,
	_data: null,
	_font: [
		[0x00,0x00,0x00,0x00,0x00], //
		[0x2f,0x00,0x00,0x00,0x00], // !
		[0x03,0x00,0x03,0x00,0x00], // "
		[0x14,0x3e,0x14,0x3e,0x14], // #
		[0x2e,0x6a,0x2b,0x3a,0x00], // $
		[0x26,0x12,0x08,0x24,0x32], // %
		[0x1c,0x17,0x15,0x34,0x00], // &
		[0x03,0x00,0x00,0x00,0x00], // '
		[0x1e,0x21,0x00,0x00,0x00], // (
		[0x21,0x1e,0x00,0x00,0x00], // )
		[0x22,0x08,0x1c,0x08,0x22], // *
		[0x08,0x1c,0x08,0x00,0x00], // +
		[0x40,0x20,0x00,0x00,0x00], // ,
		[0x08,0x08,0x00,0x00,0x00], // -
		[0x20,0x00,0x00,0x00,0x00], // .
		[0x20,0x10,0x08,0x04,0x02], // /
		[0x3f,0x21,0x21,0x3f,0x00], // 0
		[0x01,0x3f,0x00,0x00,0x00], // 1
		[0x3d,0x25,0x25,0x27,0x00], // 2
		[0x25,0x25,0x25,0x3f,0x00], // 3
		[0x07,0x04,0x04,0x3f,0x00], // 4
		[0x27,0x25,0x25,0x3d,0x00], // 5
		[0x3f,0x25,0x25,0x3d,0x00], // 6
		[0x01,0x39,0x05,0x03,0x00], // 7
		[0x3f,0x25,0x25,0x3f,0x00], // 8
		[0x27,0x25,0x25,0x3f,0x00], // 9
		[0x28,0x00,0x00,0x00,0x00], // :
		[0x40,0x28,0x00,0x00,0x00], // ;
		[0x04,0x0a,0x11,0x00,0x00], // <
		[0x14,0x14,0x00,0x00,0x00], // =
		[0x11,0x0a,0x04,0x00,0x00], // >
		[0x01,0x2d,0x05,0x07,0x00], // ?
		[0x3f,0x21,0x3d,0x25,0x1f], // @
		[0x3f,0x09,0x09,0x3f,0x00], // A
		[0x3f,0x25,0x27,0x3c,0x00], // B
		[0x3f,0x21,0x21,0x21,0x00], // C
		[0x3f,0x21,0x21,0x1e,0x00], // D
		[0x3f,0x25,0x25,0x25,0x00], // E
		[0x3f,0x05,0x05,0x05,0x00], // F
		[0x3f,0x21,0x25,0x3d,0x00], // G
		[0x3f,0x04,0x04,0x3f,0x00], // H
		[0x21,0x3f,0x21,0x00,0x00], // I
		[0x38,0x20,0x21,0x3f,0x01], // J
		[0x3f,0x04,0x04,0x3b,0x00], // K
		[0x3f,0x20,0x20,0x20,0x00], // L
		[0x3f,0x01,0x3f,0x01,0x3f], // M
		[0x3f,0x02,0x04,0x3f,0x00], // N
		[0x3f,0x21,0x21,0x3f,0x00], // O
		[0x3f,0x09,0x09,0x0f,0x00], // P
		[0x3f,0x21,0x31,0x3f,0x00], // Q
		[0x3f,0x09,0x39,0x2f,0x00], // R
		[0x27,0x25,0x25,0x3d,0x00], // S
		[0x01,0x01,0x3f,0x01,0x01], // T
		[0x3f,0x20,0x20,0x3f,0x00], // U
		[0x0f,0x10,0x30,0x1f,0x00], // V
		[0x3f,0x20,0x3f,0x20,0x3f], // W
		[0x3b,0x04,0x04,0x3b,0x00], // X
		[0x0f,0x08,0x38,0x0f,0x00], // Y
		[0x31,0x29,0x25,0x23,0x00], // Z
		[0x3f,0x21,0x00,0x00,0x00], // [
		[0x20,0x10,0x08,0x04,0x02], // "\"
		[0x21,0x3f,0x00,0x00,0x00], // ]
		[0x02,0x01,0x01,0x02,0x00], // ^
		[0x20,0x20,0x00,0x00,0x00], // _
		[0x01,0x02,0x00,0x00,0x00], // `
		[0x38,0x24,0x24,0x3c,0x00], // a
		[0x3f,0x24,0x24,0x3c,0x00], // b
		[0x3c,0x24,0x24,0x24,0x00], // c
		[0x3c,0x24,0x24,0x3f,0x00], // d
		[0x3c,0x2c,0x2c,0x2c,0x00], // e
		[0x04,0x3f,0x05,0x00,0x00], // f
		[0xbc,0xa4,0xa4,0xfc,0x00], // g
		[0x3f,0x04,0x04,0x3c,0x00], // h
		[0x3d,0x00,0x00,0x00,0x00], // i
		[0x80,0xfd,0x00,0x00,0x00], // j
		[0x3f,0x08,0x08,0x34,0x00], // k
		[0x3f,0x00,0x00,0x00,0x00], // l
		[0x3c,0x04,0x3c,0x04,0x3c], // m
		[0x3c,0x04,0x04,0x3c,0x00], // n
		[0x3c,0x24,0x24,0x3c,0x00], // o
		[0xfc,0x24,0x24,0x3c,0x00], // p
		[0x3c,0x24,0x24,0xfc,0x00], // q
		[0x3c,0x08,0x04,0x00,0x00], // r
		[0x2c,0x2c,0x2c,0x3c,0x00], // s
		[0x04,0x3f,0x24,0x00,0x00], // t
		[0x3c,0x20,0x20,0x3c,0x00], // u
		[0x0c,0x10,0x30,0x1c,0x00], // v
		[0x3c,0x20,0x3c,0x20,0x3c], // w
		[0x34,0x08,0x08,0x34,0x00], // x
		[0xbc,0xa0,0xa0,0xfc,0x00], // y
		[0x24,0x34,0x2c,0x24,0x00], // z
		[0x04,0x3f,0x21,0x00,0x00], // [
		[0x3f,0x00,0x00,0x00,0x00], // |
		[0x21,0x3f,0x04,0x00,0x00], // ]
		[0x01,0x02,0x02,0x01,0x00], // ~
		[0xFF,0xFF,0xFF,0xFF,0xFF]
	],

	_charBuffer: null,
	_cursor: [0, 0],
	_blink: false,

	init: function() {
		Video._canvas = document.getElementById("buffer");
		Video._canvas.width = sw * 2;
		Video._canvas.height = sh * 2;
		Video._ctx = Video._canvas.getContext("2d");
		Video._ctx.imageSmoothingEnabled = false;
		Video._buffer = document.createElement("canvas");
		Video._buffer.width = sw;
		Video._buffer.height = sh;
		Video._bctx = Video._buffer.getContext("2d");
		Video._data = Video._bctx.getImageData(0, 0, sw, sh);

		Video.clear(0);
		Video._canvas.focus();

		setInterval(function() {
			Video._blink = !Video._blink;
			let x = Video._cursor[0] * cw;
			let y = Video._cursor[1] * ch;
			Video._clear(0);
			const b = 0b10000000
			if (Video._blink)
				Video.chrData(x, y, [b, b, b, b, b], 255);
			Video.flip();
		}, 250);
	},
	put: function(x, y, val) {
		if (x < 0 || x >= sw || y < 0 || y >= sh) return;
		let i = (x + y * sw) * 4;

		Video._data.data[i + 0] = val;
		Video._data.data[i + 1] = val;
		Video._data.data[i + 2] = val;
		Video._data.data[i + 3] = 255;
	},
	chrData: function(x, y, chr, v) {
		for (let j = 0; j < cw; j++) {
			for (let i = 0; i < ch; i++) {
				if (chr[j] & (1 << i)) {
					Video.put(x + j, y + i, v || 255);
				}
			}
		}
		return x + cw;
	},
	chr: function(x, y, chrCode) {
		let c = chrCode.charCodeAt(0) & 0x7F;
		if (c < 32) c = 0;
		else c -= 32;

		let chr = Video._font[c];
		return Video.chrData(x, y, chr);
	},
	clear: function(v) {
		Video.cursor(0, 0);
		Video._charBuffer = new Array(cbh);
		for (let i = 0; i < Video._charBuffer.length; i++) {
			Video._charBuffer[i] = new Array(cbw);
			for (let j = 0; j < Video._charBuffer[i].length; j++) {
				Video._charBuffer[i][j] = " ";
			}
		}
		Video._clear(v);
	},
	_clear: function(v) {
		v = v || 0;
		for (let y = 0; y < sh; y++) {
			for (let x = 0; x < sw; x++) {
				Video.put(x, y, v);
			}
		}
		Video.flip();
	},
	_flipBuffer: function() {
		for (let y = 0; y < cbh; y++) {
			for (let x = 0; x < cbw; x++) {
				let chr = Video._charBuffer[y][x];
				if (chr === " ") continue;
				Video.chr(x * cw, y * ch, chr);
			}
		}
	},
	flip: function() {
		Video._flipBuffer();
		Video._bctx.fillStyle = "#000";
		Video._bctx.fillRect(0, 0, sw, sh);
		Video._bctx.putImageData(Video._data, 0, 0);
		Video._ctx.drawImage(Video._buffer, 0, 0, sw * 2, sh * 2);
	},

	/**
	 * @param {string} c
	 */
	putc: function(c) {
		if (!c) return;
		if (c === "\n") {
			Video._cursor[0] = 0;
			Video._cursor[1]++;
		} else if (c === "\t") {
			Video._cursor[0] += 2;
		} else {
			let code = c.charCodeAt(0);
			code &= 0x7F;
			c = String.fromCharCode(code);
			Video._charBuffer[Video._cursor[1]][Video._cursor[0]] = c;
			Video.chr(Video._cursor[0] * cw, Video._cursor[1] * ch, c);
			Video._cursor[0]++;
		}
		Video._fixCursor();
	},

	unput: function() {
		Video._cursor[0]--;
		Video._charBuffer[Video._cursor[1]][Video._cursor[0]] = " ";
		Video._fixCursor();
	},

	/**
	 * @param {string} text
	 */
	print: function(text) {
		for (let i = 0; i < text.length; i++) {
			let chr = text.charAt(i);
			Video.putc(chr);
		}
	},

	/**
	 * @param {string} text
	 */
	println: function(text) {
		Video.print(text + "\n");
	},

	cursor: function(x, y) {
		Video._cursor[0] = x;
		Video._cursor[1] = y;
	},

	_fixCursor: function() {
		if (Video._cursor[0] >= cbw) {
			Video._cursor[0] = 0;
			Video._cursor[1]++;
		} else if (Video._cursor[0] < 0) {
			Video._cursor[0] = 0;
		}

		if (Video._cursor[1] >= cbh) {
			Video._charBuffer.shift();

			Video._charBuffer.push(new Array(cbw));
			for (let x = 0; x < cbw; x++) {
				Video._charBuffer[Video._charBuffer.length - 1][x] = " ";
			}

			Video._cursor[1]--;
		}
		Video._clear(0);
		Video.flip();
	}
};
Video.init();

let RAM = {
	_data: [],
	init: function() {
		RAM._data = new Array(1024 * 16);
		for (let i = 0; i < RAM._data.length; i++) RAM._data[i] = ~~(Math.random() * 255);
	},
	read: function(addr) {
		addr = addr || 0;
		addr = addr % RAM._data.length;
		return RAM._data[addr];
	},
	write: function(addr, v) {
		addr = addr || 0;
		addr = addr % RAM._data.length;
		v = v || 0;
		v = v % 0xFF;
		RAM._data[addr] = v;
	},
	load: function(offset, program) {
		program = program || [];
		offset = offset || 0;

		if (program.length + offset >= RAM._data.length) return;

		for (let i = 0; i < program.length; i++) {
			RAM.write(i + offset, program[i]);
		}
		RAM.write(program.length + offset, 0);
	},
	clear: function() {
		for (let i = 0; i < RAM._data.length; i++) {
			RAM.write(i, ~~(Math.random() * 255));
		}
	}
};
RAM.init();

let CPU = {
	accum: 0,
	callStack: [],
	pc: 0,
	_cmp: 0,
	_wait: 0,
	_interrupted: false,
	_interruptDest: 0,
	_running: false,
	_ops: [
		// NOP
		{ name: "nop", cycles: 1, run: function() {} },
		// HALT
		{ name: "halt", cycles: 1, run: function() { CPU._running = false; } },
		// SYS code. (system call)
		{ name: "sys", cycles: 2, run: function() {
			let code = CPU.fetch();
			if (code === 0) { // CLEAR
				Video.clear(0);
			}
		}},

		// LDI imm (A = imm)
		{ name: "ldi", cycles: 2, run: function() {
			CPU.accum = CPU.fetch();
		}},

		// LDM loc (A = mem[loc])
		{ name: "ldm", cycles: 2, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			CPU.accum = RAM.read(mem);
		}},

		// STM loc (mem[loc] = A)
		{ name: "stm", cycles: 2, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			RAM.write(mem, CPU.accum);
		}},

		// ADD imm (A += imm)
		{ name: "add", cycles: 1, run: function() {
			CPU.accum += CPU.fetch();
			CPU.accum &= 0xFF;
		}},

		// ADM loc (A += mem[loc])
		{ name: "adm", cycles: 2, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			CPU.accum += RAM.read(mem);
			CPU.accum &= 0xFF;
		}},

		// SUB rD loc (rD += rS)
		{ name: "sub", cycles: 1, run: function() {
			CPU.accum -= CPU.fetch();
			CPU.accum &= 0xFF;
		}},

		// SBM loc (A -= mem[loc])
		{ name: "sbm", cycles: 2, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			CPU.accum -= RAM.read(mem);
			CPU.accum &= 0xFF;
		}},

		// OUT
		{ name: "out", cycles: 1, run: function() {
			Video.println(CPU.accum);
			Video.flip();
		}},

		// JMP loc
		{ name: "jmp", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			CPU.pc = mem;
		}},

		// CMP imm
		{ name: "cmp", cycles: 1, run: function() {
			let imm = CPU.fetch();
			if (CPU.accum === imm) CPU._cmp = 1;
			else if (CPU.accum > imm) CPU._cmp = 2;
			else if (CPU.accum < imm) CPU._cmp = 3;
		}},

		// CMM loc
		{ name: "cmm", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			let imm = RAM.read(mem);
			if (CPU.accum === imm) CPU._cmp = 1;
			else if (CPU.accum > imm) CPU._cmp = 2;
			else if (CPU.accum < imm) CPU._cmp = 3;
		}},

		// JEQ loc
		{ name: "jeq", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			if (CPU._cmp === 1) CPU.pc = mem;
		}},

		// JNE loc
		{ name: "jne", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			if (CPU._cmp !== 1) CPU.pc = mem;
		}},

		// JGT loc
		{ name: "jgt", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			if (CPU._cmp === 2) CPU.pc = mem;
		}},

		// JLT loc
		{ name: "jlt", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			if (CPU._cmp === 3) CPU.pc = mem;
		}},

		// JGE loc
		{ name: "jge", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			if (CPU._cmp === 2 || CPU._cmp === 1) CPU.pc = mem;
		}},

		// JLE loc
		{ name: "jle", cycles: 1, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			if (CPU._cmp === 3 || CPU._cmp === 1) CPU.pc = mem;
		}},

		// CALL loc
		{ name: "call", cycles: 2, run: function() {
			let mem = ((CPU.fetch() & 0xFF) << 8) | (CPU.fetch() & 0xFF);
			CPU.callStack.push(CPU.pc);
			CPU.pc = mem;
		}},

		// RET
		{ name: "ret", cycles: 2, run: function() {
			CPU.pc = CPU.callStack.pop();
		}},
	],
	fetch: function() {
		if (CPU.pc >= RAM._data.length) return 1;
		return RAM.read(CPU.pc++);
	},
	tick: function() {
		if (CPU._interrupted) {
			return;
		}

		if (CPU._wait > 0) {
			CPU._wait--;
		} else {
			let code = CPU.fetch();
			let op = CPU._ops[code];

			if (op === undefined || op === null) {
				CPU._running = false;
			} else {
				console.log(op.name);
				CPU._wait = op.cycles;
				let c = op.run();
				if (c) CPU._wait += c;
			}
		}
	},
	reset: function() {
		CPU.pc = 0;
		CPU.accum = 0;
		CPU.callStack = [];
		CPU._interrupted = false;
		CPU._wait = 0;
		CPU._running = false;
	},
	start: function() {
		CPU._running = true;
		let intv = setInterval(function() {
			if (!CPU._running) {
				clearInterval(intv);
				return;
			}
			CPU.tick();
		}, 2);
	}
};

function Reader(code) {
	this.src = code.split("");
	this.valid = function() { return this.src.length > 0; };
	this.peek = function() { return this.src[0]; };
	this.get = function() { return this.src.shift(); };

	/**
	 * @param {RegExp} rgx
	 */
	this.scan = function(rgx) {
		let str = "";
		while (rgx.test(this.peek()) && this.valid()) {
			str += this.get();
		}
		return str;
	};
	this.number = function() {
		let str = this.scan(/[\$0-9a-fA-F]/);
		let val = parseInt(str.startsWith("$") ? "0x" + str.substring(1) : str);
		return [str.startsWith("$"), val];
	};
	this.identifier = function() {
		return this.scan(/[a-zA-Z_0-9:]/);
	};
}

let Assembler = {
	assemble: function(code) {
		let sc = new Reader(code);
		let labels = {};
		let program = [];
		let pos = 0;
		while (sc.valid()) {
			if (sc.peek() === ";") {
				while (sc.peek() !== "\n") sc.get();
			} else if (/[a-zA-Z_]/.test(sc.peek())) { // id
				let str = sc.identifier();

				let opCode = -1;
				for (let i = 0; i < CPU._ops.length; i++) {
					if (CPU._ops[i].name.toLowerCase() === str.toLowerCase()) {
						opCode = i;
						break;
					}
				}

				if (opCode !== -1) {
					program.push(opCode);
					pos++;
				} else if (str.endsWith(":")) {
					let lbl = str.substring(0, str.length-1).trim();
					labels[lbl] = pos;
				} else {
					pos += 2;
					program.push(str.trim());
					program.push(str.trim());
				}
			} else if (/[\$0-9]/.test(sc.peek())) { // addr
				let num = sc.number();
				while (sc.peek() === "+" || sc.peek() === "-") {
					let op = sc.get();
					if (op === "+") num[1] += sc.number()[1];
					else if (op === "-") num[1] -= sc.number()[1];
					num[1] &= 0xFFFF;
				}

				if (num[0]) {
					pos += 2;
					program.push((num[1] & 0xFF00) >> 8);
					program.push(num[1] & 0x00FF);
				} else {
					pos++;
					if (num[1] > 255) {
						pos++;
						program.push((num[1] & 0xFF00) >> 8);
						program.push(num[1] & 0x00FF);
					} else {
						program.push(num[1]);
					}
				}
			} else if (sc.peek() === "\"") {
				let str = "";
				sc.get();
				while (sc.peek() !== "\"" && sc.valid()) {
					str += sc.get();
				}
				sc.get();
				for (let i = 0; i < str.length; i++) {
					let chr = str.charAt(i);
					let c = str.charCodeAt(i);
					if (chr === '\\') {
						let n = str.charAt(++i);
						if (n === "n") program.push("\n".charCodeAt(0));
						else if (n === "t") {
							program.push(" ".charCodeAt(0));
							program.push(" ".charCodeAt(0));
						}
					} else {
						program.push(c);
					}
					pos++;
				}
				program.push(0);
				pos++;
			} else {
				sc.get();
			}
		}

		// Resolve labels
		for (let i = 0; i < program.length; i++) {
			if (typeof program[i] === "string") {
				let num = labels[program[i]];
				program[i] = (num & 0xFF00) >> 8;
				program[i + 1] = (num & 0x00FF);
			}
		}

		//console.log(labels);
		console.log(program);
		return program;
	}
};

let Keyboard = {
	init: function() {
		let c = document.getElementById("buffer");
		c.onkeypress = function(e) {
			Video._blink = false;
			CPU._interrupted = false;
			RAM.write(CPU._interruptDest, e.keyCode);
			Video._clear(0);
			Video.flip();
		};
		c.onkeydown = function(e) {
			if (e.key === "F2") {
				load();
			} else {
				if (e.keyCode != 8) return;

				Video._blink = false;
				CPU._interrupted = false;
				RAM.write(CPU._interruptDest, e.keyCode);
				Video._clear(0);
				Video.flip();
			}
		};
	}
};
Keyboard.init();

function load() {
	let code = editor.getValue();
	let asm = Assembler.assemble(code);
	Video.clear(0);
	RAM.clear();
	CPU.reset();
	RAM.load(0, asm);
	CPU.start();
}