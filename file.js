const gameArea = document.getElementById('gameArea');
const targetBall = document.getElementById('targetBall');
const flashbang = document.getElementById('flashbang');
const scoreSpan = document.getElementById('score');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('startButton');
const resetButton = document.getElementById('resetButton');
const messageDisplay = document.getElementById('message');

let score = 0;
let gameRunning = false;
let gameInterval;
let flashbangInterval;
let difficulty = 'easy';
let flashbangActive = false;
let hitFlashbang = false; // Flag to check if flashbang was hit

const SPAWN_INTERVAL_MS = 1500; // Ball/flashbang spawn interval
const FLASHBANG_CHANCE = 0.2; // 20% chance for a flashbang

function startGame() {
    score = 0;
    scoreSpan.textContent = score;
    gameRunning = true;
    difficulty = difficultySelect.value;
    startButton.style.display = 'none';
    resetButton.style.display = 'inline-block';
    messageDisplay.style.display = 'none';
    hideGameOverScreen(); // Hide any game over screen if it was shown

    gameInterval = setInterval(spawnTarget, SPAWN_INTERVAL_MS);
}

function resetGame() {
    clearInterval(gameInterval);
    clearInterval(flashbangInterval);
    hideTarget();
    hideFlashbang();
    gameRunning = false;
    startButton.style.display = 'inline-block';
    resetButton.style.display = 'none';
    messageDisplay.style.display = 'block';
    messageDisplay.textContent = 'Click Start to begin!';
    score = 0;
    scoreSpan.textContent = score;
}

function spawnTarget() {
    if (!gameRunning) return;

    hideTarget();
    hideFlashbang(); // Ensure flashbang is hidden before spawning new target

    const isFlashbang = Math.random() < FLASHBANG_CHANCE;

    // The gameArea simulates the 180-degree view
    // We want objects to appear within its visible bounds.
    // X-coordinates give us horizontal spread (like the 180-degrees left to right)
    // Y-coordinates give us vertical spread (up and down)
    const maxX = gameArea.clientWidth;
    const maxY = gameArea.clientHeight;

    // Random X position within the game area
    const randomX = Math.random() * maxX;
    // Random Y position within the game area
    const randomY = Math.random() * maxY;

    if (isFlashbang) {
        flashbang.style.left = `${randomX}px`;
        flashbang.style.top = `${randomY}px`;
        flashbang.style.display = 'block';
        flashbangActive = true;
        hitFlashbang = false; // Reset flashbang hit status
    } else {
        targetBall.style.left = `${randomX}px`;
        targetBall.style.top = `${randomY}px`;
        targetBall.style.display = 'block';
    }
}

function hideTarget() {
    targetBall.style.display = 'none';
}

function hideFlashbang() {
    flashbang.style.display = 'none';
    flashbangActive = false;
}

function showGameOverScreen(message) {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.className = 'game-over-screen';
    gameOverScreen.id = 'gameOverScreen';
    gameOverScreen.innerHTML = `
        <h2>GAME OVER!</h2>
        <p>${message}</p>
        <p>Your Score: ${score}</p>
        <button id="restartButton" class="controls button">Play Again</button>
    `;
    gameArea.appendChild(gameOverScreen);

    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', () => {
        resetGame();
        startGame();
        gameArea.removeChild(gameOverScreen); // Remove the game over screen
    });
}

function hideGameOverScreen() {
    const gameOverScreen = document.getElementById('gameOverScreen');
    if (gameOverScreen) {
        gameOverScreen.remove();
    }
}

gameArea.addEventListener('click', (event) => {
    if (!gameRunning) return;

    if (flashbangActive) {
        // Did the user click on the flashbang itself?
        if (event.target === flashbang) {
             // Flashbang was hit, good!
            hideFlashbang();
            hitFlashbang = true; // Mark as hit
            score += 5; // Reward for hitting flashbang
            scoreSpan.textContent = score;
        } else {
            // User missed the flashbang (clicked gameArea but not flashbang)
            handleFlashbangMiss();
        }
    } else if (event.target === targetBall) {
        // Hit the target ball
        score += 10;
        scoreSpan.textContent = score;
        hideTarget();
    } else {
        // Clicked outside the target/flashbang
        score -= 1; // Lose points for accuracy
        scoreSpan.textContent = score;
        if (score < 0) score = 0; // Prevent score from going too negative, or implement game over if desired
    }
});

// Logic for missed flashbang
function handleFlashbangMiss() {
    if (difficulty === 'easy') {
        score -= 10;
        if (score < 0) score = 0;
        scoreSpan.textContent = score;
        flashTheScreen(); // Still flash for feedback
        // No hard loss, just point deduction
    } else if (difficulty === 'hard') {
        // Hard mode: Game over if flashbang is missed
        clearInterval(gameInterval);
        gameRunning = false;
        flashTheScreen(); // Still flash for feedback
        hideTarget();
        hideFlashbang();
        showGameOverScreen("You missed the Yoru's Flashbang!");
    }
}

function flashTheScreen() {
    const flashScreen = document.createElement('div');
    flashScreen.className = 'flashbang-active-screen';
    flashScreen.classList.add('visible');
    gameArea.appendChild(flashScreen);

    setTimeout(() => {
        flashScreen.remove();
    }, 2000); // Remove after animation
}


startButton.addEventListener('click', startGame);
resetButton.addEventListener('click', resetGame);
