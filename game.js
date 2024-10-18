// # https://phaser.discourse.group/t/responsive-game-size-in-mobile-browser/12088/16

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
let guessedTopics = [];
let guessedTopicsText;
let feedbackText;
let scoreText;
let score = 0;
let currentRound = 0;
let roundText;  // Variable to hold round number text
let timerText; // Variable to hold the timer text
let timerEvent; // Variable to manage the timer
const TIMER_DURATION = 30; // Duration for each round in seconds

function preload() {
    this.load.image('tile', 'https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/128x128.png');
    this.load.html('inputForm', 'inputForm.html');
}

function create() {

    const x = game.scale.width * 0.5; // Center horizontally (50% of the width)
  
    this.add.text(x, game.scale.height * 0.05, 'Connect', { 
        fontSize: game.scale.width * 0.10 + 'px',
        color: '#000000'
     }).setOrigin(0.5);

    // Add round text display
    roundText = this.add.text(x, game.scale.height * 0.1, `Round: ${currentRound + 1}`, { 
        fontSize: game.scale.width * 0.05 + 'px', 
        color: '#000000' }).setOrigin(0.5);

    // Add input form
    let inputForm = this.add.dom(game.scale.width * 0.25, game.scale.height * 0.9).createFromCache('inputForm');
    // Set the width of the form programmatically
    inputForm.getChildByName('guessInput').style.width = game.scale.width * 0.50 + 'px'; // Set the input field width
    inputForm.getChildByName('guessButton').style.width = game.scale.width * 0.20 + 'px'; // Set the button width (optional)
    
    inputForm.getChildByName('guessInput').style.fontSize = game.scale.width * 0.05 + 'px'; 
    inputForm.getChildByName('guessButton').style.fontSize = game.scale.width * 0.05 + 'px';

    // Set the form width itself if needed
    // inputForm.node.style.width = '300px'; // Set the width of the entire form container
    
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
    guessedTopicsText = this.add.text(game.scale.width * 0.5, game.scale.height * 0.8, 'Guessed Topics: ', { 
        fontSize: game.scale.width * 0.05 + 'px',
        color: '#000000',
    }).setOrigin(0.5);

    // Add text for feedback
    feedbackText = this.add.text(game.scale.width * 0.5, game.scale.height * 0.70, '', { 
        fontSize: game.scale.width * 0.04 + 'px',
        color: '#000000',
    }).setOrigin(0.5);

    // Add text for score
    scoreText = this.add.text(game.scale.width * 0.85, game.scale.height * 0.75, 'Score: 0', { 
        fontSize: game.scale.width * 0.05 + 'px',
        color: '#000000', 
    }).setOrigin(0.5);

    // Add text for timer

    timerText = this.add.text(game.scale.width * 0.15, game.scale.height * 0.75, `Time: ${TIMER_DURATION}`, { 
        fontSize: game.scale.width * 0.05 + 'px', 
        color: '#000000' 
    }).setOrigin(0.5);

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

    // Reset timer
    timerText.setText(`Time: ${TIMER_DURATION}`);
    startTimer(scene);

    // Create shuffled array of all words
    let allWords = topics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    const cols = 3;
    const rows = 4;
    
    // Calculate tile size and spacing relative to screen height
    const tileSize = Math.floor(game.scale.height * 0.12); // Tile size (15% of the screen height)
    const tileSpacing = Math.floor(game.scale.width * 0.25); // Tile spacing (5% of the screen width)

    // Calculate starting Y position (25% of the screen height)
    const startY = game.scale.height * 0.20;

    // Calculate the total width of the tile grid
    const totalWidth = (cols - 1) * tileSpacing + tileSize; // Total width of all tiles and spacing

    // Calculate starting X position to center the grid
    const startX = (game.scale.width - totalWidth) / 2;

    // Adjust the loop to create tiles
    for (let i = 0; i < cols; i++) { // 3 columns
        for (let j = 0; j < rows; j++) { // 4 rows
            // Calculate the x and y positions for each tile
            const x = startX + i * tileSpacing + tileSize / 2; // Centering the tiles horizontally
            const y = startY + j * tileSpacing;

            // Create the tile image
            let tile = scene.add.image(x, y, 'tile'); // Use calculated x and y positions
            tile.setScale(tileSize / tile.width); // Scale tile based on the calculated size

            // Set initial tile color to blue
            tile.setTint(0x0000ff);

            // Get the word from allWords array
            let word = allWords[i + j * cols]; // Adjust indexing for the new grid
            let text = scene.add.text(x, y, word, { fontSize: `${Math.max(16, Math.floor(tileSize * 0.2))}px`, color: '#ffffff' })
                .setOrigin(0.5); // Center the text

            // Push tile and text to the tiles array
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


function startTimer(scene) {
    let remainingTime = TIMER_DURATION; // Set the initial remaining time
    timerEvent = scene.time.addEvent({
        delay: 1000, // Call every second
        callback: function() {
            remainingTime--;
            timerText.setText(`Time: ${remainingTime}`);

            if (remainingTime <= 0) {
                // Time is up; handle the end of the round
                this.remove(); // Stop the timer
                updateFeedbackText("Game Over!"); // Update the feedback text immediately
            }
        },
        callbackScope: scene,
        repeat: TIMER_DURATION - 1 // Repeat for the duration of the timer
    });
}