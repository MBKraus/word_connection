import { getStartY } from './uiComponents.js';

export function resetTimerAndBar(scene) {
    // Clear any existing timer events first
    clearTimerEvent(scene);
    
    // Reset all timer-related variables
    scene.remainingTime = scene.timerDuration;
    scene.gameStartTime = null;
    scene.lastUpdateTime = null;
    scene.countdownAudioInRoundPlayed = false;
    scene.isGameActive = true;  // Make sure game state is reset
    
    // Recreate timer graphics if they don't exist
    if (!scene.timeBar) {
        scene.timeBar = scene.add.graphics();
    }
    
    // Clear and reset the timer bar
    scene.timeBar.clear();
    scene.timeBar.setVisible(true);
    
    // Reset timer text if it exists
    if (scene.timerText) {
        scene.timerText.setVisible(true);
    }
    
    updateTimerDisplay(scene, true);
}

function updateTimerDisplay(scene, forceTextUpdate = false) {
    // Update the timer text only when forced or on second boundaries
    if (forceTextUpdate || Math.abs(Math.floor(scene.remainingTime) - scene.remainingTime) < 0.1) {
        if (scene.timerText) {
            scene.timerText.setText(`Time: ${Math.floor(scene.remainingTime)}`);
        }
    }

    // Clear the previous bar to prevent any lingering visuals
    scene.timeBar.clear();

    // Calculate dimensions and position
    const inputBgWidth = scene.game.scale.width * 0.98;
    const inputBgHeight = scene.game.scale.height * 0.055;
    const x = (scene.game.scale.width - inputBgWidth) / 2;

    // Always draw the background bar first
    scene.timeBar.fillStyle(0xD3D3D3, 1);  // Set background color (light grey)
    scene.timeBar.fillRoundedRect(
        x,
        scene.initialTimeBarY,
        inputBgWidth,
        inputBgHeight,
        20 // rounded corners
    );

    // Calculate the progress bar width based on remaining time
    const barProgress = Math.max(0, Math.min(1, scene.remainingTime / scene.timerDuration));
    const barWidth = inputBgWidth * barProgress;
    
    // Only draw the progress bar if there's any width to draw
    if (barWidth > 0) {
        scene.timeBar.fillStyle(0xCAD2DE, 1);  // Set foreground color (light blue)
        scene.timeBar.fillRoundedRect(
            x,  // Start from the same x position as background
            scene.initialTimeBarY,
            barWidth,
            inputBgHeight,
            20 // rounded corners
        );
    }
}

export function clearTimerEvent(scene) {
    if (scene.timerEvent) {
        scene.timerEvent.remove(false);
        scene.timerEvent = null;
    }
}

export function startTimer(scene) {
    clearTimerEvent(scene);

    // Reset game state
    scene.isGameActive = true;
    scene.countdownAudioInRoundPlayed = false;
    scene.remainingTime = scene.timerDuration;
    scene.gameStartTime = Date.now();
    scene.lastUpdateTime = scene.gameStartTime;

    updateTimerDisplay(scene, true);

    scene.updateInterval = 1000 / 60; // approximately 16.67ms

    scene.timerEvent = scene.time.addEvent({
        delay: scene.updateInterval,
        callback: updateTimer,
        callbackScope: scene,
        args: [scene],
        loop: true
    });
}

function updateTimer(scene) {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - scene.gameStartTime) / 1000;
    scene.remainingTime = Math.max(0, scene.timerDuration - elapsedTime);

    // Update display every frame for smooth bar movement
    updateTimerDisplay(scene);

    if (scene.isGameActive && scene.remainingTime <= 3.05 && scene.remainingTime > 2.95 && !scene.countdownAudioInRoundPlayed) {
        scene.sound.play('countdownSound');
        scene.countdownAudioInRoundPlayed = true;
    }

    if (scene.remainingTime <= 0) {
        scene.remainingTime = 0;
        updateTimerDisplay(scene, true);
        clearTimerEvent(scene);
        scene.isGameActive = false;
        handleTimeUp(scene);
    }
}

function handleTimeUp(scene) {
    if (scene.correctGuessTexts.filter(entry => entry.text !== null).length < 3) {
        scene.time.delayedCall(1500, () => {
            endGame(scene);
        }, [], scene);
    }
}