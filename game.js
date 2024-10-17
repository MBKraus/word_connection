const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 700,
    scene: {
        preload: preload,
        create: create
    },
    dom: {
        createContainer: true
    },
    parent: 'game-container'
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
let guessedTopics = [];
let guessedTopicsText;
let feedbackText;
let scoreText;
let score = 0;
let currentRound = 0;
let roundText;  // Variable to hold round number text

function preload() {
    this.load.image('tile', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/128x128-v2.png');
    this.load.html('inputForm', 'inputForm.html');
}

function create() {
    this.add.text(400, 30, 'Ouwe\'s slimste noffel game', { fontSize: '32px' }).setOrigin(0.5);

    // Add round text display
    roundText = this.add.text(400, 70, `Round: ${currentRound + 1}`, { fontSize: '28px', color: '#ffffff' }).setOrigin(0.5);

    // Add input form
    let inputForm = this.add.dom(400, 550).createFromCache('inputForm');
    inputForm.addListener('click');
    
    inputForm.on('click', function (event) {
        if (event.target.name === 'guessButton') {
            let inputElement = this.getChildByName('guessInput');
            let guess = inputElement.value.trim().toLowerCase();
            checkGuess(this.scene, guess);
            inputElement.value = '';
        }
    });

    // Add text for displaying guessed topics
    guessedTopicsText = this.add.text(400, 650, 'Guessed Topics: ', { fontSize: '24px' }).setOrigin(0.5);

    // Add text for feedback
    feedbackText = this.add.text(400, 600, '', { fontSize: '20px' }).setOrigin(0.5);

    // Add text for score
    scoreText = this.add.text(50, 650, 'Score: 0', { fontSize: '24px' });

    startRound(this);
}

function startRound(scene) {
    // Clear previous guessed topics and tiles
    guessedTopics = [];
    tiles.forEach(tileObj => tileObj.tile.destroy());
    tiles = [];

    let topics = allRounds[currentRound];  // Get topics for the current round

    // Update round text display
    roundText.setText(`Round: ${currentRound + 1}`);

    // Create shuffled array of all words
    let allWords = topics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    // Create tiles for the round
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            let tile = scene.add.image(200 + i * 150, 150 + j * 150, 'tile');
            tile.setScale(1.1);
            tile.setTint(0x0000ff);  // Set initial tile color to blue
            let word = allWords[i * 3 + j];
            let text = scene.add.text(tile.x, tile.y, word, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
            tiles.push({ tile, text, word });
        }
    }
    
    updateGuessedTopicsDisplay(scene);
    updateFeedbackText('');
}

function checkGuess(scene, guess) {
    let topics = allRounds[currentRound];
    let matchedTopic = topics.find(topic => topic.name.toLowerCase() === guess);
    
    if (matchedTopic && !guessedTopics.includes(matchedTopic.name)) {
        guessedTopics.push(matchedTopic.name);
        highlightTiles(scene, matchedTopic.words);
        updateGuessedTopicsDisplay(scene);
        
        // Increase score and update score display
        score += 30;
        updateScoreDisplay();
        
        if (guessedTopics.length === topics.length) {
            if (currentRound < allRounds.length - 1) {
                currentRound++;
                updateFeedbackText('Round completed! Starting next round...');
                scene.time.delayedCall(2000, () => startRound(scene), [], scene);
            } else {
                updateFeedbackText('Congratulations! You guessed all topics in all rounds!');
            }
        } else {
            updateFeedbackText(`Correct! ${topics.length - guessedTopics.length} topics left.`);
        }
    } else {
        updateFeedbackText('Incorrect guess. Try again!');
    }
}

function highlightTiles(scene, words) {
    tiles.forEach(tile => {
        if (words.includes(tile.word)) {
            tile.tile.setTint(0x00ff00);  // Set tile color to green when guessed correctly
        }
    });
}

function updateGuessedTopicsDisplay(scene) {
    guessedTopicsText.setText('Guessed Topics: ' + guessedTopics.join(', '));
}

function updateFeedbackText(message) {
    feedbackText.setText(message);
}

function updateScoreDisplay() {
    scoreText.setText(`Score: ${score}`);
}
