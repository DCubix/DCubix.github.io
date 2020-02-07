var Fx = Fx || {};

var mat4 = {
	translation: function(x, y, z) {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			x, y, z, 1,
		];
	},
	rotationZ: function(rot) {
		let c = Math.cos(rot);
		let s = Math.sin(rot);
	
		return [
			c, s, 0, 0,
			-s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		];
	},
	scale: function(x, y, z) {
		return [
			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1,
		];
	},
	mul: function(a, b) {
		let b00 = b[0 * 4 + 0];
		let b01 = b[0 * 4 + 1];
		let b02 = b[0 * 4 + 2];
		let b03 = b[0 * 4 + 3];
		let b10 = b[1 * 4 + 0];
		let b11 = b[1 * 4 + 1];
		let b12 = b[1 * 4 + 2];
		let b13 = b[1 * 4 + 3];
		let b20 = b[2 * 4 + 0];
		let b21 = b[2 * 4 + 1];
		let b22 = b[2 * 4 + 2];
		let b23 = b[2 * 4 + 3];
		let b30 = b[3 * 4 + 0];
		let b31 = b[3 * 4 + 1];
		let b32 = b[3 * 4 + 2];
		let b33 = b[3 * 4 + 3];
		let a00 = a[0 * 4 + 0];
		let a01 = a[0 * 4 + 1];
		let a02 = a[0 * 4 + 2];
		let a03 = a[0 * 4 + 3];
		let a10 = a[1 * 4 + 0];
		let a11 = a[1 * 4 + 1];
		let a12 = a[1 * 4 + 2];
		let a13 = a[1 * 4 + 3];
		let a20 = a[2 * 4 + 0];
		let a21 = a[2 * 4 + 1];
		let a22 = a[2 * 4 + 2];
		let a23 = a[2 * 4 + 3];
		let a30 = a[3 * 4 + 0];
		let a31 = a[3 * 4 + 1];
		let a32 = a[3 * 4 + 2];
		let a33 = a[3 * 4 + 3];
		let dst = new Array(16);
		dst[ 0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
		dst[ 1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
		dst[ 2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
		dst[ 3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
		dst[ 4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
		dst[ 5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
		dst[ 6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
		dst[ 7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
		dst[ 8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
		dst[ 9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
		dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
		dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
		dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
		dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
		dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
		dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
		return dst;
	},
	xform: function(a, b) {
		if (a.length !== 16 || b.length !== 4) return null;

		let a00 = a[0 * 4 + 0];
		let a01 = a[0 * 4 + 1];
		let a02 = a[0 * 4 + 2];
		let a03 = a[0 * 4 + 3];
		let a10 = a[1 * 4 + 0];
		let a11 = a[1 * 4 + 1];
		let a12 = a[1 * 4 + 2];
		let a13 = a[1 * 4 + 3];
		let a20 = a[2 * 4 + 0];
		let a21 = a[2 * 4 + 1];
		let a22 = a[2 * 4 + 2];
		let a23 = a[2 * 4 + 3];
		let a30 = a[3 * 4 + 0];
		let a31 = a[3 * 4 + 1];
		let a32 = a[3 * 4 + 2];
		let a33 = a[3 * 4 + 3];
		return [
			a00 * b[0] + a01 * b[1] + a02 * b[2] + a03 * b[3],
			a10 * b[0] + a11 * b[1] + a12 * b[2] + a13 * b[3],
			a20 * b[0] + a21 * b[1] + a22 * b[2] + a23 * b[3],
			a30 * b[0] + a31 * b[1] + a32 * b[2] + a33 * b[3]
		];
	},
	ortho: function(left, right, bottom, top, near, far) {
		return [
			2 / (right - left), 0, 0, 0,
			0, 2 / (top - bottom), 0, 0,
			0, 0, 2 / (near - far), 0,
	
			(left + right) / (left - right),
			(bottom + top) / (bottom - top),
			(near + far) / (near - far),
			1.0
		];
	}
};

class Shader {
	constructor(vsrc, fsrc) {
		let gl = Fx.gl;
		let vs = Fx.loadShader(vsrc, gl.VERTEX_SHADER);
		let fs = Fx.loadShader(fsrc, gl.FRAGMENT_SHADER);
		if (vs === null || fs === null)
			return;

		this.attributes = {};
		this.uniforms = {};
		this.program = gl.createProgram();

		gl.attachShader(this.program, vs);
		gl.attachShader(this.program, fs);
		gl.linkProgram(this.program);
	}

	bind() {
		let gl = Fx.gl;
		gl.useProgram(this.program);
	}

	getUniformLocation(name) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		let ks = Object.keys(this.uniforms);
		if (ks.indexOf(name) === -1) {
			let loc = gl.getUniformLocation(this.program, name);
			if (loc !== -1) {
				this.uniforms[name] = loc;
			}
			else
				return null;
		}
		return this.uniforms[name];
	}

	getAttribute(name) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		let ks = Object.keys(this.attributes);
		if (ks.indexOf(name) === -1) {
			let loc = gl.getAttribLocation(this.program, name);
			if (loc !== -1) {
				this.attributes[name] = loc;
			}
			else
				return null;
		}
		return this.attributes[name];
	}

	seti(name, v) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.uniform1i(this.getUniformLocation(name), v);
	}

	setf(name, v) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.uniform1f(this.getUniformLocation(name), v);
	}

	set2f(name, x, y) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.uniform2f(this.getUniformLocation(name), x, y);
	}

	set3f(name, x, y, z) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.uniform3f(this.getUniformLocation(name), x, y, z);
	}

	set4f(name, x, y, z, w) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.uniform4f(this.getUniformLocation(name), x, y, z, w);
	}

	set16f(name, vals) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.uniformMatrix4fv(this.getUniformLocation(name), false, new Float32Array(vals));
	}

	destroy() {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.deleteProgram(this.program);
	}
}

class Texture {
	/**
	 * 
	 * @param {number} width 
	 * @param {number} height 
	 * @param {string} format 
	 * @param {Image} data 
	 */
	constructor(width, height, format, data) {
		width = width || 1;
		height = height || 1;
		data = data || null;

		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		this.width = width;
		this.height = height;

		let fmt = gl.RGBA;
		switch (format.toLowerCase()) {
			case "r": fmt = gl.LUMINANCE; break;
			case "rgb": fmt = gl.RGB; break;
			case "rgba": fmt = gl.RGBA; break;
			case "depth": fmt = gl.DEPTH_COMPONENT; break;
		}

		this.id = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.id);

		if (data) {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, data);
		} else {
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texImage2D(gl.TEXTURE_2D, 0, fmt, width, height, 0, fmt, gl.UNSIGNED_BYTE, null);
		}

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	/**
	 * 
	 * @param {number} slot 
	 */
	bind(slot) {
		slot = slot || 0;
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.activeTexture(gl.TEXTURE0 + slot);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}

	unbind() {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	destroy() {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.deleteTexture(this.id);
	}
}

class RenderTexture {
	constructor(width, height, format) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		this.texture = new Texture(width, height, format, null);
		this.texture.bind();

		let att = gl.COLOR_ATTACHMENT0;
		switch (format) {
			case "r":
			case "rgb":
			case "rgba": att = gl.COLOR_ATTACHMENT0; break;
			case "depth": att = gl.DEPTH_ATTACHMENT; break;
		}
		
		this.id = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, att, gl.TEXTURE_2D, this.texture.id, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	bind() {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		this.vp = gl.getParameter(gl.VIEWPORT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
		gl.viewport(0, 0, this.texture.width, this.texture.height);
	}

	unbind() {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(this.vp[0], this.vp[1], this.vp[2], this.vp[3]);
	}

}

Fx.DefaultVertexShader = `precision highp float;
attribute vec2 vPosition;
attribute vec2 vTexCoord;
attribute vec3 vTangent;
attribute vec4 vColor;

uniform mat4 uProjView;

varying vec4 oColor;
varying vec2 oPosition;
varying vec2 oTexCoord;
varying mat3 oTBN;

void main() {
	vec4 pos = vec4(vPosition, 0.0, 1.0);
	gl_Position = uProjView * pos;

	oColor = vColor;
	oPosition = pos.xy;
	oTexCoord = vTexCoord;
	
	vec3 N = vec3(0.0, 0.0, 1.0);
	vec3 T = normalize(vTangent - dot(vTangent, N) * N);
	vec3 B = cross(T, N);

	oTBN = mat3(T, B, N);
}`;

Fx.FragmentShaderHeader = `precision mediump float;
varying vec4 oColor;
varying vec2 oPosition;
varying vec2 oTexCoord;
varying mat3 oTBN;
#line 1
`;

class SpriteBatcher {
	constructor() {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		const fs = Fx.FragmentShaderHeader +
`uniform sampler2D uTex;
uniform float uTexEnable;
void main() {
	vec4 color = oColor;
	if (uTexEnable > 0.5) color *= texture2D(uTex, oTexCoord);
	gl_FragColor = color;
}`;
		
		this.vbo = gl.createBuffer();
		this.vboSize = 0;
		this.vertexCount = 0;

		this.defaultShader = new Shader(Fx.DefaultVertexShader, fs);
		this.shader = this.defaultShader;
		this.texture = null;
		this.proj = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
		this.view = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
		this.blending = "alpha";

		this.vertices = [];

		this.drawing = false;
	}

	setProjection(m) {
		if (this.drawing) this.flush();
		this.proj = m;
	}

	setView(m) {
		if (this.drawing) this.flush();
		this.view = m;
	}

	setShader(shader) {
		if (this.drawing) this.flush();
		this.shader = shader ? shader : this.defaultShader;
		if (this.drawing) {
			this.shader.bind();
		}
	}

	setBlending(blend) {
		if (this.drawing) this.flush();
		this.blending = blend;
	}

	/**
	 * @param {Texture} texture
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} sx 
	 * @param {number} sy 
	 * @param {number} ox 
	 * @param {number} oy 
	 * @param {number} rot 
	 * @param {Array} color 
	 * @param {Array} uv 
	 */
	sprite(texture, x, y, sx, sy, ox, oy, rot, color, uv) {
		x = x || 0;
		y = y || 0;
		sx = sx || 1;
		sy = sy || 1;
		ox = ox || 0;
		oy = oy || 0;
		rot = rot || 0;
		uv = uv || [0, 0, 1, 1];
		color = color || [1, 1, 1, 1];

		if (color.length < 4) throw 'Invalid Color.';
		if (uv.length < 4) throw 'Invalid UV.';

		if (!this.drawing) this.flush();
		if (this.texture !== texture) {
			this.flush();
			this.texture = texture;
		}

		let imw = texture ? texture.width : 1;
		let imh = texture ? texture.height : 1;

		let tw = imw * uv[2];
		let th = imh * uv[3];
		ox *= tw;
		oy *= th;

		let tlx = -ox * sx;
		let tly = -oy * sy;
		let brx = (tw - ox) * sx;
		let bry = (th - oy) * sy;

		let c = Math.cos(rot), s = Math.sin(rot);
		let tax = Math.cos(-rot), tay = Math.sin(-rot);

		let x1 = c * tlx - s * tly,
			y1 = s * tlx + c * tly,
			x2 = c * brx - s * tly,
			y2 = s * brx + c * tly,
			x3 = c * brx - s * bry,
			y3 = s * brx + c * bry,
			x4 = c * tlx - s * bry,
			y4 = s * tlx + c * bry;

		x1 += x; y1 += y;
		x2 += x; y2 += y;
		x3 += x; y3 += y;
		x4 += x; y4 += y;

		this.vertices.push(...[
			x1, y1,  uv[0],                 uv[1], tax, tay, 0.0,  ...color,
			x2, y2,  uv[0] + uv[2],         uv[1], tax, tay, 0.0,  ...color,
			x3, y3,  uv[0] + uv[2], uv[1] + uv[3], tax, tay, 0.0,  ...color,
			x3, y3,  uv[0] + uv[2], uv[1] + uv[3], tax, tay, 0.0,  ...color,
			x4, y4,  uv[0],         uv[1] + uv[3], tax, tay, 0.0,  ...color,
			x1, y1,  uv[0],                 uv[1], tax, tay, 0.0,  ...color
		]);

		this.vertexCount += 6;
	}

	disc(texture, x, y, radius, color, slices) {
		color = color || [1, 1, 1, 1];
		slices = slices || 32;
		if (color.length < 4) throw 'Invalid Color.';

		if (!this.drawing) this.flush();
		if (this.texture !== texture) {
			this.flush();
			this.texture = texture;
		}

		let first = [ x, y,  0.5, 0.5,  1.0, 0.0, 0.0,  ...color ];
		const step = 360 / slices;

		let verts = [];
		verts.push(first);
		for (let i = 0; i <= 360; i += step) {
			let a = i / 180.0 * Math.PI;
			let c = Math.cos(a), s = Math.sin(a);
			let vx = x + c * radius;
			let vy = y + s * radius;

			verts.push([ vx, vy,  c * 0.5 + 0.5, s * 0.5 + 0.5,  1.0, 0.0, 0.0,  ...color ]);
		}

		for (let i = 1; i < verts.length - 1; i++) {
			this.vertices.push(...verts[0    ]);
			this.vertices.push(...verts[i + 0]);
			this.vertices.push(...verts[i + 1]);
			this.vertexCount += 3;
		}
	}

	quad(texture, x, y, radius, color) {
		color = color || [1, 1, 1, 1];
		if (color.length < 4) throw 'Invalid Color.';

		if (!this.drawing) this.flush();
		if (this.texture !== texture) {
			this.flush();
			this.texture = texture;
		}

		this.vertices.push(...[
			-radius + x, -radius + y,  0.0, 0.0,  1.0, 0.0, 0.0,  ...color,
			 radius + x, -radius + y,  1.0, 0.0,  1.0, 0.0, 0.0,  ...color,
			 radius + x,  radius + y,  1.0, 1.0,  1.0, 0.0, 0.0,  ...color,
			 radius + x,  radius + y,  1.0, 1.0,  1.0, 0.0, 0.0,  ...color,
			-radius + x,  radius + y,  0.0, 1.0,  1.0, 0.0, 0.0,  ...color,
			-radius + x, -radius + y,  0.0, 0.0,  1.0, 0.0, 0.0,  ...color,
		]);

		this.vertexCount += 6;
	}

	begin() {
		if (this.drawing) {
			console.error("Please end the drawing first.");
			return;
		}
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		gl.depthMask(false);
		this.shader.bind();
		this.drawing = true;
	}

	flush(clear) {
		if (this.vertices.length === 0) return;
		if (this.texture) this.texture.bind(0);

		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		clear = clear || true;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		if (this.vboSize < this.vertices.length) {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
			this.vboSize = this.vertices.length;
		} else {
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
		}

		gl.enableVertexAttribArray(this.shader.getAttribute("vPosition"));
		gl.enableVertexAttribArray(this.shader.getAttribute("vTexCoord"));
		gl.enableVertexAttribArray(this.shader.getAttribute("vTangent"));
		gl.enableVertexAttribArray(this.shader.getAttribute("vColor"));

		gl.vertexAttribPointer(this.shader.getAttribute("vPosition"), 2, gl.FLOAT, false, 44, 0);
		gl.vertexAttribPointer(this.shader.getAttribute("vTexCoord"), 2, gl.FLOAT, false, 44, 8);
		gl.vertexAttribPointer(this.shader.getAttribute("vTangent"),  3, gl.FLOAT, false, 44, 16);
		gl.vertexAttribPointer(this.shader.getAttribute("vColor"),    4, gl.FLOAT, false, 44, 28);

		this.shader.set16f("uProjView", mat4.mul(this.proj, this.view));

		if (this.texture) {
			this.shader.seti("uTex", 0);
			this.shader.setf("uTexEnable", 1.0);
		} else {
			this.shader.setf("uTexEnable", 0.0);
		}

		gl.enable(gl.BLEND);
		switch (this.blending.toLowerCase()) {
			default:
			case "opaque": gl.disable(gl.BLEND); break;
			case "add": gl.blendFunc(gl.ONE, gl.ONE); break;
			case "alpha": gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); break;
			case "multiply": gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA); break;
		}

		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
		gl.disable(gl.BLEND);

		if (clear) {
			this.vertexCount = 0;
			this.vertices = [];
		}
	}

	end() {
		if (!this.drawing) {
			console.error("Please start the drawing first.");
			return;
		}
		if (this.vertices.length > 0) this.flush();

		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;
		
		this.texture = null;
		this.drawing = false;
		gl.depthMask(true);
	}

};

class AssetManager {
	constructor() {
		this.files = [];
		this.assets = {};
	}

	addImage(name, url) {
		this.files.push({
			type: "image",
			url: url,
			name: name
		});
	}

	get(name) { return this.assets[name]; }

	load(callback) {
		let ok = 0, err = 0;

		let that = this;
		function check() {
			if (ok + err >= that.files.length && callback) callback();
		}

		if (this.files.length === 0) check();

		for (let it of this.files) {
			if (it.type.toLowerCase() === "image") {
				let img = new Image();
				img.onload = function() {
					that.assets[it.name] = new Texture(img.width, img.height, "rgba", img);
					ok++;
					check();
				};
				img.onerror = function() {
					err++;
					check();
				};
				img.src = it.url;
			}
		}
	}
}

class InputManager {
	/**
	 * 
	 * @param {HTMLCanvasElement} canvas 
	 */
	constructor(canvas) {
		this.keydown = [];
		this.keyrelease = [];
		this.keypress = [];
		this.mousedown = [];
		this.mouserelease = [];
		this.mousepress = [];
		this.mousePos = [0, 0];

		let that = this;
		window.onkeydown = function(e) {
			e.preventDefault();
			that.keydown[e.keyCode] = true;
			that.keypress[e.keyCode] = true;
		};
		window.onkeyup = function(e) {
			e.preventDefault();
			that.keydown[e.keyCode] = false;
			that.keyrelease[e.keyCode] = true;
		};
		canvas.onmousedown = function(e) {
			e.preventDefault();
			that.mousedown[e.button] = true;
			that.mousepress[e.button] = true;
		};
		canvas.onmouseup = function(e) {
			e.preventDefault();
			that.mousedown[e.button] = false;
			that.mouserelease[e.button] = true;
		};
		canvas.onmousemove = function(e) {
			let r = canvas.getBoundingClientRect();
			that.mousePos[0] = e.clientX - r.left;
			that.mousePos[1] = e.clientY - r.top;
		};
		canvas.oncontextmenu = function(e) {
			return false;
		};
		canvas.focus();
	}

	keyDown(k) { return this.keydown[k]; }
	keyPressed(k) { return this.keypress[k]; }
	keyReleased(k) { return this.keyrelease[k]; }

	mouseDown(k) { return this.mousedown[k]; }
	mousePressed(k) { return this.mousepress[k]; }
	mouseReleased(k) { return this.mouserelease[k]; }

	mousePosition() { return this.mousePos; }

	update() {
		for (let k in this.keypress) {
			this.keypress[k] = false;
		}
		for (let k in this.keyrelease) {
			this.keyrelease[k] = false;
		}
		for (let k in this.mousepress) {
			this.mousepress[k] = false;
		}
		for (let k in this.mouserelease) {
			this.mouserelease[k] = false;
		}
	}
}

var ID = 0;
class EntityWorld {
	constructor() {
		this.entities = [];
		this.entityPool = [];
		this.behaviors = {};

		this.registerBehavior("sprite", {
			render: function(e, sb) {
				let ox = e.originX || 0;
				let oy = e.originY || 0;
				let sx = e.scaleX || 1;
				let sy = e.scaleY || 1;
				let x = e.x || 0;
				let y = e.y || 0;
				let rot = e.rotation || 0;
				let col = e.color || [1, 1, 1, 1];
				let uv = e.uv || [0, 0, 1, 1];
				sb.sprite(e.diffuse, x, y, sx, sy, ox, oy, rot, col, uv);
			}
		});

		this.registerBehavior("normal", {
			render: function(e, sb) {
				let ox = e.originX || 0;
				let oy = e.originY || 0;
				let sx = e.scaleX || 1;
				let sy = e.scaleY || 1;
				let x = e.x || 0;
				let y = e.y || 0;
				let rot = e.rotation || 0;
				let uv = e.uv || [0, 0, 1, 1];
				sb.sprite(e.normal, x, y, sx, sy, ox, oy, rot, [1, 1, 1, 1], uv);
			}
		});

		this.registerBehavior("occluder", {
			render: function(e, sb) {
				let ox = e.originX || 0;
				let oy = e.originY || 0;
				let sx = e.scaleX || 1;
				let sy = e.scaleY || 1;
				let x = e.x || 0;
				let y = e.y || 0;
				let rot = e.rotation || 0;
				let uv = e.uv || [0, 0, 1, 1];
				sb.sprite(e.occluder, x, y, sx, sy, ox, oy, rot, [1, 1, 1, 1], uv);
			}
		});
	}

	create(types) {
		types = types || [];
		let ent;
		if (this.entityPool.length === 0) {
			ent = {
				types: types,
				dead: false,
				life: null,
				__init: false,
			};
		} else {
			ent = this.entityPool.pop();
			ent.types = types;
			ent.__init = false;
			ent.life = null;
			ent.dead = false;
		}
		this.entities.push(ent);
		return ent;
	}

	registerBehavior(name, behavior) {
		if (!behavior) return;
		this.behaviors[name] = behavior;
	}

	update(dt) {
		for (let e of this.entities) {
			if (!e) continue;
			if (e.dead) continue;
			for (let type of e.types) {
				if (!this.behaviors[type]) continue;
				if (!e.__init && this.behaviors[type].create) {
					this.behaviors[type].create(e, this);
				}
				if (this.behaviors[type].update) {
					this.behaviors[type].update(e, dt, this);
				}
			}
			e.__init = true;

			if (e.life !== null) {
				if (e.life > 0.0) {
					e.life -= dt;
				} else {
					e.life = 0;
					e.dead = true;
				}
			}
		}

		let len = this.entities.length;
		while (len--) {
			let e = this.entities[len];
			if (e.dead) {
				this.entityPool.push(e);
				this.entities.splice(len, 1);
			}
		}
	}

	render(sb) {
		for (let e of this.entities) {
			if (!e) continue;
			if (e.dead) continue;
			for (let type of e.types) {
				if (!this.behaviors[type]) continue;
				if (!this.behaviors[type].render) continue;
				this.behaviors[type].render(e, sb, this);
			}
		}
	}

	renderOnly(sb, types) {
		if (!types) {
			this.render(sb);
			return;
		}

		for (let e of this.entities) {
			if (!e) continue;
			if (e.dead) continue;
			for (let type of e.types) {
				if (!this.behaviors[type]) continue;
				if (!this.behaviors[type].render) continue;
				if (types.indexOf(type) === -1) continue;
				this.behaviors[type].render(e, sb, this);
			}
		}
	}

	each(types, callback) {
		if (!types) return;
		for (let e of this.entities) {
			if (!e) continue;
			if (e.dead) continue;
			
			let ck = [];
			for (let type of e.types) {
				if (types.indexOf(type) !== -1) {
					ck.push(true);
				}
			}
			if (ck.length === types.length && callback) {
				callback(e);
			}
		}
	}

}

class Renderer {
	constructor(width, height) {
		this.spriteBatcher = new SpriteBatcher();

		const fs = Fx.FragmentShaderHeader + `
uniform sampler2D uTex;
uniform float uTexEnable;
void main() {
	vec3 n = vec3(0.0, 0.0, 1.0);
	float a = 1.0;
	if (uTexEnable > 0.5) {
		vec4 nmap = texture2D(uTex, oTexCoord);
		n = normalize(oTBN * (nmap.xyz * 2.0 - 1.0));
		a = nmap.a;
	}
	gl_FragColor = vec4(n * 0.5 + 0.5, a);
}
`;
		const lightFS = Fx.FragmentShaderHeader + `
#define PI 3.141592654
uniform sampler2D uTex;
uniform sampler2D uNormal;

uniform sampler2D uOcclusion;
uniform sampler2D uShadow;
uniform float uShadowEnabled;

uniform vec2 uLightPos;
uniform float uLightRadius;
uniform float uLightZ;

uniform vec2 uResolution;

float sqr2(float x) { return x * x; }

float sample(vec2 coord, float r) {
	return step(r, texture2D(uShadow, coord).r);
}

float shadowSample(float lightSize) {
	vec2 uv = oTexCoord;
	vec2 norm = uv * 2.0 - 1.0;
	norm *= uLightRadius;
	float theta = atan(norm.y, norm.x);
	float r = length(norm);
	float coord = (theta / PI) * 0.5 + 0.5;

	vec2 tc = vec2(coord, 0.0);

	float center = sample(tc, r);
	float blur = (1.0 / lightSize);// * smoothstep(0.0, 1.0, r);

	float sum = 0.0;
	sum += sample(vec2(tc.x - 4.0*blur, tc.y), r) * 0.05;
	sum += sample(vec2(tc.x - 3.0*blur, tc.y), r) * 0.09;
	sum += sample(vec2(tc.x - 2.0*blur, tc.y), r) * 0.12;
	sum += sample(vec2(tc.x - 1.0*blur, tc.y), r) * 0.15;
	
	sum += center * 0.16;
	
	sum += sample(vec2(tc.x + 1.0*blur, tc.y), r) * 0.15;
	sum += sample(vec2(tc.x + 2.0*blur, tc.y), r) * 0.12;
	sum += sample(vec2(tc.x + 3.0*blur, tc.y), r) * 0.09;
	sum += sample(vec2(tc.x + 4.0*blur, tc.y), r) * 0.05;

	return sum * smoothstep(1.0, 0.0, r);
}

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	vec4 D = texture2D(uTex, uv);
	vec4 Nc = texture2D(uNormal, uv);

	vec3 N = normalize(Nc.xyz * 2.0 - 1.0);
	vec3 L = vec3((uLightPos - gl_FragCoord.xy) / uResolution, uLightZ);
	L.x *= uResolution.x / uResolution.y;

	float dist = length(L);
	float att = smoothstep(uLightRadius, 0.0, dist);

	L = normalize(L);

	float nl = max(dot(N, L), 0.0);
	vec3 diff = (oColor.rgb * oColor.a) * nl * att;

	if (uShadowEnabled > 0.5) {
		vec2 luv = oTexCoord;
		luv.y = 1.0 - luv.y;
	
		float O = 1.0 - texture2D(uOcclusion, luv).r;
		diff *= shadowSample(1024.0) + O;
	}

	gl_FragColor = D * vec4(diff, 1.0);
}
`;

		const ambientFS = Fx.FragmentShaderHeader + `
uniform sampler2D uTex;
uniform vec3 uAmbient;

uniform vec2 uResolution;

void main() {
	vec2 uv = gl_FragCoord.xy / uResolution;
	vec4 D = texture2D(uTex, uv);
	gl_FragColor = D * vec4(uAmbient, 1.0);
}
`;

		const occluderFS = Fx.FragmentShaderHeader + `
uniform sampler2D uTex;
uniform float uTexEnable;

void main() {
	float a = 1.0;
	if (uTexEnable > 0.5) {
		a = 1.0 - texture2D(uTex, oTexCoord).a;
	}
	gl_FragColor = vec4(vec3(a), 1.0 - a);
}
		`;

		const shadowFS = Fx.FragmentShaderHeader + `
#define PI 3.141592654

uniform sampler2D uTex;
uniform float uTexEnable;

uniform vec2 uResolution;

void main() {
	float thres = 0.75;
	float maxDist = 1.0;

	for (float y = 0.0; y < 99999.0; y += 1.0) {
		if (y >= uResolution.y) break;

		float dist = y / uResolution.y;

		vec2 norm = vec2(oTexCoord.x, dist) * 2.0 - 1.0;
		float theta = PI * 1.5 + norm.x * PI;
		float r = norm.y * 0.5 + 0.5;

		vec2 coord = vec2(-r * sin(theta), -r * cos(theta)) * 0.5 + 0.5;

		float caster = texture2D(uTex, coord).r;
		if (caster < thres) {
			maxDist = min(maxDist, dist);
		}
	}
	gl_FragColor = vec4(vec3(maxDist), 1.0);
}
		`;

		this.normalsShader = new Shader(Fx.DefaultVertexShader, fs);
		this.ambientShader = new Shader(Fx.DefaultVertexShader, ambientFS);
		this.lightingShader = new Shader(Fx.DefaultVertexShader, lightFS);
		this.occlusionShader = new Shader(Fx.DefaultVertexShader, occluderFS);
		this.shadowShader = new Shader(Fx.DefaultVertexShader, shadowFS);

		this.colorBuffer = new RenderTexture(width, height, "rgba");
		this.normalsBuffer = new RenderTexture(width, height, "rgb");
		this.occlusionBuffer = new RenderTexture(1024, 1024, "rgb");
		this.shadowBuffer = new RenderTexture(1024, 1, "rgb");

		this.ambient = [0.08, 0.08, 0.12];
	}

	/**
	 * @param {EntityWorld} world 
	 */
	render(world) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		this.spriteBatcher.setBlending("alpha");
		this.spriteBatcher.setProjection(mat4.ortho(0, this.colorBuffer.texture.width, this.colorBuffer.texture.height, 0, -1, 1));

		this.colorBuffer.bind();
		this.colorPass(world);
		this.colorBuffer.unbind();

		this.normalsBuffer.bind();
		this.normalsPass(world);
		this.normalsBuffer.unbind();

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.spriteBatcher.begin();
		this.spriteBatcher.setShader(this.ambientShader);
		this.ambientShader.set3f("uAmbient", this.ambient[0], this.ambient[1], this.ambient[2]);
		this.ambientShader.set2f("uResolution", this.colorBuffer.texture.width, this.colorBuffer.texture.height);
		this.spriteBatcher.sprite(this.colorBuffer.texture, 0, 0);
		this.spriteBatcher.end();

		this.normalsBuffer.texture.bind(1);

		let sb = this.spriteBatcher;
		let ls = this.lightingShader;
		let os = this.occlusionShader;
		let ss = this.shadowShader;
		let that = this;

		world.each(["light"], function(e) {
			let x = e.x || 0;
			let y = e.y || 0;
			let rad = e.radius || 0.4;
			let col = e.color || [1.0, 1.0, 1.0];
			let intens = e.intensity || 1.0;
			let z = e.z || 0.075;

			rad = rad > 1.0 ? 1.0 : rad;

			let shadowEnabled = e.shadow || false;
			if (shadowEnabled) {
				let vm = sb.view.slice();
				let prj = sb.proj.slice();

				that.occlusionBuffer.bind();
					gl.clearColor(1.0, 1.0, 1.0, 1.0);
					gl.clear(gl.COLOR_BUFFER_BIT);
				
					sb.setBlending("alpha");
					sb.setProjection(mat4.ortho(0, that.occlusionBuffer.texture.width, that.occlusionBuffer.texture.height, 0, -1, 1))
					sb.setView(mat4.translation(that.occlusionBuffer.texture.width / 2 - x, that.occlusionBuffer.texture.height / 2 - y, 0));
					sb.begin();
						sb.setShader(os);
						world.renderOnly(sb, ["occluder"]);
					sb.end();
				that.occlusionBuffer.unbind();
					
				sb.setView([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
				sb.setProjection(mat4.ortho(0, that.shadowBuffer.texture.width, 1, 0, -1, 1));
				that.shadowBuffer.bind();
				 	gl.clearColor(1.0, 1.0, 1.0, 1.0);
				 	gl.clear(gl.COLOR_BUFFER_BIT);
					
				 	sb.begin();
				 		sb.setShader(ss);
				 		ss.set2f("uResolution", that.occlusionBuffer.texture.width, that.occlusionBuffer.texture.height);
				 		sb.sprite(that.occlusionBuffer.texture, 0, 0);
				 	sb.end();
				that.shadowBuffer.unbind();
				sb.setView(vm);
				sb.setProjection(prj);
			}

			sb.setBlending("add");
			sb.begin();
				sb.setShader(ls);
				if (shadowEnabled) {
					that.shadowBuffer.texture.bind(2);
					that.occlusionBuffer.texture.bind(3);
					ls.seti("uShadow", 2);
					ls.seti("uOcclusion", 3);
					ls.setf("uShadowEnabled", 1.0);
				} else {
					ls.setf("uShadowEnabled", 0.0);
				}

				ls.seti("uNormal", 1);
				ls.set2f("uResolution", that.colorBuffer.texture.width, that.colorBuffer.texture.height);

				ls.set2f("uLightPos", x, y);
				ls.setf("uLightRadius", rad);
				ls.setf("uLightZ", z);
				sb.quad(that.colorBuffer.texture, x, y, 512 * rad, [...col, intens]);
			sb.end();
		});
		gl.bindTexture(gl.TEXTURE_2D, null);

		this.spriteBatcher.setBlending("alpha");
		this.spriteBatcher.setProjection(mat4.ortho(0, this.colorBuffer.texture.width, this.colorBuffer.texture.height, 0, -1, 1));
		this.spriteBatcher.setView([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);

		// this.spriteBatcher.begin();
		// this.spriteBatcher.setShader(null);
		// this.spriteBatcher.sprite(this.occlusionBuffer.texture, 0, 0, 0.25, 0.25);
		// this.spriteBatcher.sprite(this.shadowBuffer.texture, 0, 260, 0.25, 10.0);
		// this.spriteBatcher.end();
		
	}

	/**
	 * @param {EntityWorld} world 
	 */
	colorPass(world) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.spriteBatcher.setShader(null);
		this.spriteBatcher.begin();
		world.renderOnly(this.spriteBatcher, ["sprite"]);
		this.spriteBatcher.end();
	}

	/**
	 * @param {EntityWorld} world 
	 */
	normalsPass(world) {
		/** @type {WebGLRenderingContext} */
		let gl = Fx.gl;

		gl.clearColor(0.0, 0.0, 1.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		this.spriteBatcher.setShader(this.normalsShader);
		this.spriteBatcher.begin();
		world.renderOnly(this.spriteBatcher, ["normal"]);
		this.spriteBatcher.end();
	}

}

Fx.create = function(width, height, preload) {
	Fx.canvas = document.createElement("canvas");
	Fx.canvas.width = width;
	Fx.canvas.height = height;

	/** @type {WebGLRenderingContext} */
	let gl = Fx.gl = Fx.canvas.getContext("webgl");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	document.body.appendChild(Fx.canvas);

	gl.viewport(0, 0, width, height);
	gl.disable(gl.CULL_FACE);

	Fx.assets = new AssetManager();
	Fx.input = new InputManager(Fx.canvas);
	Fx.entities = new EntityWorld();
	Fx.renderer = new Renderer(width, height);

	preload(Fx.assets);

	Fx.assets.load(function() { console.log("OK"); Fx.run(); });
};

const timeStep = 1000 / 60.0;
var lastTime = Date.now();
var accum = 0;
Fx.run = function() {
	window.requestAnimationFrame(Fx.run);

	let currTime = Date.now();
	let delta = currTime - lastTime;
	lastTime = currTime;
	accum += delta;

	while (accum >= timeStep) {
		Fx.entities.update(timeStep / 1000.0);
		accum -= timeStep;
	}

	Fx.input.update();

	Fx.renderer.render(Fx.entities);
};

Fx.loadShader = function(src, type) {
	let gl = Fx.gl;
	let shader = gl.createShader(type);
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Shader error: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
};
