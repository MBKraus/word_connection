import { loadTopics, generateRounds } from './topics.js';
import { createHeader, createAdContainer, createInputDisplay, createRoundDisplay, 
    createScoreDisplay, createTimerDisplay, createHeaderIcons, createFeedbackIcons, createCorrectGuessContainer, updateScoreDisplay, initializeCorrectGuessPlaceholders} from './uiComponents.js';
import { isMobile } from './utils.js';
import { createInterRoundScreen, showInterRoundScreen, hideInterRoundScreen, createFailureEndScreen, showFailureEndScreen, createDailyLimitScreen, createWelcomeScreen, showWelcomeScreen} from './screens.js';
import { setupKeyboardInput, createKeyboard } from './keyboard.js';
import { createCountdown, showCountdown} from './countdown.js';
import { resetTimerAndBar, clearTimerEvent, startTimer} from './timer.js';
import { highlightTiles, hideTiles, getTileConfig, createTiles} from './tiles.js';
import { createConfettiEffect } from './confetti.js';
import { GameStorage } from './gameStorage.js';
import { saveGameStats, updateUserProfile } from './gameStorage.js';
import { auth } from './auth.js';

Promise.all([
    document.fonts.load('16px "Poppins"'),
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
    backgroundColor: '#FFFFFF',
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
    this.load.text('data', 'https://mbkraus.github.io/word_connection/data.txt');
    this.load.image('question', 'https://mbkraus.github.io/word_connection/assets/question.png');
    this.load.image('check', 'https://mbkraus.github.io/word_connection/assets/check.png');
    this.load.image('cross', 'https://mbkraus.github.io/word_connection/assets/wrong.png');
    this.load.audio('correctSound', 'https://mbkraus.github.io/word_connection/assets/audio/correct.wav');
    this.load.audio('incorrectSound', 'https://mbkraus.github.io/word_connection/assets/audio/incorrect.mp3');
    this.load.audio('countdownSound', 'https://mbkraus.github.io/word_connection/assets/audio/countdown.wav');
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
    this.timerDuration = 30;
    this.timerText = null;
    this.timerEvent = null;
    this.currentInputText = ''; 
    this.updateInterval = 100;
    this.gameStartTime = null;
    this.isGameActive = true;
    this.countdownAudioInRoundPlayed = false;

    const NUMBER_OF_ROUNDS = 3;
    const TOPICS_PER_ROUND = 3;
    const allTopics = loadTopics(this);
    this.allRounds = generateRounds(allTopics, NUMBER_OF_ROUNDS, TOPICS_PER_ROUND);

    // Check if user has already played today (cookie-based)
    if (GameStorage.hasPlayedTodayCookie()) {
        // Only create and show the daily limit screen
        this.dailyLimitControls = createDailyLimitScreen(this);
        this.dailyLimitControls.show();
    } else {
        // Create game elements but don't start the game yet
        createGameElements(this);

        // Create and show the welcome screen
        createWelcomeScreen(this);
        showWelcomeScreen(this, 'welcomeScreen');

        setupKeyboardInput(this);
        createInterRoundScreen(this);
        createFailureEndScreen(this);
        createCountdown(this);
    }

    // At the end of the create function, show the text container
    document.querySelector('.text-container').classList.add('loaded');
}

function showAdContainer() {
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'block';
    }
}

function createGameElements(scene) {

    createHeader(scene);
    createAdContainer();
    const headerBottom = (scene.headerText.height * 0.5) - 2;
    document.getElementById('ad-container').style.top = `${headerBottom}px`;

    createInputDisplay(scene);
    createRoundDisplay(scene);
    createScoreDisplay(scene);
    createTimerDisplay(scene);
    createHeaderIcons(scene);
    createCorrectGuessContainer(scene);

    if (isMobile()) {
        createKeyboard(scene, game);
    }

    createFeedbackIcons(scene);
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
    
    // Show the ad container only after welcome screen/login is complete
    showAdContainer();

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

    // Find the matched topic
    let matchedTopic = scene.currentTopics.find(topic => 
        topic.name.toLowerCase() === guess.toLowerCase()
    );
    
    if (matchedTopic) {
        highlightTiles(scene, matchedTopic.words);
        
        // Find the corresponding entry that matches this topic name
        let matchedEntry = scene.correctGuessTexts.find(entry => 
            entry.topicName.toLowerCase() === matchedTopic.name.toLowerCase() && entry.text === null
        );

        if (matchedEntry) {
            const { circle, guessContainer } = matchedEntry;

            // Add the topic text to appear next to the circle
            const circleRadius = scene.game.scale.width * 0.023;
            matchedEntry.text = scene.add.text(
                circleRadius * 3, // Space after circle
                0,
                matchedTopic.name,
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
                    circle.lineStyle(10, 0x167D60);
                    circle.fillStyle(0x167D60);
                    circle.strokeCircle(0, 0, circleRadius);
                    circle.fillCircle(0, 0, circleRadius);
                    circle.alpha = 1;
                }
            });
        }
        
        scene.checkmark.setVisible(true);
        scene.time.delayedCall(1000, () => {
            scene.checkmark.setVisible(false);
        });
        
        scene.score += 30;
        updateScoreDisplay(scene);
        scene.sound.play('correctSound');
        
        // End round if all topics have been guessed
        if (scene.correctGuessTexts.filter(entry => entry.text !== null).length === 3) {
            scene.isGameActive = false; // Disable further guesses
            scene.time.delayedCall(1500, () => {
                handleRoundEnd(scene);
            });
        }
    } else {
        scene.sound.play('incorrectSound');
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

    scene.time.delayedCall(100, () => {
        createConfettiEffect();
    });

    scene.okButton.setText('Next Round');
    scene.okButton.removeAllListeners('pointerdown');
    scene.okButton.on('pointerdown', () => {
        hideInterRoundScreen(scene);
        if (scene.currentRound >= scene.allRounds.length - 1) {
            // If this was the final round, end the game after a delay
            scene.time.delayedCall(1000, () => {
                endGame(scene);
            });
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
        saveGameStats(scene.score, totalTopicsGuessed);
    }

    if (isGameComplete && allTopicsGuessed) {
        // Show final victory screen
        scene.interRoundScoreText.setText(`All rounds completed!\nCome back tomorrow for another puzzle!\n\nFinal Score: ${scene.score}`);
        scene.okButton.setText('Share your score!');
        scene.okButton.removeAllListeners('pointerdown');
        scene.okButton.on('pointerdown', () => {
            hideInterRoundScreen(scene);
        });
        showInterRoundScreen(scene);

        // Trigger confetti for completing the game
        scene.time.delayedCall(100, () => {
            createConfettiEffect();
        });
    } else if (!allTopicsGuessed) {
        // Show failure end screen if not all topics guessed
        showFailureEndScreen(scene);
    }

    GameStorage.recordGamePlayed();

}

})