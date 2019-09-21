let canvas = document.getElementById("view");
let ctx = canvas.getContext("2d");

ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

Array.prototype.insert = function ( index, item ) {
	this.splice( index, 0, item );
};

Math.radians = function(deg) {
	return deg / 180.0 * Math.PI;
};

function shortAngleDist(a0, a1) {
	let max = Math.PI * 2;
	let da = (a1 - a0) % max;
	return 2.0 * da % max - da;
}

Math.angleLerp = function(a0, a1, t) {
    return a0 + shortAngleDist(a0, a1) * t;
};

Math.lerp = function(a, b, t) {
	return (1 - t) * a + b * t;
};

function Vec2(x, y) {
	this.x = x instanceof Vec2 ? x.x : x;
	this.y = x instanceof Vec2 ? x.y : y;
	this.length = function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	};
	this.normalized = function() {
		let len = this.length();
		return new Vec2(this.x / len, this.y / len);
	};

	/**
	 * @param {Vec2} b
	 */
	this.sub = function(b) {
		return new Vec2(this.x - b.x, this.y - b.y);
	};
	/**
	 * @param {Vec2} b
	 */
	this.add = function(b) {
		return new Vec2(this.x + b.x, this.y + b.y);
	};
	/**
	 * @param {number} b
	 */
	this.mul = function(b) {
		return new Vec2(this.x * b, this.y * b);
	};

	this.lerp = function(b, t) {
		return new Vec2(
			Math.lerp(this.x, b.x, t),
			Math.lerp(this.y, b.y, t)
		);
	};
}

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
		let str = this.scan(/[\-\+0-9a-fA-F\.]/);
		let val = parseInt(str);
		return val;
	};
	this.color = function() {
		let str = this.scan(/[\#0-9a-zA-Z]/);
		return str;
	};
	this.identifier = function() {
		return this.scan(/[a-zA-Z_]/);
	};
	this.trimSpaces = function() {
		while (/[ \t\n\r\f]/.test(this.peek())) this.get();
	};
}

/**
 *
 * @param {Number} rot
 * @param {Number} length
 * @param {Number} x
 * @param {Number} y
 */
var ID = 0;
function Figure(rot, length, x, y, circle, color, thickness, movable) {
	this.id = ID++;
	this.pos = new Vec2(x || 0, y || 0);
	this.rot = rot || 0;
	this.length = length || 0;
	this.color = color || "black";
	this.thickness = thickness || 10;
	this.circle = circle || false;
	this.movable = movable || true;
	this.ik = 0;
	this.name = "fig_" + this.id;

	this.children = [];
	this.parent = null;
	this.selected = false;

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	this.draw = function(ctx, color) {
		ctx.save();
		ctx.rotate(this.rot);
		ctx.translate(this.pos.x, this.pos.y);

		if (this.length > 0 && this.thickness > 0) {
			let col = color || this.color;

			if (this.selected) {
				ctx.strokeStyle = "red";
				ctx.lineWidth = this.thickness + 3;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(this.length, 0);
				ctx.stroke();
			}

			if (!this.circle) {
				ctx.strokeStyle = col;
				ctx.lineWidth = this.thickness;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(this.length, 0);
				ctx.stroke();
			} else {
				ctx.fillStyle = col;
				ctx.beginPath();
				ctx.arc(this.length / 2, 0, this.length / 2, 0, Math.PI * 2);
				ctx.fill();
			}

			ctx.translate(this.length, 0);
		}

		for (let c of this.children) {
			c.draw(ctx, color);
		}

		ctx.restore();
	};

	this.drawHandles = function(ctx) {
		ctx.save();
		ctx.rotate(this.rot);
		ctx.translate(this.pos.x + this.length, this.pos.y);

		if (this.movable) {
			ctx.fillStyle = this.parent !== null ? (this.ik > 0 ? "#0f0" : "red") : "orange";
			ctx.beginPath();
			ctx.arc(0, 0, 4, 0, Math.PI * 2);
			ctx.fill();
		}

		for (let c of this.children) {
			c.drawHandles(ctx);
		}
		ctx.restore();
	};

	this.drawDebug = function(ctx) {
		let pos = this.globalPos();
		ctx.fillStyle = "blue";
		ctx.beginPath();
		ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
		ctx.fill();

		for (let c of this.children) {
			c.drawDebug(ctx);
		}
	};

	this.test = function(x, y) {
		let pos = this.globalPos();
		let dx = x - pos.x, dy = y - pos.y;
		let dist = Math.sqrt(dx * dx + dy * dy);
		if (dist <= 8 && this.movable) {
			return this;
		} else {
			for (let c of this.children) {
				let ts = c.test(x, y);
				if (ts !== null) return ts;
			}
		}
		return null;
	};

	this.globalRot = function() {
		if (this.parent === null) return this.rot;
		return this.parent.globalRot() + this.rot;
	};

	this.globalPos = function() {
		if (this.parent === null) return new Vec2(this.pos);
		let pos = this.parent.globalPos();
		let rot = this.globalRot();
		pos.x += Math.cos(rot) * this.length;
		pos.y += Math.sin(rot) * this.length;
		return pos;
	};

	this.root = function() {
		let n = this;
		while (true) {
			if (n.parent === null) return n;
			n = n.parent;
		}
	};

	this.childrenRecursive = function(it) {
		it = it || this;
		let figs = [it];
		for (let c of it.children) {
			let cd = c.childrenRecursive(c);
			figs.push(...cd);
		}
		return figs;
	};
}

/**
 * @param {Figure} fig
 */
function Keyframe(pos, rot, frame) {
	this.targetPos = pos;
	this.targetRot = rot;
	this.frame = frame;
}

function Scene(width, height, fps, frameCount) {
	this.figures = [];
	this.keyframes = {};
	this.fps = fps || 24;
	this.endFrame = frameCount || 255;
	this.width = width || 512;
	this.height = height || 512;

	this.addKeyframe = function(id, pos, rot, frame) {
		let name = "fig_" + id;
		if (this.keyframes[name] === undefined || this.keyframes[name] === null) {
			this.keyframes[name] = [];
		}

		let foundFrame = null;
		let frameID = 0;
		for (let k of this.keyframes[name]) {
			if (k.frame === frame || frame < k.frame) {
				foundFrame = k;
				break;
			}
			frameID++;
		}

		if (foundFrame === null) {
			this.keyframes[name].push(new Keyframe(pos, rot, frame));
		} else {
			if (frame === foundFrame.frame) {
				this.keyframes[name][frameID].targetPos = pos;
				this.keyframes[name][frameID].targetRot = rot;
				this.keyframes[name][frameID].frame = frame;
			} else {
				let id = frameID <= 0 ? 0 : frameID;
				this.keyframes[name].insert(id, new Keyframe(pos, rot, frame));
			}
		}
	};

	this.getFigure = function(id) {
		for (let fig of this.figures) {
			if (fig.id === id) return fig;
			else {
				for (let sfig of fig.childrenRecursive()) {
					if (sfig.id === id) return sfig;
				}
			}
		}
		return null;
	};

	this.addFigure = function(fig) {
		this.figures.push(fig);
	};

	this.addFigureString = function(str) {
		let sc = new Reader(str);
		let root = [];
		let stk = null;

		/**
		 * @param {Figure} fig
		 */
		function fixFigure(fig) {
			for (let c of fig.children) {
				if (c.ik > 0) {
					c.parent.movable = false;
				}
				fixFigure(c);
			}
		}

		while (sc.valid()) {
			if (/[sS]/.test(sc.peek())) { // Stick
				sc.get();
				if (sc.peek() === "(") {
					sc.get();
					stk = new Figure();

					while (sc.peek() !== ")") {
						sc.trimSpaces();
						let prop = sc.identifier().toUpperCase(); sc.trimSpaces();
						sc.trimSpaces();
						if (sc.peek() === ":") {
							sc.get();
							sc.trimSpaces();
							if		(prop === "ROT")	stk.rot = Math.radians(sc.number());
							else if (prop === "LEN")	stk.length = sc.number();
							else if (prop === "X")		stk.pos.x = sc.number();
							else if (prop === "Y")		stk.pos.y = sc.number();
							else if (prop === "CIR")	stk.circle = sc.identifier().toUpperCase() === "TRUE";
							else if (prop === "COL")	stk.color = sc.color();
							else if (prop === "W")		stk.thickness = sc.number();
							else if (prop === "MOV")	stk.movable = sc.identifier().toUpperCase() === "TRUE";
							else if (prop === "IK")		stk.ik = sc.number();
							else if (prop === "NAME")	stk.name = sc.identifier();
							sc.trimSpaces();
						}
						if (sc.peek() === ",") {
							sc.get();
						} else {
							if (sc.peek() !== ')') {
								console.error("Expected a comma or end of STICK.");
								break;
							}
						}
					}

					if (sc.peek() === ")") {
						sc.get();
					} else {
						console.error("Invalid STICK declaration.");
					}

					if (root.length > 0) {
						stk.parent = root[root.length - 1];
						root[root.length - 1].children.push(stk);
					}
				} else {
					console.error("Invalid STICK declaration.");
					break;
				}
			} else if (sc.peek() === "{") {
				sc.get();
				root.push(stk);
			} else if (sc.peek() === "}") {
				sc.get();
				if (root.length > 1) root.pop();
			} else {
				sc.get();
			}
		}
		root[0].parent = null;
		fixFigure(root[0]);
		this.addFigure(root[0]);
	};

	this.draw = function(ctx, onion) {
		for (let fig of this.figures) {
			fig.draw(ctx, onion ? "#ccc" : undefined);
		}
	};

	this._animateTrack = function(fig, keyframes, frame) {
		if (keyframes.length <= 1) {
			return;
		}
		for (let i = 0; i < keyframes.length - 1; i++) {
			let a = keyframes[i + 0];
			let b = keyframes[i + 1];
			if (frame >= a.frame && frame <= b.frame) {
				let ta = a.frame, tb = b.frame, t = frame;
				let time = (t - ta) / (tb - ta);
				fig.pos = a.targetPos.lerp(b.targetPos, time);
				fig.rot = Math.angleLerp(a.targetRot, b.targetRot, time);
			}
		}
	};

	this.animate = function(frame) {
		let obs = Object.keys(this.keyframes);
		for (let k of obs) {
			let keyframes = this.keyframes[k];
			this._animateTrack(this.getFigure(parseInt(k.split("_")[1])), keyframes, frame);
		}
	};
}

// FABRIK Implementation
/**
 * @param {Figure} fig
 */
function _getIKNodes(fig) {
	if (fig.ik === 0) return null;
	let n = fig;
	let nodes = [];
	let depth = 0;
	while (n !== null && depth <= fig.ik) {
		nodes.push(new Vec2(n.globalPos()));
		n = n.parent;
		depth++;
	}
	return nodes;
}

function _getIKFigs(fig) {
	if (fig.ik === 0) return null;
	let n = fig;
	let nodes = [];
	let depth = 0;
	while (n !== null && depth < fig.ik) {
		nodes.push(n);
		n = n.parent;
		depth++;
	}
	return nodes;
}

/**
 * @param {Figure} fig
 * @param {Array} segments
 */
function _transferIK(fig, segments) {
	if (fig.ik === 0) return;
	let n = fig;
	let i = 0;
	while (n !== null && i < fig.ik) {
		let vec = segments[i].sub(segments[i + 1]);
		let ang = Math.atan2(vec.y, vec.x);
		let pang = n.parent !== null ? n.parent.globalRot() : 0;
		n.rot = ang - pang;
		n = n.parent;
		i++;
	}
}

function _reach(head, tail, tgt) {
	let c_dx = tail.x - head.x;
	let c_dy = tail.y - head.y;
	let c_dist = Math.sqrt(c_dx * c_dx + c_dy * c_dy);

	let s_dx = tail.x - tgt.x;
	let s_dy = tail.y - tgt.y;
	let s_dist = Math.sqrt(s_dx * s_dx + s_dy * s_dy);

	let scale = c_dist / s_dist;

	return [
		new Vec2(tgt.x, tgt.y),
		new Vec2(tgt.x + s_dx * scale, tgt.y + s_dy * scale)
	];
}

function _fabrik(segments, tgt) {
	let base = new Vec2(segments[segments.length - 1]);

	// Forward
	for (let i = 0; i < segments.length - 1; i++) {
		let r = _reach(segments[i], segments[i + 1], tgt);
		segments[i] = r[0];
		tgt = r[1];
	}
	segments[segments.length - 1] = tgt;

	// Backward
	tgt = base;
	for (let i = segments.length - 1; i > 0; i--) {
		let r = _reach(segments[i], segments[i - 1], tgt);
		segments[i] = r[0];
		tgt = r[1];
	}
	segments[0] = tgt;
}
//

let mouse = new Vec2(0, 0);
let drag = false;

let scene = new Scene();
let selectedStick = null, selectedFig = null, segments = [];

function redraw() {
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	scene.draw(ctx);

	if (selectedFig !== null && !TL.playing) {
		selectedFig.drawHandles(ctx);
	}
}

canvas.width = scene.width;
canvas.height = scene.height;

canvas.focus();
canvas.onmousedown = function(e) {
	let rec = canvas.getBoundingClientRect();
	drag = true;
	mouse.x = e.clientX - rec.left;
	mouse.y = e.clientY - rec.top;

	let clickedFig = false;
	for (let fig of scene.figures) {
		let ob = fig.test(mouse.x, mouse.y);
		if (ob !== null) {
			if (!scene.keyframes[`fig_${ob.id}`]) {
				scene.keyframes[`fig_${ob.id}`] = [];
			}
			let kf = scene.keyframes[`fig_${ob.id}`];
			TL.setKeyFrames(kf);

			if (selectedStick !== null) selectedStick.selected = false;
			selectedStick = ob;
			selectedStick.selected = true;
			selectedFig = fig;

			clickedFig = true;
			if (selectedStick.ik > 0) {
				segments = _getIKNodes(selectedStick);
			}
			break;
		}
	}

	if (!clickedFig) {
		if (selectedStick !== null) selectedStick.selected = false;
		selectedFig = null;
		selectedStick = null;
	}

	redraw();
};

let changed = false;
canvas.onmousemove = function(e) {
	let rec = canvas.getBoundingClientRect();
	mouse.x = e.clientX - rec.left;
	mouse.y = e.clientY - rec.top;
	if (drag) {
		if (selectedStick !== null) {
			if (selectedStick.parent !== null) {
				if (selectedStick.ik === 0) {
					let pos = selectedStick.parent.globalPos();
					let dx = mouse.x - pos.x, dy = mouse.y - pos.y;
					let a = Math.atan2(dy, dx);
					let angl = (a - selectedStick.parent.globalRot());
					selectedStick.rot = angl;
					changed = true;
				} else {
					if (segments !== null) {
						_fabrik(segments, mouse);
						_transferIK(selectedStick, segments);
						changed = true;
					}
				}
			} else {
				selectedStick.pos.x = mouse.x;
				selectedStick.pos.y = mouse.y;
				changed = true;
			}
		}
		redraw();
	}
};

canvas.onmouseup = function() {
	drag = false;
	if (changed) {
		newKeyframe();
		changed = false;
	}
};

window.onresize = function() {
	redraw();
};

scene.addFigureString(`S(X: 5, Y: 5, NAME: root) {
	S(ROT: -90, LEN: 40, NAME: torso) {
		S(ROT: 130, LEN: 25, NAME: l_arm) {
			S(ROT: 20, LEN: 25, IK: 2, NAME: l_farm)
		}
		S(ROT: -130, LEN: 25, NAME: r_arm) {
			S(ROT: -20, LEN: 25, IK: 2, NAME: r_farm)
		}
		S(LEN: 25, CIR: TRUE, MOV: FALSE, NAME: head)
	}
	S(ROT: 130, LEN: 25, NAME: l_leg) {
		S(ROT: -20, LEN: 25, IK: 2, NAME: l_fleg)
	}
	S(ROT: 45, LEN: 25, NAME: r_leg) {
		S(ROT: 20, LEN: 25, IK: 2, NAME: r_fleg)
	}
}`);
redraw();

function newKeyframe() {
	if (TL.playing) return;
	if (selectedStick.ik === 0) {
		scene.addKeyframe(selectedStick.id, new Vec2(selectedStick.pos), selectedStick.rot, TL.current);
	} else {
		for (let ob of _getIKFigs(selectedStick)) {
			scene.addKeyframe(ob.id, new Vec2(ob.pos), ob.rot, TL.current);
		}
	}
	TL._redraw();
}

function playStop(btn) {
	if (!TL.playing) {
		btn.innerHTML = `<i class="fa fa-stop"></i>`;
		TL.play(parseInt(document.getElementById("fps").value));
	} else {
		btn.innerHTML = `<i class="fa fa-play"></i>`;
		TL.stop();
	}
	scene.animate(TL.current);
	redraw();
}

redraw();
TL.init();
TL.ontick(function(f) {
	scene.animate(f);
	redraw();
});