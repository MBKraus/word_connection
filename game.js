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
        {name: 'Fruits', words: ['Apple', 'Banana', 'Cherry', 'Date']},
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
let inputForms = [];
let feedbackText;
let scoreText;
let score = 0;
let currentRound = 0;
let roundText;
let timerText;
let timerEvent;
const TIMER_DURATION = 30;

function preload() {
    this.load.image('tile', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/128x128.png');
    this.load.html('inputForm', 'inputForm.html');
}

function create() {
    const x = game.scale.width * 0.5;
  
    this.add.text(x, game.scale.height * 0.05, 'Connect', { 
        fontSize: game.scale.width * 0.10 + 'px',
        color: '#000000'
     }).setOrigin(0.5);

    roundText = this.add.text(x, game.scale.height * 0.1, `Round: ${currentRound + 1}`, { 
        fontSize: game.scale.width * 0.05 + 'px', 
        color: '#000000' }).setOrigin(0.5);

    // Create three input forms
    for (let i = 0; i < 3; i++) {
        let inputForm = this.add.dom(game.scale.width * 0.3, game.scale.height * (0.8 + i * 0.05)).createFromCache('inputForm');
        inputForm.getChildByName('guessInput').style.width = game.scale.width * 0.40 + 'px';
        inputForm.getChildByName('guessButton').style.width = game.scale.width * 0.15 + 'px';
        inputForm.getChildByName('guessInput').style.fontSize = game.scale.width * 0.04 + 'px'; 
        inputForm.getChildByName('guessButton').style.fontSize = game.scale.width * 0.04 + 'px';

        inputForm.addListener('click');
        inputForm.on('click', function (event) {
            if (event.target.name === 'guessButton') {
                let inputElement = this.getChildByName('guessInput');
                let guess = inputElement.value.trim().toLowerCase();
                checkGuess(this.scene, guess, i);
                inputElement.value = '';
            }
        });
        inputForms.push(inputForm);
    }

    feedbackText = this.add.text(game.scale.width * 0.5, game.scale.height * 0.70, '', { 
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
    }).setOrigin(0.5);

    scoreText = this.add.text(game.scale.width * 0.85, game.scale.height * 0.75, 'Score: 0', { 
        fontSize: game.scale.width * 0.05 + 'px',
        color: '#000000', 
    }).setOrigin(0.5);

    timerText = this.add.text(game.scale.width * 0.15, game.scale.height * 0.75, `Time: ${TIMER_DURATION}`, { 
        fontSize: game.scale.width * 0.05 + 'px', 
        color: '#000000' 
    }).setOrigin(0.5);

    // Create an array to hold the correct guess texts
    this.correctGuessTexts = [];

    startRound(this);
}

function startRound(scene) {
    // Clear previous tiles
    tiles.forEach(tileObj => tileObj.tile.destroy());
    tiles = [];

    // Clear previous correct guess texts
    scene.correctGuessTexts.forEach(text => text.destroy());
    scene.correctGuessTexts = [];

    let topics = allRounds[currentRound];

    roundText.setText(`Round: ${currentRound + 1}`);

    // Stop the previous timer if it exists
    if (timerEvent) {
        timerEvent.remove();
    }

    // Reset and start the timer
    startTimer(scene);

    let allWords = topics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    const cols = 3;
    const rows = 4;
    
    const tileSize = Math.floor(game.scale.height * 0.14);
    const tileSpacing = Math.floor(game.scale.width * 0.25);
    const startY = game.scale.height * 0.20;
    const totalWidth = (cols - 1) * tileSpacing + tileSize;
    const startX = (game.scale.width - totalWidth) / 2;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const x = startX + i * tileSpacing + tileSize / 2;
            const y = startY + j * tileSpacing;

            let tile = scene.add.image(x, y, 'tile');
            tile.setScale(tileSize / tile.width);
            tile.setTint(0x0000ff);

            let word = allWords[i + j * cols];
            let text = scene.add.text(x, y, word, { fontSize: `${Math.max(16, Math.floor(tileSize * 0.2))}px`, color: '#ffffff' })
                .setOrigin(0.5);

            tiles.push({ tile, text, word });
        }
    }
    
    // Reset input forms
    inputForms.forEach(form => {
        form.setVisible(true);
        form.getChildByName('guessInput').value = '';
    });

    updateFeedbackText('');
}

function checkGuess(scene, guess, formIndex) {
    let topics = allRounds[currentRound];
    let matchedTopic = topics.find(topic => topic.name.toLowerCase() === guess.toLowerCase());
    
    if (matchedTopic) {
        highlightTiles(scene, matchedTopic.words);
        
        // Hide input form and show correct answer
        inputForms[formIndex].setVisible(false);
        let correctText = scene.add.text(game.scale.width * 0.5, game.scale.height * (0.8 + formIndex * 0.05), matchedTopic.name, { 
            fontSize: game.scale.width * 0.04 + 'px',
            color: '#00ff00'
        }).setOrigin(0.5);
        scene.correctGuessTexts.push(correctText);

        // Increase score and update score display
        score += 30;
        updateScoreDisplay();
        
        if (inputForms.every(form => !form.visible)) {
            if (currentRound < allRounds.length - 1) {
                currentRound++;
                updateFeedbackText('Round completed! Starting next round...');
                scene.time.delayedCall(2000, () => startRound(scene), [], scene);
            } else {
                updateFeedbackText('Congratulations! You guessed all topics in all rounds!');
                if (timerEvent) {
                    timerEvent.remove();
                }
            }
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
                this.remove();
                handleTimeUp(scene);
            }
        },
        callbackScope: scene,
        repeat: TIMER_DURATION
    });
}

function handleTimeUp(scene) {
    updateFeedbackText("Time's up! Round Over!");
    inputForms.forEach(form => form.setVisible(false));
    
    if (currentRound < allRounds.length - 1) {
        currentRound++;
        scene.time.delayedCall(2000, () => startRound(scene), [], scene);
    } else {
        updateFeedbackText("Game Over! All rounds completed.");
        // You might want to add logic here to show final score or restart the game
    }
}