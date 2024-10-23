const config = {
    type: Phaser.AUTO,
    scene: {
        preload: preload,
        create: create
    },
    dom: {
        createContainer: true
    },
    backgroundColor: '#FFFFFF',
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,  
        width: 1080,
        height: 1920,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

let allRounds;
let tiles = [];
let scoreText;
let score = 0;
let currentRound = 0;
let roundText;
let timerText;
let timerEvent;
let interRoundScreen;
let okButton;
let interRoundScoreText;
let startScreen;
let startButton;
let correctGuessTexts = [];
let currentInputText = '';
let timeBar; // Declare the timeBar variable
let countdownText;
let countdownCircle;
let countdownTime = 3; // Start at 3 seconds
let gameStartTime;
let lastUpdateTime;
let isTimerRunning = false;
let isGameOver = false;
let confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
let confettiAnimationId = null;
const TIMER_DURATION = 30;
const UPDATE_INTERVAL = 100; // Update every 100ms for smoother countdown
const NUMBER_OF_ROUNDS = 2;
const TOPICS_PER_ROUND = 3;
let countdownAudioInRoundPlayed = false;

function preload() {
    this.load.text('data', 'https://mbkraus.github.io/word_connection/data.txt');
    this.load.image('bulb', 'https://mbkraus.github.io/word_connection/assets/bulb.png');
    this.load.image('person', 'https://mbkraus.github.io/word_connection/assets/person.png');
    this.load.image('question', 'https://mbkraus.github.io/word_connection/assets/question.png');
    this.load.image('tile', 'https://mbkraus.github.io/word_connection/assets/square.png');
    this.load.audio('correctSound', 'https://mbkraus.github.io/word_connection/assets/audio/correct.wav');
    this.load.audio('incorrectSound', 'https://mbkraus.github.io/word_connection/assets/audio/incorrect.mp3');
    this.load.audio('countdownSound', 'https://mbkraus.github.io/word_connection/assets/audio/countdown.wav');
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Updated create function (allRounds generated here)
function create() {
    const data = this.cache.text.get('data');
    const jsonString = atob(data);
    const allTopics = JSON.parse(jsonString);
    
    // Generate rounds
    allRounds = generateRounds(allTopics, NUMBER_OF_ROUNDS, TOPICS_PER_ROUND);

    // Rest of your create function remains the same
    countdownCircle = this.add.graphics();
    countdownText = this.add.text(game.scale.width / 2, game.scale.height * 0.3, '', {
        fontSize: '64px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

    createGameElements(this);
    createInterRoundScreen(this);
    showCountdown(this);

    // Keyboard input setup
    if (!isMobile()) {
        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8) {
                currentInputText = currentInputText.slice(0, -1);
            } else if (event.keyCode === 13) {
                if (currentInputText) {
                    checkGuess(this.scene, currentInputText.trim().toLowerCase());
                    currentInputText = '';
                }
            } else if (event.key.length === 1) {
                currentInputText += event.key.toUpperCase();
            }
            inputDisplay.setText(currentInputText);
        });
    }
}

// Function to generate rounds without repeating topics in the same round
function generateRounds(allTopics, numberOfRounds, topicsPerRound) {
    let availableTopics = [...allTopics];

    return Array(numberOfRounds).fill(null).map(() => {
        // Ensure there are enough topics available
        if (availableTopics.length < topicsPerRound) {
            // Replenish the available topics (resetting the pool) if there are not enough remaining
            availableTopics = [...allTopics];
        }

        const roundTopics = sampleTopics(availableTopics, topicsPerRound);

        // Remove the topics that were used in this round
        availableTopics = availableTopics.filter(topic => !roundTopics.includes(topic));

        return roundTopics;
    });
}

function sampleTopics(allTopics, count) {
    if (!Array.isArray(allTopics) || allTopics.length < count) {
        console.error('Invalid topics array or not enough topics');
        return [];
    }
    
    // Shuffle topics
    let topics = [...allTopics];
    for (let i = topics.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topics[i], topics[j]] = [topics[j], topics[i]];
    }

    // Return the first `count` topics
    return topics.slice(0, count);
}

function showCountdown(scene) {
    countdownTime = 3;
    roundText.setText(`Round: ${currentRound + 1}`);
    roundText.setVisible(true);

    countdownCircle.clear();
    countdownCircle.fillStyle(0x000000, 1);
    const radius = 100;
    countdownCircle.fillCircle(game.scale.width / 2, game.scale.height * 0.3, radius);

    countdownText.setText(countdownTime);
    countdownText.setVisible(true);
    countdownCircle.setVisible(true);

    timerText.setVisible(false);
    timeBar.setVisible(false);

    hideTiles();

    let countdownStartTime = Date.now();
    
    const countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - countdownStartTime) / 1000;
        countdownTime = Math.max(0, 3 - Math.floor(elapsedTime));
        countdownText.setText(countdownTime);

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            countdownCircle.setVisible(false);
            countdownText.setVisible(false);

            resetTimerAndBar(scene);
            showTiles(scene);
        }
    }, 100); // Update more frequently for smoother countdown
}



function resetTimerAndBar(scene) {
    remainingTime = TIMER_DURATION;
    updateTimerDisplay(scene);

    timerText.setVisible(true);
    timeBar.setVisible(true);
}

function showTiles(scene) {
    // Call startRound to generate and show tiles
    startRound(scene);
}

function createGameElements(scene) {
    const x = game.scale.width * 0.5;

    scene.add.image(game.scale.width * 0.75, game.scale.height * 0.035, 'bulb').setScale(0.15);
    scene.add.image(game.scale.width * 0.83, game.scale.height * 0.038, 'person').setScale(0.12);
    scene.add.image(game.scale.width * 0.18, game.scale.height * 0.038, 'question').setScale(0.12);

    scene.add.text(x, game.scale.height * 0.04, 'Connect', {
        fontSize: game.scale.width * 0.07 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Add a horizontal rectangle for ads
    const rectangleWidth = 728;
    const rectangleHeight = 90;

    const graphics = scene.add.graphics();
    graphics.fillStyle(0xD3D3D3, 1);

    // Calculate the x position to center the rectangle horizontally
    const ad_x = (game.scale.width - rectangleWidth) / 2;
    const ad_y = game.scale.height * 0.075; // Keeping the same y position

    graphics.fillRect(ad_x, ad_y, rectangleWidth, rectangleHeight);

    roundText = scene.add.text(x, game.scale.height * 0.18, `Round: ${currentRound + 1}`, {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

  
    // Fixed width for input background and rounded corners using Phaser Graphics
    const inputBgWidth = game.scale.width * 0.6;
    const inputBgHeight = game.scale.height * 0.04;

    // Input Display
    const inputBgGraphics = scene.add.graphics();
    inputBgGraphics.fillStyle(0xD3D3D3, 1); 
    inputBgGraphics.fillRoundedRect(x - inputBgWidth / 2, game.scale.height * 0.70 - inputBgHeight / 2, inputBgWidth, inputBgHeight, 20);

    // Create the time bar (thin rectangle with rounded edges)
    timeBar = scene.add.graphics();
    const timeBarHeight = 14; // Height of the time bar
    const initialBarWidth = game.scale.width; // Initial width of the time bar
    timeBar.fillStyle(0xff0000, 1); // Red color
    timeBar.fillRoundedRect(0, game.scale.height * 0.25, initialBarWidth, timeBarHeight, 5); // Draw the initial time bar

    // Display current input text
    inputDisplay = scene.add.text(x, game.scale.height * 0.70, currentInputText, {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
        wordWrap: { width: inputBgWidth - 20 }
    }).setOrigin(0.5);

    // Create keyboard buttons only for mobile devices
    if (isMobile()) {
        createKeyboard(scene);
    }
    scoreText = scene.add.text(game.scale.width * 0.85, game.scale.height * 0.18, 'Score: 0', {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

    timerText = scene.add.text(game.scale.width * 0.15, game.scale.height * 0.18, `Time: ${TIMER_DURATION}`, {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
    }).setOrigin(0.5);


    // Create a container for correct guesses (add this after inputDisplay creation)
    correctGuessContainer = scene.add.container(x, game.scale.height * 0.54);

    // Add checkmark icon (hidden by default)
    checkmark = scene.add.text(inputBgWidth / 2 + 10, 0, '✓', {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '0x66FF66',
        fontFamily: 'Arial'
    }).setOrigin(0, 0.5);
    checkmark.setVisible(false);

    // Add the checkmark to the same parent as inputDisplay
    scene.add.existing(checkmark);
    
    // Position checkmark relative to input display
    checkmark.setPosition(
        inputDisplay.x + inputBgWidth * 0.4,
        inputDisplay.y
    );
}

function createKeyboard(scene) {
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
        ['✓', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←', '']
    ];

    const keyboardContainer = scene.add.container(0, 0); // Initialize the container

    const keyboardWidth = game.scale.width; // Full width of the game screen
    const keyboardHeight = game.scale.height * 0.24; // Adjusted height for the keyboard

    const rowHeight = keyboardHeight / 3;
    const keyWidthRatio = 0.645; // Keys will be taller than wide (60% of height)

    const keySpacing = 10; // Add space between keys
    const rowSpacing = 10; // Vertical spacing between rows

    // Set the Y position of the keyboard container a little above the bottom of the screen
    const keyboardY = game.scale.height - keyboardHeight - 50; // Adjust the value as needed for spacing

    keys.forEach((row, rowIndex) => {
        let rowWidth = 0;

        // Calculate the row width based on key sizes, including special keys
        row.forEach((key) => {
            if (key === '') return; // Skip empty slots
            let keyWidth = rowHeight * keyWidthRatio;
            if (key === '✓' || key === '←') {
                keyWidth = rowHeight * keyWidthRatio * 1.5; // 1.5x width for Enter and Backspace
            }
            rowWidth += keyWidth + keySpacing; // Add width + spacing
        });
        rowWidth -= keySpacing; // Remove the extra spacing after the last key

        let startX = (keyboardWidth - rowWidth) / 2; // Centering the row

        row.forEach((key, colIndex) => {
            if (key === '') return; // Skip empty slots

            // Adjust the key width based on whether it's a special key or a regular one
            let keyWidth = rowHeight * keyWidthRatio;
            if (key === '✓' || key === '←') {
                keyWidth = rowHeight * keyWidthRatio * 1.5; // 1.5x width for Enter and Backspace
            }

            const x = startX + (keyWidth / 2); // Set X position of the key
            const y = (rowIndex * rowHeight) + (rowIndex * rowSpacing) + (rowHeight / 2); // Y position

            const button = scene.add.graphics();

            // Set the color for the key
            if (key === '✓') {
                button.fillStyle(0x008000, 1); // Green color for the Enter key
            } else {
                button.fillStyle(0x7E8484, 1); // Default color for other keys
            }

            // Draw a rounded rectangle for the key
            button.fillRoundedRect(
                -keyWidth / 2,   // Top-left X
                -rowHeight / 2,  // Top-left Y
                keyWidth,        // Width
                rowHeight,       // Height
                10               // Corner radius for rounded edges
            );

            // Add key label text
            const keyText = scene.add.text(0, 0, key, {
                fontSize: `${rowHeight * 0.4}px`,
                color: '#FFFFFF',
                fontFamily: 'Arial',
            }).setOrigin(0.5);

            // Create a container for the key button and text
            const keyButton = scene.add.container(x, y, [button, keyText]);
            keyButton.setSize(keyWidth, rowHeight);
            keyButton.setInteractive();

            keyButton.on('pointerdown', () => {
                if (key === '✓') {
                    if (currentInputText) {
                        checkGuess(scene, currentInputText.trim().toLowerCase());
                        currentInputText = '';
                        inputDisplay.setText(currentInputText);
                    }
                } else if (key === '←') {
                    currentInputText = currentInputText.slice(0, -1);
                    inputDisplay.setText(currentInputText);
                } else {
                    currentInputText += key;
                    inputDisplay.setText(currentInputText);
                }
            });

            // Add the key button to the keyboard container
            keyboardContainer.add(keyButton);

            // Move startX to the next key's position (including the spacing)
            startX += keyWidth + keySpacing;
        });
    });

    // Position the keyboardContainer slightly above the bottom of the screen
    keyboardContainer.setY(keyboardY);
}

function createInterRoundScreen(scene) {
    interRoundScreen = scene.add.container(0, 0);
    interRoundScreen.setDepth(1000);

    let bg = scene.add.rectangle(0, 0, game.scale.width, game.scale.height, 0x000000);
    bg.setOrigin(0);
    interRoundScreen.add(bg);

    interRoundScoreText = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.4, '', {
        fontSize: game.scale.width * 0.08 + 'px',
        color: '#ffffff'
    }).setOrigin(0.5);
    interRoundScreen.add(interRoundScoreText);

    okButton = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.6, 'Next Round', {
        fontSize: game.scale.width * 0.06 + 'px',
        color: '#ffffff',
        backgroundColor: '#4a4a4a',
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    }).setOrigin(0.5).setInteractive();

    okButton.on('pointerdown', () => {
        hideInterRoundScreen();
        startNextRound(scene);
    });

    interRoundScreen.add(okButton);
    interRoundScreen.setVisible(false);
}

// Update hideGameElements function to handle the new structure
function hideGameElements() {
    tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
    scoreText.setVisible(false);
    timerText.setVisible(false);
    roundText.setVisible(false);
    
    // Update this part to handle the new structure
    if (correctGuessContainer) {
        correctGuessContainer.setVisible(false);
    }
}

// Update showGameElements function
function showGameElements() {
    tiles.forEach(tileObj => {
        tileObj.tile.setVisible(true);
        tileObj.text.setVisible(true);
    });
    scoreText.setVisible(true);
    timerText.setVisible(true);
    roundText.setVisible(true);
    
    if (correctGuessContainer) {
        correctGuessContainer.setVisible(true);
    }
}

// Update startGame function
function startGame(scene) {
    currentRound = 0;
    score = 0;
    updateScoreDisplay();
    
    if (correctGuessContainer) {
        correctGuessContainer.removeAll(true);
    }
    correctGuessTexts = [];

    hideTiles();
    resetTimerAndBar(scene);
    
    roundText.setText(`Round: 1`);
    showCountdown(scene);
}

function checkGuess(scene, guess) {
    const currentTopics = allRounds[currentRound];

    let matchedTopic = currentTopics.find(topic => 
        topic.name.toLowerCase() === guess.toLowerCase()
    );
    
    if (matchedTopic) {
        highlightTiles(scene, matchedTopic.words);
        
        const rectHeight = game.scale.height * 0.04;
        const rectWidth = game.scale.width * 0.4;
        const yOffset = correctGuessTexts.length * (rectHeight + 10);
        
        const rect = scene.add.rectangle(
            0,
            yOffset,
            rectWidth,
            rectHeight,
            0xFFA500
        ).setOrigin(0.5, 0);
        
        const text = scene.add.text(
            0,
            yOffset + rectHeight / 2,
            matchedTopic.name,
            {
                fontSize: game.scale.width * 0.04 + 'px',
                color: '#FFFFFF',
                fontFamily: 'Arial',
            }
        ).setOrigin(0.5);
        
        correctGuessContainer.add([rect, text]);
        correctGuessTexts.push({ rect, text });
        
        checkmark.setVisible(true);
        scene.time.delayedCall(1000, () => {
            checkmark.setVisible(false);
        });
        
        score += 30;
        updateScoreDisplay();
        scene.sound.play('correctSound');
        
        if (correctGuessTexts.length === 3) {
            // Add a slight delay before showing the inter-round screen
            scene.time.delayedCall(1500, () => {
                handleRoundEnd(scene);
            });
        } } else {
        scene.sound.play('incorrectSound');
    }
}

function highlightTiles(scene, words) {
    tiles.forEach(tile => {
        if (words.includes(tile.word)) {
            tile.tile.setTint(0x66FF66);
        }
    });
}

function updateScoreDisplay() {
    scoreText.setText(`Score: ${score}`);
}

function startTimer(scene) {
    clearTimerEvent(); // Clear any previous timer event

    remainingTime = TIMER_DURATION;
    gameStartTime = Date.now();
    lastUpdateTime = gameStartTime;

    updateTimerDisplay(scene);

    timerEvent = scene.time.addEvent({
        delay: UPDATE_INTERVAL,
        callback: updateTimer,
        callbackScope: scene,
        loop: true
    });
}

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - gameStartTime) / 1000; // Convert to seconds
    remainingTime = Math.max(0, TIMER_DURATION - elapsedTime);

    if (currentTime - lastUpdateTime >= 1000) { // Update display every second
        updateTimerDisplay(this);
        lastUpdateTime = currentTime;
    }

    // Play sound when there are 4 seconds left
    if (remainingTime <= 2.05 && remainingTime > 1.95 && !countdownAudioInRoundPlayed) {
        this.sound.play('countdownSound');
        countdownAudioInRoundPlayed = true;
    }

    if (remainingTime <= 0) {
        clearTimerEvent();
        handleTimeUp(this);
    }
}

function updateTimerDisplay(scene) {
    timerText.setText(`Time: ${Math.ceil(remainingTime)}`);
    
    // Update the width of the time bar
    const newWidth = (remainingTime / TIMER_DURATION) * game.scale.width;
    timeBar.clear();
    timeBar.fillStyle(0xff0000, 1);
    timeBar.fillRoundedRect(0, game.scale.height * 0.20, newWidth, 14, 5);
}

function handleTimeUp(scene) {
    scene.time.delayedCall(1500, () => {
        endGame(scene);
    }, [], scene);
}

function handleRoundEnd(scene) {
    clearTimerEvent();

    countdownAudioInRoundPlayed = false;

    let timeRemaining = remainingTime;
    let timeBonus = 0;
    let roundBonus = 50;
    let wordPoints = 3 * 30;

    if (timeRemaining > 20) {
        timeBonus = 30;
    } else if (timeRemaining > 10) {
        timeBonus = 10;
    }

    score += roundBonus + timeBonus;

    let interRoundMessage = `Awesome!\n\n+ ${wordPoints} Word Points`;
    interRoundMessage += `\n+ ${roundBonus} Round Bonus`;
    if (timeBonus > 0) {
        interRoundMessage += `\n+ ${timeBonus} Time Bonus`;
    }
    interRoundMessage += `\n\nTotal Score: ${score}`;

    interRoundScoreText.setText(interRoundMessage);

    showInterRoundScreen(scene);
    
    okButton.setText('Next Round');
    okButton.removeAllListeners('pointerdown');
    okButton.on('pointerdown', () => {
        hideInterRoundScreen();
        startNextRound(scene);
    });

    // Trigger confetti if all three topics were guessed correctly
    if (correctGuessTexts.length === 3) {
        // Small delay to ensure the inter-round screen is visible
        scene.time.delayedCall(100, () => {
            createConfettiEffect();
        });
    }
}

function showInterRoundScreen(scene) {
    interRoundScreen.setVisible(true);
    hideGameElements();
}

function hideInterRoundScreen() {
    interRoundScreen.setVisible(false);
    showGameElements();
}

// Update startNextRound function
function startNextRound(scene) {
    if (currentRound < allRounds.length - 1) {
        currentRound++;
        hideInterRoundScreen();
        hideTiles();
        clearTimerEvent();

        if (correctGuessContainer) {
            correctGuessContainer.removeAll(true);
        }
        correctGuessTexts = [];

        if (checkmark) {
            checkmark.setVisible(false);
        }

        roundText.setText(`Round: ${currentRound + 1}`);
        showCountdown(scene);
    } else {
        endGame(scene);
    }
}

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function createConfettiEffect() {
    // Cancel any existing confetti animation
    if (confettiAnimationId) {
        clearInterval(confettiAnimationId);
    }

    const duration = 3000; // 3 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 2000, // Ensure confetti appears above all game elements
        shapes: ['square', 'circle'],
        colors: confettiColors,
        disableForReducedMotion: true // Accessibility consideration
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Create the confetti animation interval
    confettiAnimationId = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(confettiAnimationId);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire confetti from multiple origins for better coverage
        // Left side
        confetti(Object.assign({}, defaults, {
            particleCount: particleCount / 3,
            origin: { x: randomInRange(0.2, 0.3), y: 0.5 }
        }));

        // Center
        confetti(Object.assign({}, defaults, {
            particleCount: particleCount / 3,
            origin: { x: randomInRange(0.4, 0.6), y: 0.5 }
        }));

        // Right side
        confetti(Object.assign({}, defaults, {
            particleCount: particleCount / 3,
            origin: { x: randomInRange(0.7, 0.8), y: 0.5 }
        }));
    }, 250);
}

function clearTimerEvent() {
    if (timerEvent) {
        timerEvent.remove(false);
        timerEvent = null;
    }
}

function hideTiles() {
    tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
}

// Update endGame function
function endGame(scene) {
    countdownAudioInRoundPlayed = false;
    
    interRoundScoreText.setText(`Game Over!\nFinal Score: ${score}`);
    okButton.setText('Restart');

    okButton.removeAllListeners('pointerdown');
    okButton.on('pointerdown', () => {
        hideInterRoundScreen();
        if (correctGuessContainer) {
            correctGuessContainer.removeAll(true);
        }
        correctGuessTexts = [];
        startGame(scene);
    });

    showInterRoundScreen(scene);

    // Show confetti for game completion if all topics were guessed
    if (correctGuessTexts.length === 3) {
        scene.time.delayedCall(100, () => {
            createConfettiEffect();
        });
    }
}

// Updated startRound function (use pre-generated allRounds)
function startRound(scene) {
    console.log('Starting round:', currentRound); // Debug log

    hideTiles();
    clearTimerEvent();

    // Clear previous tiles
    tiles.forEach(tileObj => {
        tileObj.tile.destroy();
        tileObj.text.destroy();
    });
    tiles = [];

    // Clear previous correct guesses
    if (correctGuessContainer) {
        correctGuessContainer.removeAll(true);
    }
    correctGuessTexts = [];
    
    // Hide checkmark if visible
    if (checkmark) {
        checkmark.setVisible(false);
    }

    // Get topics for the current round
    const currentTopics = allRounds[currentRound];

    // Collect all words for this round
    let allWords = currentTopics.flatMap(topic => topic.words);
    
    Phaser.Utils.Array.Shuffle(allWords);

    roundText.setText(`Round: ${currentRound + 1}`);
    remainingTime = TIMER_DURATION;
    timerText.setText(`Time: ${remainingTime}`);
    startTimer(scene);

    const cols = 3;
    const rows = 4;
    const tileWidth = Math.floor(game.scale.width * 0.35);
    const tileHeight = tileWidth * 0.4;
    const startY = game.scale.height * 0.25;
    const startX = (game.scale.width - (cols * tileWidth)) / 2;

    // Create tiles with words
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = startX + i * tileWidth + tileWidth / 2;
            const y = startY + j * tileHeight;

            let tile = scene.add.image(x, y, 'tile');
            tile.setScale(tileWidth / tile.width, tileHeight / tile.height);
            tile.setTint(0x5A9BD6);

            let word = allWords[i + j * cols];
            let text = scene.add.text(x, y, word, { 
                fontSize: `${Math.max(25, Math.floor(tileHeight * 0.27))}px`, 
                color: '#ffffff',
                fontFamily: 'Arial',
            }).setOrigin(0.5);

            tiles.push({ tile, text, word });
        }
    }
    
    currentInputText = '';
    showGameElements();
}
