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

export function createInterRoundScreen(scene, game) {
    // Attach interRoundScreen to the scene object
    scene.interRoundScreen = scene.add.container(0, 0);
    scene.interRoundScreen.setDepth(1000);

    // Background overlay
    const bg = scene.add.rectangle(0, 0, game.scale.width, game.scale.height, 0x000000);
    bg.setOrigin(0);
    scene.interRoundScreen.add(bg);

    // Score text display in the center of the screen
    scene.interRoundScoreText = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.4, '', {
        fontSize: game.scale.width * 0.08 + 'px',
        color: '#ffffff',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
    scene.interRoundScreen.add(scene.interRoundScoreText);

    // OK button to proceed to the next round
    scene.okButton = scene.add.text(game.scale.width * 0.5, game.scale.height * 0.74, 'Next Round', {
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


export function createFailureEndScreen(scene, game, score) {
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
    scene.interRoundScoreText.setText(`Your Score: ${score}`);
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