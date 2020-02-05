var Engine = Engine || {};

class Shader {
	constructor(vsrc, fsrc) {
		let gl = Engine.gl;
		let vs = Engine.loadShader(vsrc, gl.VERTEX_SHADER);
		let fs = Engine.loadShader(fsrc, gl.FRAGMENT_SHADER);
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
		let gl = Engine.gl;
		gl.useProgram(this.program);
	}

	getUniformLocation(name) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		let ks = Object.keys(this.uniforms);
		if (ks.indexOf(name) === -1) {
			let loc = gl.getUniformLocation(this.program, name);
			if (loc) {
				this.uniforms[name] = loc;
			}
			else
				return null;
		}
		return this.uniforms[name];
	}

	getAttribute(name) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		let ks = Object.keys(this.attributes);
		if (ks.indexOf(name) === -1) {
			let loc = gl.getAttribLocation(this.program, name);
			if (loc) {
				this.attributes[name] = loc;
			}
			else
				return null;
		}
		return this.attributes[name];
	}

	seti(name, v) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.uniform1i(this.getUniformLocation(name), v);
	}

	setf(name, v) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.uniform1f(this.getUniformLocation(name), v);
	}

	set2f(name, x, y) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.uniform2f(this.getUniformLocation(name), x, y);
	}

	set3f(name, x, y, z) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.uniform3f(this.getUniformLocation(name), x, y, z);
	}

	set4f(name, x, y, z, w) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.uniform4f(this.getUniformLocation(name), x, y, z, w);
	}

	set16f(name, vals) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.uniformMatrix4fv(this.getUniformLocation(name), false, new Float32Array(vals));
	}

	destroy() {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
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

		this.width = width;
		this.height = height;

		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		this.id = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.id);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		let fmt = gl.RGBA;
		switch (format.toLowerCase()) {
			case "r": fmt = gl.LUMINANCE; break;
			case "rgb": fmt = gl.RGB; break;
			case "rgba": fmt = gl.RGBA; break;
			case "depth": fmt = gl.DEPTH_COMPONENT; break;
		}
		gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, data);

		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	/**
	 * 
	 * @param {number} slot 
	 */
	bind(slot) {
		slot = slot || 0;
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.activeTexture(gl.TEXTURE0 + slot);
		gl.bindTexture(gl.TEXTURE_2D, this.id);
	}

	unbind() {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.bindTexture(gl.TEXTURE_2D, null);
	}

	destroy() {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		gl.deleteTexture(this.id);
	}
}

class RenderTexture {
	constructor(width, height, format) {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		this.texture = new Texture(width, height, format, null);

		let att = gl.COLOR_ATTACHMENT0;
		switch (format) {
			case "r":
			case "rgb":
			case "rgba": att = gl.COLOR_ATTACHMENT0; break;
			case "depth": att = gl.DEPTH_ATTACHMENT; break;
		}
		
		this.id = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
		this.texture.bind();
		gl.framebufferTexture2D(gl.FRAMEBUFFER, att, gl.TEXTURE_2D, this.texture.id, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}

	bind() {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		this.vp = gl.getParameter(gl.VIEWPORT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
		gl.viewport(0, 0, this.texture.width, this.texture.height);
	}

	unbind() {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(this.vp[0], this.vp[1], this.vp[2], this.vp[3]);
	}

}

Engine.DefaultVertexShader = `precision highp float;
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

Engine.FragmentShaderHeader = `precision mediump float;
varying vec4 oColor;
varying vec2 oPosition;
varying vec2 oTexCoord;
varying mat3 oTBN;

#line 1
`;

class SpriteBatcher {
	constructor() {
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;

		const fs = Engine.FragmentShaderHeader +
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

		this.defaultShader = new Shader(Engine.DefaultVertexShader, fs);
		this.shader = this.defaultShader;

		this.vertices = [];

		this.drawing = false;
	}

	/**
	 * 
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
	sprite(x, y, sx, sy, ox, oy, rot, color, uv) {
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

		let pos = [
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0
		];

		let tpos = [];
		for (let i = 0; i < pos.length; i+=2) {
			let p = Engine.transform(pos[i] - ox, pos[i + 1] - oy, x, y, sx, sy, rot);
			tpos.push(...p);
		}

		let tx = Math.cos(rot), ty = Math.sin(rot);

		this.vertices.push(...[
			tpos[0], tpos[1],  uv[0],                 uv[1], tx, ty, 0.0,  ...color,
			tpos[2], tpos[3],  uv[0] + uv[2],         uv[1], tx, ty, 0.0,  ...color,
			tpos[4], tpos[5],  uv[0] + uv[2], uv[1] + uv[3], tx, ty, 0.0,  ...color,
			tpos[4], tpos[5],  uv[0] + uv[2], uv[1] + uv[3], tx, ty, 0.0,  ...color,
			tpos[6], tpos[7],  uv[0],         uv[1] + uv[3], tx, ty, 0.0,  ...color,
			tpos[0], tpos[1],  uv[0],                 uv[1], tx, ty, 0.0,  ...color
		]);

		this.vertexCount += 6;
	}

	begin(shader) {
		if (this.drawing) {
			console.error("Please end the drawing first.");
			return;
		}
		shader = shader || null;
		if (shader !== null) {
			this.shader = shader;
		}
		this.drawing = true;
	}

	end(texture, projview, flush) {
		if (!this.drawing) {
			console.error("Please start the drawing first.");
			return;
		}
		projview = projview || [
			1.0, 0.0, 0.0, 0.0,
			0.0, 1.0, 0.0, 0.0,
			0.0, 0.0, 1.0, 0.0,
			0.0, 0.0, 0.0, 1.0
		];
		flush = flush || true;
		texture = texture || null;
		
		/** @type {WebGLRenderingContext} */
		let gl = Engine.gl;
		
		this.shader.bind();

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		if (this.vboSize < this.vertices.length) {
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.DYNAMIC_DRAW);
			this.vboSize = this.vertices.length;
		} else {
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertices));
		}

		gl.vertexAttribPointer(this.shader.getAttribute("vPosition"), 2, gl.FLOAT, false, 44, 0);
		gl.vertexAttribPointer(this.shader.getAttribute("vTexCoord"), 2, gl.FLOAT, false, 44, 8);
		gl.vertexAttribPointer(this.shader.getAttribute("vTangent"),  3, gl.FLOAT, false, 44, 16);
		gl.vertexAttribPointer(this.shader.getAttribute("vColor"),    4, gl.FLOAT, false, 44, 28);

		this.shader.set16f("uProjView", projview);

		if (texture) {
			texture.bind(0);
			this.shader.seti("uTex", 0);
			this.shader.setf("uTexEnable", 1.0);
		} else {
			this.shader.setf("uTexEnable", 0.0);
		}

		gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);

		if (flush) {
			this.vertexCount = 0;
			this.vertices = [];
		}

		this.drawing = false;
	}

};

class AssetManager {
	constructor() {
		this.files = [];

		this.images = {};
	}

	addImage(name, url) {
		this.files.push({
			type: "image",
			url: url,
			name: name
		});
	}

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
					that.images[it.name] = new Texture(img.width, img.height, "rgba", img);
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

Engine.create = function(width, height, game) {
	Engine.canvas = document.createElement("canvas");
	Engine.canvas.width = width;
	Engine.canvas.height = height;

	/** @type {WebGLRenderingContext} */
	let gl = Engine.gl = Engine.canvas.getContext("webgl");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	document.body.appendChild(Engine.canvas);

	gl.viewport(0, 0, width, height);

	Engine.renderer = new SpriteBatcher();
	Engine.assets = new AssetManager();
	Engine.game = game;
	
	if (game.preload) game.preload(Engine.assets);

	Engine.assets.load(function() {
		if (game.create) game.create();
		Engine.run();
	});
};

const timeStep = 1.0 / 60.0;
var lastTime = Date.now();
var accum = 0;
Engine.run = function() {
	let currTime = Date.now();
	let delta = currTime - lastTime;
	lastTime = currTime;
	accum += delta;

	while (accum >= timeStep) {
		if (Engine.game.update) Engine.game.update(timeStep);
		accum -= timeStep;
	}

	if (Engine.game.render) Engine.game.render(Engine.renderer, Engine.gl);

	window.requestAnimationFrame(Engine.run);
};

Engine.loadShader = function(src, type) {
	let gl = Engine.gl;
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

Engine.transform = function(x, y,  tx, ty, sx, sy, rotation) {
	let c = Math.cos(rotation), s = Math.sin(rotation);

	let fx = x + tx;
	let fy = y + ty;

	let rx = c * fx - s * fy;
	let ry = c * fy + s * fx;

	return [ rx * sx, ry * sy ];
};

Engine.ortho = function(left, right, top, bottom, near, far) {
	const w = right - left;
	const h = top - bottom;
	const d = far - near;
	return [
		2.0 / w, 0.0, 0.0, -((right + left) / w),
		0.0, 2.0 / h, 0.0, -((top + bottom) / h),
		0.0, 0.0, -2.0 / d, -((far + near) / d),
		0.0, 0.0, 0.0, 1.0
	];
};