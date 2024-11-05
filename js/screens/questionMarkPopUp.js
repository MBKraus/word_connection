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

export function createQuestionMarkPopup(scene, triggerImage) {
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height * 0.45);
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