import { generateGameRounds} from './topics.js';
import { createHeader, createInputDisplay, createRoundDisplay, createCheckmark, createGiveUpButton,
    createScoreDisplay, createTimerDisplay, createHeaderIcons, createCrossIcon, createCorrectGuessContainer, updateScoreDisplay, initializeCorrectGuessPlaceholders} from './uiComponents.js';
import { isMobile } from './utils.js';
import { createCompleteScreen, showCompleteScreen, hideCompleteScreen } from './screens/complete.js';
import {createFailureEndScreen, showFailureEndScreen } from './screens/failureEnd.js';
import { createWelcomeScreen, showWelcomeScreen } from './screens/welcome.js';
import { setupKeyboardInput, createKeyboard } from './keyboard.js';
import { createCountdown, showCountdown} from './countdown.js';
import { resetTimerAndBar, clearTimerEvent, startTimer} from './timer.js';
import { highlightTiles, hideTiles, getTileConfig, createTiles} from './tiles.js';
import {createDailyLimitScreen} from './screens/dailyLimit.js';
import { isFuzzyMatchSimple, calculateRoundPoints, createNextGameTimer, getNextPlayTime } from './utils.js';
import { GameStorage } from './gameStorage.js';
import { writeGameStats, updateUserProfile } from './gameStorage.js';
import {handleAuthStateChange} from './auth.js';
import { getFirebaseApp } from './firebaseInit.js';
import { 
    getAuth, 
    onAuthStateChanged,
    GoogleAuthProvider,
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

Promise.all([
    document.fonts.load('16px "Poppins"'),        // Default Poppins (Regular)
    document.fonts.load('16px "Poppins Light"', '300'), // Poppins Light (Weight 300)
]).then(function() {
const config = {
    type: Phaser.AUTO,
    scene: {
        preload: preload,
        create: create,
    },
    dom: {
        createContainer: true
    },
    // backgroundColor: '#FFFFFF',
    transparent: true,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,  
        width: 1080,
        height: 1920,
        // parent: 'game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

function preload() {

    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block'; 

    this.load.on('complete', function () {
        loadingSpinner.style.display = 'none'; 
    });

    this.load.text('data', './content/data.txt');
    this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
    this.load.image('question', './assets/question.png');
    this.load.image('cross', './assets/wrong.png');
    this.load.audio('correctSound', './assets/audio/correct.mp3');
    this.load.audio('incorrectSound', './assets/audio/wrong.mp3');
    this.load.audio('countdownSound', './assets/audio/countdown.mp3');
}

window.startGame = startGame;
window.checkGuess = checkGuess;
window.hideGameElements = (scene) => setElementsVisibility(scene, false);
window.showGameElements = (scene) => setElementsVisibility(scene, true);
window.startRound = startRound;
window.startNextRound = startNextRound;
window.endGame = endGame;
window.handleRoundEndNotAllTopicsGuessed = handleRoundEndNotAllTopicsGuessed;


async function create() {

    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';
    document.body.style.backgroundColor = '#ffffff'; // Set background to white

    this.currentRound = 0;
    this.tiles = [];
    this.score = 0;
    this.timerDuration = 60;
    this.timerText = null;
    this.timerEvent = null;
    this.currentInputText = ''; 
    this.updateInterval = 100;
    this.gameStartTime = null;
    this.isGameActive = true;
    this.countdownAudioInRoundPlayed = false;
    const NUMBER_OF_ROUNDS = 2;
    const TOPICS_PER_ROUND = 3;

    const app = await getFirebaseApp();
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();

    window.auth = auth; 
    window.googleProvider = googleProvider;
    window.scene = this;

    // Wait for AuthStateChange and fetch user and hasPlayedPerDB
    const { user, hasPlayedPerDB } = await new Promise((resolve) => {
        onAuthStateChanged(window.auth, async (user) => {
            const hasPlayedPerDB = await handleAuthStateChange(user);
            resolve({ user, hasPlayedPerDB }); 
        });
    });

    this.dailyLimitControls = createDailyLimitScreen(this, user);

  

    if (hasPlayedPerDB) {
        this.dailyLimitControls.show();
        loadingSpinner.style.display = 'none';
    } else if (GameStorage.hasPlayedTodayCookie()) {
        scene.dailyLimitStatsButton.buttonText.setText('Create a free account')
        scene.dailyLimitSubTitle.setText("Great job on today's puzzle!\nCome back tomorrow for a new challenge!\n\nWant to start tracking your stats?",)
        this.dailyLimitControls.show();
        loadingSpinner.style.display = 'none';
    } else {
        createWelcomeScreen(this);
        showWelcomeScreen(this, 'welcomeScreen');
        loadingSpinner.style.display = 'none';
    }

    const encodedData = this.cache.text.get('data');
    const decodedString = atob(encodedData)
    const jsonData = JSON.parse(decodedString);
    this.allRounds = generateGameRounds(jsonData);

    createGameElements(this);
    setupKeyboardInput(this);
    createCompleteScreen(this);
    createFailureEndScreen(this);
    createCountdown(this);

    document.querySelector('.text-container').classList.add('loaded');
}

function createGameElements(scene) {

    createHeader(scene);
    createInputDisplay(scene);
    createRoundDisplay(scene);
    createScoreDisplay(scene);
    createTimerDisplay(scene);
    createHeaderIcons(scene);
    createCorrectGuessContainer(scene);
    createGiveUpButton(scene);
    createCheckmark(scene, scene.inputDisplay.x + (scene.game.scale.width * 0.90 * 0.4), scene.inputDisplay.y);
    createCrossIcon(scene);

    if (isMobile()) {
        createKeyboard(scene, game);
    }

    if (!scene.nextGameTimer) {
        // Create and start the timer globally
        scene.nextGameTimer = createNextGameTimer(
            getNextPlayTime,
            (text) => {
            }
        );
        scene.nextGameTimer.start();
    }
}

// Visibility management helper
function setElementsVisibility(scene, isVisible) {
    const elements = [
        ...scene.tiles.map(tileObj => [tileObj.tile, tileObj.text]).flat(),
        scene.scoreText,
        scene.timerText,
        scene.roundText,
        scene.correctGuessContainer
    ].filter(Boolean);

    elements.forEach(element => element.setVisible(isVisible));
}

function startGame(scene) {
    // Start game from the first round
    scene.isGameActive = true;
    scene.currentRound = 0;
    scene.score = 0;
    scene.guessedTopicsOrder = [];
    updateScoreDisplay(scene);

    if (scene.hamburgerMenu) {
        if (window.auth && window.auth.currentUser) {
            scene.hamburgerMenu.setVisible(true);
        } else {
            scene.hamburgerMenu.setVisible(false);
        }
    }

    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.removeAll(true);
    }
    scene.correctGuessTexts = [];

    hideTiles(scene);
    resetTimerAndBar(scene);

    scene.roundText.setText(`Round: 1`);
    showCountdown(scene);
}

function checkGuess(scene, guess) {
    // Return early if timer is at 0 or game is not active
    if (scene.remainingTime <= 0 || !scene.isGameActive) {
        return;
    }

    // Normalize the guess
    const normalizedGuess = guess.toLowerCase().trim();

    // Find if the guess matches any value in any of the topic arrays
    let foundMatch = false;
    let matchedTopicIndex = -1;

    // Check each topic array
    for (let i = 0; i < scene.currentTopics.length; i++) {
        const topicObj = scene.currentTopics[i];
        
        // Check if this topic has already been guessed
        const alreadyGuessed = scene.correctGuessTexts.some(entry => 
            entry.text !== null && 
            entry.text.text.toLowerCase() === topicObj.topic[0].toLowerCase()
        );
        
        if (!alreadyGuessed) {
            // Use isFuzzyMatchSimple for each word in the topic
            const fuzzyMatched = topicObj.topic.some(value => 
                isFuzzyMatchSimple(normalizedGuess, value.toLowerCase())
            );

            if (fuzzyMatched) {
                foundMatch = true;
                matchedTopicIndex = i;
                break;
            }
        }
    }

    if (foundMatch) {
        let matchedTopic = scene.currentTopics[matchedTopicIndex];

        // Track the order of guessed topics
        scene.guessedTopicsOrder.push(matchedTopicIndex);
        
        highlightTiles(scene, matchedTopic.entries, matchedTopicIndex);
        
        // Find the first unused guess text entry
        let matchedEntry = scene.correctGuessTexts.find(entry => 
            entry.text === null
        );
        
        if (matchedEntry) {
            const { circle, guessContainer } = matchedEntry;
            // Add the topic text to appear next to the circle
            const circleRadius = scene.game.scale.width * 0.0125;
            matchedEntry.text = scene.add.text(
                circleRadius * 3, // Space after circle
                0,
                matchedTopic.topic[0], // Display the main topic name (first in array)
                {
                    fontSize: scene.game.scale.width * 0.04 + 'px',
                    color: '#000000',
                    fontFamily: 'Poppins',
                    fontWeight: 'bold'
                }
            ).setOrigin(0, 0.5);
            
            // Use the specific container for this entry
            matchedEntry.guessContainer.add(matchedEntry.text);
            
            // Apply the appropriate color to the circle based on the order
            const colors = [0x6d92e6, 0x9bcf53, 0xbf53cf]; // Blue, Green, Purple
            const color = colors[scene.guessedTopicsOrder.length - 1]; // Get the color based on the order of guesses

            // Animate the existing circle fill to the correct color
            scene.tweens.add({
                targets: circle,
                alpha: 0,
                duration: 25,
                onComplete: () => {
                    circle.clear();
                    circle.lineStyle(10, color);
                    circle.fillStyle(color);
                    circle.strokeCircle(0, 0, circleRadius);
                    circle.fillCircle(0, 0, circleRadius);
                    circle.alpha = 1;
                }
            });
        }
        
        // Show checkmark feedback
        scene.checkmarkCircle.setVisible(true);
        scene.checkmarkText.setVisible(true);
        scene.time.delayedCall(1000, () => {
            scene.checkmarkCircle.setVisible(false);
            scene.checkmarkText.setVisible(false);
        });

        scene.sound.play('correctSound');
        
        // Update score
        scene.score += 30;
        updateScoreDisplay(scene);

        // End round if all topics have been guessed
        if (scene.correctGuessTexts.filter(entry => entry.text !== null).length === 3) {
            scene.isGameActive = false; // Disable further guesses
            scene.time.delayedCall(1500, () => {
                handleRoundEndAllTopicsGuessed(scene);
            });
        }
    } else {
        // Handle incorrect guess
        scene.sound.play('incorrectSound');
        scene.cross.setVisible(true);
        scene.time.delayedCall(1000, () => {
            scene.cross.setVisible(false);
        });
    }
}


function startNextRound(scene) {
    // Start the next round
    scene.isGameActive = true;
    scene.currentRound++;
    hideCompleteScreen(scene);
    hideTiles(scene);
    clearTimerEvent(scene);
    updateScoreDisplay(scene);

    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.removeAll(true);
    }
    scene.correctGuessTexts = [];

    if (scene.checkmark) {
        scene.checkmark.setVisible(false);
    }
    showCountdown(scene);
}


function startRound(scene) {

    // Start a new round
    resetRoundState(scene);
    
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.remainingTime = scene.timerDuration;
    scene.timerText.setText(`Time: ${scene.remainingTime}`);
    startTimer(scene);
    
    const tileConfig = getTileConfig(scene);
    createTiles(scene, tileConfig);
    
    initializeCorrectGuessPlaceholders(scene);
    window.showGameElements(scene);
}

function resetRoundState(scene) {
    // Clear previous data and reset elements for the new round
    hideTiles(scene);
    clearTimerEvent(scene);
    scene.currentInputText = '';
    
    scene.tiles.forEach(tileObj => {
        tileObj.tile.destroy();
        tileObj.text.destroy();
    });
    scene.tiles = [];

    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.removeAll(true);
    }
    scene.correctGuessTexts = [];

    if (scene.checkmark) {
        scene.checkmark.setVisible(false);
    }
}

function handleRoundEndAllTopicsGuessed(scene) {
    // Handle the end of the round when you guessed all three topics
    clearTimerEvent(scene);
    scene.countdownAudioInRoundPlayed = false;

    const points = calculateRoundPoints(scene.remainingTime, 3);
    scene.score += points.roundBonus + points.timeBonus;

    let componentScores = `+ ${points.wordPoints} Word Points`;
    componentScores += `\n+ ${points.roundBonus} Round Bonus`;
    if (points.timeBonus > 0) {
        componentScores += `\n+ ${points.timeBonus} Time Bonus`;
    }
  
    scene.completeSubScoreText.setText(componentScores);

    const totalScoreText = `${scene.score} Points`;

    const isGameComplete = scene.currentRound >= scene.allRounds.length - 1;

    if (isGameComplete) {
        scene.completeTitle.setText('All rounds completed!');
        scene.completeSubTitle.setText('You did great! See you tomorrow!');

        scene.completeNextGameLabel.setVisible(true);
        scene.completeNextGameTime.setVisible(true);

        scene.completeInterRoundScore.setVisible(false);

        scene.completeFinalScoreLabel.setVisible(true);
        scene.completeFinalScoreValue.setText(totalScoreText);
        scene.completeFinalScoreValue.setVisible(true);

        if (window.auth.currentUser) {
            scene.okButton.buttonText.setText('Statistics');
            scene.okButton.setVisible(true);
        } else {
            scene.okButton.setVisible(false);
        }

        endGame(scene);
    } else {
        scene.completeTitle.setText('Round completed!');
        scene.completeSubTitle.setText('You did great!');

        scene.completeInterRoundScore.setText(totalScoreText);
        scene.completeInterRoundScore.setVisible(true);

        scene.completeFinalScoreLabel.setVisible(false);
        scene.completeFinalScoreValue.setVisible(false);

        scene.completeNextGameLabel.setVisible(false);
        scene.completeNextGameTime.setVisible(false);
      
        scene.okButton.buttonText.setText('Next Round');
        scene.okButton.setVisible(true);
    }

    showCompleteScreen(scene);
}


function handleRoundEndNotAllTopicsGuessed(scene) {
    clearTimerEvent(scene);
    scene.countdownAudioInRoundPlayed = false;

    const totalScoreText = `${scene.score} Points`;
    scene.scoreValue.setText(totalScoreText);

    const isGameComplete = scene.currentRound >= scene.allRounds.length - 1;
     
    if (isGameComplete) {
        endGame(scene);
        if (window.auth.currentUser) {
            scene.nextRoundButton.buttonText.setText('Statistics');
            scene.nextRoundButton.setVisible(true);
        } else {
            scene.nextRoundButton.setVisible(false);
        }
 
        scene.scoreLabel.setX(scene.scale.width * 0.25)
        scene.scoreValue.setX(scene.scale.width * 0.25)

        scene.nextGameLabel.setVisible(true)
        scene.nextGameTime.setVisible(true);
    } else {
        scene.nextRoundButton.buttonText.setText('Next Round');
        scene.nextRoundButton.setVisible(true);

        scene.scoreLabel.setX(scene.scale.width * 0.5)
        scene.scoreValue.setX(scene.scale.width * 0.5)

        scene.nextGameLabel.setVisible(false)
        scene.nextGameTime.setVisible(false);
    }

    showFailureEndScreen(scene);
}


function endGame(scene) {

    // Calculate total number of topics guessed correctly across all rounds
    // Each round has 3 topics, so multiply currentRound by 3 and add current round's correct guesses
    const topicsInPreviousRounds = scene.currentRound * 3;
    const topicsInCurrentRound = scene.correctGuessTexts.filter(entry => entry.text !== null).length;
    const totalTopicsGuessed = topicsInPreviousRounds + topicsInCurrentRound;

    if (window.auth.currentUser) {  // Check if a user is logged in
        const userId = window.auth.currentUser.uid;

        // Save game stats to Firebase with total topics guessed
        writeGameStats(scene.score, totalTopicsGuessed);

        updateUserProfile(userId);  // Call updateUserProfile with the current user's ID

    }
    GameStorage.storePlayedTodayCookie();
}
})