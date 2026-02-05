// --- Additional Variables ---
let isGameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

// Collision Detection Function
function checkCollision(pX, pY, pW, pH, tX, tY, tW, tH) {
    return pX < tX + tW && pX + pW > tX && pY < tY + tH && pY + pH > tY;
}

// Reset Game Function
function resetGame() {
    speed = 0;
    score = 0;
    trafficCars = [];
    isGameOver = false;
    isInteriorView = false;
}

// --- Main Draw Loop (Updated) ---
function draw() {
    if (isGameOver) {
        // Game Over Screen with Red Glow
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = "bold 60px Russo One";
        ctx.fillStyle = "#ff0000";
        ctx.textAlign = "center";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "red";
        ctx.fillText("CRASHED!", canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = "20px Orbitron";
        ctx.fillStyle = "white";
        ctx.fillText("FINAL SPEED: " + Math.floor(speed) + " KM/H", canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText("HIGH SCORE: " + Math.floor(highScore), canvas.width / 2, canvas.height / 2 + 60);
        ctx.fillText("TOUCH TO RESTART", canvas.width / 2, canvas.height / 2 + 120);
        
        return; 
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Calculate Speed & Score
    if (isGas && speed < MAX_SPEED) speed += 4;
    else if (isBrake && speed > 0) speed -= 10;
    else if (speed > 0) speed -= 1.5;

    if (speed > 10) score += speed / 100; // Speed jitni zyada, score utna tez badhega
    speedElement.innerText = Math.floor(speed);

    // 2. Road Animation
    roadY += speed * 0.1;
    if (roadY >= canvas.height) roadY = 0;
    ctx.drawImage(img.road, 0, roadY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(img.road, 0, roadY, canvas.width, canvas.height);

    // 3. Traffic & Collision
    let playerX = canvas.width / 2 - 50;
    let playerY = canvas.height - 250;
    let playerW = 100;
    let playerH = 200;

    trafficCars.forEach((c, index) => {
        let relativeSpeed = (speed - TRAFFIC_BASE_SPEED) * 0.1;
        c.y += relativeSpeed + 3; 
        ctx.drawImage(img[c.type], c.x, c.y, 80, 160);

        // Check for Crash
        if (checkCollision(playerX, playerY, playerW, playerH, c.x, c.y, 80, 160)) {
            isGameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem("highScore", highScore);
            }
        }

        if (c.y > canvas.height + 500 || c.y < -1000) trafficCars.splice(index, 1);
    });
    spawnTraffic();

    // 4. Draw Player View
    if (!isInteriorView) {
        ctx.drawImage(img.playerOut, playerX, playerY, playerW, playerH);
    } else {
        // Interior Graphics
        ctx.drawImage(img.playerIn, 0, 0, canvas.width, canvas.height);
        
        // Branding on Dashboard
        ctx.font = "italic bold 22px Orbitron";
        ctx.fillStyle = "white";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "red";
        ctx.fillText("BHARAT GAMING STUDIO", canvas.width / 2, canvas.height - 140);
        
        // Logo placements
        ctx.drawImage(img.logo, canvas.width / 2 - 35, canvas.height - 120, 70, 70); 
        ctx.globalAlpha = 0.6; // Mirror reflection effect
        ctx.drawImage(img.logo, 40, 60, 90, 45); 
        ctx.drawImage(img.logo, canvas.width - 130, 60, 90, 45);
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
}

// Restart event
canvas.addEventListener('touchstart', () => {
    if (isGameOver) resetGame();
});
