export const STYLES = {
    fonts: {
        large: (scene) => `${scene.scale.width * 0.08}px Poppins`,
        medium: (scene) => `${scene.scale.width * 0.06}px Poppins`,
        small: (scene) => `${scene.scale.width * 0.04}px Poppins`
    },
    colors: {
        text: '#000000',
        playButtonBg: '#000000',
        playButtonText: '#FFFFFF',
        playButtonBorder: '#FFFFFF',
        loginButtonBg: '#FFFFFF',
        loginButtonText: '#000000',
        loginButtonBorder: '#000000',
        buttonHover: '#666666',
        overlay: 0xFFFFFF
    },
    padding: {
        button: {
            left: 125,
            right: 125,
            top: 25,
            bottom: 25
        }
    },
    borderRadius: {
        sides: 65
    }
};

export function createButton(scene, x, y, text, onClick, bgColor = '#4a4a4a', textColor = '#000000', borderColor = '#000000',
    paddingLeft = 125, paddingRight = 125, paddingTop = 25, paddingBottom = 25
) {
    const container = scene.add.container(x, y);

    // Create temporary text to measure dimensions
    const tempText = scene.add.text(0, 0, text, {
        fontSize: scene.scale.width * 0.06 + 'px',
        fontFamily: 'Poppins'
    });
    const textWidth = tempText.width + paddingLeft + paddingRight;
    const textHeight = tempText.height + paddingTop + paddingBottom;
    tempText.destroy();

    // Create the rounded rectangle button using Phaser's native GeometryMask
    const graphics = scene.add.graphics();
    
    const drawButton = (graphics, fillColor, borderCol) => {
        graphics.clear();
        
        // Convert hex colors to numbers
        const fillColorNum = parseInt(fillColor.replace('#', ''), 16);
        const borderColorNum = parseInt(borderCol.replace('#', ''), 16);
        
        // Draw border (slightly larger rectangle)
        graphics.lineStyle(6, borderColorNum);
        graphics.fillStyle(fillColorNum);
        
        const cornerRadius = STYLES.borderRadius.sides;
        const width = textWidth;
        const height = textHeight;
        
        // Use Phaser's built-in rounded rectangle
        graphics.strokeRoundedRect(-width/2, -height/2, width, height, cornerRadius);
        graphics.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);
    };

    // Initial button draw
    drawButton(graphics, bgColor, borderColor);

    // Add text
    const buttonText = scene.add.text(0, 0, text, {
        fontSize: scene.scale.width * 0.04 + 'px',
        fontFamily: 'Poppins',
        color: textColor
    }).setOrigin(0.5);

    container.add([graphics, buttonText]);
    container.setSize(textWidth, textHeight);
    container.setInteractive();

    // Handle interactions
    container.on('pointerover', () => {
        drawButton(graphics, STYLES.colors.buttonHover, borderColor);
    });

    container.on('pointerout', () => {
        drawButton(graphics, bgColor, borderColor);
    });

    container.on('pointerdown', onClick);

    return container;
}

// Keep other helper functions unchanged
export function createOverlay(scene, container) {
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, STYLES.colors.overlay);
    bg.setOrigin(0);
    container.add(bg);
    return bg;
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

export function showScreen(scene, screenName) {
    scene[screenName].setVisible(true);
    window.hideGameElements(scene);
    
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'none';
    }

    if (scene.authDOMElement) {
        scene.authDOMElement.setVisible(false);
    }
}

export function hideScreen(scene, screenName) {
    scene[screenName].setVisible(false);
    window.showGameElements(scene);
    
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'flex';
    }

    if (scene.authDOMElement) {
        scene.authDOMElement.setVisible(true);
    }
}