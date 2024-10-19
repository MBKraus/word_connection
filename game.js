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
        {name: 'Fruits', words: ['Apple', 'Banana', 'Cherry', 'Berry']},
        {name: 'Animals', words: ['Dog', 'Elephant', 'Frog', 'Giraffe']},
        {name: 'Countries', words: ['Brazil', 'Canada', 'Denmark', 'Egypt']}
    ],
    [
        {name: 'Colors', words: ['Red', 'Green', 'Blue', 'Yellow']},
        {name: 'Vehicles', words: ['Car', 'Bike', 'Train', 'Bus']},
        {name: 'Sports', words: ['Football', 'Basketball', 'Tennis', 'Cricket']}
    ]
];

let tiles = [];
let inputForm;
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

function preload() {
    this.load.image('tile', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/128x128.png');
    this.load.html('inputForm', 'inputForm.html');
    this.load.image('bulb', 'https://mbkraus.github.io/word_connection/assets/bulb.png');
    this.load.image('person', 'https://mbkraus.github.io/word_connection/assets/person.png');
    this.load.image('question', 'https://mbkraus.github.io/word_connection/assets/question.png');
}

function create() {
    createStartScreen(this);
    createGameElements(this);
    createInterRoundScreen(this);
    
    // Initially show only the start screen
    showStartScreen();
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

    const bulbIcon = scene.add.image(game.scale.width * 0.75, game.scale.height * 0.035, 'bulb').setScale(0.15);
    const personIcon = scene.add.image(game.scale.width * 0.83, game.scale.height * 0.038, 'person').setScale(0.12);
    const questionIcon = scene.add.image(game.scale.width * 0.18, game.scale.height * 0.038, 'question').setScale(0.12);
  

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

    // Create a single input form
    inputForm = scene.add.dom(game.scale.width * 0.27, game.scale.height * 0.55).createFromCache('inputForm');
    inputForm.getChildByName('guessInput').style.width = game.scale.width * 0.60 + 'px';
    inputForm.getChildByName('guessInput').style.fontSize = game.scale.width * 0.04 + 'px'; 

    const inputElement = inputForm.getChildByName('guessInput');
    
    inputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default action (like form submission)
            let guess = this.value.trim().toLowerCase();
            checkGuess(scene, guess);
            this.value = ''; // Clear the input field after guessing
        }
    });

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
        // Move to next round when the button is clicked
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
    inputForm.setVisible(false);
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
    inputForm.setVisible(true);
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
        
        // Show correct answer above the input form
        let correctText = scene.add.text(game.scale.width * (0.29 + correctGuessTexts.length * 0.20), game.scale.height * 0.6, matchedTopic.name, { 
            fontSize: game.scale.width * 0.04 + 'px',
            color: '#013220',
            fontFamily: 'Arial',
        }).setOrigin(0.5);
        correctGuessTexts.push(correctText);

        // Increase score and update score display
        score += 30;
        updateScoreDisplay();
        
        // Check if all topics have been guessed
        if (correctGuessTexts.length === 3) {
            updateFeedbackText('Round completed!'); // Inform the player
            
            // Delay before calling handleRoundEnd
            scene.time.delayedCall(1500, () => {
                handleRoundEnd(scene); // Call handleRoundEnd after 1 second
            });
        } else {
            updateFeedbackText('Correct! Keep guessing the remaining topics.');
        }
    } else {
        updateFeedbackText('Incorrect guess. Your guess is wrong. Try again!');
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
    inputForm.setVisible(false);
    scene.time.delayedCall(1500, () => {
        endGame(scene); // Show game over screen directly
    }, [], scene);
}

function handleRoundEnd(scene) {
    if (timerEvent && timerEvent.getRemaining() > 0) {
        timerEvent.remove();
    }
    
    interRoundScoreText.setText(`Round Completed!\nScore: ${score}`);
    showInterRoundScreen(scene);
    
    // Remove automatic next round call and show next round button
    okButton.setText('Next Round'); // Change button text
    okButton.removeAllListeners('pointerdown'); // Clear existing listeners
    okButton.on('pointerdown', () => {
        hideInterRoundScreen();
        startNextRound(scene); // Start the next round when button is clicked
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
    // Do not reset the score here
    interRoundScoreText.setText(`Game Over!\nFinal Score: ${score}`); // Show the actual score
    
    okButton.setText('Restart');
    
    okButton.removeAllListeners('pointerdown');
    okButton.on('pointerdown', () => {
        hideInterRoundScreen();
        startGame(scene); // Restart the game
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

    const tileWidth = Math.floor(game.scale.width * 0.35); // Set tile width
    const tileHeight = tileWidth * 0.4; // Set tile height to be 40% of the width
    const startY = game.scale.height * 0.17; // Start Y position for tiles
    const startX = (game.scale.width - (cols * tileWidth)) / 2; // Centering the tiles horizontally

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = startX + i * tileWidth + tileWidth / 2; // Adjusted for half the width
            const y = startY + j * tileHeight; // No vertical spacing

            let tile = scene.add.image(x, y, 'tile');
            tile.setScale(tileWidth / tile.width, tileHeight / tile.height); // Scale the tile based on width and height
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
    
    inputForm.setVisible(true);
    inputForm.getChildByName('guessInput').value = '';

    updateFeedbackText('');
    showGameElements();
}

