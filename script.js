/* Sound */
const explosionSound = new Audio("sound_effect.mp4");
explosionSound.volume = 0.15;

/* STATE */
let fireworksRunning = false;
let fireInterval = null;
let fireworkCount = 0;
let lastTime = performance.now();

/* CANVAS */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

/* STAR SKY */
let stars = [];
let meteors = [];

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

function createMeteor() {
    meteors.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        vx: rand(3, 6),
        vy: rand(2, 4),
        length: rand(80, 120),
        life: 100,
        baseLife: 100
    });
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

function drawMeteors() {
    ctx.save();
    meteors.forEach(m => {
        const alpha = m.life / m.baseLife;
        const gradient = ctx.createLinearGradient(
            m.x, m.y,
            m.x - m.vx * m.length / 5, m.y - m.vy * m.length / 5
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.6})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * m.length / 5, m.y - m.vy * m.length / 5);
        ctx.stroke();
    });
    ctx.restore();
}

/* MOON */
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

/* FIREWORK */
const particles = [];
const gravity = 0.05;
const fireCount = 180;

const shapes = [
    "circle","square","rectangle",
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

    fireworkCount++;
    if (fireworkCount % 4 === 1) {
        const boom = explosionSound.cloneNode();
        const dx = x - canvas.width/2;
        const dy = y - canvas.height/2;
        const dist = Math.sqrt(dx*dx + dy*dy);
        boom.volume = Math.max(0.1, 1 - dist/800);
        boom.play().catch(() => {});
    }

    const shape = randShape();
    const color = randColor();
    
    // Scale down fireworks on mobile
    const isMobile = window.innerWidth < 768;
    const sizeScale = isMobile ? 0.5 : 1;
    
    // Only create layers for circle, square, rectangle
    const needsLayers = ["circle", "square", "rectangle"].includes(shape);
    const layers = needsLayers ? Math.floor(rand(5,9)) : 1;
    
    for (let layer = 0; layer < layers; layer++) {
        const baseSpeed = needsLayers 
            ? rand(5, 9) * (0.4 + layer * 0.2)
            : rand(5, 9);
        const speed = baseSpeed * sizeScale;
        const layerParticles = needsLayers 
            ? Math.floor(fireCount / layers)
            : fireCount;
        
        for (let i = 0; i < layerParticles; i++) {
            const t = Math.PI*2*i/layerParticles;
            const v = shapeVector(shape, t);

            particles.push({
                x, y,
                vx: v.x*speed,
                vy: v.y*speed,
                ay: gravity,
                life: rand(80,140),
                baseLife: 0,
                size: rand(2,3) * sizeScale,
                alpha: 1,
                color
            });
            particles.at(-1).baseLife = particles.at(-1).life;
        }
    }
}

/* UPDATE & DRAW - NOW WITH DELTA TIME */
function update(deltaTime) {
    // Clamp deltaTime to prevent huge jumps if tab was inactive
    deltaTime = Math.min(deltaTime, 3);
    
    for (let i = particles.length-1; i>=0; i--) {
        const p = particles[i];
        p.vy += p.ay * deltaTime;
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;
        p.alpha = p.life/p.baseLife;
        if (p.life <= 0) particles.splice(i,1);
    }
    
    // Update meteors with delta time
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx * deltaTime;
        m.y += m.vy * deltaTime;
        m.life -= deltaTime;
        if (m.life <= 0 || m.x > canvas.width || m.y > canvas.height) {
            meteors.splice(i, 1);
        }
    }
    
    // Randomly create new meteors (probability adjusted for frame rate)
    if (Math.random() < 0.01 * deltaTime) {
        createMeteor();
    }
    
    textHue += 0.4 * deltaTime;
}

function drawText() {
    // Much smaller font size for mobile
    const fontSize = Math.min(64, canvas.width * 0.05);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = `hsl(${textHue},100%,65%)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    
    const textY = canvas.height < 700 ? canvas.height * 0.12 : canvas.height * 0.15;
    const text = canvas.width < 400 ? " " : "Happy New Year";
    ctx.fillText(text, canvas.width/2, textY);
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    drawMeteors();
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

function animate(currentTime) {
    // Calculate delta time (normalized to 60 FPS as baseline)
    const deltaTime = (currentTime - lastTime) / 16.67;
    lastTime = currentTime;
    
    draw();
    update(deltaTime);
    requestAnimationFrame(animate);
}

/* START / STOP FIREWORKS */
function startFireworks() {
    if (fireInterval) return;
    fireworksRunning = true;

    fireInterval = setInterval(() => {
        createFirework(
            rand(canvas.width*0.2, canvas.width*0.8),
            rand(canvas.height*0.25, canvas.height*0.6)
        );
    }, window.innerWidth < 768 ? 2000 : 1500);
}

function stopFireworks() {
    clearInterval(fireInterval);
    fireInterval = null;
    fireworksRunning = false;
}

/* UI EVENTS */
document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("toggleFireworks").style.display = "block";
    lastTime = performance.now(); // Initialize timing
    animate(lastTime);
    startFireworks();
};

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

/* RESIZE */
createStars();
window.onresize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    createStars();
};