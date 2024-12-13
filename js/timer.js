import { getStartY } from './uiComponents.js';

export function pauseTimer(scene) {
    if (!scene.timerEvent) {
        console.warn('Cannot pause timer: scene.timerEvent is undefined homie');
        return;
    }
    if (scene.timerEvent.paused) {
        console.warn('Timer is already paused');
        return;
    }
    scene.timerEvent.paused = true;
    scene.pauseStartTime = Date.now();
    scene.isTimerPaused = true;
}

export function resumeTimer(scene) {
    if (scene.timerEvent && scene.timerEvent.paused) {
        // Adjust the game start time by the pause duration
        const pauseDuration = Date.now() - scene.pauseStartTime;
        scene.gameStartTime += pauseDuration;
        scene.timerEvent.paused = false;
        // Reset the paused flag
        scene.isTimerPaused = false;
    }
}

export function resetTimerAndBar(scene) {
    // Clear any existing timer events first
    clearTimerEvent(scene);
    
    // Reset all timer-related variables
    scene.remainingTime = scene.timerDuration;
    scene.gameStartTime = null;
    scene.lastUpdateTime = null;
    scene.countdownAudioInRoundPlayed = false;
    scene.isGameActive = true;  // Make sure game state is reset
    scene.isTimerPaused = false;  // Reset pause state
    
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

    // Clear the previous bar
    scene.timeBar.clear();

    // Calculate dimensions and position
    const inputBgWidth = scene.game.scale.width * 0.87;
    const inputBgHeight = scene.game.scale.height * 0.055;
    const x = scene.game.scale.width * 0.12;
    const cornerRadius = 20;

    // Draw the background bar
    scene.timeBar.fillStyle(0xE2E8F1, 1);
    scene.timeBar.fillRoundedRect(
        x,
        scene.initialTimeBarY,
        inputBgWidth,
        inputBgHeight,
        cornerRadius
    );

    // Calculate the progress bar width
    const barProgress = Math.max(0, Math.min(1, scene.remainingTime / scene.timerDuration));
    let barWidth = Math.max(0, inputBgWidth * barProgress);

    // Draw the progress bar (if width > 0)
    if (barWidth > 0) {
        scene.timeBar.fillStyle(0xCAD2DE, 1);

        // Adjust width when in the rounded corner area
        if (barWidth <= cornerRadius) {
            // Calculate the available width at this y-position in the rounded corner
            // Using the circle equation: x = sqrt(r² - y²) where r is cornerRadius
            // At the middle of the height, y = cornerRadius/2
            const y = cornerRadius/2;
            const availableWidth = cornerRadius - Math.sqrt(cornerRadius * cornerRadius - y * y);
            
            // Scale the remaining width proportionally within the curved space
            const scaleFactor = barWidth / cornerRadius;
            barWidth = availableWidth + (barWidth - availableWidth) * scaleFactor;
        }

        // Calculate dynamic corner radius based on remaining width
        const dynamicRadius = Math.min(cornerRadius, barWidth / 2);

        // Draw the progress bar with adjusted corner radius
        scene.timeBar.fillRoundedRect(
            x,
            scene.initialTimeBarY,
            barWidth,
            inputBgHeight,
            {
                tl: dynamicRadius,
                tr: 0,
                bl: dynamicRadius,
                br: 0
            }
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

    // Make stats button and giveup active
    scene.chartIcon.setInteractive(true);
    scene.giveUpButton.setInteractive(true);

    // Reset game state
    scene.isGameActive = true;
    scene.countdownAudioInRoundPlayed = false;
    scene.remainingTime = scene.timerDuration;
    scene.gameStartTime = Date.now();
    scene.lastUpdateTime = scene.gameStartTime;
    scene.pauseStartTime = null;  // Add this line

    updateTimerDisplay(scene, true);

    scene.updateInterval = 1000 / 60;

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
    scene.remainingTime = Math.max(0, scene.timerDuration - elapsedTime); // Clamp to zero

    // Update display every frame for smooth bar movement
    updateTimerDisplay(scene);

    // Only play countdown sound if timer is not paused
    if (!scene.isTimerPaused && scene.isGameActive && 
        scene.remainingTime <= 3.05 && scene.remainingTime > 2.95 && 
        !scene.countdownAudioInRoundPlayed) {
        // scene.sound.play('countdownSound');
        scene.countdownAudioInRoundPlayed = true;
    }

    if (scene.remainingTime <= 0) {
        scene.remainingTime = 0; // Explicitly set to zero
        updateTimerDisplay(scene, true);
        clearTimerEvent(scene);
        scene.isGameActive = false;
        
        if (scene.correctGuessTexts.filter(entry => entry.text !== null).length < 3) {
            scene.time.delayedCall(1500, () => {
                window.handleRoundEndNotAllTopicsGuessed(scene);
            }, [], scene);
        }
    }
}
