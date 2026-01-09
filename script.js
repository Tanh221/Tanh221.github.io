/* CONSTANTS */
const MAX_PARTICLES = 3000;
const PARTICLE_CLEANUP_BATCH = 150;
const METEOR_SPAWN_CHANCE = 0.01;
const MAX_AUDIO_NODES = 8;

/* STATE */
let fireworksRunning = false;
let fireInterval = null;
let fireworkCount = 0;
let lastTime = performance.now();
let soundEnabled = true;
let currentFrequency = 1500;

/* AUDIO MANAGEMENT */
let activeAudioCount = 0;

function playExplosionSound(volume) {
    if (!soundEnabled) return;
    
    // Limit concurrent sounds
    if (activeAudioCount >= MAX_AUDIO_NODES) return;
    
    const audio = new Audio("sound_effect.mp4");
    audio.volume = volume * 0.15;
    activeAudioCount++;
    
    audio.onended = () => {
        activeAudioCount--;
        audio.remove();
    };
    
    audio.onerror = () => {
        activeAudioCount--;
    };
    
    audio.play().catch(() => {
        activeAudioCount--;
    });
}

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
    "circle","rectangle",
    "star","flower","heart","spiral","infinity","text"
];

// Fixed list of text options for text fireworks
const textOptions = [
    "Happy",
    "New Year",
    "Happy New Year",
    "Best Wishes"

];

let textPointsCache = {};
let currentTextIndex = 0;

/* GENERATE TEXT POINTS */
function generateTextPoints(text, fontSize = 80) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set canvas size
    tempCanvas.width = 800;
    tempCanvas.height = 200;
    
    // Draw text
    tempCtx.font = `bold ${fontSize}px Arial`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillStyle = 'white';
    tempCtx.fillText(text, tempCanvas.width / 2, tempCanvas.height / 2);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const points = [];
    
    // Sample pixels (every 3rd pixel for performance)
    for (let y = 0; y < tempCanvas.height; y += 3) {
        for (let x = 0; x < tempCanvas.width; x += 3) {
            const i = (y * tempCanvas.width + x) * 4;
            if (imageData.data[i + 3] > 128) { // Alpha channel
                // Normalize coordinates to -1 to 1 range
                points.push({
                    x: (x - tempCanvas.width / 2) / (tempCanvas.width / 2),
                    y: (y - tempCanvas.height / 2) / (tempCanvas.height / 2)
                });
            }
        }
    }
    
    return points;
}

// Pre-generate all text points on load
function initializeTextPoints() {
    textOptions.forEach(text => {
        textPointsCache[text] = generateTextPoints(text);
    });
}

// Get next text in rotation
function getNextTextPoints() {
    const text = textOptions[currentTextIndex];
    currentTextIndex = (currentTextIndex + 1) % textOptions.length;
    return textPointsCache[text];
}

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
        case "text": {
            // Return null, handled differently in createFirework
            return null;
        }
    }
}

/* CREATE FIREWORK */
function createFirework(x, y) {
    // Memory management - prevent unlimited growth
    if (particles.length > MAX_PARTICLES) {
        particles.splice(0, PARTICLE_CLEANUP_BATCH);
    }

    fireworkCount++;
    if (fireworkCount % 4 === 1) {
        const dx = x - canvas.width/2;
        const dy = y - canvas.height/2;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const volume = Math.max(0.1, 1 - dist/800);
        playExplosionSound(volume);
    }

    const shape = randShape();
    const color = randColor();
    
    const isMobile = window.innerWidth < 768;
    const sizeScale = isMobile ? 0.5 : 1;
    
    // Handle text shape differently
    if (shape === "text") {
        const textPoints = getNextTextPoints(); // Get next text in rotation
        if (textPoints.length === 0) return; // No text points generated
        
        const scale = 150 * sizeScale; // Scale factor for text size
        const speed = rand(2, 4) * sizeScale;
        
        textPoints.forEach(point => {
            particles.push({
                x, y,
                vx: point.x * speed,
                vy: point.y * speed,
                ay: gravity * 0.5, // Less gravity for text
                life: rand(120, 180), // Longer life
                baseLife: 0,
                size: rand(2, 4) * sizeScale,
                alpha: 1,
                color
            });
            particles.at(-1).baseLife = particles.at(-1).life;
        });
        return;
    }
    
    // Original shape logic
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
            if (!v) continue; // Skip if null

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

/* UPDATE & DRAW */
function update(deltaTime) {
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
    
    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx * deltaTime;
        m.y += m.vy * deltaTime;
        m.life -= deltaTime;
        if (m.life <= 0 || m.x > canvas.width || m.y > canvas.height) {
            meteors.splice(i, 1);
        }
    }
    
    if (Math.random() < METEOR_SPAWN_CHANCE * deltaTime) {
        createMeteor();
    }
    
    textHue += 0.4 * deltaTime;
}

function drawText() {
    const fontSize = Math.min(64, canvas.width * 0.05);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = `hsl(${textHue},100%,65%)`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 15;
    
    const textY = canvas.height < 700 ? canvas.height * 0.12 : canvas.height * 0.15;
    const text = canvas.width < 400 ? "🎆" : "Happy New Year";
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
    }, currentFrequency);
}

function stopFireworks() {
    clearInterval(fireInterval);
    fireInterval = null;
    fireworksRunning = false;
}

function updateFireworkFrequency(frequency) {
    currentFrequency = frequency;
    if (fireworksRunning) {
        stopFireworks();
        startFireworks();
    }
}

/* UI EVENTS */
document.getElementById("startBtn").onclick = () => {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("controls").style.display = "flex";
    lastTime = performance.now();
    animate(lastTime);
    startFireworks();
};

document.getElementById("toggleFireworks").onclick = () => {
    const btn = document.getElementById("toggleFireworks");
    if (fireworksRunning) {
        stopFireworks();
        btn.textContent = "▶ Start";
    } else {
        startFireworks();
        btn.textContent = "⏸ Stop";
    }
};

document.getElementById("toggleSound").onclick = () => {
    const btn = document.getElementById("toggleSound");
    soundEnabled = !soundEnabled;
    btn.textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
};

document.getElementById("frequencySelect").onchange = (e) => {
    updateFireworkFrequency(parseInt(e.target.value));
};

/* INITIALIZE */
initializeTextPoints(); // Pre-generate all text points

/* RESIZE */
createStars();
initializeTextPoints(); // Initialize text points on load
window.onresize = () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    createStars();
};