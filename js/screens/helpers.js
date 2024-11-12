// Common styling configurations
export const STYLES = {
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
export function createOverlay(scene, container) {
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, STYLES.colors.overlay);
    bg.setOrigin(0);
    container.add(bg);
    return bg;
}

export function createButton(scene, x, y, text, onClick) {
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

export function createText(scene, x, y, initialText = '') {
    return scene.add.text(x, y, initialText, {
        fontSize: scene.scale.width * 0.08 + 'px',
        color: STYLES.colors.text,
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
}

export function createScreen(scene, name, visibility = false) {
    const screen = scene.add.container(0, 0);
    screen.setDepth(1000);
    createOverlay(scene, screen);
    screen.setVisible(visibility);
    return screen;
}

// Screen management functions
export function showScreen(scene, screenName) {
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

export function hideScreen(scene, screenName) {
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