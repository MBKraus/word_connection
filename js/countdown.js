import { resetTimerAndBar, clearTimerEvent, startTimer} from './timer.js';

export function createCountdown(scene) {
    // Create countdown circle and text and assign them to the scene
    scene.countdownCircle = scene.add.graphics();
    scene.countdownText = scene.add.text(
        scene.scale.width / 2, 
        scene.scale.height * 0.3, 
        '', 
        {
            fontSize: '64px',
            color: '#FFFFFF',
            fontFamily: 'Poppins',
        }
    ).setOrigin(0.5);
}

export function showCountdown(scene) {
    let countdownTime = 3;
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.roundText.setVisible(true);

    scene.countdownCircle.clear();
    scene.countdownCircle.fillStyle(0x167D60, 1);
    const radius = 100;
    scene.countdownCircle.fillCircle(scene.game.scale.width / 2, scene.game.scale.height * 0.3, radius);

    scene.countdownText.setText(countdownTime);
    scene.countdownText.setVisible(true);
    scene.countdownCircle.setVisible(true);

    scene.timerText.setVisible(false);
    scene.timeBar.setVisible(false);

    hideTiles(scene);

    let countdownStartTime = Date.now();
    
    const countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - countdownStartTime) / 1000;
        countdownTime = Math.max(0, 3 - Math.floor(elapsedTime));
        scene.countdownText.setText(countdownTime);

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            scene.countdownCircle.setVisible(false);
            scene.countdownText.setVisible(false);

            resetTimerAndBar(scene);
            showTiles(scene);
        }
    }, 100); // Update more frequently for smoother countdown
}


function hideTiles(scene) {
    scene.tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
}

function showTiles(scene) {
    // Call startRound to generate and show tiles
    startRound(scene);
}


function startRound(scene) {

    resetRoundState(scene);
    setupRoundTextAndTimer(scene);
    
    const tileConfig = getTileConfig(scene);
    createTiles(scene, tileConfig);
    initializeCorrectGuessPlaceholders(scene);
    showGameElements();
}

// Helper function: Clear previous data and reset elements for the new round
function resetRoundState(scene) {
    hideTiles(scene);
    clearTimerEvent(scene);
    scene.currentInputText = '';
    
    // Destroy existing tiles and texts
    scene.tiles.forEach(tileObj => {
        tileObj.tile.destroy();
        tileObj.text.destroy();
    });
    scene.tiles = [];

    // Clear correct guess container
    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.removeAll(true);
    }
    scene.correctGuessTexts = [];

    // Hide checkmark if it exists
    if (scene.checkmark) {
        scene.checkmark.setVisible(false);
    }
}

// Helper function: Configure and start round text and timer
function setupRoundTextAndTimer(scene) {
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.remainingTime = scene.timerDuration;
    scene.timerText.setText(`Time: ${scene.remainingTime}`);
    startTimer(scene);
}

// Helper function: Get configuration values for tiles layout
function getTileConfig(scene) {
    const cols = 3;
    const rows = 4;
    const horizontalGap = 20;
    const verticalGap = 15;
    const cornerRadius = 15;
    
    const totalHorizontalGaps = (cols - 1) * horizontalGap;
    const availableWidth = scene.game.scale.width * 0.3325 * cols;
    const tileWidth = (availableWidth - totalHorizontalGaps) / cols;
    const tileHeight = tileWidth * 0.36;
    const startY = scene.game.scale.height * 0.24;
    const startX = (scene.game.scale.width - (cols * tileWidth + totalHorizontalGaps)) / 2;

    return { cols, rows, startX, startY, tileWidth, tileHeight, horizontalGap, verticalGap, cornerRadius };
}

// Helper function: Create tiles based on the configuration
function createTiles(scene, config) {
    scene.currentTopics = scene.allRounds[scene.currentRound];
    let allWords = scene.currentTopics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    for (let i = 0; i < config.cols; i++) {
        for (let j = 0; j < config.rows; j++) {
            const x = config.startX + i * (config.tileWidth + config.horizontalGap);
            const y = config.startY + j * (config.tileHeight + config.verticalGap);

            let graphics = scene.add.graphics();
            graphics.fillStyle(0xE2E8F1, 1);
            drawRoundedRect(graphics, x, y, config.tileWidth, config.tileHeight, config.cornerRadius);

            const word = allWords[i + j * config.cols];
            const text = scene.add.text(x + config.tileWidth / 2, y + config.tileHeight / 2, word.toUpperCase(), {
                fontSize: `${Math.max(32, Math.floor(config.tileHeight * 0.27))}px`,
                color: '#000000',
                fontFamily: 'Poppins',
                fontWeight: 'bold',
            }).setOrigin(0.5);

            scene.tiles.push({ 
                tile: graphics, 
                text, 
                word,
                x,
                y,
                width: config.tileWidth,
                height: config.tileHeight
            });
        }
    }
}

function drawRoundedRect(graphics, x, y, width, height, radius) {
    graphics.beginPath();
    
    // Top-left
    graphics.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    // Top line
    graphics.lineTo(x + width - radius, y);
    // Top-right
    graphics.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, 0);
    // Right line
    graphics.lineTo(x + width, y + height - radius);
    // Bottom-right
    graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    // Bottom line
    graphics.lineTo(x + radius, y + height);
    // Bottom-left
    graphics.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    // Left line
    graphics.lineTo(x, y + radius);
    
    graphics.closePath();
    graphics.fillPath();
}

// Helper function: Initialize placeholders for correct guesses
function initializeCorrectGuessPlaceholders(scene) {

    scene.currentTopics.forEach((topic, index) => {
        const yOffset = index * (scene.game.scale.height * 0.045);
        const circleRadius = scene.game.scale.width * 0.023;

        scene.guessContainer = scene.add.container(0, yOffset);
        const circle = scene.add.graphics();
        circle.lineStyle(10, 0x167D60); // Green border
        circle.fillStyle(0xFFFFFF); // White fill
        circle.strokeCircle(0, 0, circleRadius);
        circle.fillCircle(0, 0, circleRadius);

        scene.guessContainer.add(circle);
        scene.correctGuessContainer.add(scene.guessContainer);

        scene.correctGuessTexts.push({ guessContainer: scene.guessContainer, circle, topicName: topic.name, text: null });
    });
}


