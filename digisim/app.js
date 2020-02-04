let canvas = document.getElementById("view");
let ctx = canvas.getContext("2d");

let sprite = new Image();
let loaded = false;
sprite.onload = function() {
	loaded = true;
};
sprite.src = "./sprites.png";

const tw = 8, th = 8;
function drawTile(ctx, index, x, y, w, h) {
	let tilesX = ~~(sprite.width / tw);
	let srcx = ~~(index % tilesX) * tw;
	let srcy = ~~(index / tilesX) * th;
	ctx.drawImage(sprite, srcx, srcy, tw, th, x, y, w, h);
}

/// == EDITOR ==================================================

var blockWidth = 50;
var pinSpacing = 24;
var padding = 8;
var ID = 0;
function Link() {
	this.id = ID++;
	this.fromComponentID = 0;
	this.toComponentID = 0;
	this.fromOutput = "";
	this.toInput = "";
}

class Component {
	constructor(x, y) {
		this.id = ID++;
		this.editor = null;
		this.x = x || 50;
		this.y = y || 50;
		this.name = "COMP";
		
		this.inputs = {};
		this.outputs = {};

		this.solved = false;
	}

	width() { return blockWidth; }
	height() {
		let ins = Object.keys(this.inputs).length, outs = Object.keys(this.outputs).length;
		let maxPins = Math.max(ins, outs);
		return padding * 2 + maxPins * pinSpacing;
	}

	drawLabel(ctx) {
		let height = this.height();
		ctx.save();
		ctx.font = "bold 12pt monospace";
		let sz = ctx.measureText(this.name);
		let h = sz.actualBoundingBoxAscent + sz.actualBoundingBoxDescent;
		ctx.translate(this.x, this.y);
		ctx.rotate(-Math.PI / 2);
		ctx.textAlign = "center";
		ctx.fillStyle = "white";
		ctx.fillText(this.name, -height / 2 - th / 2, h / 2 + blockWidth / 2);
		ctx.restore();
	}

	draw(ctx) {
		if (!loaded) this.drawOld(ctx);
		else this.drawNew(ctx);
		this.drawLabel(ctx);
	}

	drawNew(ctx) {
		let ins = Object.keys(this.inputs).length, outs = Object.keys(this.outputs).length;
		let height = this.height();

		ctx.font = "14px monospace";
		let sz = ctx.measureText(this.name);
		let h = sz.actualBoundingBoxAscent + sz.actualBoundingBoxDescent;

		ctx.save();
		ctx.strokeStyle = "black";
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.rect(this.x + 5, this.y + 5, blockWidth - 10, height - 10);
		ctx.shadowColor = "black";
		ctx.shadowBlur = 10;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 5;
		ctx.stroke();
		ctx.restore();

		drawTile(ctx, 1, this.x + tw, this.y, blockWidth - (tw * 2), th);
		drawTile(ctx, 31, this.x + tw, this.y + (height - th), blockWidth - (tw * 2), th);

		drawTile(ctx, 10, this.x, this.y + th, tw, height - (th * 2));
		drawTile(ctx, 17, this.x + (blockWidth - tw), this.y + th, tw, height - (th * 2));

		drawTile(ctx, 0, this.x, this.y, tw, th);
		drawTile(ctx, 7, this.x + (blockWidth - tw), this.y, tw, th);
		drawTile(ctx, 30, this.x, this.y + (height - th), tw, th);
		drawTile(ctx, 37, this.x + (blockWidth - tw), this.y + (height - th), tw, th);

		drawTile(ctx, 11, this.x + tw, this.y + th, blockWidth - (tw * 2), height - (th * 2));

		let hw = blockWidth / 2;
		for (let i = 0; i < 4; i++) {
			let ox = this.x + hw;
			drawTile(ctx, 2 + i, ox + (i - 2) * tw, this.y, tw, th);
		}

		for (let i = 0; i < ins; i++) {
			let n = Object.keys(this.inputs)[i];
			let pos = this.pinPosition(i, 0, ins);
			let sz = ctx.measureText(n);

			drawTile(ctx, 18, pos[0] - tw*2, pos[1] - 4, tw, th);
			drawTile(ctx, 19, pos[0] - tw, pos[1] - 4, tw, th);
			ctx.fillText(n, pos[0] - (sz.width), pos[1] - 4);
		}

		for (let i = 0; i < outs; i++) {
			let n = Object.keys(this.outputs)[i];
			let pos = this.pinPosition(i, blockWidth, outs);
			let sz = ctx.measureText(n);

			drawTile(ctx, 9, pos[0] + tw, pos[1] - 4, tw, th);
			drawTile(ctx, 8, pos[0], pos[1] - 4, tw, th);
			ctx.fillText(n, pos[0] + (sz.width / 2), pos[1] - 4);
		}
	}

	drawOld(ctx) {
		let ins = Object.keys(this.inputs).length, outs = Object.keys(this.outputs).length;
		let height = this.height();

		ctx.font = "14px monospace";
		let sz = ctx.measureText(this.name);
		let h = sz.actualBoundingBoxAscent + sz.actualBoundingBoxDescent;

		ctx.save();

		ctx.fillStyle = "black";
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		ctx.shadowBlur = 8;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 4;

		ctx.strokeStyle = "black";
		ctx.fillStyle = "white";
		ctx.lineWidth = 2;
		
		ctx.fillRect(this.x, this.y, blockWidth, height);

		ctx.restore();

		ctx.beginPath();
		ctx.rect(this.x, this.y, blockWidth, height);
		ctx.stroke();

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.textAlign = "center";
		ctx.fillStyle = "black";
		ctx.fillText(this.name, blockWidth / 2, height / 2 + h / 2.2);
		ctx.restore();

		ctx.fillStyle = "black";
		ctx.font = "12px monospace";

		for (let i = 0; i < ins; i++) {
			let n = Object.keys(this.inputs)[i];
			let pos = this.pinPosition(i, 0, ins);
			let sz = ctx.measureText(n);

			ctx.beginPath();
			ctx.moveTo(pos[0], pos[1]);
			ctx.lineTo(pos[0] - 18, pos[1]);
			ctx.stroke();
			ctx.fillText(n, pos[0] - (sz.width + 9), pos[1] - 2);
		}

		for (let i = 0; i < outs; i++) {
			let n = Object.keys(this.outputs)[i];
			let pos = this.pinPosition(i, blockWidth, outs);
			let sz = ctx.measureText(n);

			ctx.beginPath();
			ctx.moveTo(pos[0], pos[1]);
			ctx.lineTo(pos[0] + 18, pos[1]);
			ctx.stroke();
			ctx.fillText(n, pos[0] + (sz.width), pos[1] - 2);
		}
	}

	inputIndex(n) { return Object.keys(this.inputs).indexOf(n); }
	outputIndex(n) { return Object.keys(this.outputs).indexOf(n); }

	inputPos(n) {
		let ins = Object.keys(this.inputs).length;
		return this.pinPosition(this.inputIndex(n), 0, ins);
	}

	outputPos(n) {
		let outs = Object.keys(this.outputs).length;
		return this.pinPosition(this.outputIndex(n), blockWidth, outs);
	}

	pinPosition(pin, x, count) {
		let h = this.height();
		let sp = h / count;
		let y = this.y + (count === 1 ? h / 2 : sp * pin + (h / 2 - sp / 2));
		return [ this.x + x, y ];
	}

	activate() { }
	behavior() { this.solved = true; }
}

class In extends Component {
	constructor() {
		super();
		this.name = "IN";
		this.outputs = { "A": 0 };
	}
}

class Out extends Component {
	constructor() {
		super();
		this.name = "OUT";
		this.inputs = { "A": 0 };
	}
}

class Switch extends Component {
	constructor(x, y) {
		super(x, y);
		this.name = "SWT";
		this.outputs = { "A": 0 };
	}

	drawLabel(ctx) {}

	draw(ctx) {
		super.draw(ctx);

		ctx.save();
		ctx.strokeStyle = "black";
		ctx.fillStyle = this.outputs["A"] > 0 ? "rgb(0, 255, 0)" : "gray";
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.rect(this.x + padding, this.y + padding + th, blockWidth - padding * 2, this.height() - (padding * 2 + th));
		ctx.stroke();
		if (this.outputs["A"] > 0) {
			ctx.shadowColor = "rgba(80, 255, 80, 1.0)";
			ctx.shadowBlur = 8;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		} else {
			ctx.shadowBlur = 0;
		}
		ctx.fillRect(this.x + padding, this.y + padding + th, blockWidth - padding * 2, this.height() - (padding * 2 + th));
		ctx.restore();
	};

	activate() {
		this.outputs["A"] = this.outputs["A"] > 0 ? 0 : 1;
		super.activate();
	};
}

class LED extends Component {
	constructor(x, y) {
		super(x, y);
		this.name = "LED";
		this.inputs = { "A": 0 };
	}

	drawLabel(ctx) {}

	draw(ctx) {
		super.draw(ctx);

		ctx.save();
		ctx.strokeStyle = "black";
		ctx.fillStyle = this.inputs["A"] > 0 ? "rgb(0, 255, 0)" : "gray";
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.rect(this.x + padding, this.y + padding + th, blockWidth - padding * 2, this.height() - (padding * 2 + th));
		ctx.stroke();
		if (this.inputs["A"] > 0) {
			ctx.shadowColor = "rgba(80, 255, 80, 1.0)";
			ctx.shadowBlur = 8;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
		} else {
			ctx.shadowBlur = 0;
		}
		ctx.fillRect(this.x + padding, this.y + padding + th, blockWidth - padding * 2, this.height() - (padding * 2 + th));
		ctx.restore();
	};
}

class NAND extends Component {
	constructor(x, y) {
		super(x, y);
		this.name = "NAND";
		this.inputs = { "A": 0, "B": 0 };
		this.outputs = { "C": 0 };
	}

	behavior() {
		this.outputs["C"] = (this.inputs["A"] > 0 && this.inputs["B"] > 0) ? 0 : 1;
		super.behavior();
	}
}

class GenericComponent extends Component {
	constructor(x, y) {
		super(x, y);
		this.components = [];
		this.links = [];
		this.module = false;
	}

	save() {
		let comps = [];
		for (let c of this.components) {
			if (c === undefined || c === null) continue;
			comps.push({
				id: c.id,
				name: c.name,
				x: c.x,
				y: c.y
			});
		}
		// console.log(JSON.stringify({
		// 	"name": this.name,
		// 	"links": this.links,
		// 	"components": comps
		// }));
	}

	async load(file, mod) {
		mod = mod || false;
		let res = await fetch(`./comps/${file}`);
		if (res.status === 200) {
			let data = await res.json();
			if (mod) this.loadAsModule(data);
			else this.loadAsProject(data);
		}
		return this;
	}

	loadAsModule(data) {
		const LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
		this.module = true;
		this.name = data["name"];
		for (let comp of data["components"]) {
			if (comp["name"] === "IN") {
				this.inputs[LABELS.shift()] = 0;
				let cmp = new In(comp["x"], comp["y"]);
				cmp.id = comp["id"];
				this.create(cmp);
				ID = Math.max(ID, cmp.id);
			} else if (comp["name"] === "OUT") {
				this.outputs[LABELS.shift()] = 0;
				let cmp = new Out(comp["x"], comp["y"]);
				cmp.id = comp["id"];
				this.create(cmp);
				ID = Math.max(ID, cmp.id);
			} else if (comp["name"] === "NAND") {
				let cmp = new NAND(comp["x"], comp["y"]);
				cmp.id = comp["id"];
				this.create(cmp);
				ID = Math.max(ID, cmp.id);
			}
		}

		this._loadLinks(data);
	}

	loadAsProject(data) {
		this.name = data["name"];
		for (let comp of data["components"]) {
			if (comp["name"] === "IN") {
				let cmp = new In(comp["x"], comp["y"]);
				cmp.id = comp["id"];
				this.create(cmp);
				ID = Math.max(ID, cmp.id);
			} else if (comp["name"] === "OUT") {
				let cmp = new Out(comp["x"], comp["y"]);
				cmp.id = comp["id"];
				this.create(cmp);
				ID = Math.max(ID, cmp.id);
			} else if (comp["name"] === "NAND") {
				let cmp = new NAND(comp["x"], comp["y"]);
				cmp.id = comp["id"];
				this.create(cmp);
				ID = Math.max(ID, cmp.id);
			}
		}
		this._loadLinks(data);
	}

	_loadLinks(data) {
		console.log(data["links"]);
		for (let k of data["links"]) {
			let lnk = new Link();
			lnk.id = k["id"];
			lnk.fromComponentID = k["fromComponentID"];
			lnk.toComponentID = k["toComponentID"];
			lnk.fromOutput = k["fromOutput"];
			lnk.toInput = k["toInput"];
			this.links[lnk.id] = lnk;

			if (this.components.length > 0) this.update();

			ID = Math.max(ID, lnk.id);
		}
	}

	update() {
		for (let comp of this.components) {
			if (comp === undefined || comp === null) continue;
			comp.solved = false;
		}

		let brokenLinks = [];
		for (let lnk of this.links) {
			if (lnk === undefined || lnk === null) continue;

			let from = this.components[lnk.fromComponentID];
			let to = this.components[lnk.toComponentID];

			if (from === null || from === undefined || to === null || to === undefined) {
				brokenLinks.push(lnk.id);
				continue;
			}

			if (from.name === "IN") {
				
			}

			if (!from.solved) from.behavior();
			to.inputs[lnk.toInput] = from.outputs[lnk.fromOutput];
		}

		for (let lnk of brokenLinks) {
			this.links[lnk] = null;
		}
	}

	behavior() {
		this.update();
	}

	create(c) {
		c.editor = this;
		this.components[c.id] = c;
		return c.id;
	}

	link(from, fromOut, to, toIn) {
		let lnk = new Link();
		lnk.fromComponentID = from;
		lnk.toComponentID = to;
		lnk.fromOutput = fromOut;
		lnk.toInput = toIn;
		this.links[lnk.id] = lnk;
		this.update();
		return lnk.id;
	}

	removeLink(id) {
		this.links[id] = null;
		this.update();
	}

	draw(ctx) {
		if (this.module) {
			super.draw(ctx);
		} else {
			ctx.fillStyle = "white";
			ctx.lineWidth = 2;
			for (let lnk of this.links) {
				if (lnk === undefined || lnk === null) continue;

				let from = this.components[lnk.fromComponentID];
				let to = this.components[lnk.toComponentID];
				let pa = from.outputPos(lnk.fromOutput);
				let pb = to.inputPos(lnk.toInput);

				pa[0] += tw - 1;
				pb[0] -= tw - 1;

				ctx.save();
				if (from.outputs[lnk.fromOutput] > 0) {
					ctx.strokeStyle = "rgb(0, 0, 200)";
					ctx.shadowColor = "rgb(80, 80, 255)";
					ctx.shadowBlur = 6;
					ctx.shadowOffsetX = 0;
					ctx.shadowOffsetY = 0;
				} else {
					ctx.strokeStyle = "black";
					ctx.shadowBlur = 0;
					ctx.shadowColor = "none";
				}

				ctx.beginPath();
				ctx.moveTo(pa[0], pa[1]);
				
				if (pb[0] < pa[0]) {
					let d = (pa[0] - pb[0]);
					ctx.bezierCurveTo(pa[0] + d, pa[1], pb[0] - d, pb[1], pb[0], pb[1]);
				} else {
					let midX = (pb[0] - pa[0]) / 2;
					ctx.bezierCurveTo(pa[0] + midX, pa[1], pa[0] + midX, pb[1], pb[0], pb[1]);
				}

				ctx.stroke();
				ctx.restore();
			}

			for (let comp of this.components) {
				if (comp === undefined || comp === null) continue;
				comp.draw(ctx);
			}
		}
	}
}

var ed = new GenericComponent();
//ed.load("not.json");
let not = new GenericComponent();
not.load("not.json", true).then(function(c) { console.log(c); ed.create(c); });

var linking = {
	from: null, fromOut: null, active: false
};
linking.active = false;

var selected = null;
var drag = false;
var px = 0, py = 0, mx = 0, my = 0;

window.onmousedown = function(e) {
	e.preventDefault();
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	px = x;
	py = y;
	drag = true;

	let hitSmth = false;
	for (let c of ed.components) {
		if (c === undefined || c === null) continue;
		if (x >= c.x &&
			y >= c.y &&
			x <= c.x + c.width() &&
			y <= c.y + c.height())
		{
			selected = c;
			hitSmth = true;
			break;
		}
	}
	if (!hitSmth && selected !== null) selected = null;

	for (let c of ed.components) {
		if (c === undefined || c === null) continue;
		for (let i in c.outputs) {
			let p = c.outputPos(i);
			let px = p[0],
				py = p[1];
			if (x >= px &&
				y >= py-4 &&
				x <= px+tw &&
				y <= py+4 &&
				!linking.active)
			{
				linking.from = c;
				linking.fromOut = i;
				linking.active = true;
				break;
			}
		}

		for (let i in c.inputs) {
			let p = c.inputPos(i);
			let px = p[0],
				py = p[1];
			if (x >= px-tw &&
				y >= py-4 &&
				x <= px &&
				y <= py+4 &&
				!linking.active)
			{
				for (let lnk of ed.links) {
					if (lnk === undefined || lnk === null) continue;
					if (lnk.toComponentID === c.id && lnk.toInput === i) {
						linking.active = true;
						linking.from = ed.components[lnk.fromComponentID];	
						linking.fromOut = lnk.fromOutput;
						ed.removeLink(lnk.id);
						break;
					}
				}
				break;
			}
		}
	}

	window.onresize();
};

window.onmousemove = function(e) {
	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	mx = x;
	my = y;
	if (drag && selected !== null) {
		selected.x += x - px;
		selected.y += y - py;
		px = x;
		py = y;
	}
	window.onresize();
};

window.onmouseup = function(e) {
	e.preventDefault();

	let rect = canvas.getBoundingClientRect();
	let x = e.clientX - rect.left;
	let y = e.clientY - rect.top;
	drag = false;

	if (e.button === 2 && selected !== null) {
		selected.activate();
		ed.update();
		ed.update();
	} else {
		ed.save();
	}

	let linked = false;
	for (let c of ed.components) {
		if (c === undefined || c === null) continue;
		for (let i in c.inputs) {
			let p = c.inputPos(i);
			let px = p[0],
				py = p[1];
			if (x >= px-tw &&
				y >= py-4 &&
				x <= px &&
				y <= py+4 &&
				linking.active)
			{
				ed.link(linking.from.id, linking.fromOut, c.id, i);
				linked = true;
				break;
			}
		}
	}

	linking.active = false;
	window.onresize();
};

canvas.oncontextmenu = function() { return false; };

window.onresize = function() {
	let parent = canvas.parentElement;

	canvas.width = parent.clientWidth;
	canvas.height = parent.clientHeight;

	ctx.fillStyle = "#777";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ed.draw(ctx);
	if (selected !== null) {
		selected.draw(ctx);
		ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
		ctx.fillRect(selected.x, selected.y, selected.width(), selected.height());
	}

	if (linking.active) {
		ctx.strokeStyle = "lightgray";
		ctx.lineWidth = 4;

		let from = linking.from;
		let pa = from.outputPos(linking.fromOut);
		pa[0] += tw-1;
		let pb = [mx, my];
		//pb[0] -= tw-1;

		ctx.beginPath();
		ctx.moveTo(pa[0], pa[1]);
		
		if (pb[0] < pa[0]) {
			let d = (pa[0] - pb[0]);
			ctx.bezierCurveTo(pa[0] + d, pa[1], pb[0] - d, pb[1], pb[0], pb[1]);
		} else {
			let midX = (pb[0] - pa[0]) / 2;
			ctx.bezierCurveTo(pa[0] + midX, pa[1], pa[0] + midX, pb[1], pb[0], pb[1]);
		}

		ctx.stroke();
	}
};

ed.create(new Switch(10, 10));
ed.create(new LED(10, 10));

window.onresize();