// Common styling configurations
const STYLES = {
    fonts: {
        large: (scene) => `${scene.scale.width * 0.08}px Poppins`,
        medium: (scene) => `${scene.scale.width * 0.06}px Poppins`,
        small: (scene) => `${scene.scale.width * 0.04}px Poppins`
    },
    colors: {
        text: '#ffffff',
        buttonBg: '#4a4a4a',
        buttonHover: '#666666',
        overlay: 0x000000
    },
    padding: {
        button: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    }
};

// Helper functions for common UI elements
function createOverlay(scene, container) {
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, STYLES.colors.overlay);
    bg.setOrigin(0);
    container.add(bg);
    return bg;
}

function createButton(scene, x, y, text, onClick) {
    const button = scene.add.text(x, y, text, {
        fontSize: scene.scale.width * 0.06 + 'px',
        fontFamily: 'Poppins',
        color: STYLES.colors.text,
        backgroundColor: STYLES.colors.buttonBg,
        padding: STYLES.padding.button
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', onClick);
    return button;
}

function createText(scene, x, y, initialText = '') {
    return scene.add.text(x, y, initialText, {
        fontSize: scene.scale.width * 0.08 + 'px',
        color: STYLES.colors.text,
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
}

function createScreen(scene, name) {
    const screen = scene.add.container(0, 0);
    screen.setDepth(1000);
    createOverlay(scene, screen);
    screen.setVisible(false);
    return screen;
}

// Screen management functions
function showScreen(scene, screenName) {
    scene[screenName].setVisible(true);
    window.hideGameElements(scene);
    
    // Hide ad container
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'none';
    }

    // Hide auth elements (both Phaser DOM element and HTML container)
    if (scene.authDOMElement) {  // Store this reference when creating auth UI
        scene.authDOMElement.setVisible(false);
    }
}

function hideScreen(scene, screenName) {
    scene[screenName].setVisible(false);
    window.showGameElements(scene);
    
    // Show ad container
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'flex';
    }

    // Show auth elements
    if (scene.authDOMElement) {
        scene.authDOMElement.setVisible(true);
    }
}

// Main screen creation functions
export function createInterRoundScreen(scene) {
    scene.interRoundScreen = createScreen(scene, 'interRoundScreen');

    scene.interRoundScoreText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.4
    );
    scene.interRoundScreen.add(scene.interRoundScoreText);

    scene.okButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.74,
        'Next Round',
        () => {
            hideScreen(scene, 'interRoundScreen');
            window.startNextRound(scene);
        }
    );
    scene.interRoundScreen.add(scene.okButton);
}

export function createFailureEndScreen(scene) {
    scene.failureEndScreen = createScreen(scene, 'failureEndScreen');

    scene.failureScoreText = createText(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.4
    );
    scene.failureEndScreen.add(scene.failureScoreText);

    const restartButton = createButton(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.7,
        'Restart',
        () => {
            hideScreen(scene, 'failureEndScreen');
            startGame(scene);
        }
    );
    scene.failureEndScreen.add(restartButton);
}

export function createQuestionMarkPopup(scene, triggerImage) {
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height * 0.4);
    popup.setVisible(false);
    popup.setDepth(1000);

    const popupWidth = scene.scale.width * 0.6;
    const popupHeight = scene.scale.height * 0.5;
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background
    const background = scene.add.graphics();
    background.fillStyle(STYLES.colors.overlay, 0.9);
    background.fillRoundedRect(-halfWidth, -halfHeight, popupWidth, popupHeight, 20);
    popup.add(background);

    // Add text
    const text = scene.add.text(0, -halfHeight * 0.7, 'Hello World', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text
    }).setOrigin(0.5);
    popup.add(text);

    // Create button
    const buttonWidth = scene.scale.width * 0.1;
    const buttonHeight = scene.scale.height * 0.06;
    const button = scene.add.rectangle(0, halfHeight * 0.5, buttonWidth, buttonHeight, STYLES.colors.buttonBg)
        .setInteractive();
    
    const buttonText = scene.add.text(0, halfHeight * 0.5, 'OK', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text
    }).setOrigin(0.5);

    // Add event handlers
    triggerImage.on('pointerdown', () => popup.setVisible(true));
    button.on('pointerdown', () => popup.setVisible(false));
    button.on('pointerover', () => button.setFillStyle(STYLES.colors.buttonHover));
    button.on('pointerout', () => button.setFillStyle(STYLES.colors.buttonBg));

    popup.add(button);
    popup.add(buttonText);
}

// Export show/hide functions
export const showInterRoundScreen = (scene) => showScreen(scene, 'interRoundScreen');
export const hideInterRoundScreen = (scene) => hideScreen(scene, 'interRoundScreen');
export const showFailureEndScreen = (scene) => {
    scene.failureScoreText.setText(`Try Again!\n\nYour Score: ${scene.score}`);
    showScreen(scene, 'failureEndScreen');
};
export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');