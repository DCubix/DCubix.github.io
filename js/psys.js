let mainHeader = document.getElementById("mainHeader");
let canvas = document.getElementById("disp");
let ctx = canvas.getContext("2d");

window.onresize = function() {
    canvas.width = document.body.clientWidth;
    canvas.height = mainHeader.clientHeight;

    ctx.fillStyle = "rgb(37, 33, 32)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
window.onresize();

let MAX_PARTICLES = 128;
let particles = [];

const Directions = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1]
];

for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({
        x: 0,
        y: 0,
        px: 0,
        py: 0,
        dx: 0,
        dy: 0,
        dir: 0,
        speed: 0,
        dirTime: 0,
        dirChangeRate: 0,
        dead: true
    });
}

function redraw() {
    ctx.fillStyle = "rgba(37, 33, 32, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < MAX_PARTICLES; i++) {
        let p = particles[i];
        if (p.dead) continue;

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(229, 223, 197, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineWidth = 2.0;
        ctx.lineCap = "round";
        ctx.shadowColor = "rgba(229, 223, 197, 0.95)";
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
    }
}

function emitParticle(x, y, dir) {
    let p = null;
    for (let i = 0; i < MAX_PARTICLES; i++) {
        if (particles[i].dead) {
            p = i;
            break;
        }
    }

    if (p === null) return;

    particles[p].dead = false;
    particles[p].px = particles[p].x = x;
    particles[p].py = particles[p].y = y;
    particles[p].dirChangeRate = ~~(5.0 + Math.random() * 20.0);
    particles[p].dirTime = particles[p].dirChangeRate + 1;
    particles[p].speed = 2.0 + Math.random();
    particles[p].dir = dir;
}

window.onmousedown = function(e) {
    e = e || window.event;
    let id = (e.target || e.srcElement).id;
    if (id !== "avatar") return;

    let avatar = document.getElementById(id);
    let rect = avatar.getBoundingClientRect();
    let x = rect.left + avatar.clientWidth / 2;
    let y = rect.top + avatar.clientHeight / 2;

    //let cr = canvas.getBoundingClientRect();
    //let x = e.clientX - cr.left;
    //let y = e.clientY - cr.top;
    for (let i = 0; i < 50; i++) {
        emitParticle(x, y, ~~(Math.random() * (Directions.length-1)));
    }
};

function emit() {
    let side = ~~Math.floor(Math.random() * 4);

    let x = 0,
        y = 0,
        dir = 0;
    switch (side) {
        default:
        case 0: // LEFT
            dir = 0;
            y = Math.random() * (canvas.height - 1);
        break;
        case 1: // TOP
            dir = 2;
            x = Math.random() * (canvas.width - 1);
        break;
        case 2: // RIGHT
            dir = 4;
            x = canvas.width - 1;
            y = Math.random() * (canvas.height - 1);
        break;
        case 3: // BOTTOM
            dir = 6;
            x = Math.random() * (canvas.width - 1);
            y = canvas.height - 1;
        break;
    }

    emitParticle(x, y, dir);
}

let time = 0;
function update() {
    let t = time++ % 5;
    if (t == 0) {
        emit();
    }

    for (let i = 0; i < MAX_PARTICLES; i++) {
        let p = particles[i];
        if (p.dead) continue;

        if (p.dirTime++ >= p.dirChangeRate) {
            const incs = [-1, 0, 1];
            let dirIndex = p.dir;
            dirIndex += incs[Math.floor((Math.random() * incs.length))];
            dirIndex %= Directions.length;
            if (dirIndex < 0) {
                dirIndex = Directions.length + dirIndex;
            }

            p.dir = dirIndex;
            p.dirChangeRate = 5.0 + Math.random() * 20.0;
            p.dirTime = 0;
        } else {
            let dir = Directions[p.dir];
            p.dx = dir[0];
            p.dy = dir[1];
        }

        p.px = p.x;
        p.py = p.y;
        p.x += p.dx * p.speed;
        p.y += p.dy * p.speed;

        if (p.x < 0 || p.x > canvas.width ||
            p.y < 0 || p.y > canvas.height)
            p.dead = true;
    }
}

function loop() {
    update();
    redraw();
    window.requestAnimationFrame(loop);
}

loop();