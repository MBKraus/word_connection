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

export function showInterRoundScreen(scene) {
    scene.interRoundScreen.setVisible(true);
    window.hideGameElements(scene);
}

// Ensure the hideInterRoundScreen function takes scene as an argument
export function hideInterRoundScreen(scene) {
    scene.interRoundScreen.setVisible(false);
}


export function createFailureEndScreen(scene) {
    // Create a container for the end screen
    scene.failureEndScreen = scene.add.container(0, 0);
    scene.failureEndScreen.setDepth(1000);

    // Background
    let bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, 0x000000);
    bg.setOrigin(0);
    scene.failureEndScreen.add(bg);

    // Create a separate text element for the failure screen
    scene.failureScoreText = scene.add.text(scene.game.scale.width * 0.5, scene.game.scale.height * 0.4, '', {
        fontSize: scene.game.scale.width * 0.08 + 'px',
        color: '#ffffff',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
    scene.failureEndScreen.add(scene.failureScoreText);

    // Restart button
    const restartButton = scene.add.text(scene.game.scale.width * 0.5, scene.game.scale.height * 0.7, 'Restart', {
        fontSize: scene.game.scale.width * 0.06 + 'px',
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
        hideFailureEndScreen(scene);
        startGame(scene);  // Restart the game
    });

    scene.failureEndScreen.add(restartButton);
    scene.failureEndScreen.setVisible(false);
}

export function showFailureEndScreen(scene) {
    // Update the failure screen text before showing
    scene.failureScoreText.setText(`Try Again!\n\nYour Score: ${scene.score}`);
    scene.failureEndScreen.setVisible(true);
    window.hideGameElements(scene);
}

export function hideFailureEndScreen(scene) {
    // Hides the failure end screen
    scene.failureEndScreen.setVisible(false);
    window.showGameElements(scene);
}


export function createQuestionMarkPopup(scene, triggerImage) {
    // Create the popup container
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height * 0.4);
    popup.setVisible(false);
    popup.setDepth(1000);

    // Calculate relative dimensions
    const popupWidth = scene.scale.width * 0.6;    // 60% of game width
    const popupHeight = scene.scale.height * 0.5;  // 50% of game height
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background with relative size
    const background = scene.add.graphics();
    background.fillStyle(0x000000, 0.9);
    background.fillRoundedRect(-halfWidth, -halfHeight, popupWidth, popupHeight, 20);
    popup.add(background);

    // Add text with relative positioning and font size
    const text = scene.add.text(0, -halfHeight * 0.7, 'Hello World', {
        font: `${scene.scale.width * 0.04}px Poppins`,  // Relative font size
        fill: '#ffffff'
    }).setOrigin(0.5);
    popup.add(text);

    // Create OK button with relative size and positioning
    const buttonWidth = scene.scale.width * 0.1;   // 10% of game width
    const buttonHeight = scene.scale.height * 0.06; // 6% of game height
    const button = scene.add.rectangle(0, halfHeight * 0.5, buttonWidth, buttonHeight, 0x4a4a4a);
    
    const buttonText = scene.add.text(0, halfHeight * 0.5, 'OK', {
        font: `${scene.scale.width * 0.04}px Poppins`,  // Relative font size
        fill: '#ffffff'
    }).setOrigin(0.5);

    button.setInteractive();
    popup.add(button);
    popup.add(buttonText);

    // Add click handlers
    triggerImage.on('pointerdown', () => {
        popup.setVisible(true);
    });

    button.on('pointerdown', () => {
        popup.setVisible(false);
    });

    // Optional: add hover effect for the button
    button.on('pointerover', () => {
        button.setFillStyle(0x666666);
    });

    button.on('pointerout', () => {
        button.setFillStyle(0x4a4a4a);
    });
}