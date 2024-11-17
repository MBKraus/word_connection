import { pauseTimer, resumeTimer } from '../timer.js';
import { STYLES } from './helpers.js';

export function createQuestionMarkPopup(scene, triggerImage) {
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    popup.setVisible(false);
    popup.setDepth(1000);

    const popupWidth = scene.scale.width;
    const popupHeight = scene.scale.height;
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background
    const background = scene.add.graphics();
    background.fillStyle(0xFFFFFF, 1); // White background
    background.fillRect(-halfWidth, -halfHeight, popupWidth, popupHeight);
    popup.add(background);

    // Add text
    const text = scene.add.text(0, -halfHeight * 0.4, 'Explain the game etc.', {
        font: STYLES.fonts.medium(scene),
        fill: '#000000', // Black font color
        align: 'center',
        lineSpacing: 10,
    }).setOrigin(0.5);
    popup.add(text);

    // Create close button
    const closeButtonContainer = scene.add.container(halfWidth - 50, -halfHeight * 0.55);
    const closeButton = scene.add.graphics();
    closeButton.lineStyle(8, 0x000000); // Black color for the cross
    closeButton.beginPath();
    closeButton.moveTo(-15, -15); // Larger cross
    closeButton.lineTo(15, 15);
    closeButton.moveTo(15, -15);
    closeButton.lineTo(-15, 15);
    closeButton.closePath();
    closeButton.strokePath();

    const closeButtonHitArea = scene.add.rectangle(0, 0, 50, 50);
    closeButtonHitArea.setInteractive({ useHandCursor: true });

    closeButtonContainer.add([closeButton, closeButtonHitArea]);
    popup.add(closeButtonContainer);

    // Add event handlers for the trigger image
    triggerImage.on('pointerdown', () => {
        popup.setVisible(true);
        pauseTimer(scene); // Pause the timer when popup opens
    });

    // Add event handler for the close button
    closeButtonHitArea.on('pointerdown', () => {
        popup.setVisible(false);
        resumeTimer(scene); // Resume the timer when popup closes
    });
}
