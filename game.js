// --- 1. Assets Configuration ---
const sources = {
    road: 'road.png',
    playerOut: 'outviewcar.png',
    playerIn: 'inviewcar.png',
    logo: 'b.png',
    steering: 'steering.png',
    car1: 'car1.png',
    car2: 'car2.png',
    car3: 'car3.png',
    car4: 'car4.png',
    car5: 'car5.png',
    car6: 'car6.png',
    car7: 'car7.png',
    car8: 'car8.png',
    car9: 'car9.png',
    car10: 'car10.png'
};

let img = {};
let loadedImages = 0;
let gameStarted = false;
const totalImages = Object.keys(sources).length;

// Sabse pehle images ko initialize karo
for (let key in sources) {
    img[key] = new Image();
    img[key].src = sources[key];
    
    img[key].onload = () => {
        loadedImages++;
        if (loadedImages >= totalImages && !gameStarted) {
            startGame();
        }
    };

    img[key].onerror = () => {
        console.error("Missing: " + sources[key]);
        // Agar image nahi mili toh uski jagah ek colored box load kar do taaki black screen na aaye
        img[key].src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
        loadedImages++;
        if (loadedImages >= totalImages && !gameStarted) {
            startGame();
        }
    };
}

function startGame() {
    if(!gameStarted) {
        gameStarted = true;
        const loadingScreen = document.getElementById('loading-screen');
        if(loadingScreen) loadingScreen.style.display = 'none';
        requestAnimationFrame(draw); 
    }
}

// Mobile ke liye 5 second ka wait (kabhi kabhi images slow load hoti hain)
setTimeout(() => {
    if (!gameStarted) {
        startGame();
    }
}, 5000);

// --- 3. Additional Variables & Game Logic ---
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let targetRotation = 0;
let currentRotation = 0;

function checkCollision(pX, pY, pW, pH, tX, tY, tW, tH) {
    return pX < tX + tW && pX + pW > tX && pY < tY + tH && pY + pH > tY;
}

function resetGame() {
    speed = 0;
    score = 0;
    trafficCars = [];
    isGameOver = false;
    isInteriorView = false;
}

function applyEffects() {
    const gameScreen = document.getElementById('gameCanvas');
    if (!gameScreen) return;
    if (speed > 600) {
        gameScreen.classList.add('fast-blur');
        if (speed > 750) gameScreen.classList.add('screen-shake');
    } else {
        gameScreen.classList.remove('fast-blur', 'screen-shake');
    }
}

function drawFlames(x, y, w, h) {
    if (isGas && speed > 100) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "yellow";
        ctx.fillStyle = Math.random() > 0.5 ? "orange" : "red";
        ctx.beginPath();
        ctx.arc(x + 20, y + h + (Math.random() * 20), 10, 0, Math.PI * 2);
        ctx.arc(x + w - 20, y + h + (Math.random() * 20), 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function updateSteering() {
    const wheelImg = document.getElementById('steering-wheel');
    if (!wheelImg) return;
    if (typeof isSteeringLeft !== 'undefined' && isSteeringLeft) targetRotation = -45;
    else if (typeof isSteeringRight !== 'undefined' && isSteeringRight) targetRotation = 45;
    else targetRotation = 0;
    currentRotation += (targetRotation - currentRotation) * 0.1;
    wheelImg.style.transform = `rotate(${currentRotation}deg)`;
}

// --- 4. Main Draw Loop ---
function draw() {
    if (isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 60px Russo One";
        ctx.fillStyle = "#ff0000";
        ctx.textAlign = "center";
        ctx.fillText("CRASHED!", canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = "20px Orbitron";
        ctx.fillStyle = "white";
        ctx.fillText("FINAL SPEED: " + Math.floor(speed) + " KM/H", canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("HIGH SCORE: " + Math.floor(highScore), canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText("TOUCH TO RESTART", canvas.width / 2, canvas.height / 2 + 120);
        return; 
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isGas && speed < MAX_SPEED) speed += 4;
    else if (isBrake && speed > 0) speed -= 10;
    else if (speed > 0) speed -= 1.5;

    if (speed > 10) score += speed / 100;
    if (document.getElementById('speed')) {
        document.getElementById('speed').innerText = Math.floor(speed);
    }

    roadY += speed * 0.1;
    if (roadY >= canvas.height) roadY = 0;
    
    // Draw Road
    if (img.road) {
        ctx.drawImage(img.road, 0, roadY - canvas.height, canvas.width, canvas.height);
        ctx.drawImage(img.road, 0, roadY, canvas.width, canvas.height);
    }

    applyEffects();
    updateSteering();

    let playerX = canvas.width / 2 - 50;
    let playerY = canvas.height - 250;
    let playerW = 100;
    let playerH = 200;

    trafficCars.forEach((c, index) => {
        let relativeSpeed = (speed - TRAFFIC_BASE_SPEED) * 0.1;
        c.y += relativeSpeed + 3; 
        if(img[c.type]) ctx.drawImage(img[c.type], c.x, c.y, 80, 160);

        if (checkCollision(playerX, playerY, playerW, playerH, c.x, c.y, 80, 160)) {
            isGameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }
        if (c.y > canvas.height + 500 || c.y < -1000) trafficCars.splice(index, 1);
    });
    
    if (typeof spawnTraffic === 'function') spawnTraffic();

    if (!isInteriorView) {
        drawFlames(playerX, playerY, playerW, playerH);
        if (img.playerOut) ctx.drawImage(img.playerOut, playerX, playerY, playerW, playerH);
    } else {
        if (img.playerIn) ctx.drawImage(img.playerIn, 0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.font = "italic bold 22px Orbitron";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("BHARAT GAMING STUDIO", canvas.width / 2, canvas.height - 140);
        ctx.restore();
        if (img.logo) {
            ctx.drawImage(img.logo, canvas.width / 2 - 35, canvas.height - 120, 70, 70); 
            ctx.globalAlpha = 0.6;
            ctx.drawImage(img.logo, 40, 60, 90, 45); 
            ctx.drawImage(img.logo, canvas.width - 130, 60, 90, 45);
            ctx.globalAlpha = 1.0;
        }
    }

    requestAnimationFrame(draw);
}

// --- 5. Events ---
canvas.addEventListener('touchstart', (e) => {
    if (isGameOver) {
        e.preventDefault();
        resetGame();
        requestAnimationFrame(draw);
    }
});
