import { generateGameRounds} from './topics.js';
import { createHeader, createInputDisplay, createRoundDisplay, createCheckmark,
    createScoreDisplay, createTimerDisplay, createHeaderIcons, createCrossIcon, createCorrectGuessContainer, updateScoreDisplay, initializeCorrectGuessPlaceholders} from './uiComponents.js';
import { isMobile } from './utils.js';
import { createInterRoundScreen, showInterRoundScreen, hideInterRoundScreen } from './screens/interRound.js';
import {createFailureEndScreen, showFailureEndScreen } from './screens/failureEnd.js';
import { createWelcomeScreen, showWelcomeScreen } from './screens/welcome.js';
import { setupKeyboardInput, createKeyboard } from './keyboard.js';
import { createCountdown, showCountdown} from './countdown.js';
import { resetTimerAndBar, clearTimerEvent, startTimer} from './timer.js';
import { highlightTiles, hideTiles, getTileConfig, createTiles} from './tiles.js';
import {createDailyLimitScreen} from './screens/dailyLimit.js';
import { GameStorage } from './gameStorage.js';
import { writeGameStats, updateUserProfile } from './gameStorage.js';
import { auth } from './auth.js';

Promise.all([
    document.fonts.load('16px "Poppins"'),        // Default Poppins (Regular)
    document.fonts.load('16px "Poppins Light"', '300'), // Poppins Light (Weight 300)
    document.fonts.load('16px "Play"'),
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
    this.load.audio('correctSound', './assets/audio/correct.wav');
    this.load.audio('incorrectSound', './assets/audio/incorrect.mp3');
    this.load.audio('countdownSound', './assets/audio/countdown.wav');
}

window.startGame = startGame;
window.checkGuess = checkGuess;
window.hideGameElements = (scene) => setElementsVisibility(scene, false);
window.showGameElements = (scene) => setElementsVisibility(scene, true);
window.startRound = startRound;
window.startNextRound = startNextRound;
window.endGame = endGame;

function create() {
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
  
    // // Check if user has already played today (cookie-based)
    // if (GameStorage.hasPlayedTodayCookie()) {
    //     // Only create and show the daily limit screen
    //     this.dailyLimitControls = createDailyLimitScreen(this);
    //     this.dailyLimitControls.show();
    // } else {
        
    // Create and show the welcome screen
    createWelcomeScreen(this);
    showWelcomeScreen(this, 'welcomeScreen');

    const encodedData = this.cache.text.get('data');
    const decodedString = atob(encodedData)
    const jsonData = JSON.parse(decodedString);
    this.allRounds = generateGameRounds(jsonData);

    // Create game elements but don't start the game yet
    createGameElements(this);

    setupKeyboardInput(this);
    createInterRoundScreen(this);
    createFailureEndScreen(this);
    createCountdown(this);
    // }

    // At the end of the create function, show the text container
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
    createCheckmark(scene, scene.inputDisplay.x + (scene.game.scale.width * 0.98 * 0.4), scene.inputDisplay.y);
    createCrossIcon(scene);

    if (isMobile()) {
        createKeyboard(scene, game);
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
        // For each topic object, check all its possible values
        const topicObj = scene.currentTopics[i];
        
        // Check if this topic has already been guessed
        const alreadyGuessed = scene.correctGuessTexts.some(entry => 
            entry.text !== null && 
            entry.text.text.toLowerCase() === topicObj.topic[0].toLowerCase()
        );
        
        if (!alreadyGuessed && topicObj.topic.some(value => value.toLowerCase() === normalizedGuess)) {
            foundMatch = true;
            matchedTopicIndex = i;
            break;
        }
    }

    if (foundMatch) {
        let matchedTopic = scene.currentTopics[matchedTopicIndex];

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
            
            // Animate the existing circle fill to green
            scene.tweens.add({
                targets: circle,
                alpha: 0,
                duration: 25,
                onComplete: () => {
                    circle.clear();
                    circle.lineStyle(10, 0x51c878);
                    circle.fillStyle(0x51c878);
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
        
        // Update score
        scene.score += 30;
        updateScoreDisplay(scene);
        // scene.sound.play('correctSound');
        
        // End round if all topics have been guessed
        if (scene.correctGuessTexts.filter(entry => entry.text !== null).length === 3) {
            scene.isGameActive = false; // Disable further guesses
            scene.time.delayedCall(1500, () => {
                handleRoundEnd(scene);
            });
        }
    } else {
        // Handle incorrect guess
        // scene.sound.play('incorrectSound');
        scene.cross.setVisible(true);
        scene.time.delayedCall(1000, () => {
            scene.cross.setVisible(false);
        });
    }
}



function calculateRoundPoints(timeRemaining) {
    const points = {
        wordPoints: 3 * 30,
        roundBonus: 50,
        timeBonus: 0
    };

    if (timeRemaining > 20) {
        points.timeBonus = 30;
    } else if (timeRemaining > 10) {
        points.timeBonus = 10;
    }

    return points;
}

function handleRoundEnd(scene) {
    // Handle the end of the round when you guessed all three topics
    clearTimerEvent(scene);
    scene.countdownAudioInRoundPlayed = false;

    const points = calculateRoundPoints(scene.remainingTime);
    scene.score += points.roundBonus + points.timeBonus;

    let interRoundMessage = `Awesome!\n\n+ ${points.wordPoints} Word Points`;
    interRoundMessage += `\n+ ${points.roundBonus} Round Bonus`;
    if (points.timeBonus > 0) {
        interRoundMessage += `\n+ ${points.timeBonus} Time Bonus`;
    }
    interRoundMessage += `\n\nTotal Score: ${scene.score}`;

    scene.interRoundScoreText.setText(interRoundMessage);
    showInterRoundScreen(scene);

    scene.okButton.removeAllListeners('pointerdown');
    scene.okButton.on('pointerdown', () => {
        hideInterRoundScreen(scene);
        if (scene.currentRound >= scene.allRounds.length - 1) {
            // If this was the final round, end the game after a delay
            endGame(scene);
            return;
            // Else proceed with the next round
        } else {
            startNextRound(scene);
        }
    });
}

function startNextRound(scene) {
    // Start the next round
    scene.isGameActive = true;
    scene.currentRound++;
    hideInterRoundScreen(scene);
    hideTiles(scene);
    clearTimerEvent(scene);

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

function endGame(scene) {
    // Called in two situations:
    // - when you guessed all topics right in the final round
    // - when time's up

    scene.countdownAudioInRoundPlayed = false;

    // Calculate total number of topics guessed correctly across all rounds
    // Each round has 3 topics, so multiply currentRound by 3 and add current round's correct guesses
    const topicsInPreviousRounds = scene.currentRound * 3;
    const topicsInCurrentRound = scene.correctGuessTexts.filter(entry => entry.text !== null).length;
    const totalTopicsGuessed = topicsInPreviousRounds + topicsInCurrentRound;

    // Check if all topics were guessed in the current round
    const allTopicsGuessed = scene.correctGuessTexts.filter(entry => entry.text !== null).length === 3;

    // Check if the player has completed all rounds
    const isGameComplete = scene.currentRound >= scene.allRounds.length - 1;

    if (auth.currentUser) {  // Check if a user is logged in
        const userId = auth.currentUser.uid;
        updateUserProfile(userId);  // Call updateUserProfile with the current user's ID

        // Save game stats to Firebase with total topics guessed
        writeGameStats(scene.score, totalTopicsGuessed);
    }

    if (isGameComplete && allTopicsGuessed) {
        // Show final victory screen
        scene.interRoundScoreText.setText(`All rounds completed!\n\nCome back tomorrow\nfor another puzzle!\n\nFinal Score: ${scene.score}`);
        
        // Remove the old button and replace it with a new one
        if (scene.okButton) {
        scene.okButton.destroy(); // Remove the existing button
    }
        
        // // Create a new button with updated text
        // scene.okButton = createButton(
        //     scene,
        //     scene.scale.width * 0.5,
        //     scene.scale.height * 0.74,
        //     'Share your score!', // Updated text
        //     () => {
        //         hideInterRoundScreen(scene);
        //     },
        //     STYLES.colors.loginButtonBg,
        //     STYLES.colors.loginButtonText,
        //     STYLES.colors.loginButtonBorder
        // );
        // scene.interRoundScreen.add(scene.okButton);

        showInterRoundScreen(scene);

    } else if (!allTopicsGuessed) {
        // Show failure end screen if not all topics guessed
        showFailureEndScreen(scene);
    }

    GameStorage.recordGamePlayedLocal();

}
})