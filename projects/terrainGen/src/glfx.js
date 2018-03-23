const GLFX_NextFrame = (function() {
	return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
})();

function GLFX_ElementResized(element, callback) {
	var elementHeight = element.height,
		elementWidth = element.width;
	setInterval(function(){
		if( element.height !== elementHeight || element.width !== elementWidth ){
			elementHeight = element.height;
			elementWidth = element.width;
			callback();
		}
	}, 300);
}

function GLFX_ContextSetup(eid=null, width=640, height=480) {
	let canvas = null;
	if (eid) {
		canvas = document.getElementById(eid);
	} else {
		canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
	}
	return [canvas, canvas.getContext("webgl")];
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};

Math.cot = function(v) {
	return 1.0 / Math.tan(v);
}

Math.isPowerOf2 = function(v) {
	return (v & (v - 1)) == 0;
}

class Vec2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	dot(v) {
		if (!(v instanceof Vec2)) { return undefined; }
		return this.x * v.x + this.y * v.y;
	}

	perpDot(v) {
		if (!(v instanceof Vec2)) { return undefined; }
		return this.x * v.y - this.y * v.x;
	}

	get length() {
		return Math.sqrt(this.dot(this));
	}

	normalized() {
		let len = this.length;
		return new Vec2(this.x / len, this.y / len);
	}

	add(v) {
		if (!(v instanceof Vec2)) { return undefined; }
		return new Vec2(this.x + v.x, this.y + v.y);
	}

	sub(v) {
		if (!(v instanceof Vec2)) { return undefined; }
		return new Vec2(this.x - v.x, this.y - v.y);
	}

	mul(v) {
		if (v instanceof Vec2) {
			return new Vec2(this.x * v.x, this.y * v.y);
		} else if (typeof v === 'number') {
			return new Vec2(this.x * v, this.y * v);
		}
		return undefined;
	}
}

class Vec3 {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	dot(v) {
		if (!(v instanceof Vec3)) { return 0; }
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	cross(v) {
		if (!(v instanceof Vec3)) { return undefined; }
		return new Vec3(
			this.y * v.z - this.z * v.y,
			this.z * v.x - this.x * v.z,
			this.x * v.y - this.y * v.x
		);
	}

	get length() {
		return Math.sqrt(this.dot(this));
	}

	normalized() {
		let len = this.length;
		return new Vec3(this.x / len, this.y / len, this.z / len);
	}

	add(v) {
		if (!(v instanceof Vec3)) { return undefined; }
		return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
	}

	sub(v) {
		if (!(v instanceof Vec3)) { return undefined; }
		return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
	}

	mul(v) {
		if (v instanceof Vec3) {
			return new Vec3(this.x * v.x, this.y * v.y, this.z * v.z);
		} else if (typeof v === 'number') {
			return new Vec3(this.x * v, this.y * v, this.z * v);
		}
		return undefined;
	}
}

class Vec4 {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	dot(v) {
		if (!(v instanceof Vec4)) { return undefined; }
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}

	get length() {
		return Math.sqrt(this.dot(this));
	}

	normalized() {
		let len = this.length;
		return new Vec4(this.x / len, this.y / len, this.z / len, this.w / len);
	}

	mul(v) {
		if (v instanceof Vec4) {
			return new Vec4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
		} else if (typeof v === 'number') {
			return new Vec4(this.x * v, this.y * v, this.z * v, this.w * v);
		}
		return undefined;
	}

	toVec3() {
		return new Vec3(this.x, this.y, this.z);
	}

	get values() {
		return [this.x, this.y, this.z, this.w];
	}

	setValue(index, v) {
		switch (index) {
			default:
			case 0: this.x = v; break;
			case 1: this.y = v; break;
			case 2: this.z = v; break;
			case 3: this.w = v; break;
		}
	}

	set(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
}

class Mat4 {
	constructor(v) {
		if ((v instanceof Float32Array || v instanceof Array) && v.length === 16) {
			this.rows = [
				new Vec4(v[0], v[1], v[2], v[3]),
				new Vec4(v[4], v[5], v[6], v[7]),
				new Vec4(v[8], v[9], v[10], v[11]),
				new Vec4(v[12], v[13], v[14], v[15])
			];
		} else {
			this.rows = [
				new Vec4(1, 0, 0, 0),
				new Vec4(0, 1, 0, 0),
				new Vec4(0, 0, 1, 0),
				new Vec4(0, 0, 0, 1)
			];
		}
		this.fa = new Float32Array(16);
	}

	getValue(row, col) {
		return this.rows[row].values[col];
	}

	get value() {
		let i = 0;
		for (let row of this.rows) {
			for (let v of row.values) {
				this.fa[i] = v;
				i++;
			}
		}
		return this.fa;
	}

	clone() {
		let [a, b, c, d] = this.rows;
		return new Mat4([
			a.x, a.y, a.z, a.w,
			b.x, b.y, b.z, b.w,
			c.x, c.y, c.z, c.w,
			d.x, d.y, d.z, d.w
		]);
	}

	transposed() {
		let [a, b, c, d] = this.rows;
		return new Mat4([
			a.x, b.x, c.x, d.x,
			a.y, b.y, c.y, d.y,
			a.z, b.z, c.z, d.z,
			a.w, b.w, c.w, d.w
		]);
	}

	inverted() {
		let mat = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0]
		];
		let tmp = new Array(12);
		let src = new Array(16);

		// Transpose
		for (let i = 0; i < 4; i++) {
			src[i + 0] = this.getValue(i, 0);
			src[i + 4] = this.getValue(i, 1);
			src[i + 8] = this.getValue(i, 2);
			src[i + 12] = this.getValue(i, 3);
		}

		// Calculate pairs for first 8 elements (cofactors)
		tmp[0] = src[10] * src[15];
		tmp[1] = src[11] * src[14];
		tmp[2] = src[9] * src[15];
		tmp[3] = src[11] * src[13];
		tmp[4] = src[9] * src[14];
		tmp[5] = src[10] * src[13];
		tmp[6] = src[8] * src[15];
		tmp[7] = src[11] * src[12];
		tmp[8] = src[8] * src[14];
		tmp[9] = src[10] * src[12];
		tmp[10] = src[8] * src[13];
		tmp[11] = src[9] * src[12];

		// Calculate first 8 elements (cofactors)
		mat[0][0] = tmp[0] * src[5] + tmp[3] * src[6] + tmp[4] * src[7];
		mat[0][0] -= tmp[1] * src[5] + tmp[2] * src[6] + tmp[5] * src[7];
		mat[0][1] = tmp[1] * src[4] + tmp[6] * src[6] + tmp[9] * src[7];
		mat[0][1] -= tmp[0] * src[4] + tmp[7] * src[6] + tmp[8] * src[7];
		mat[0][2] = tmp[2] * src[4] + tmp[7] * src[5] + tmp[10] * src[7];
		mat[0][2] -= tmp[3] * src[4] + tmp[6] * src[5] + tmp[11] * src[7];
		mat[0][3] = tmp[5] * src[4] + tmp[8] * src[5] + tmp[11] * src[6];
		mat[0][3] -= tmp[4] * src[4] + tmp[9] * src[5] + tmp[10] * src[6];
		mat[1][0] = tmp[1] * src[1] + tmp[2] * src[2] + tmp[5] * src[3];
		mat[1][0] -= tmp[0] * src[1] + tmp[3] * src[2] + tmp[4] * src[3];
		mat[1][1] = tmp[0] * src[0] + tmp[7] * src[2] + tmp[8] * src[3];
		mat[1][1] -= tmp[1] * src[0] + tmp[6] * src[2] + tmp[9] * src[3];
		mat[1][2] = tmp[3] * src[0] + tmp[6] * src[1] + tmp[11] * src[3];
		mat[1][2] -= tmp[2] * src[0] + tmp[7] * src[1] + tmp[10] * src[3];
		mat[1][3] = tmp[4] * src[0] + tmp[9] * src[1] + tmp[10] * src[2];
		mat[1][3] -= tmp[5] * src[0] + tmp[8] * src[1] + tmp[11] * src[2];

		// Calculate pairs for second 8 elements (cofactors)
		tmp[0] = src[2] * src[7];
		tmp[1] = src[3] * src[6];
		tmp[2] = src[1] * src[7];
		tmp[3] = src[3] * src[5];
		tmp[4] = src[1] * src[6];
		tmp[5] = src[2] * src[5];
		tmp[6] = src[0] * src[7];
		tmp[7] = src[3] * src[4];
		tmp[8] = src[0] * src[6];
		tmp[9] = src[2] * src[4];
		tmp[10] = src[0] * src[5];
		tmp[11] = src[1] * src[4];

		// Calculate second 8 elements (cofactors)
		mat[2][0] = tmp[0] * src[13] + tmp[3] * src[14] + tmp[4] * src[15];
		mat[2][0] -= tmp[1] * src[13] + tmp[2] * src[14] + tmp[5] * src[15];
		mat[2][1] = tmp[1] * src[12] + tmp[6] * src[14] + tmp[9] * src[15];
		mat[2][1] -= tmp[0] * src[12] + tmp[7] * src[14] + tmp[8] * src[15];
		mat[2][2] = tmp[2] * src[12] + tmp[7] * src[13] + tmp[10] * src[15];
		mat[2][2] -= tmp[3] * src[12] + tmp[6] * src[13] + tmp[11] * src[15];
		mat[2][3] = tmp[5] * src[12] + tmp[8] * src[13] + tmp[11] * src[14];
		mat[2][3] -= tmp[4] * src[12] + tmp[9] * src[13] + tmp[10] * src[14];
		mat[3][0] = tmp[2] * src[10] + tmp[5] * src[11] + tmp[1] * src[9];
		mat[3][0] -= tmp[4] * src[11] + tmp[0] * src[9] + tmp[3] * src[10];
		mat[3][1] = tmp[8] * src[11] + tmp[0] * src[8] + tmp[7] * src[10];
		mat[3][1] -= tmp[6] * src[10] + tmp[9] * src[11] + tmp[1] * src[8];
		mat[3][2] = tmp[6] * src[9] + tmp[11] * src[11] + tmp[3] * src[8];
		mat[3][2] -= tmp[10] * src[11] + tmp[2] * src[8] + tmp[7] * src[9];
		mat[3][3] = tmp[10] * src[10] + tmp[4] * src[8] + tmp[9] * src[9];
		mat[3][3] -= tmp[8] * src[9] + tmp[11] * src[10] + tmp[5] * src[8];

		// Calculate determinant
		let det = 1.0 / (src[0] * mat[0][0] + src[1] * mat[0][1] + src[2] * mat[0][2] + src[3] * mat[0][3]);
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				mat[i][j] = mat[i][j] * det;
			}
		}

		let fmat = new Array(16);
		for (let row of mat) {
			fmat.push(...row);
		}
		return new Mat4(fmat);
	}

	mul(rhs) {
		if (rhs instanceof Mat4) {
			let d = new Array(16);
			let ot = rhs.transposed();
			for (let j = 0; j < 4; j++) {
				for (let i = 0; i < 4; i++) {
					d[i + j * 4] = this.rows[j].dot(ot.rows[i]);
				}
			}
			return new Mat4(d);
		} else if (rhs instanceof Vec4) {
			return new Vec4(
				this.rows[0].dot(rhs),
				this.rows[1].dot(rhs),
				this.rows[2].dot(rhs),
				this.rows[3].dot(rhs)
			);
		} else if (rhs instanceof Vec3) {
			let v = new Vec4(rhs.x, rhs.y, rhs.z, 1);
			return new Vec3(
				this.rows[0].dot(v),
				this.rows[1].dot(v),
				this.rows[2].dot(v)
			);
		} else if (typeof rhs === 'number') {
			let d = new Array(16);
			for (let j = 0; j < 4; j++) {
				for (let i = 0; i < 4; i++) {
					d[i + j * 4] = this.getValue(j, i) * rhs;
				}
			}
			return new Mat4(d);
		}
	}

	static ident() {
		return new Mat4([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	}

	static translation(x, y=0, z=0) {
		let vx = 0, vy = y, vz = z;
		if (x instanceof Vec3) {
			vx = x.x; vy = x.y; vz = x.z;
		} else {
			vx = x; vy = y; vz = z;
		}
		return new Mat4([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			vx, vy, vz, 1
		]);
	}

	static scale(x, y=0, z=0) {
		let vx = 0, vy = y, vz = z;
		if (x instanceof Vec3) {
			vx = x.x; vy = x.y; vz = x.z;
		} else {
			vx = x; vy = y; vz = z;
		}
		return new Mat4([
			vx, 0, 0, 0,
			0, vy, 0, 0,
			0, 0, vz, 0,
			0, 0, 0, 1
		]);
	}

	static uniformScale(s) {
		return new Mat4([
			s, 0, 0, 0,
			0, s, 0, 0,
			0, 0, s, 0,
			0, 0, 0, 1
		]);
	}

	static rotationX(a) {
		let s = Math.sin(a), c = Math.cos(a);
		return new Mat4([
			1.0, 0.0, 0.0, 0.0,
			0.0,   c,  -s, 0.0,
			0.0,   s,   c, 0.0,
			0.0, 0.0, 0.0, 1.0
		]);
	}

	static rotationY(a) {
		let s = Math.sin(a), c = Math.cos(a);
		return new Mat4([
			  c, 0.0,  -s, 0.0,
			0.0, 1.0, 0.0, 0.0,
			  s, 0.0,   c, 0.0,
			0.0, 0.0, 0.0, 1.0
		]);
	}

	static rotationZ(a) {
		let s = Math.sin(a), c = Math.cos(a);
		return new Mat4([
			  c,  -s, 0.0, 0.0,
			  s,   c, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		]);
	}

	static axisAngle(axis, a) {
		if (!(axis instanceof Vec3)) return undefined;
		let s = Math.sin(a), c = Math.cos(a);
		let t = 1.0 - c;
		let ax = axis.normalized();
		let x = ax.x;
		let y = ax.y;
		let z = ax.z;
		return new Mat4([
			t * x * x + c, t * x * y - z * s, t * x * z + y * s, 0.0,
			t * x * y + z * s, t * y * y + c, t * y * z - x * s, 0.0,
			t * x * z - y * s, t * y * z + x * s, t * z * z + c, 0.0,
			0.0, 0.0, 0.0, 1.0
		]);
	}

	static ortho(l, r, t, b, n, f) {
		let w = r - l;
		let h = t - b;
		let d = f - n;
		return new Mat4([
			2.0 / w,	 0.0,	   0.0, -(r + l) / w,
				0.0, 2.0 / h,	   0.0, -(t + b) / h,
				0.0,	 0.0, -2.0 / d, -(f + n) / d,
				0.0,	 0.0,	   0.0,			 1.0,
		]);
	}

	static ortho2D(width, height) {
		return Mat4.ortho(0, width, height, 0, -1, 1);
	}

	static frustum(l, r, b, t, n, f) {
		let n2, w, h, d;

		n2 = 2 * n;
		w = r - l;
		h = t - b;
		d = f - n;

		let m = new Mat4();
		m.rows[0].set(n2 / w, 0, 0, 0);
		m.rows[1].set(0, n2 / h, 0, 0);
		m.rows[2].set((r + l) / w, (t + b) / h, (-f - n) / d, -1);
		m.rows[3].set(0, 0, (-n2 * f) / d, 0);

		return m;
	}

	static perspective(fov, asp, n, f) {
		let xmax, ymax;
		ymax = n * Math.tan(fov);
		xmax = ymax * asp;
		return Mat4.frustum(-xmax, xmax, -ymax, ymax, n, f);
	}

	static lookAt(eye, at, up) {
		if (!(eye instanceof Vec3)) return undefined;
		if (!(at instanceof Vec3)) return undefined;
		if (!(up instanceof Vec3)) return undefined;

		let z = eye.sub(at).normalized();
		let x = up.cross(z).normalized();
		let y = z.cross(x);

		let R = new Mat4([
			x.x, x.y, -x.z, 0.0,
			y.x, y.y, -y.z, 0.0,
			z.x, z.y, -z.z, 0.0,
			0.0, 0.0, 0.0, 1.0
		]);

		return Mat4.translation(eye.mul(-1)).mul(R);
	}
}

class Uniform {
	constructor(GL, loc) {
		this.loc = loc;
		this.GL = GL;
	}

	setInt(v) {
		this.GL.uniform1i(this.loc, v);
	}

	setFloat(v) {
		this.GL.uniform1f(this.loc, v);
	}

	setVec2(v) {
		if (!(v instanceof Vec2)) return;
		this.GL.uniform2f(this.loc, v.x, v.y);
	}

	setVec3(v) {
		if (!(v instanceof Vec3)) return;
		this.GL.uniform3f(this.loc, v.x, v.y, v.z);
	}

	setVec4(v) {
		if (!(v instanceof Vec4)) return;
		this.GL.uniform4f(this.loc, v.x, v.y, v.z, v.w);
	}

	setMat4(v) {
		if (!(v instanceof Mat4)) return;
		this.GL.uniformMatrix4fv(this.loc, false, v.value);
	}
}

class Shader {
	constructor(GL) {
		this.GL = GL;
		this.program = GL.createProgram();
		this.uniforms = new Map();
		this.attributes = new Map();
	}

	setSources(vert, frag) {
		let vs = this.GL.createShader(this.GL.VERTEX_SHADER);
		this.GL.shaderSource(vs, vert);
		this.GL.compileShader(vs);
		
		if (!this.GL.getShaderParameter(vs, this.GL.COMPILE_STATUS)) {
			console.error("Vertex Shader Error:\n\t" + this.GL.getShaderInfoLog(vs));
			this.GL.deleteShader(vs);
			return;
		}
		//
		let fs = this.GL.createShader(this.GL.FRAGMENT_SHADER);
		this.GL.shaderSource(fs, frag);
		this.GL.compileShader(fs);
		
		if (!this.GL.getShaderParameter(fs, this.GL.COMPILE_STATUS)) {
			console.error("Fragment Shader Error:\n\t" + this.GL.getShaderInfoLog(fs));
			this.GL.deleteShader(fs);
			return;
		}

		this.GL.attachShader(this.program, vs);
		this.GL.attachShader(this.program, fs);
		this.GL.linkProgram(this.program);

		this.GL.deleteShader(vs);
		this.GL.deleteShader(fs);
	}

	bind() {
		this.GL.useProgram(this.program);
	}

	unbind() {
		this.GL.useProgram(null);
	}

	getUniformLocation(name) {
		if (!this.uniforms.has(name)) {
			let loc = this.GL.getUniformLocation(this.program, name);
			if (loc !== null && loc !== -1) {
				this.uniforms.set(name, loc);
			} else {
				return null;
			}
		}
		return this.uniforms.get(name);
	}

	getAttribLocation(name) {
		if (!this.attributes.has(name)) {
			let loc = this.GL.getAttribLocation(this.program, name);
			if (loc !== null && loc !== -1) {
				this.attributes.set(name, loc);
			} else {
				return null;
			}
		}
		return this.attributes.get(name);
	}

	getUniform(name) {
		let loc = this.getUniformLocation(name);
		if (loc) {
			return new Uniform(this.GL, loc);
		}
		return null;
	}

	delete() {
		this.GL.deleteProgram(this.program);
	}
}

class Texture2D {
	constructor(GL, src, width=1, height=1) {
		this.GL = GL;
		this.id = GL.createTexture();
		this.ispow2 = false;
		this.valid = false;
		let _this = this;
		if (src) {
			let img = new Image();
			img.onload = function() {
				GL.bindTexture(GL.TEXTURE_2D, _this.id);
				GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, GL.RGBA, GL.UNSIGNED_BYTE, img);
				if (Math.isPowerOf2(img.width) && Math.isPowerOf2(img.height)) {
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.REPEAT);
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.REPEAT);
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);

					GL.generateMipmap(GL.TEXTURE_2D);

					_this.ispow2 = true;
				} else {
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
					GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
				}
				_this.valid = true;
				GL.bindTexture(GL.TEXTURE_2D, null);
			}
			img.src = src;
		} else {
			GL.bindTexture(GL.TEXTURE_2D, _this.id);
			if (Math.isPowerOf2(width) && Math.isPowerOf2(height)) {
				GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
				GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
				_this.ispow2 = true;
			} else {
				GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
				GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
			}
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
			GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
			GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, width, height, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
			_this.valid = true;
			GL.bindTexture(GL.TEXTURE_2D, null);
		}
	}

	bind(slot=0) {
		if (this.valid) {
			this.GL.activeTexture(this.GL.TEXTURE0 + slot);
			this.GL.bindTexture(this.GL.TEXTURE_2D, this.id);
		}
	}

	unbind() {
		this.GL.bindTexture(this.GL.TEXTURE_2D, null);
	}
}

const VSIZE_F = 15;
const VSIZE = VSIZE_F * 4;

class Vertex {
	constructor(x, y, z, u, v, nx=0, ny=0, nz=0, tx=0, ty=0, tz=0, r=1, g=1, b=1, a=1) {
		this.position = new Vec3(x, y, z);
		this.uv = new Vec2(u, v);
		this.normal = new Vec3(nx, ny, nz);
		this.tangent = new Vec3(tx, ty, tz);
		this.color = new Vec4(r, g, b, a);
	}

	toArray() {
		return [
			this.position.x, this.position.y, this.position.z,
			this.normal.x, this.normal.y, this.normal.z,
			this.tangent.x, this.tangent.y, this.tangent.z,
			this.uv.x, this.uv.y,
			this.color.x, this.color.y, this.color.z, this.color.w
		];
	}
}

class Mesh {
	constructor(GL) {
		this.GL = GL;
		this.vertices = []; // [Vertex, ...]
		this.indices = [];
		this.indexed = true;
		this.vbo = GL.createBuffer();
		this.ibo = GL.createBuffer();
		this.firstTimeVBO = true;
		this.firstTimeIBO = true;
	}

	addVertex(x, y, z, u, v, nx=0, ny=0, nz=0, tx=0, ty=0, tz=0, r=1, g=1, b=1, a=1) {
		this.vertices.push(new Vertex(x, y, z, u, v, nx, ny, nz, tx, ty, tz, r, g, b, a));
	}

	addTriangle(a, b, c) {
		this.indices.push(a, b, c);
	}

	addIndex(i) {
		this.indices.push(i);
	}

	__triNormal(i0, i1, i2) {
		let v0 = this.vertices[i0].position;
		let v1 = this.vertices[i1].position;
		let v2 = this.vertices[i2].position;

		let e0 = v1.sub(v0);
		let e1 = v2.sub(v0);
		let n = e0.cross(e1);

		this.vertices[i0].normal = this.vertices[i0].normal.add(n);
		this.vertices[i1].normal = this.vertices[i1].normal.add(n);
		this.vertices[i2].normal = this.vertices[i2].normal.add(n);
	}

	getIndex(i) {
		if (this.indexed) {
			return this.indices[i];
		}
		return i;
	}

	calculateNormals(primitive) {
		switch (primitive) {
			case this.GL.POINTS:
			case this.GL.LINES:
			case this.GL.LINE_LOOP:
			case this.GL.LINE_STRIP:
				break;
			case this.GL.TRIANGLES: {
				for (let i = 0; i < this.indices.length; i+=3) {
					let i0 = this.getIndex(i + 0);
					let i1 = this.getIndex(i + 1);
					let i2 = this.getIndex(i + 2);
					this.__triNormal(i0, i1, i2);
				}
			} break;
			case this.GL.TRIANGLE_FAN: {
				for (let i = 0; i < this.indices.length; i+=2) {
					let i0 = this.getIndex(0);
					let i1 = this.getIndex(i);
					let i2 = this.getIndex(i + 1);
					this.__triNormal(i0, i1, i2);
				}
			} break;
			case this.GL.TRIANGLE_STRIP: {
				for (let i = 0; i < this.indices.length-2; i++) {
					let i0, i1, i2;
					if (i % 2 === 0) {
						i0 = this.getIndex(i + 0);
						i1 = this.getIndex(i + 1);
						i2 = this.getIndex(i + 2);
					} else {
						i0 = this.getIndex(i + 2);
						i1 = this.getIndex(i + 1);
						i2 = this.getIndex(i + 0);
					}
					this.__triNormal(i0, i1, i2);
				}
			} break;
		}
		
		for (let i = 0; i < this.vertices.length; i++) {
			this.vertices[i].normal = this.vertices[i].normal.normalized();
		}
	}

	update() {
		let gl = this.GL;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		let varr = [];
		for (let v of this.vertices) {
			varr.push(...v.toArray());
		}

		if (this.firstTimeVBO) {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(varr), gl.DYNAMIC_DRAW);
			this.firstTimeVBO = false;
		} else {
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(varr));
		}

		if (this.indexed) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
			if (this.firstTimeIBO) {
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.DYNAMIC_DRAW);
				this.firstTimeIBO = false;
			} else {
				gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(this.indices));
			}
		}
	}

	render(shader, primitive) {
		let gl = this.GL;

		let posL = shader.getAttribLocation("vPosition");
		let nrmL = shader.getAttribLocation("vNormal");
		let tanL = shader.getAttribLocation("vTangent");
		let uvL = shader.getAttribLocation("vUV");
		let colorL = shader.getAttribLocation("vColor");

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

		gl.enableVertexAttribArray(posL);
		gl.vertexAttribPointer(posL, 3, gl.FLOAT, false, VSIZE, 0);

		gl.enableVertexAttribArray(nrmL);
		gl.vertexAttribPointer(nrmL, 3, gl.FLOAT, false, VSIZE, 12);

		gl.enableVertexAttribArray(tanL);
		gl.vertexAttribPointer(tanL, 3, gl.FLOAT, false, VSIZE, 24);

		gl.enableVertexAttribArray(uvL);
		gl.vertexAttribPointer(uvL, 2, gl.FLOAT, false, VSIZE, 36);

		gl.enableVertexAttribArray(colorL);
		gl.vertexAttribPointer(colorL, 4, gl.FLOAT, false, VSIZE, 44);

		if (this.indexed) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
			gl.drawElements(primitive, this.indices.length, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(primitive, 0, this.vertices.length);
		}
	}

	delete() {
		this.GL.deleteBuffer(this.vbo);
		this.GL.deleteBuffer(this.ibo);
	}
}