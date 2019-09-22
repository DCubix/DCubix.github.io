let TL = {
	_canvas: null,
	_ctx: null,
	_keyframes: null,
	_drag: false,
	_int: null,
	_tick: null,
	current: 0,
	playing: false,
	frames: 100,
	init: function() {
		TL._canvas = document.getElementById("timeline");
		TL._ctx = TL._canvas.getContext("2d");
		TL._keyframes = null
		TL.setFrames(100);

		TL._canvas.onmousedown = function(e) {
			let rec = TL._canvas.getBoundingClientRect();
			TL._click(e.clientX - rec.left);
			TL._drag = true;
		};
		TL._canvas.onmousemove = function(e) {
			if (TL._drag) {
				let rec = TL._canvas.getBoundingClientRect();
				TL._click(e.clientX - rec.left);
			}
		};
		TL._canvas.onmouseup = function(e) {
			TL._drag = false;
		};
		TL._canvas.onmouseleave = function(e) {
			TL._drag = false;
		};
	},
	ontick: function(cb) {
		TL._tick = cb;
	},
	play: function(fps) {
		TL.playing = true;
		let delay = ~~(1000 / (fps || 24));
		TL._int = setInterval(function() {
			if (TL._tick) TL._tick(TL.current);
			if (TL.current++ >= TL.frames) {
				TL.current = 0;
			}
			TL._redraw();
		}, delay);
	},
	stop: function() {
		TL.playing = false;
		clearInterval(TL._int);
		TL.current = 0;
		TL._redraw();
	},
	setKeyFrames: function(kf) {
		TL._keyframes = kf;
		TL._redraw();
	},
	setFrames: function(count) {
		TL.frames = count;
		TL._canvas.width = (count+1) * 8;
		TL._redraw();
	},
	_click: function(x) {
		let fx = ~~(x / 8);
		TL.current = Math.min(fx, TL.frames);
		if (TL._tick) TL._tick(TL.current);
		TL._redraw();
	},
	_redraw: function() {
		TL._ctx.fillStyle = "white";
		TL._ctx.fillRect(0, 0, TL._canvas.width, TL._canvas.height);

		TL._ctx.fillStyle = "#888";
		TL._ctx.fillRect(0, 0, TL._canvas.width, 16);

		TL._ctx.strokeStyle = "#BBB";
		TL._ctx.beginPath();
		TL._ctx.moveTo(0, 16);
		TL._ctx.lineTo(TL._canvas.width, 16);
		TL._ctx.stroke();

		if (TL._keyframes !== null) {
			for (let k of TL._keyframes) {
				let fx = k.frame * 8;
				TL._ctx.fillStyle = "rgb(255, 255, 20)";
				TL._ctx.fillRect(fx, 16, 8, 16);
			}
		}

		let fram = `F${TL.current}`;
		let w = TL._ctx.measureText(fram).width;
		let cx = TL.current * 8;
		TL._ctx.fillStyle = "rgba(0, 50, 250, 0.6)";

		let tx = cx + w + 4 >= TL._canvas.width ? TL._canvas.width - (w + 4) : cx;
		TL._ctx.fillRect(tx, 0, w + 4, 16);
		TL._ctx.fillRect(cx, 16, 8, 16);

		TL._ctx.fillStyle = "white";
		TL._ctx.font = "12px monospace";
		TL._ctx.fillText(fram, tx + 1, 11);

		for (let i = 0; i <= TL.frames+1; i++) {
			TL._ctx.beginPath();
			TL._ctx.moveTo(i * 8, 16);
			TL._ctx.lineTo(i * 8, TL._canvas.height + 16);
			TL._ctx.stroke();
		}
	}
};