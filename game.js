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

const allRounds = [
    [
        { name: 'Fruits', words: ['Apple', 'Banana', 'Cherry', 'Berry'] },
        { name: 'Animals', words: ['Dog', 'Elephant', 'Frog', 'Giraffe'] },
        { name: 'Countries', words: ['Brazil', 'Canada', 'Denmark', 'Egypt'] }
    ],
    [
        { name: 'Colors', words: ['Red', 'Green', 'Blue', 'Yellow'] },
        { name: 'Vehicles', words: ['Car', 'Bike', 'Train', 'Bus'] },
        { name: 'Sports', words: ['Football', 'Basketball', 'Tennis', 'Cricket'] }
    ]
];

let tiles = [];
let feedbackText;
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
const TIMER_DURATION = 30;
let currentInputText = '';
let timeBar; // Declare the timeBar variable
let countdownText;
let countdownCircle;
let countdownTime = 3; // Start at 3 seconds
let gameStartTime;
let lastUpdateTime;
const UPDATE_INTERVAL = 100; // Update every 100ms for smoother countdown
let isTimerRunning = false;
let isGameOver = false;


function preload() {
    this.load.image('tile', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/128x128.png');
    this.load.image('bulb', 'https://mbkraus.github.io/word_connection/assets/bulb.png');
    this.load.image('person', 'https://mbkraus.github.io/word_connection/assets/person.png');
    this.load.image('question', 'https://mbkraus.github.io/word_connection/assets/question.png');
}


function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function create() {
    // Initialize countdown variables
    countdownCircle = this.add.graphics(); // Initialize countdown graphics
    countdownText = this.add.text(game.scale.width / 2, game.scale.height * 0.3, '', {
        fontSize: '64px',
        color: '#FFFFFF',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

    createGameElements(this);
    createInterRoundScreen(this);

    showCountdown(this); // Start the countdown

    // Add keyboard input for desktop
    if (!isMobile()) {
        this.input.keyboard.on('keydown', function (event) {
            if (event.keyCode === 8) { // Backspace
                currentInputText = currentInputText.slice(0, -1);
            } else if (event.keyCode === 13) { // Enter
                if (currentInputText) {
                    checkGuess(this.scene, currentInputText.trim().toLowerCase());
                    currentInputText = '';
                }
            } else if (event.key.length === 1) { // Single character
                currentInputText += event.key.toUpperCase();
            }
            inputDisplay.setText(currentInputText);
        });
    }
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

    // Add a horizontal rectangle below the header and images
    const rectangleHeight = game.scale.height * 0.08;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xD3D3D3, 1);
    graphics.fillRect(0, game.scale.height * 0.075, game.scale.width, rectangleHeight);

    roundText = scene.add.text(x, game.scale.height * 0.18, `Round: ${currentRound + 1}`, {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

    // Fixed width for input background and rounded corners using Phaser Graphics
    const inputBgWidth = game.scale.width * 0.6;
    const inputBgHeight = game.scale.height * 0.04;

    // Create a graphics object to draw a rounded rectangle with orange fill
    const inputBgGraphics = scene.add.graphics();
    inputBgGraphics.fillStyle(0xD3D3D3, 1); // Orange color with full opacity
    inputBgGraphics.fillRoundedRect(x - inputBgWidth / 2, game.scale.height * 0.65 - inputBgHeight / 2, inputBgWidth, inputBgHeight, 20);

    // Create the time bar (thin rectangle with rounded edges)
    timeBar = scene.add.graphics();
    const timeBarHeight = 14; // Height of the time bar
    const initialBarWidth = game.scale.width; // Initial width of the time bar
    timeBar.fillStyle(0xff0000, 1); // Red color
    timeBar.fillRoundedRect(0, game.scale.height * 0.25, initialBarWidth, timeBarHeight, 5); // Draw the initial time bar

    // Display current input text
    inputDisplay = scene.add.text(x, game.scale.height * 0.65, currentInputText, {
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
        wordWrap: { width: inputBgWidth - 20 }
    }).setOrigin(0.5);

    // Create keyboard buttons only for mobile devices
    if (isMobile()) {
        createKeyboard(scene);
    }

    feedbackText = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.59, '', {
        fontSize: game.scale.width * 0.035 + 'px',
        color: '#000000',
        fontFamily: 'Arial',
    }).setOrigin(0.5);

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
}

function createKeyboard(scene) {
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
        ['✓', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←', '']
    ];

    const keyboardContainer = scene.add.container(0, 0); // Initialize the container

    const keyboardWidth = game.scale.width; // Full width of the game screen
    const keyboardHeight = game.scale.height * 0.26; // Adjusted height for the keyboard

    const rowHeight = keyboardHeight / 3;
    const keyWidthRatio = 0.9; // Keys will be taller than wide (60% of height)

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
                button.fillStyle(0x00FF00, 1); // Green color for the Enter key
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

function hideGameElements() {
    tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
    feedbackText.setVisible(false);
    scoreText.setVisible(false);
    timerText.setVisible(false);
    roundText.setVisible(false);
    correctGuessTexts.forEach(text => text.setVisible(false));
}

function showGameElements() {
    tiles.forEach(tileObj => {
        tileObj.tile.setVisible(true);
        tileObj.text.setVisible(true);
    });
    feedbackText.setVisible(true);
    scoreText.setVisible(true);
    timerText.setVisible(true);
    roundText.setVisible(true);
    correctGuessTexts.forEach(text => text.setVisible(true));
}

// Update the startGame function to reset the round number
function startGame(scene) {
    // Reset game state
    currentRound = 0;
    score = 0;
    updateScoreDisplay();
    correctGuessTexts.forEach(text => text.destroy()); // Clear any previous correct guess texts
    correctGuessTexts = [];
    
    // Hide tiles and game elements before starting the countdown
    hideTiles(); // Ensure tiles are hidden before setting up a new game

    // Reset the timer and time bar for the game
    resetTimerAndBar(scene);

    // Update the round text to show the first round
    roundText.setText(`Round: 1`);

    // Call the countdown function to display the countdown
    showCountdown(scene);
}




function checkGuess(scene, guess) {
    let topics = allRounds[currentRound];
    let matchedTopic = topics.find(topic => topic.name.toLowerCase() === guess.toLowerCase());
    
    if (matchedTopic) {
        highlightTiles(scene, matchedTopic.words);
        
        let correctText = scene.add.text(game.scale.width * (0.29 + correctGuessTexts.length * 0.20), game.scale.height * 0.55, matchedTopic.name, { 
            fontSize: game.scale.width * 0.04 + 'px',
            color: '#013220',
            fontFamily: 'Arial',
        }).setOrigin(0.5);
        correctGuessTexts.push(correctText);

        score += 30;
        updateScoreDisplay();
        
        if (correctGuessTexts.length === 3) {
            updateFeedbackText('Round completed!');
            scene.time.delayedCall(1500, () => {
                handleRoundEnd(scene);
            });
        } else {
            updateFeedbackText('Correct! Keep guessing the remaining topics.');
        }
    } else {
        updateFeedbackText('Incorrect guess. Try again!');
    }
}

function highlightTiles(scene, words) {
    tiles.forEach(tile => {
        if (words.includes(tile.word)) {
            tile.tile.setTint(0x00ff00);
        }
    });
}

function updateFeedbackText(message) {
    feedbackText.setText(message);
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
    updateFeedbackText("Time's up!");
    scene.time.delayedCall(1500, () => {
        endGame(scene);
    }, [], scene);
}

// Update handleRoundEnd to use the new timing mechanism
function handleRoundEnd(scene) {
    clearTimerEvent();
    
    let timeRemaining = remainingTime; // Use the remainingTime directly
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
}

function showInterRoundScreen(scene) {
    interRoundScreen.setVisible(true);
    hideGameElements();
}

function hideInterRoundScreen() {
    interRoundScreen.setVisible(false);
    showGameElements();
}

// Update the startNextRound function to set the correct round number before the countdown
function startNextRound(scene) {
    if (currentRound < allRounds.length - 1) {
        currentRound++;
        hideInterRoundScreen(); // Hide the inter-round screen first
        hideTiles();            // Hide only the tiles
        clearTimerEvent();      // Clear any previous timer events

        // Clear feedback text and correct guess texts before showing countdown
        updateFeedbackText(''); // Clear the feedback text
        correctGuessTexts.forEach(text => text.destroy()); // Clear correct guess texts
        correctGuessTexts = []; // Reset the array

        // Update the round text before starting the countdown
        roundText.setText(`Round: ${currentRound + 1}`);

        showCountdown(scene);   // Show countdown before the next round starts
    } else {
        endGame(scene);
    }
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


function endGame(scene) {
    interRoundScoreText.setText(`Game Over!\nFinal Score: ${score}`);

    okButton.setText('Restart');

    okButton.removeAllListeners('pointerdown');
    okButton.on('pointerdown', () => {
        hideInterRoundScreen(); // Hide the inter-round screen first

        // Clear feedback text and correct guess texts before restarting
        updateFeedbackText(''); // Clear the feedback text
        correctGuessTexts.forEach(text => text.destroy()); // Clear correct guess texts
        correctGuessTexts = []; // Reset the array

        startGame(scene); // Start a new game
    });

    showInterRoundScreen(scene);
}



function startRound(scene) {
    hideTiles(); // Ensure tiles are hidden before setting up a new round
    clearTimerEvent(); // Clear any existing timer events
    tiles.forEach(tileObj => {
        tileObj.tile.destroy();
        tileObj.text.destroy();
    });
    tiles = [];

    correctGuessTexts.forEach(text => text.destroy());
    correctGuessTexts = [];

    let topics = allRounds[currentRound];

    roundText.setText(`Round: ${currentRound + 1}`);

    remainingTime = TIMER_DURATION; // Reset remaining time for the timer
    timerText.setText(`Time: ${remainingTime}`); // Reset displayed timer
    startTimer(scene); // Start the game timer

    let allWords = topics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    const cols = 3;
    const rows = 4;

    const tileWidth = Math.floor(game.scale.width * 0.35);
    const tileHeight = tileWidth * 0.4;
    const startY = game.scale.height * 0.25;
    const startX = (game.scale.width - (cols * tileWidth)) / 2;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = startX + i * tileWidth + tileWidth / 2;
            const y = startY + j * tileHeight;

            let tile = scene.add.image(x, y, 'tile');
            tile.setScale(tileWidth / tile.width, tileHeight / tile.height);
            tile.setTint(0x0000ff);

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
    updateFeedbackText('');
    showGameElements(); // Ensure game elements are shown (including tiles)
}

