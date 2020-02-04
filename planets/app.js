/// Basic math types and helpers
Math.lerp = function(a, b, t) {
	return (1 - t) * a + b * t;
};

Math.cosInterpolate = function(a, b, t) {
	let t2 = (1.0 - Math.cos(t * Math.PI)) / 2.0;
	return Math.lerp(a, b, t2);
};

Math.clamp = function(v, mi, ma) {
	return Math.max(Math.min(v, ma), mi);
};

class Vec2 {
	constructor(x, y) {
		this.x = x || 0.0;
		this.y = y || 0.0;
	}

	/**
	 * Dot product
	 * @param {Vec2} other
	 */
	dot(other) {
		return this.x * other.x + this.y * other.y;
	}

	get lengthSqr() { return this.dot(this); }
	get length() { return Math.sqrt(this.lengthSqr); }

	normalized() {
		let len = this.length;
		return new Vec2(this.x / len, this.y / len);
	}

	/**
	 * 
	 * @param {Vec2} other 
	 */
	add(other) {
		return new Vec2(this.x + other.x, this.y + other.y);
	}

	/**
	 * 
	 * @param {Vec2} other 
	 */
	sub(other) {
		return new Vec2(this.x - other.x, this.y - other.y);
	}

	/**
	 * 
	 * @param {number} other 
	 */
	mul(other) {
		return new Vec2(this.x * other, this.y * other);
	}

	/**
	 * 
	 * @param {number} other 
	 */
	div(other) {
		return new Vec2(this.x / other, this.y / other);
	}

}

/// Simulation
const G = 39.5;
const S = 0.15;
const GRID = 128;
const BASE_MASS = 1; // Suns
const UNIVERSE_SIZE = 2; // Grid units

class Body {
	constructor(mass, x, y) {
		let a = Math.random() * Math.PI * 2;
		this.position = new Vec2(x, y);
		this.velocity = new Vec2(Math.cos(a), Math.sin(a));
		this.mass = mass || 0.001;
	}

	get quadrantX() {
		return Math.floor(this.position.x / GRID);
	}

	get quadrantY() {
		return Math.floor(this.position.y / GRID);
	}

	get quadrant() {
		return this.quadrantX + UNIVERSE_SIZE * this.quadrantY;
	}
}

class QuadTree {
	constructor(tl, br) {
		this.topLeft = tl || new Vec2();
		this.bottomRight = br || new Vec2();

		this.body = null;
		this.topLeftTree = null;
		this.topRightTree = null;
		this.bottomLeftTree = null;
		this.bottomRightTree = null;
	}

	get content() {
		let a = [];
		if (this.body !== null) a.push(this.body);
		if (this.topLeftTree !== null) a.push(...this.topLeftTree.content);
		if (this.topRightTree !== null) a.push(...this.topRightTree.content);
		if (this.bottomLeftTree !== null) a.push(...this.bottomLeftTree.content);
		if (this.bottomRightTree !== null) a.push(...this.bottomRightTree.content);
		return a;
	}

	get totalMass() {
		let m = 0;
		m += this.topLeftTree !== null ? this.topLeftTree.totalMass : 0;
		m += this.topRightTree !== null ? this.topRightTree.totalMass : 0;
		m += this.bottomLeftTree !== null ? this.bottomLeftTree.totalMass : 0;
		m += this.bottomRightTree !== null ? this.bottomRightTree.totalMass : 0;
		m += this.body !== null ? this.body.mass : 0;
		return m;
	}

	get centerOfMass() {
		let comc = new Vec2();
		let k = 0;
		if (this.topLeftTree !== null) {
			let c = this.topLeftTree.centerOfMass;
			comc.x += c.x;
			comc.y += c.y;
			k++;
		}
		if (this.topRightTree !== null) {
			let c = this.topRightTree.centerOfMass;
			comc.x += c.x;
			comc.y += c.y;
			k++;
		}
		if (this.bottomLeftTree !== null) {
			let c = this.bottomLeftTree.centerOfMass;
			comc.x += c.x;
			comc.y += c.y;
			k++;
		}
		if (this.bottomRightTree !== null) {
			let c = this.bottomRightTree.centerOfMass;
			comc.x += c.x;
			comc.y += c.y;
			k++;
		}
		if (this.body !== null) {
			comc.x += this.body.position.x;
			comc.y += this.body.position.y;
			k++;
		}
		comc = comc.mul(1.0 / k);
		return comc;
	}

	/**
	 * 
	 * @param {function} callback 
	 */
	traverse(callback) {
		if (callback(this)) return;
		if (this.topLeftTree !== null) this.topLeftTree.traverse(callback);
		if (this.topRightTree !== null) this.topRightTree.traverse(callback);
		if (this.bottomLeftTree !== null) this.bottomLeftTree.traverse(callback);
		if (this.bottomRightTree !== null) this.bottomRightTree.traverse(callback);
	}

	/**
	 * 
	 * @param {Body} body 
	 */
	insert(body) {
		if (!body) return;
		if (!this.inBounds(body.position.x, body.position.y)) return;
		if (Math.abs(this.topLeft.x - this.bottomRight.x) <= 1 &&
			Math.abs(this.topLeft.y - this.bottomRight.y) <= 1)
		{
			if (this.body === null) {
				this.body = body;
			}
			return;
		}

		if ((this.topLeft.x + this.bottomRight.x) / 2.0 >= body.position.x) {
			if ((this.topLeft.y + this.bottomRight.y) / 2.0 >= body.position.y) {
				if (this.topLeftTree === null) {
					this.topLeftTree = new QuadTree(
						new Vec2(this.topLeft.x, this.topLeft.y),
						new Vec2((this.topLeft.x + this.bottomRight.x) / 2, (this.topLeft.y + this.bottomRight.y) / 2)
					);
				}
				this.topLeftTree.insert(body);
			} else {
				if (this.bottomLeftTree === null) {
					this.bottomLeftTree = new QuadTree(
						new Vec2(this.topLeft.x, (this.topLeft.y + this.bottomRight.y) / 2),
						new Vec2((this.topLeft.x + this.bottomRight.x) / 2, this.bottomRight.y)
					);
				}
				this.bottomLeftTree.insert(body);
			}
		} else {
			if ((this.topLeft.y + this.bottomRight.y) / 2.0 >= body.position.y) {
				if (this.topRightTree === null) {
					this.topRightTree = new QuadTree(
						new Vec2((this.topLeft.x + this.bottomRight.x) / 2, this.topLeft.y),
						new Vec2(this.bottomRight.x, (this.topLeft.y + this.bottomRight.y) / 2)
					);
				}
				this.topRightTree.insert(body);
			} else {
				if (this.bottomRightTree === null) {
					this.bottomRightTree = new QuadTree(
						new Vec2((this.topLeft.x + this.bottomRight.x) / 2, (this.topLeft.y + this.bottomRight.y) / 2),
						new Vec2(this.bottomRight.x, this.bottomRight.y)
					);
				}
				this.bottomRightTree.insert(body);
			}
		}
	}

	update() {
		
	}

	find(x, y) {
		if (!this.inBounds(x, y)) return null;
		if (this.body !== null) return this.body;

		if ((this.topLeft.x + this.bottomRight.x) / 2 >= x) {
			if ((this.topLeft.y + this.bottomRight.y) / 2 >= y) {
				if (this.topLeftTree === null) return null;
				return this.topLeftTree.find(x, y);
			} else {
				if (this.bottomLeftTree === null) return null;
				return this.bottomLeftTree.find(x, y);
			}
		} else {
			if ((this.topLeft.y + this.bottomRight.y) / 2 >= y) {
				if (this.topRightTree === null) return null;
				return this.topRightTree.find(x, y);
			} else {
				if (this.bottomRightTree === null) return null;
				return this.bottomRightTree.find(x, y);
			}
		}
	}

	inBounds(x, y) {
		return x >= this.topLeft.x &&
				x <= this.bottomRight.x &&
				y >= this.topLeft.y &&
				y <= this.bottomRight.y;
	}
}

class Simulation {
	constructor() {
		this.bodies = [];
		this.quadtree = null;
	}

	random() {
		for (let i = 0; i < 10; i++) {
			let mass = BASE_MASS * (Math.random() + 0.1);
			this.bodies.push(new Body(
				mass,
				Math.random() * UNIVERSE_SIZE * GRID,
				Math.random() * UNIVERSE_SIZE * GRID
			));
		}
		this.build();
	}

	build() {
		this.quadtree = new QuadTree(new Vec2(), new Vec2(UNIVERSE_SIZE * GRID, UNIVERSE_SIZE * GRID));
		for (let b of this.bodies) {
			this.quadtree.insert(b);
		}
	}

	step(dt) {
		this.build();

		const accuracy = 0.9;
		for (let i = 0; i < this.bodies.length; i++) {
			let pa = this.bodies[i];
			let accel = new Vec2();

			this.quadtree.traverse(function(q) {
				let delta = q.centerOfMass.sub(pa.position);
				let l = (q.bottomRight.x - q.topLeft.x);
				let d = delta.length;
				let r = l / d;
				if (r < accuracy) {
					let distSqr = delta.lengthSqr;
					let force = (G * q.totalMass) / (distSqr * Math.sqrt(distSqr + S));

					let ndelta = delta.normalized();
					accel = accel.add(ndelta.mul(force));
					return true;
				}
				return false;
			});

			pa.velocity.x += accel.x * dt;
			pa.velocity.y += accel.y * dt;

			pa.position.x += pa.velocity.x * dt;
			pa.position.y += pa.velocity.y * dt;

			if (pa.position.x < 0) {
				pa.position.x += UNIVERSE_SIZE * GRID;
			} else if (pa.position.x > UNIVERSE_SIZE * GRID) {
				pa.position.x -= UNIVERSE_SIZE * GRID;
			}
			if (pa.position.y < 0) {
				pa.position.y += UNIVERSE_SIZE * GRID;
			} else if (pa.position.y > UNIVERSE_SIZE * GRID) {
				pa.position.y -= UNIVERSE_SIZE * GRID;
			}
		}
		//console.log(this.quadrants);
	}

	/**
	 * 
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw(ctx) {
		ctx.strokeStyle = "rgba(0,128,0,0.25";
		this.quadtree.traverse(function(q) {
			let x = q.topLeft.x;
			let y = q.topLeft.y;
			let w = q.bottomRight.x - q.topLeft.x;
			let h = q.bottomRight.y - q.topLeft.y;
			ctx.beginPath();
			ctx.rect(x, y, w, h);
			ctx.stroke();
		});

		for (let k in this.quadrants) {
			if (!this.quadrants[k]) continue;
			let qx = (k % UNIVERSE_SIZE) * GRID;
			let qy = Math.floor(k / UNIVERSE_SIZE) * GRID;
			ctx.fillRect(qx, qy, GRID, GRID);
		}

		ctx.fillStyle = "dodgerblue";
		for (let body of this.bodies) {
			let r = 1;//(body.mass / 2) * 128;
			ctx.beginPath();
			ctx.arc(body.position.x, body.position.y, r, 0, Math.PI * 2);
			ctx.fill();
		}
	}

}

let sim = new Simulation();
sim.random();
sim.step(0.008);

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

window.onresize = function() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
window.onresize();

let zoom = 1.0;
canvas.onwheel = function(e) {
	let d = Math.sign(e.deltaY);
	zoom -= d * 0.02;
	zoom = Math.clamp(zoom, 0.1, 10.0);
};

const timeStep = 1.0 / 60.0;
let startTime = Date.now();
let accum = 0.0;
let deltaScale = 0.2;
function loop() {
	canvas.focus();

	let canRender = false;
	let currTime = Date.now();
	let delta = currTime - startTime;
	startTime = currTime;

	accum += delta;

	while (accum >= timeStep) {
		//sim.step(timeStep * deltaScale);
		accum -= timeStep;
		canRender = true;
	}

	if (canRender) {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.save();
		ctx.scale(zoom, zoom);
		sim.draw(ctx);
		ctx.restore();
	}

	window.requestAnimationFrame(loop);
}
loop();