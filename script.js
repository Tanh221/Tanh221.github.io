/* ======================
   🔊 SOUND
====================== */
const explosionSound = new Audio("sound_effect.mp4");
explosionSound.volume = 0.15;

/* ======================
   STATE
====================== */
let started = false;
let fireInterval;

/* ======================
   CANVAS
====================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

/* ======================
   🌌 STAR SKY
====================== */
let stars = [];

function createStars() {
    stars = [];
    const count = Math.floor(canvas.width * canvas.height / 9000);
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random() * 0.7 + 0.3
        });
    }
}

function drawStars() {
    ctx.save();
    ctx.fillStyle = "white";
    stars.forEach(s => {
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

/* ======================
   🌕 MOON
====================== */
function drawMoon() {
    const x = canvas.width - 120;
    const y = 120;
    const r = 45;

    ctx.save();
    ctx.fillStyle = "#f5f3ce";
    ctx.shadowColor = "#f5f3ce";
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

/* ======================
   FIREWORK
====================== */
const particles = [];
const gravity = 0.05;
const fireCount = 180;

const shapes = [
    "circle","square","rectangle","triangle",
    "star","flower","heart","spiral","infinity"
];

let textHue = Math.random() * 360;

function rand(min, max) {
    return Math.random() * (max - min) + min;
}
function randColor() {
    return `hsl(${Math.random() * 360},100%,60%)`;
}
function randShape() {
    return shapes[Math.floor(Math.random() * shapes.length)];
}

/* SHAPE VECTOR */
function shapeVector(shape, t) {
    const dx = Math.cos(t);
    const dy = Math.sin(t);

    switch (shape) {
        case "circle": return { x: dx, y: dy };
        case "square": {
            const m = Math.max(Math.abs(dx), Math.abs(dy));
            return { x: dx/m, y: dy/m };
        }
        case "rectangle": {
            const w = 1.6, h = 1;
            const m = Math.max(Math.abs(dx)/w, Math.abs(dy)/h);
            return { x: dx/m, y: dy/m };
        }
        case "triangle": return { x: dx, y: Math.sin(t * 1.5) };
        case "star": {
            const r = Math.cos(5 * t);
            return { x: dx*r, y: dy*r };
        }
        case "flower": {
            const f = Math.sin(6 * t);
            return { x: dx*f, y: dy*f };
        }
        case "heart": {
            const x = 16*Math.pow(Math.sin(t),3);
            const y = 13*Math.cos(t)-5*Math.cos(2*t)
                    -2*Math.cos(3*t)-Math.cos(4*t);
            return { x: x/18, y: -y/18 };
        }
        case "spiral": {
            const r = t/(Math.PI*2);
            return { x: Math.cos(t)*r, y: Math.sin(t)*r };
        }
        case "infinity": {
            const d = 1 + Math.sin(t)**2;
            return { x: Math.cos(t)/d, y: Math.sin(t)*Math.cos(t)/d };
        }
    }
}

/* CREATE FIREWORK */
function createFirework(x, y) {
    if (particles.length > 6000) return;

    const boom = explosionSound.cloneNode();
    const dx = x - canvas.width/2;
    const dy = y - canvas.height/2;
    const dist = Math.sqrt(dx*dx + dy*dy);
    boom.volume = Math.max(0.1, 1 - dist/800);
    boom.play();

    const shape = randShape();
    const color = randColor();
    const speed = rand(5, 9);

    for (let i = 0; i < fireCount; i++) {
        const t = Math.PI*2*i/fireCount;
        const v = shapeVector(shape, t);

        particles.push({
            x, y,
            vx: v.x*speed,
            vy: v.y*speed,
            ay: gravity,
            life: rand(80,140),
            baseLife: 0,
            size: rand(2,3),
            alpha: 1,
            color
        });
        particles.at(-1).baseLife = particles.at(-1).life;
    }
}

/* UPDATE & DRAW */
function update() {
    for (let i = particles.length-1; i>=0; i--) {
        const p = particles[i];
        p.vy += p.ay;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life/p.baseLife;
        if (p.life <= 0) particles.splice(i,1);
    }
    textHue += 0.4;
}

function drawText() {
    ctx.font = "bold 64px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = `hsl(${textHue},100%,65%)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 20;
    ctx.fillText("🎉 Happy New Year 🎉", canvas.width/2, canvas.height*0.15);
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    drawMoon();

    particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawText();
}

function animate() {
    if (!started) return;
    draw();
    update();
    requestAnimationFrame(animate);
}

/* START */
document.getElementById("startBtn").onclick = () => {
    started = true;
    document.getElementById("startScreen").style.display = "none";
    animate();
    fireInterval = setInterval(() => {
        createFirework(
            rand(canvas.width*0.2, canvas.width*0.8),
            rand(canvas.height*0.25, canvas.height*0.6)
        );
    }, window.innerWidth < 768 ? 1800 : 1200);
};

createStars();
window.onresize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    createStars();
};
