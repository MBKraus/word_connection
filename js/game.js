import { loadTopics, generateRounds } from './topics.js';
import { createHeader, createAdContainer, createInputDisplay, createRoundDisplay, createScoreDisplay, createTimerDisplay, createHeaderIcons, createFeedbackIcons,} from './uiComponents.js';
import { isMobile } from './utils.js';
import { createInterRoundScreen, hideInterRoundScreen, createFailureEndScreen} from './screens.js';
import { setupKeyboardInput, createKeyboard } from './keyboard.js';
import { createCountdown, showCountdown} from './countdown.js';
import { resetTimerAndBar} from './timer.js';


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

let allRounds;
let scoreText;
let score = 0;
let roundText;
let timerText;
let timerEvent;
let interRoundScreen;
let okButton;
let interRoundScoreText;
let correctGuessTexts = [];
let currentInputText = '';
let timeBar; // Declare the timeBar variable
let countdownText;
let countdownCircle;
let countdownTime = 3; // Start at 3 seconds
let gameStartTime;
let lastUpdateTime;
let confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
let confettiAnimationId = null;

const NUMBER_OF_ROUNDS = 2;
const TOPICS_PER_ROUND = 3;
let countdownAudioInRoundPlayed = false;
let failureEndScreen;
let isGameActive = true; // Initialize this variable to track the game state

function preload() {
    this.load.text('data', 'https://mbkraus.github.io/word_connection/data.txt');
    this.load.image('question', 'https://mbkraus.github.io/word_connection/assets/question.png');
    this.load.image('check', 'https://mbkraus.github.io/word_connection/assets/check.png');
    this.load.image('cross', 'https://mbkraus.github.io/word_connection/assets/wrong.png');
    this.load.audio('correctSound', 'https://mbkraus.github.io/word_connection/assets/audio/correct.wav');
    this.load.audio('incorrectSound', 'https://mbkraus.github.io/word_connection/assets/audio/incorrect.mp3');
    this.load.audio('countdownSound', 'https://mbkraus.github.io/word_connection/assets/audio/countdown.wav');
}

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

    const allTopics = loadTopics(this);
    this.allRounds = generateRounds(allTopics, NUMBER_OF_ROUNDS, TOPICS_PER_ROUND);

    createCountdown(this);

    createGameElements(this);

    createInterRoundScreen(this);
    
    showCountdown(this);

    setupKeyboardInput(this);

    createFailureEndScreen(this);
}


function createGameElements(scene) {

    createHeader(scene);
    
    createAdContainer();
    const headerBottom = (scene.headerText.height / 2) - 2;
    document.getElementById('ad-container').style.top = `${headerBottom}px`;

    createInputDisplay(scene);
    createRoundDisplay(scene);
    createScoreDisplay(scene);
    createTimerDisplay(scene);
    createHeaderIcons(scene);

    if (isMobile()) {
        createKeyboard(scene, game);
    }

    createFeedbackIcons(scene);
}



// // Update hideGameElements function to handle the new structure
// function hideGameElements() {
//     tiles.forEach(tileObj => {
//         tileObj.tile.setVisible(false);
//         tileObj.text.setVisible(false);
//     });
//     scoreText.setVisible(false);
//     timerText.setVisible(false);
//     roundText.setVisible(false);
    
//     // Update this part to handle the new structure
//     if (correctGuessContainer) {
//         correctGuessContainer.setVisible(false);
//     }
// }
 
// // Update showGameElements function
// function showGameElements() {
//     tiles.forEach(tileObj => {
//         tileObj.tile.setVisible(true);
//         tileObj.text.setVisible(true);
//     });
//     scoreText.setVisible(true);
//     timerText.setVisible(true);
//     roundText.setVisible(true);
    
//     if (correctGuessContainer) {
//         correctGuessContainer.setVisible(true);
//     }
// }

// // Update startGame function
// function startGame(scene) {
//     isGameActive = true;
//     currentRound = 0;
//     score = 0;
//     updateScoreDisplay();
    
//     if (correctGuessContainer) {
//         correctGuessContainer.removeAll(true);
//     }
//     correctGuessTexts = [];

//     hideTiles();
//     resetTimerAndBar(scene);
    
//     roundText.setText(`Round: 1`);
//     showCountdown(scene);
// }



// function highlightTiles(scene, words) {
//     tiles.forEach(tile => {
//         if (words.includes(tile.word)) {
//             // Clear the previous graphics
//             tile.tile.clear();
            
//             // Draw with new color
//             tile.tile.fillStyle(0x167D60, 1);
//             drawRoundedRect(
//                 tile.tile, 
//                 tile.x,
//                 tile.y,
//                 tile.width,
//                 tile.height,
//                 15  // cornerRadius
//             );
//         }
//     });
// }

// function drawRoundedRect(graphics, x, y, width, height, radius) {
//     graphics.beginPath();
    
//     // Top-left
//     graphics.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
//     // Top line
//     graphics.lineTo(x + width - radius, y);
//     // Top-right
//     graphics.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, 0);
//     // Right line
//     graphics.lineTo(x + width, y + height - radius);
//     // Bottom-right
//     graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
//     // Bottom line
//     graphics.lineTo(x + radius, y + height);
//     // Bottom-left
//     graphics.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
//     // Left line
//     graphics.lineTo(x, y + radius);
    
//     graphics.closePath();
//     graphics.fillPath();
// }

// function updateScoreDisplay() {
//     scoreText.setText(`Score: ${score}`);
// }


// function handleTimeUp(scene) {
//     // Only show failure screen if not all topics were guessed
//     if (correctGuessTexts.filter(entry => entry.text !== null).length < 3) {
//         scene.time.delayedCall(1500, () => {
//             endGame(scene);
//         }, [], scene);
//     }
// }

// function handleRoundEnd(scene) {
//     clearTimerEvent();

//     countdownAudioInRoundPlayed = false;

//     let timeRemaining = remainingTime;
//     let timeBonus = 0;
//     let roundBonus = 50;
//     let wordPoints = 3 * 30;

//     if (timeRemaining > 20) {
//         timeBonus = 30;
//     } else if (timeRemaining > 10) {
//         timeBonus = 10;
//     }

//     score += roundBonus + timeBonus;

//     let interRoundMessage = `Awesome!\n\n+ ${wordPoints} Word Points`;
//     interRoundMessage += `\n+ ${roundBonus} Round Bonus`;
//     if (timeBonus > 0) {
//         interRoundMessage += `\n+ ${timeBonus} Time Bonus`;
//     }
//     interRoundMessage += `\n\nTotal Score: ${score}`;

//     interRoundScoreText.setText(interRoundMessage);

//     showInterRoundScreen(scene);
    
//     okButton.setText('Next Round');
//     okButton.removeAllListeners('pointerdown');
//     okButton.on('pointerdown', () => {
//         hideInterRoundScreen();
//         startNextRound(scene);
//     });

//     // Trigger confetti if all three topics were guessed correctly
//     if (correctGuessTexts.length === 3) {
//         // Small delay to ensure the inter-round screen is visible
//         scene.time.delayedCall(100, () => {
//             createConfettiEffect();
//         });
//     }
// }

// function showInterRoundScreen(scene) {
//     interRoundScreen.setVisible(true);
//     hideGameElements();
// }

// // Update startNextRound function
// function startNextRound(scene) {
//     if (currentRound < allRounds.length - 1) {
//         isGameActive = true;
//         currentRound++;
//         hideInterRoundScreen();
//         hideTiles();
//         clearTimerEvent();

//         if (correctGuessContainer) {
//             correctGuessContainer.removeAll(true);
//         }
//         correctGuessTexts = [];

//         if (scene.checkmark) {
//             scene.checkmark.setVisible(false);
//         }

//         roundText.setText(`Round: ${currentRound + 1}`);
//         showCountdown(scene);
//     } else {
//         endGame(scene);
//     }
// }



// function createConfettiEffect() {
//     // Cancel any existing confetti animation
//     if (confettiAnimationId) {
//         clearInterval(confettiAnimationId);
//     }

//     const duration = 3000; // 3 seconds
//     const animationEnd = Date.now() + duration;
//     const defaults = { 
//         startVelocity: 30,
//         spread: 360,
//         ticks: 60,
//         zIndex: 2000, // Ensure confetti appears above all game elements
//         shapes: ['square', 'circle'],
//         colors: confettiColors,
//         disableForReducedMotion: true // Accessibility consideration
//     };

//     function randomInRange(min, max) {
//         return Math.random() * (max - min) + min;
//     }

//     // Create the confetti animation interval
//     confettiAnimationId = setInterval(function() {
//         const timeLeft = animationEnd - Date.now();

//         if (timeLeft <= 0) {
//             return clearInterval(confettiAnimationId);
//         }

//         const particleCount = 50 * (timeLeft / duration);

//         // Fire confetti from multiple origins for better coverage
//         // Left side
//         confetti(Object.assign({}, defaults, {
//             particleCount: particleCount / 3,
//             origin: { x: randomInRange(0.2, 0.3), y: 0.5 }
//         }));

//         // Center
//         confetti(Object.assign({}, defaults, {
//             particleCount: particleCount / 3,
//             origin: { x: randomInRange(0.4, 0.6), y: 0.5 }
//         }));

//         // Right side
//         confetti(Object.assign({}, defaults, {
//             particleCount: particleCount / 3,
//             origin: { x: randomInRange(0.7, 0.8), y: 0.5 }
//         }));
//     }, 250);
// }



// function endGame(scene) {
//     countdownAudioInRoundPlayed = false;

//     // Check if all topics were guessed in the current round
//     const allTopicsGuessed = correctGuessTexts.filter(entry => entry.text !== null).length === 3;

//     // Check if the player completed all rounds
//     if (currentRound >= allRounds.length - 1 || allTopicsGuessed) {
//         // Show victory screen if they completed all rounds or guessed all topics
//         interRoundScoreText.setText(`End of Game!\n\nFinal Score: ${score}`);
//         okButton.setText('Restart');
//         okButton.removeAllListeners('pointerdown');
//         okButton.on('pointerdown', () => {
//             hideInterRoundScreen();
//             startGame(scene);
//         });

//         showInterRoundScreen(scene);
//     } else {
//         // Show failure end screen if not all topics guessed
//         interRoundScoreText.setText(`Try Again! Your Score: ${score}`);
//         showFailureEndScreen(scene);
//     }
// }



// function checkGuess(scene, guess) {
//     // Return early if timer is at 0 or game is not active
//     if (remainingTime <= 0 || !isGameActive) {
//         return;
//     }

//     const currentTopics = allRounds[currentRound];

//     // Find the matched topic
//     let matchedTopic = currentTopics.find(topic => 
//         topic.name.toLowerCase() === guess.toLowerCase()
//     );
    
//     if (matchedTopic) {
//         highlightTiles(scene, matchedTopic.words);
        
//         // Find the corresponding entry in correctGuessTexts for this topic
//         let matchedEntry = correctGuessTexts.find(entry => 
//             entry.topicName.toLowerCase() === matchedTopic.name.toLowerCase()
//         );
        
//         if (matchedEntry) {
//             const { circle, guessContainer } = matchedEntry;

//             // Add the topic text to appear next to the circle
//             const circleRadius = game.scale.width * 0.023;
//             matchedEntry.text = scene.add.text(
//                 circleRadius * 3, // Space after circle
//                 0,
//                 matchedTopic.name,
//                 {
//                     fontSize: game.scale.width * 0.04 + 'px',
//                     color: '#000000',
//                     fontFamily: 'Poppins',
//                     fontWeight: 'bold'
//                 }
//             ).setOrigin(0, 0.5);

//             guessContainer.add(matchedEntry.text);

//             // Animate the existing circle fill to green
//             scene.tweens.add({
//                 targets: circle,
//                 alpha: 0, // This will be our trigger to change the fill
//                 duration: 25,
//                 onComplete: () => {
//                     circle.clear();
//                     circle.lineStyle(10, 0x167D60);
//                     circle.fillStyle(0x167D60); // Change fill to green
//                     circle.strokeCircle(0, 0, circleRadius);
//                     circle.fillCircle(0, 0, circleRadius);
//                     circle.alpha = 1;
//                 }
//             });
//         }
        
//         scene.checkmark.setVisible(true);
//         scene.time.delayedCall(1000, () => {
//             scene.checkmark.setVisible(false);
//         });
        
//         score += 30;
//         updateScoreDisplay();
//         scene.sound.play('correctSound');
        
//         // End round if all topics have been guessed
//         if (correctGuessTexts.filter(entry => entry.text !== null).length === 3) {
//             isGameActive = false; // Disable further guesses
//             scene.time.delayedCall(1500, () => {
//                 handleRoundEnd(scene);
//             });
//         }
//     } else {
//         scene.sound.play('incorrectSound');
//         scene.cross.setVisible(true);
//         scene.time.delayedCall(1000, () => {
//             scene.cross.setVisible(false);
//         });
//     }
// }



// function hideFailureEndScreen() {
//     // Hides the failure end screen
//     failureEndScreen.setVisible(false);
//     showGameElements();
// }



})