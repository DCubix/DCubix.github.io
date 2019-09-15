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
			if (Video._blink)
				Video.chrData(x, y, [0xFF, 0xFF, 0xFF, 0xFF, 0xFF], 255);
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

	_fixCursor: function() {
		if (Video._cursor[0] >= cbw) {
			Video._cursor[0] = 0;
			Video._cursor[1]++;
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
		for (let i = 0; i < RAM._data.length; i++) RAM._data[i] = 0;
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
	},
	clear: function() {
		for (let i = 0; i < RAM._data.length; i++) {
			RAM.write(i, 0);
		}
	}
};
RAM.init();

const STATUS_NONE = 0;
const STATUS_GREATER = 1;
const STATUS_LESS = 2;
const STATUS_EQUALS = 5;

let CPU = {
	accum: [0, 0], // A, B
	callStack: [],
	pc: 0,
	status: 0,
	_wait: 0,
	_interrupted: false,
	_interruptDest: 0,
	_running: false,
	_ops: [
		// NOP 0
		{ name: "nop", cycles: 1, run: function() {} },
		// HLT 1
		{ name: "hlt", cycles: 1, run: function() { CPU._running = false; } },

		// LDA imm (loads an 8bit immediate into A: A = IMM) 2
		{ name: "lda", cycles: 1, run: function() { let imm = CPU.fetch(); CPU.accum[0] = imm; } },
		// LMA $mem (loads mem value into register: A = MEM[loc]) 3
		{ name: "lma", cycles: 2, run: function() {
			let mem0 = CPU.fetch(),
				mem1 = CPU.fetch();
			let mem = (mem0 & 0xFF) << 8 | (mem1 & 0xFF);
			CPU.accum[0] = RAM.read(mem);
		}},
		// STA $mem (stores the A accum value into memory: MEM[loc] = A) 4
		{ name: "sta", cycles: 2, run: function() {
			let mem0 = CPU.fetch(),
				mem1 = CPU.fetch();
			let mem = (mem0 & 0xFF) << 8 | (mem1 & 0xFF);
			RAM.write(mem, CPU.accum[0]);
		}},

		// LDB imm (loads an 8bit immediate into B: B = IMM) 5
		{ name: "ldb", cycles: 1, run: function() { let imm = CPU.fetch(); CPU.accum[1] = imm; } },
		// LMB $mem (loads mem value into register: B = MEM[loc]) 6
		{ name: "lmb", cycles: 2, run: function() {
			let mem0 = CPU.fetch(),
				mem1 = CPU.fetch();
			let mem = (mem0 & 0xFF) << 8 | (mem1 & 0xFF);
			CPU.accum[1] = RAM.read(mem);
		}},
		// STB $mem (stores the B accum value into memory: MEM[loc] = B) 7
		{ name: "stb",cycles: 2, run: function() {
			let mem0 = CPU.fetch(),
				mem1 = CPU.fetch();
			let mem = (mem0 & 0xFF) << 8 | (mem1 & 0xFF);
			RAM.write(mem, CPU.accum[1]);
		}},

		// SOB $mem (stores A into memory offetted by B: MEM[loc + B] = A) 4
		{ name: "sob", cycles: 2, run: function() {
			let mem0 = CPU.fetch(),
				mem1 = CPU.fetch();
			let mem = (mem0 & 0xFF) << 8 | (mem1 & 0xFF);
			RAM.write(mem + CPU.accum[1], CPU.accum[0]);
		}},

		// LAP (loads a value at the memory location stored in AB into A)
		{ name: "lap", cycles: 2, run: function() {
			let mem = (CPU.accum[0] & 0xFF) << 8 | (CPU.accum[1] & 0xFF);
			CPU.accum[0] = RAM.read(mem);
		}},
		// LBP (loads a value at the memory location stored in AB into A)
		{ name: "lbp", cycles: 2, run: function() {
			let mem = (CPU.accum[0] & 0xFF) << 8 | (CPU.accum[1] & 0xFF);
			CPU.accum[1] = RAM.read(mem);
		}},

		// STP imm (stores an immediate at the memory location stored in AB)
		{ name: "stp", cycles: 2, run: function() {
			let imm = CPU.fetch();
			let mem = (CPU.accum[0] & 0xFF) << 8 | (CPU.accum[1] & 0xFF);
			RAM.write(mem, imm);
		}},

		// JMP loc 8
		{ name: "jmp",cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			CPU.pc = loc;
		}},

		// CALL loc (calls a subroutine at loc) 9
		{ name: "call", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			CPU.callStack.push(CPU.pc);
			CPU.pc = loc;
		}},
		// RET (returns from subroutine) 10
		{ name: "ret", cycles: 1, run: function() {
			CPU.pc = CPU.callStack.pop();
		}},

		// CMP (compares A and B accumulators) 11
		{ name: "cmp", cycles: 1, run: function() {
			let r0 = CPU.accum[0];
			let r1 = CPU.accum[1];
			if (r0 == r1) CPU.status = STATUS_EQUALS;
			else if (r0 > r1) CPU.status = STATUS_GREATER;
			else if (r0 < r1) CPU.status = STATUS_LESS;
		}},

		// CAI imm (compares A to immediate) 11
		{ name: "cai", cycles: 1, run: function() {
			let r0 = CPU.accum[0];
			let r1 = CPU.fetch();
			if (r0 == r1) CPU.status = STATUS_EQUALS;
			else if (r0 > r1) CPU.status = STATUS_GREATER;
			else if (r0 < r1) CPU.status = STATUS_LESS;
		}},

		// CBI imm (compares B to immediate) 11
		{ name: "cbi", cycles: 1, run: function() {
			let r0 = CPU.accum[1];
			let r1 = CPU.fetch();
			if (r0 == r1) CPU.status = STATUS_EQUALS;
			else if (r0 > r1) CPU.status = STATUS_GREATER;
			else if (r0 < r1) CPU.status = STATUS_LESS;
		}},

		// JEQ loc (jumps if equals: if STATUS == EQ: PC = loc) 12
		{ name: "jeq", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			if (CPU.status === STATUS_EQUALS) CPU.pc = loc;
		}},

		// JNE loc (jumps if not equals: if STATUS != EQ: PC = loc) 13
		{ name: "jne", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			if (CPU.status !== STATUS_EQUALS) CPU.pc = loc;
		}},

		// JLT loc (jumps if less than: if STATUS === LT: PC = loc) 14
		{ name: "jlt", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			if (CPU.status === STATUS_LESS) CPU.pc = loc;
		}},

		// JGT loc (jumps if less than: if STATUS === GT: PC = loc) 15
		{ name: "jgt", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			if (CPU.status === STATUS_GREATER) CPU.pc = loc;
		}},

		// JLE loc (jumps if less than or equals: if STATUS === LT || STATUS === EQ: PC = loc) 16
		{ name: "jle", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			if (CPU.status === STATUS_LESS || CPU.status === STATUS_EQUALS) CPU.pc = loc;
		}},

		// JGE loc (jumps if greater than or equals: if STATUS === GT || STATUS === EQ: PC = loc) 17
		{ name: "jge", cycles: 2, run: function() {
			let loc0 = CPU.fetch(),
				loc1 = CPU.fetch();
			let loc = (loc0 & 0xFF) << 8 | (loc1 & 0xFF);
			if (CPU.status === STATUS_GREATER || CPU.status === STATUS_EQUALS) CPU.pc = loc;
		}},

		// ADA imm (adds an 8bit immediate to A: A += IMM) 18
		{ name: "ada", cycles: 1, run: function() {
			let imm = CPU.fetch();
			CPU.accum[0] += imm;
			CPU.accum[0] &= 0xFF;
		}},
		// BTA (adds B value to A: A += Bv) 19
		{ name: "bta", cycles: 1, run: function() {
			CPU.accum[0] += CPU.accum[1];
			CPU.accum[0] &= 0xFF;
		}},
		// SBA imm (subtracts an 8bit immediate from A: A -= IMM) 20
		{ name: "sba", cycles: 2, run: function() {
			let imm = CPU.fetch();
			CPU.accum[0] -= imm;
			CPU.accum[0] &= 0xFF;
		}},
		// BFA (subtracts B from A: A -= Bv) 21
		{ name: "bfa", cycles: 1, run: function() {
			CPU.accum[0] -= CPU.accum[1];
			CPU.accum[0] &= 0xFF;
		}},

		// ADB imm (adds an 8bit immediate to B: B += IMM) 22
		{ name: "adb", cycles: 1, run: function() {
			let imm = CPU.fetch();
			CPU.accum[1] += imm;
			CPU.accum[1] &= 0xFF;
		}},
		// ATB (adds A value to B: B += Av) 23
		{ name: "atb", cycles: 1, run: function() {
			CPU.accum[1] += CPU.accum[0];
			CPU.accum[1] &= 0xFF;
		}},
		// SBB imm (subtracts an 8bit immediate from B: B -= IMM) 24
		{ name: "sbb",  cycles: 2, run: function() {
			let imm = CPU.fetch();
			CPU.accum[1] -= imm;
			CPU.accum[1] &= 0xFF;
		}},
		// AFB (subtracts A from B: B -= Av) 25
		{ name: "afb", cycles: 1, run: function() {
			CPU.accum[1] -= CPU.accum[0];
			CPU.accum[1] &= 0xFF;
		}},

		// ADW imm (adds a 16bit immediate to AB: AB += IMM) 26
		{ name: "adw", cycles: 2, run: function() {
			let im0 = CPU.fetch();
			let im1 = CPU.fetch();
			let imm = (im0 & 0xFF) << 8 | (im1 & 0xFF);
			let val = (CPU.accum[0] & 0xFF) << 8 | (CPU.accum[1] & 0xFF);
			val += imm;
			CPU.accum[0] = (val & 0xFF00) >> 8;
			CPU.accum[1] = (val & 0x00FF);
		}},
		// SBW imm (subtracts a 16bit immediate from AB: AB -= IMM) 27
		{ name: "sbw", cycles: 2, run: function() {
			let im0 = CPU.fetch();
			let im1 = CPU.fetch();
			let imm = (im0 & 0xFF) << 8 | (im1 & 0xFF);
			let val = (CPU.accum[0] & 0xFF) << 8 | (CPU.accum[1] & 0xFF);
			val -= imm;
			CPU.accum[0] = (val & 0xFF00) >> 8;
			CPU.accum[1] = (val & 0x00FF);
		}},

		// INA (request interrupt and stores resulting byte into A) 28
		{ name: "ina", cycles: 1, run: function() {
			CPU._interrupted = true;
			CPU._interruptDest = 0;
		}},
		// INB (request interrupt and stores resulting byte into B) 29
		{ name: "inb", cycles: 1, run: function() {
			CPU._interrupted = true;
			CPU._interruptDest = 1;
		}},

		// VCI imm (write a character immediate to the video chip) 30
		{ name: "vci", cycles: 2, run: function() {
			let chr = CPU.fetch();
			Video.putc(String.fromCharCode(chr));
			Video.flip();
		}},
		// VCA (write a character from A to the video chip) 31
		{ name: "vca", cycles: 1, run: function() {
			Video.putc(String.fromCharCode(CPU.accum[0]));
			Video.flip();
		}},
		// VCB (write a character from B to the video chip) 32
		{ name: "vcb", cycles: 1, run: function() {
			Video.putc(String.fromCharCode(CPU.accum[1]));
			Video.flip();
		}},

		// RNA (write a random byte to A) 33
		{ name: "rna", cycles: 2, run: function() {
			CPU.accum[0] = ~~(Math.random() * 255);
		}},
		// RNB (write a random byte to B) 34
		{ name: "rnb", cycles: 2, run: function() {
			CPU.accum[1] = ~~(Math.random() * 255);
		}},
		// RNW (write a random word to AB) 35
		{ name: "rnw", cycles: 2, run: function() {
			let val = ~~(Math.random() * 0xFFFF);
			CPU.accum[0] = (val & 0xFF00) >> 8;
			CPU.accum[1] = (val & 0x00FF);
		}},

		// VPT string+0. (prints a null-terminated immediate string) 36
		{ name: "vpt", cycles: 2, run: function() {
			let c = CPU.fetch();
			while (c !== 0) {
				Video.putc(String.fromCharCode(c));
				c = CPU.fetch();
			}
			Video.flip();
		}},
		// VPM $mem. (prints a null-terminated memory string) 37
		{ name: "vpm", cycles: 2, run: function() {
			let mem0 = CPU.fetch(),
				mem1 = CPU.fetch();
			let mem = (mem0 & 0xFF) << 8 | (mem1 & 0xFF);
			let c = RAM.read(mem);
			while (c !== 0) {
				Video.putc(String.fromCharCode(c));
				c = RAM.read(mem++);
			}
			Video.flip();
		}},
	],
	fetch: function() {
		if (CPU.pc >= RAM._data.length) return 0;
		return RAM.read(CPU.pc++);
	},
	tick: function() {
		if (CPU._interrupted) {
			return;
		}

		if (CPU._wait > 0) {
			CPU._wait--;
		} else {
			let op = CPU._ops[CPU.fetch()];
			//CPU._wait = op.cycles;
			op.run();
		}
	},
	reset: function() {
		CPU.pc = 0;
		CPU.status = 0;
		CPU.accum = [0, 0];
		CPU.callStack = [];
		CPU._interrupted = false;
		CPU._wait = 0;
		CPU.start();
	},
	start: function() {
		CPU._running = true;
		let intv = setInterval(function() {
			if (!CPU._running) clearInterval(intv);
			CPU.tick();
		}, 1);
	}
};

CPU.start();

let Keyboard = {
	init: function() {
		let c = document.getElementById("buffer");
		c.onkeypress = function(e) {
			Video._blink = false;
			CPU._interrupted = false;
			CPU.accum[CPU._interruptDest] = e.keyCode;
			Video._clear(0);
			Video.flip();
		};
	}
};
Keyboard.init();

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
		let str = this.scan(/[\$0-9]/);
		return [str.startsWith("$"), parseInt(str.startsWith("$") ? "0x" + str.substring(1) : str)];
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
				//} else if (str in labels) {
					// let num = labels[str];
					// if (sc.peek() === "+" || sc.peek() === "-") {
					// 	let op = sc.get();
					// 	if (op === "+") num += sc.number()[1];
					// 	else if (op === "-") num -= sc.number()[1];
					// 	num &= 0xFFFF;
					// }
					// pos += 2;
					// program.push((num & 0xFF00) >> 8);
					// program.push(num & 0x00FF);
				} else {
					pos += 2;
					program.push(str.trim());
					program.push(str.trim());
					// console.error("Unknown identifier. " + str);
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

		console.log(labels);
		console.log(program);
		return program;
	}
};

let code = `
start:
	VPT ">"
	JMP loop

clean_cmd:
	LDA 0
	SOB $2000
	SBB 1
	CBI 0
	JNE clean_cmd
	RET

loop:
	INA
	VCA
	SOB $2000
	ADB 1
	CAI 13
	JNE loop
	VPT "\n"
	VPM $2001
	VPT "\n"
	LDA 0
	CALL clean_cmd
	JMP start
`;

let ROM = Assembler.assemble(code);
RAM.clear();
RAM.load(0, ROM);
CPU.start();