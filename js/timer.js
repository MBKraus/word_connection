export function resetTimerAndBar(scene) {
    scene.remainingTime = scene.timerDuration;
    updateTimerDisplay(scene);

    scene.timerText.setVisible(true);
    scene.timeBar.setVisible(true);
}

function updateTimerDisplay(scene) {
    // Update the timer text
    scene.timerText.setText(`Time: ${Math.floor(scene.remainingTime)}`);

    // Calculate the width of the time bar
    scene.timeBar.clear();
    scene.timeBar.fillStyle(0xB8B8B8, 1);
    
    // Only draw the bar if there's actually time remaining
    if (Math.floor(scene.remainingTime) > 0) {
        const barProgress = scene.remainingTime / scene.timerDuration;
        const inputBgWidth = scene.game.scale.width * 0.98;
        const inputBgHeight = scene.game.scale.height * 0.055;
        const x = scene.game.scale.width * 0.5 - inputBgWidth / 2;
        const y = scene.game.scale.height * 0.70 - inputBgHeight / 2;
        
        // Draw the timer bar with the same rounded corners as the input background
        scene.timeBar.fillRoundedRect(
            x,
            y,
            inputBgWidth * barProgress,
            inputBgHeight,
            20
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
    clearTimerEvent(scene); // Clear any previous timer event

    scene.remainingTime = scene.timerDuration;
    scene.gameStartTime = Date.now();
    scene.lastUpdateTime = scene.gameStartTime;

    updateTimerDisplay(scene);

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
    const elapsedTime = (currentTime - scene.gameStartTime) / 1000; // Convert to seconds
    scene.remainingTime = Math.max(0, scene.timerDuration - elapsedTime);

    if (currentTime - scene.lastUpdateTime >= 1000) { // Update display every second
        updateTimerDisplay(scene);
        scene.lastUpdateTime = currentTime;
    }

    // Play sound when there are 2 seconds left, only if the game is still active
    if (scene.isGameActive && scene.remainingTime <= 3.05 && scene.remainingTime > 2.95 && !scene.countdownAudioInRoundPlayed) {
        scene.sound.play('countdownSound');
        scene.countdownAudioInRoundPlayed = true;
    }

    // If remaining time is less than or equal to 0, ensure everything shows zero
    if (scene.remainingTime <= 0) {
        scene.remainingTime = 0;  // Force to exactly 0
        updateTimerDisplay(scene);  // Update one final time
        clearTimerEvent(scene);
        scene.isGameActive = false; // Set game state to inactive before handling time up
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