import { loadTopics, generateRounds } from './topics.js';
import { createHeader, createAdContainer, createInputDisplay, createRoundDisplay, createScoreDisplay, createTimerDisplay, createHeaderIcons, createFeedbackIcons, createCorrectGuessContainer, updateScoreDisplay} from './uiComponents.js';
import { isMobile } from './utils.js';
import { createInterRoundScreen, showInterRoundScreen, hideInterRoundScreen, createFailureEndScreen, showFailureEndScreen} from './screens.js';
import { setupKeyboardInput, createKeyboard } from './keyboard.js';
import { createCountdown, showCountdown} from './countdown.js';
import { resetTimerAndBar, clearTimerEvent} from './timer.js';
import { highlightTiles, hideTiles} from './tiles.js';
import { createConfettiEffect } from './confetti.js';

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
window.hideGameElements = hideGameElements;
window.showGameElements = showGameElements;
window.startRound = startRound;
window.endGame = endGame;

function create() {

    this.currentRound = 0;
    this.tiles = [];
    this.score = 0
    this.timerDuration = 30
    this.timerText = null;
    this.timerEvent = null;
    this.currentInputText = ''; 
    this.updateInterval = 100; // Update every 100ms for smoother countdown
    this.gameStartTime = null;
    this.isGameActive = true;
    this.countdownAudioInRoundPlayed = false;

    const NUMBER_OF_ROUNDS = 2;
    const TOPICS_PER_ROUND = 3;
    const allTopics = loadTopics(this);
    this.allRounds = generateRounds(allTopics, NUMBER_OF_ROUNDS, TOPICS_PER_ROUND);

    createGameElements(this);

    setupKeyboardInput(this);

    createInterRoundScreen(this);
    createFailureEndScreen(this);

    createCountdown(this);
    showCountdown(this);
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

function hideGameElements(scene) {
    scene.tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
    scene.scoreText.setVisible(false);
    scene.timerText.setVisible(false);
    scene.roundText.setVisible(false);
    
    // Update this part to handle the new structure
    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.setVisible(false);
    }
}

function showGameElements(scene) {
    scene.tiles.forEach(tileObj => {
        tileObj.tile.setVisible(true);
        tileObj.text.setVisible(true);
    });
    scene.scoreText.setVisible(true);
    scene.timerText.setVisible(true);
    scene.roundText.setVisible(true);
    
    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.setVisible(true);
    }
}

function startGame(scene) {
    // Start game from the first round
    scene.isGameActive = true;
    scene.currentRound = 0;
    scene.score = 0;
    updateScoreDisplay(scene);
    
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

function handleRoundEnd(scene) {
    clearTimerEvent(scene);

    scene.countdownAudioInRoundPlayed = false;

    let timeRemaining = scene.remainingTime;
    let timeBonus = 0;
    let roundBonus = 50;
    let wordPoints = 3 * 30;

    if (timeRemaining > 20) {
        timeBonus = 30;
    } else if (timeRemaining > 10) {
        timeBonus = 10;
    }

    scene.score += roundBonus + timeBonus;

    let interRoundMessage = `Awesome!\n\n+ ${wordPoints} Word Points`;
    interRoundMessage += `\n+ ${roundBonus} Round Bonus`;
    if (timeBonus > 0) {
        interRoundMessage += `\n+ ${timeBonus} Time Bonus`;
    }
    interRoundMessage += `\n\nTotal Score: ${scene.score}`;

    scene.interRoundScoreText.setText(interRoundMessage);

    showInterRoundScreen(scene);
    
    scene.okButtion = scene.add.text('Next Round')
    // okButton.setText('Next Round');
    scene.okButton.removeAllListeners('pointerdown');
    scene.okButton.on('pointerdown', () => {
        hideInterRoundScreen(scene);
        startNextRound(scene);
    });

    // Trigger confetti if all three topics were guessed correctly
    if (scene.correctGuessTexts.length === 3) {
        // Small delay to ensure the inter-round screen is visible
        scene.time.delayedCall(100, () => {
            createConfettiEffect();
        });
    }
}

function startNextRound(scene) {
    // Transition to the next round if available
    if (scene.currentRound < scene.allRounds.length - 1) {
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

        scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
        showCountdown(scene);
    } else {
        endGame(scene);
    }
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
    scene.countdownAudioInRoundPlayed = false;

    // Check if all topics were guessed in the current round
    const allTopicsGuessed = scene.correctGuessTexts.filter(entry => entry.text !== null).length === 3;

    // Check if the player completed all rounds
    if (scene.currentRound >= scene.allRounds.length - 1 || allTopicsGuessed) {
        // Show victory screen if they completed all rounds or guessed all topics
        scene.interRoundScoreText.setText(`All rounds completed!\n\nFinal Score: ${scene.score}`);
        scene.okButton.setText('Restart');
        scene.okButton.removeAllListeners('pointerdown');
        scene.okButton.on('pointerdown', () => {
            hideInterRoundScreen(scene);
            startGame(scene);
        });

        showInterRoundScreen(scene);
    } else {
        // Show failure end screen if not all topics guessed
        scene.interRoundScoreText.setText(`Try Again! Your Score: ${scene.score}`);
        showFailureEndScreen(scene);
    }
}

})