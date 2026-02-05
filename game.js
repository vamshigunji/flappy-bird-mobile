const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startMsg = document.getElementById('start-msg');

let canvasWidth, canvasHeight;
function resize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
window.addEventListener('resize', resize);
resize();

// Game constants
const GRAVITY = 0.25;
const JUMP = -5;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 1500; // ms
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const BIRD_SIZE = 30;

let bird = {
    x: 50,
    y: canvasHeight / 2,
    velocity: 0,
    radius: BIRD_SIZE / 2
};

let pipes = [];
let score = 0;
let gameActive = false;
let lastPipeTime = 0;

function jump() {
    if (!gameActive) {
        resetGame();
        gameActive = true;
        startMsg.style.display = 'none';
    }
    bird.velocity = JUMP;
}

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

window.addEventListener('mousedown', (e) => {
    jump();
});

function resetGame() {
    bird.y = canvasHeight / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    scoreElement.innerText = 'Score: 0';
    lastPipeTime = performance.now();
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvasHeight - PIPE_GAP - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    pipes.push({
        x: canvasWidth,
        top: height,
        passed: false
    });
}

function update(timestamp) {
    if (!timestamp) timestamp = performance.now();
    if (!gameActive) {
        draw();
        requestAnimationFrame(update);
        return;
    }

    // Bird physics
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Pipe generation
    if (timestamp - lastPipeTime > PIPE_SPAWN_RATE) {
        createPipe();
        lastPipeTime = timestamp;
    }

    // Pipe movement
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= PIPE_SPEED;

        // Collision detection
        if (
            bird.x + bird.radius > pipe.x &&
            bird.x - bird.radius < pipe.x + PIPE_WIDTH &&
            (bird.y - bird.radius < pipe.top || bird.y + bird.radius > pipe.top + PIPE_GAP)
        ) {
            gameOver();
        }

        // Score update
        if (!pipe.passed && bird.x > pipe.x + PIPE_WIDTH) {
            pipe.passed = true;
            score++;
            scoreElement.innerText = `Score: ${score}`;
        }

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }
    }

    // Floor/Ceiling collision
    if (bird.y + bird.radius > canvasHeight || bird.y - bird.radius < 0) {
        gameOver();
    }

    draw();
    requestAnimationFrame(update);
}

function gameOver() {
    gameActive = false;
    startMsg.innerText = 'Game Over! Tap to Restart';
    startMsg.style.display = 'block';
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw bird
    ctx.fillStyle = '#f7e148';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw pipes
    ctx.fillStyle = '#73be2e';
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvasHeight - (pipe.top + PIPE_GAP));
        ctx.strokeRect(pipe.x, pipe.top + PIPE_GAP, PIPE_WIDTH, canvasHeight - (pipe.top + PIPE_GAP));
    });
}

requestAnimationFrame(update);