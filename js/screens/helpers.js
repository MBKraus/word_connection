export const STYLES = {
    fonts: {
        large: (scene) => `${scene.scale.width * 0.08}px Poppins`,
        medium: (scene) => `${scene.scale.width * 0.06}px Poppins`,
        small: (scene) => `${scene.scale.width * 0.04}px Poppins`
    },
    colors: {
        text: '#000000',
        playButtonBg: '#000000',         // Black background for play button
        playButtonText: '#FFFFFF',       // White text for play button
        playButtonBorder: '#FFFFFF',     // White border for play button
        loginButtonBg: '#FFFFFF',        // White background for login button
        loginButtonText: '#000000',      // Black text for login button
        loginButtonBorder: '#000000',    // Black border for login button
        buttonHover: '#666666',          // Common hover color
        overlay: 0xFFFFFF
    },
    padding: {
        button: {
            left: 40,
            right: 40,
            top: 25,
            bottom: 25
        }
    },
    borderRadius: {
        topLeft: 60,
        topRight: 60,
        bottomLeft: 60,
        bottomRight: 60,
        sides: 65
    }
};

export function createOverlay(scene, container) {
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, STYLES.colors.overlay);
    bg.setOrigin(0);
    container.add(bg);
    return bg;
}

export function createButton(scene, x, y, text, onClick, bgColor = '#4a4a4a', textColor = '#000000', borderColor = '#000000') {
    const container = scene.add.container(x, y);

    const tempText = scene.add.text(0, 0, text, {
        fontSize: scene.scale.width * 0.06 + 'px',
        fontFamily: 'Poppins'
    });
    const textWidth = tempText.width + STYLES.padding.button.left + STYLES.padding.button.right;
    const textHeight = tempText.height + STYLES.padding.button.top + STYLES.padding.button.bottom;
    tempText.destroy();

    const drawButton = (graphics, fillColor, borderCol) => {
        graphics.clear();
        graphics.lineStyle(6, parseInt(borderCol.replace('#', ''), 16));
        graphics.fillStyle(parseInt(fillColor.replace('#', ''), 16));

        const radius = STYLES.borderRadius.sides;
        const halfWidth = textWidth / 2;
        const halfHeight = textHeight / 2;

        graphics.beginPath();
        graphics.moveTo(-halfWidth + radius, -halfHeight);
        graphics.lineTo(halfWidth - radius, -halfHeight);
        graphics.arc(halfWidth - radius, -halfHeight + radius, radius, -Math.PI/2, 0);
        graphics.lineTo(halfWidth, halfHeight - radius);
        graphics.arc(halfWidth - radius, halfHeight - radius, radius, 0, Math.PI/2);
        graphics.lineTo(-halfWidth + radius, halfHeight);
        graphics.arc(-halfWidth + radius, halfHeight - radius, radius, Math.PI/2, Math.PI);
        graphics.lineTo(-halfWidth, -halfHeight + radius);
        graphics.arc(-halfWidth + radius, -halfHeight + radius, radius, Math.PI, -Math.PI/2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    };

    const graphics = scene.add.graphics();
    drawButton(graphics, bgColor, borderColor);

    const buttonText = scene.add.text(0, 0, text, {
        fontSize: scene.scale.width * 0.04 + 'px',
        fontFamily: 'Poppins',
        color: textColor
    }).setOrigin(0.5);

    container.add([graphics, buttonText]);

    container.setSize(textWidth, textHeight);
    container.setInteractive();

    container.on('pointerover', () => {
        drawButton(graphics, STYLES.colors.buttonHover, borderColor);
    });

    container.on('pointerout', () => {
        drawButton(graphics, bgColor, borderColor);
    });

    container.on('pointerdown', onClick);

    return container;
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