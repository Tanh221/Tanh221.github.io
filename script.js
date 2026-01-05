/* ======================
   🔊 SOUND
====================== */
const explosionSound = new Audio("sound_effect.mp4");
explosionSound.volume = 0.15;

/* ======================
   STATE
====================== */
let fireworksRunning = false;
let fireInterval = null;

/* ======================
   CANVAS
====================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

/* ======================
   📐 DPI RESIZE (CRITICAL)
====================== */
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    createStars();
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ======================
   🌌 STAR SKY
====================== */
let stars = [];

function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 12000);
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
    const x = canvas.width / (window.devicePixelRatio || 1) - 90;
    const y = 120;
    const r = 40;

    ctx.save();
    ctx.fillStyle = "#f5f3ce";
    ctx.shadowColor = "#f5f3ce";
    ctx.shadowBlur = 20;
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
const fireCount = 160;

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
            return { x: dx / m, y: dy / m };
        }
        case "rectangle": {
            const w = 1.6, h = 1;
            const m = Math.max(Math.abs(dx) / w, Math.abs(dy) / h);
            return { x: dx / m, y: dy / m };
        }
        case "triangle": return { x: dx, y: Math.sin(t * 1.5) };
        case "star": {
            const r = Math.cos(5 * t);
            return { x: dx * r, y: dy * r };
        }
        case "flower": {
            const f = Math.sin(6 * t);
            return { x: dx * f, y: dy * f };
        }
        case "heart": {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t)
                    - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            return { x: x / 18, y: -y / 18 };
        }
        case "spiral": {
            const r = t / (Math.PI * 2);
            return { x: Math.cos(t) * r, y: Math.sin(t) * r };
        }
        case "infinity": {
            const d = 1 + Math.sin(t) ** 2;
            return { x: Math.cos(t) / d, y: Math.sin(t) * Math.cos(t) / d };
        }
    }
}

/* CREATE FIREWORK */
function createFirework(x, y) {
    if (particles.length > 5000) return;

    const boom = explosionSound.cloneNode();
    boom.volume = 0.12;
    boom.play();

    const shape = randShape();
    const color = randColor();
    const speed = rand(4.5, 7.5);

    for (let i = 0; i < fireCount; i++) {
        const t = Math.PI * 2 * i / fireCount;
        const v = shapeVector(shape, t);

        const p = {
            x, y,
            vx: v.x * speed,
            vy: v.y * speed,
            ay: gravity,
            life: rand(80, 130),
            baseLife: 0,
            size: rand(1.8, 2.6),
            alpha: 1,
            color
        };
        p.baseLife = p.life;
        particles.push(p);
    }
}

/* UPDATE & DRAW */
function update() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.ay;
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.alpha = p.life / p.baseLife;
        if (p.life <= 0) particles.splice(i, 1);
    }
    textHue += 0.4;
}

function drawText() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const base = Math.min(w, h);

    const fontSize = Math.max(22, Math.min(base * 0.055, 48));

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = `hsl(${textHue},100%,65%)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = fontSize * 0.25;

    ctx.fillText("🎉 Happy New Year 🎉", w / 2, h * 0.12);
}

function draw() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    drawStars();
    drawMoon();

    particles.forEach(p => {
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    drawText();
}

function animate() {
    draw();
    update();
    requestAnimationFrame(animate);
}

/* ======================
   START / STOP FIREWORKS
====================== */
function startFireworks() {
    if (fireInterval) return;
    fireworksRunning = true;

    fireInterval = setInterval(() => {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);

        createFirework(
            rand(w * 0.2, w * 0.8),
            rand(h * 0.25, h * 0.6)
        );
    }, 1600);
}

function stopFireworks() {
    clearInterval(fireInterval);
    fireInterval = null;
    fireworksRunning = false;
}

/* ======================
   UI EVENTS
====================== */
const startBtn = document.getElementById("startBtn");

function startApp(e) {
    e.preventDefault();
    e.stopPropagation();

    document.getElementById("startScreen").style.display = "none";

    const canvas = document.getElementById("canvas");
    canvas.style.display = "block";

    document.getElementById("toggleFireworks").style.display = "block";

    animate();
    startFireworks();
}

// CLICK (desktop)
startBtn.addEventListener("click", startApp);

// TOUCH (mobile – BẮT BUỘC)
startBtn.addEventListener("touchstart", startApp, { passive: false });


const toggleBtn = document.getElementById("toggleFireworks");
toggleBtn.onclick = () => {
    if (fireworksRunning) {
        stopFireworks();
        toggleBtn.textContent = "▶ Start Fireworks";
    } else {
        startFireworks();
        toggleBtn.textContent = "⏸ Stop Fireworks";
    }
};
