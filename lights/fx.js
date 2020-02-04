var Fx = Fx || {};

function Shader(vsrc, fsrc) {
	let gl = Fx.gl;
	let vs = Fx.loadShader(vsrc, gl.VERTEX_SHADER);
	let fs = Fx.loadShader(fsrc, gl.FRAGMENT_SHADER);
	if (vs === null || fs === null) return;

	this.uniforms = {};
	this.program = gl.createProgram();
	gl.attachShader(this.program, vs);
	gl.attachShader(this.program, fs);
	gl.linkProgram();

	this.bind = function() {
		gl.useProgram(this.program);
	};

	this.getUniformLocation = function(name) {
		let ks = Object.keys(this.uniforms);
		if (ks.indexOf(name) === -1) {
			let loc = gl.getUniformLocation(this.program, name);
			if (loc) {
				this.uniforms[name] = loc;
			} else return null;
		}
		return this.uniforms[name];
	};

	this.seti = function(name, v) {
		gl.uniform1i(this.getUniformLocation(name), v);
	};

	this.setf = function(name, v) {
		gl.uniform1f(this.getUniformLocation(name), v);
	};

	this.set2f = function(name, x, y) {
		gl.uniform2f(this.getUniformLocation(name), x, y);
	};

	this.set3f = function(name, x, y, z) {
		gl.uniform3f(this.getUniformLocation(name), x, y, z);
	};

	this.set4f = function(name, x, y, z, w) {
		gl.uniform4f(this.getUniformLocation(name), x, y, z, w);
	};
}

Fx.create = function(width, height) {
	Fx.canvas = document.createElement("canvas");
	let gl = Fx.gl = Fx.canvas.getContext("webgl");
	if (gl === null) {
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}
	document.body.appendChild(Fx.canvas);
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