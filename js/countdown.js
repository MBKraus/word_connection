import { resetTimerAndBar, clearTimerEvent, startTimer} from './timer.js';
import { getTileConfig, createTiles, hideTiles, showTiles} from './tiles.js';
import { initializeCorrectGuessPlaceholders } from './uiComponents.js';

export function createCountdown(scene) {
    // Create countdown circle and text and assign them to the scene
    scene.countdownCircle = scene.add.graphics();
    scene.countdownText = scene.add.text(
        scene.scale.width / 2, 
        scene.scale.height * 0.3, 
        '', 
        {
            fontSize: '64px',
            color: '#FFFFFF',
            fontFamily: 'Poppins',
        }
    ).setOrigin(0.5);
}

export function showCountdown(scene) {
    let countdownTime = 3;
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.roundText.setVisible(true);

    scene.countdownCircle.clear();
    scene.countdownCircle.fillStyle(0x167D60, 1);
    const radius = 100;
    scene.countdownCircle.fillCircle(scene.game.scale.width / 2, scene.game.scale.height * 0.3, radius);

    scene.countdownText.setText(countdownTime);
    scene.countdownText.setVisible(true);
    scene.countdownCircle.setVisible(true);

    scene.timerText.setVisible(false);
    scene.timeBar.setVisible(false);

    hideTiles(scene);

    let countdownStartTime = Date.now();
    
    const countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - countdownStartTime) / 1000;
        countdownTime = Math.max(0, 3 - Math.floor(elapsedTime));
        scene.countdownText.setText(countdownTime);

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            scene.countdownCircle.setVisible(false);
            scene.countdownText.setVisible(false);

            resetTimerAndBar(scene);
            showTiles(scene);
        }
    }, 100); // Update more frequently for smoother countdown
}

export function startRound(scene) {

    resetRoundState(scene);
    setupRoundTextAndTimer(scene);
    
    const tileConfig = getTileConfig(scene);
    createTiles(scene, tileConfig);
    initializeCorrectGuessPlaceholders(scene);
    window.showGameElements(scene);
}

// Helper function: Clear previous data and reset elements for the new round
function resetRoundState(scene) {
    hideTiles(scene);
    clearTimerEvent(scene);
    scene.currentInputText = '';
    
    // Destroy existing tiles and texts
    scene.tiles.forEach(tileObj => {
        tileObj.tile.destroy();
        tileObj.text.destroy();
    });
    scene.tiles = [];

    // Clear correct guess container
    if (scene.correctGuessContainer) {
        scene.correctGuessContainer.removeAll(true);
    }
    scene.correctGuessTexts = [];

    // Hide checkmark if it exists
    if (scene.checkmark) {
        scene.checkmark.setVisible(false);
    }
}

function setupRoundTextAndTimer(scene) {
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.remainingTime = scene.timerDuration;
    scene.timerText.setText(`Time: ${scene.remainingTime}`);
    startTimer(scene);
}




