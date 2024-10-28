// screens.js

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

export function showCountdown(scene, game) {
    let countdownTime = 3;
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.roundText.setVisible(true);

    scene.countdownCircle.clear();
    scene.countdownCircle.fillStyle(0x167D60, 1);
    const radius = 100;
    scene.countdownCircle.fillCircle(game.scale.width / 2, game.scale.height * 0.3, radius);

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

            resetTimerAndBar(scene, game);
            showTiles(scene);
        }
    }, 100); // Update more frequently for smoother countdown
}

function hideTiles(scene) {
    scene.tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
}

function showTiles(scene) {
    // Call startRound to generate and show tiles
    startRound(scene);
}

export function createInterRoundScreen(scene) {
    // Attach interRoundScreen to the scene object
    scene.interRoundScreen = scene.add.container(0, 0);
    scene.interRoundScreen.setDepth(1000);

    // Background overlay
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, 0x000000);
    bg.setOrigin(0);
    scene.interRoundScreen.add(bg);

    // Score text display in the center of the screen
    scene.interRoundScoreText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.4, '', {
        fontSize: scene.scale.width * 0.08 + 'px',
        color: '#ffffff',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
    scene.interRoundScreen.add(scene.interRoundScoreText);

    // OK button to proceed to the next round
    scene.okButton = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.74, 'Next Round', {
        fontSize: scene.scale.width * 0.06 + 'px',
        fontFamily: 'Poppins',
        color: '#ffffff',
        backgroundColor: '#4a4a4a',
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    }).setOrigin(0.5).setInteractive();

    scene.okButton.on('pointerdown', () => {
        hideInterRoundScreen(scene);
        startNextRound(scene);
    });

    // Add the OK button to the inter-round screen container
    scene.interRoundScreen.add(scene.okButton);
    scene.interRoundScreen.setVisible(false);
}

// Ensure the hideInterRoundScreen function takes scene as an argument
export function hideInterRoundScreen(scene) {
    scene.interRoundScreen.setVisible(false);
}


export function createFailureEndScreen(scene, game) {
    // Create a container for the end screen
    scene.failureEndScreen = scene.add.container(0, 0);
    scene.failureEndScreen.setDepth(1000);

    // Background
    let bg = scene.add.rectangle(0, 0, game.scale.width, game.scale.height, 0x000000);
    bg.setOrigin(0);
    scene.failureEndScreen.add(bg);

    // Failure message
    let failureMessage = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.4, 'Try Again!', {
        fontSize: game.scale.width * 0.08 + 'px',
        color: '#ffffff',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
    scene.failureEndScreen.add(failureMessage);

    // Score display
    scene.interRoundScoreText.setText(`Your Score: ${scene.score}`);
    scene.interRoundScoreText.setPosition(game.scale.width * 0.5, game.scale.height * 0.5);
    scene.interRoundScoreText.setVisible(true);

    // Restart button
    const restartButton = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.7, 'Restart', {
        fontSize: game.scale.width * 0.06 + 'px',
        fontFamily: 'Poppins',
        color: '#ffffff',
        backgroundColor: '#4a4a4a',
        padding: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    }).setOrigin(0.5).setInteractive();

    // Button interaction
    restartButton.on('pointerdown', () => {
        hideFailureEndScreen();
        startGame(scene);  // Restart the game
    });

    scene.failureEndScreen.add(restartButton);
    scene.failureEndScreen.setVisible(false); // Initially hide the screen
}

function resetTimerAndBar(scene, game) {
    scene.remainingTime = scene.timerDuration;
    updateTimerDisplay(scene, game);

    timerText.setVisible(true);
    timeBar.setVisible(true);
}

function updateTimerDisplay(scene, game) {
    // Update the timer text
    scene.timerText.setText(`Time: ${Math.floor(scene.remainingTime)}`);

    // Calculate the width of the time bar
    scene.timeBar.clear();
    scene.timeBar.fillStyle(0xB8B8B8, 1);
    
    // Only draw the bar if there's actually time remaining
    if (Math.floor(scene.remainingTime) > 0) {
        const barProgress = scene.remainingTime / scene.timerDuration;
        const inputBgWidth = game.scale.width * 0.98;
        const inputBgHeight = game.scale.height * 0.055;
        const x = game.scale.width * 0.5 - inputBgWidth / 2;
        const y = game.scale.height * 0.70 - inputBgHeight / 2;
        
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