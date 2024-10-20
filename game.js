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
    createStartScreen(this);
    createGameElements(this);
    createInterRoundScreen(this);
    
    showStartScreen();

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



function createStartScreen(scene) {
    startScreen = scene.add.container(0, 0);
    startScreen.setDepth(1000);

    let bg = scene.add.rectangle(0, 0, game.scale.width, game.scale.height, 0x000000);
    bg.setOrigin(0);
    startScreen.add(bg);

    let titleText = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.4, 'Connect', {
        fontSize: game.scale.width * 0.08 + 'px',
        color: '#ffffff'
    }).setOrigin(0.5);
    startScreen.add(titleText);

    startButton = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.6, 'Start Game', {
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

    startButton.on('pointerdown', () => {
        hideStartScreen();
        startGame(scene);
    });

    startScreen.add(startButton);
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

    roundText = scene.add.text(x, game.scale.height * 0.1, `Round: ${currentRound + 1}`, { 
        fontSize: game.scale.width * 0.04 + 'px', 
        color: '#000000',
        fontFamily: 'Arial', 
    }).setOrigin(0.5);

    // Fixed width for input background and rounded corners using Phaser Graphics
    const inputBgWidth = game.scale.width * 0.6;
    const inputBgHeight = game.scale.height * 0.04;

    // Create a graphics object to draw a rounded rectangle with orange fill
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffa500, 1); // Orange color with full opacity
    graphics.fillRoundedRect(x - inputBgWidth / 2, game.scale.height * 0.60 - inputBgHeight / 2, inputBgWidth, inputBgHeight, 20);

    // Display current input text
    inputDisplay = scene.add.text(x, game.scale.height * 0.60, currentInputText, { 
        fontSize: game.scale.width * 0.04 + 'px', 
        color: '#000000', 
        fontFamily: 'Arial',
        wordWrap: { width: inputBgWidth - 20 }
    }).setOrigin(0.5);

    // Create keyboard buttons only for mobile devices
    if (isMobile()) {
        createKeyboard(scene);
    }

    feedbackText = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.47, '', { 
        fontSize: game.scale.width * 0.035 + 'px',
        color: '#000000',
        fontFamily: 'Arial', 
    }).setOrigin(0.5);

    scoreText = scene.add.text(game.scale.width * 0.85, game.scale.height * 0.51, 'Score: 0', { 
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000', 
        fontFamily: 'Arial', 
    }).setOrigin(0.5);

    timerText = scene.add.text(game.scale.width * 0.15, game.scale.height * 0.51, `Time: ${TIMER_DURATION}`, { 
        fontSize: game.scale.width * 0.04 + 'px', 
        color: '#000000',
        fontFamily: 'Arial', 
    }).setOrigin(0.5);
}

function createKeyboard(scene) {
    const keys = [
        'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
        'Z', 'X', 'C', 'V', 'B', 'N', 'M'
    ];
  
    const keyboardContainer = scene.add.container(0, game.scale.height * 0.65);
    
    const keySize = game.scale.width * 0.09;
    const keySpacing = game.scale.width * 0.01;
    const rowSpacing = game.scale.height * 0.02;

    keys.forEach((key, index) => {
        const row = Math.floor(index / 10);
        const col = index % 10;
        const x = (col * (keySize + keySpacing)) + (game.scale.width * 0.05) + (row === 2 ? keySize / 2 : 0);
        const y = (row * (keySize + rowSpacing)) + (game.scale.height * 0.05);

        const button = scene.add.graphics();
        button.fillStyle(0x4a4a4a, 1);
        button.fillRoundedRect(0, 0, keySize, keySize, 10);

        const keyText = scene.add.text(keySize / 2, keySize / 2, key, {
            fontSize: `${Math.max(24, game.scale.width * 0.035)}px`,
            color: '#FFFFFF',
        }).setOrigin(0.5);

        const keyButton = scene.add.container(x, y, [button, keyText]);
        keyButton.setSize(keySize, keySize);
        keyButton.setInteractive();

        keyButton.on('pointerdown', () => {
            currentInputText += key;
            inputDisplay.setText(currentInputText);
        });

        keyboardContainer.add(keyButton);
    });

    // Adjust the Enter button
    const enterButton = createButton(scene, 'Enter', game.scale.width * 0.78, game.scale.height * 0.28, () => {
        if (currentInputText) {
            checkGuess(scene, currentInputText.trim().toLowerCase());
            currentInputText = '';
            inputDisplay.setText(currentInputText);
        }
    });
    keyboardContainer.add(enterButton);

    // Adjust the Backspace button
    const backspaceButton = createButton(scene, 'Back', game.scale.width * 0.92, game.scale.height * 0.28, () => {
        currentInputText = currentInputText.slice(0, -1);
        inputDisplay.setText(currentInputText);
    });
    keyboardContainer.add(backspaceButton);
}

function createButton(scene, text, x, y, callback) {
    const button = scene.add.graphics();
    button.fillStyle(0x4a4a4a, 1);
    button.fillRoundedRect(0, 0, game.scale.width * 0.13, game.scale.height * 0.07, 10);

    const buttonText = scene.add.text(game.scale.width * 0.065, game.scale.height * 0.035, text, {
        fontSize: `${Math.max(20, game.scale.width * 0.03)}px`,
        color: '#FFFFFF',
    }).setOrigin(0.5);

    const container = scene.add.container(x, y, [button, buttonText]);
    container.setSize(game.scale.width * 0.13, game.scale.height * 0.07);
    container.setInteractive();
    container.on('pointerdown', callback);

    return container;
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

function showStartScreen() {
    startScreen.setVisible(true);
    hideGameElements();
}

function hideStartScreen() {
    startScreen.setVisible(false);
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

function startGame(scene) {
    currentRound = 0;
    score = 0;
    updateScoreDisplay();
    startRound(scene);
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
    let remainingTime = TIMER_DURATION;
    timerText.setText(`Time: ${remainingTime}`);

    timerEvent = scene.time.addEvent({
        delay: 1000,
        callback: function() {
            remainingTime--;
            timerText.setText(`Time: ${remainingTime}`);

            if (remainingTime <= 0) {
                timerEvent.remove();
                handleTimeUp(scene);
            }
        },
        callbackScope: scene,
        repeat: TIMER_DURATION - 1
    });
}

function handleTimeUp(scene) {
    updateFeedbackText("Time's up!");
    scene.time.delayedCall(1500, () => {
        endGame(scene);
    }, [], scene);
}

function handleRoundEnd(scene) {
    if (timerEvent && timerEvent.getRemaining() > 0) {
        timerEvent.remove();
    }
    
    interRoundScoreText.setText(`Round Completed!\nScore: ${score}`);
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

function startNextRound(scene) {
    if (currentRound < allRounds.length - 1) {
        currentRound++;
        startRound(scene);
    } else {
        endGame(scene);
    }
}

function endGame(scene) {
    interRoundScoreText.setText(`Game Over!\nFinal Score: ${score}`);
    
    okButton.setText('Restart');
    
    okButton.removeAllListeners('pointerdown');
    okButton.on('pointerdown', () => {
        hideInterRoundScreen();
        startGame(scene);
    });

    showInterRoundScreen(scene);
}

function startRound(scene) {
    tiles.forEach(tileObj => {
        tileObj.tile.destroy();
        tileObj.text.destroy();
    });
    tiles = [];

    correctGuessTexts.forEach(text => text.destroy());
    correctGuessTexts = [];

    let topics = allRounds[currentRound];

    roundText.setText(`Round: ${currentRound + 1}`);

    startTimer(scene);

    let allWords = topics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    const cols = 3;
    const rows = 4;

    const tileWidth = Math.floor(game.scale.width * 0.35);
    const tileHeight = tileWidth * 0.4;
    const startY = game.scale.height * 0.17;
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
    showGameElements();
}
