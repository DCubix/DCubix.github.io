let TL = {
	_canvas: null,
	_ctx: null,
	_keyframes: null,
	_labels: [],
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
		TL.setKeyFrames(null);

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

		TL._canvas.onkeydown = function(e) { e.preventDefault(); };
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
	setFrame: function(fx) {
		TL.current = fx;
		TL.current %= TL.frames;
		if (TL._tick) TL._tick(TL.current);
		TL._redraw();
	},
	setKeyFrames: function(kf) {
		TL._keyframes = kf;
		TL._canvas.height = kf !== null ? 16 + kf.length * 12 : 16;
		TL._redraw();
	},
	setFrames: function(count) {
		TL.frames = count;
		TL._canvas.width = (count+1) * 8 + 100;
		TL._redraw();
	},
	_click: function(x) {
		let fx = ~~((x - 100) / 8);
		TL.current = Math.max(Math.min(fx, TL.frames), 0);
		if (TL._tick) TL._tick(TL.current);
		TL._redraw();
	},
	_redraw: function() {
		let ox = 100;
		let cy = 0;

		TL._ctx.save();
		TL._ctx.translate(ox, 0);

		TL._ctx.font = "12px monospace";

		TL._ctx.fillStyle = "white";
		TL._ctx.fillRect(0, 0, TL._canvas.width, TL._canvas.height);

		TL._ctx.fillStyle = "#555";
		TL._ctx.fillRect(-ox, 0, ox, TL._canvas.height);
		TL._ctx.fillStyle = "#888";
		TL._ctx.fillRect(0, cy, TL._canvas.width, 16);
		cy += 16;

		if (TL._keyframes) {
			let i = 0;
			for (let keyframes of TL._keyframes) {
				TL._ctx.strokeStyle = "#BBB";
				TL._ctx.beginPath();
				TL._ctx.moveTo(0, cy);
				TL._ctx.lineTo(TL._canvas.width, cy);
				TL._ctx.stroke();

				if (keyframes !== null) {
					for (let k of keyframes) {
						let fx = k.frame * 8;
						TL._ctx.fillStyle = "rgb(255, 255, 20)";
						TL._ctx.fillRect(fx, cy, 8, 12);
					}
				}

				let w = TL._ctx.measureText(TL._labels[i]).width;
				TL._ctx.fillStyle = "white";
				TL._ctx.fillText(TL._labels[i], -(w + 3), cy + 10);

				cy += 12;
				i++;
			}
		}

		let fram = `F${TL.current}`;
		let w = TL._ctx.measureText(fram).width;
		let cx = TL.current * 8;
		TL._ctx.fillStyle = "rgba(0, 50, 250, 0.6)";

		let tx = cx + w + 4 >= TL._canvas.width ? TL._canvas.width - (w + 4) : cx;
		TL._ctx.fillRect(tx, 0, w + 4, 16);
		TL._ctx.fillRect(cx, 16, 8, TL._canvas.height);

		TL._ctx.fillStyle = "white";
		TL._ctx.fillText(fram, tx + 1, 11);

		TL._ctx.strokeStyle = "#555";
		for (let i = 0; i <= TL.frames+1; i++) {
			TL._ctx.beginPath();
			TL._ctx.moveTo(i * 8, 16);
			TL._ctx.lineTo(i * 8, TL._canvas.height + 12);
			TL._ctx.stroke();
		}

		TL._ctx.restore();
	}
};