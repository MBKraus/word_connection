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

    // Add main heading
    const text = scene.add.text(0, -halfHeight * 0.55, 'How to play', {
        font: STYLES.fonts.medium(scene),
        fill: '#000000', // Black font color
        align: 'center',
        lineSpacing: 10,
    }).setOrigin(0.5);
    popup.add(text);

    // Add detailed instructions
    const instructions = scene.add.text(0, scene.scale.height*0.10, 
        `Guess the 3 topics hidden within the descriptive tiles and earn points.\n\n` +
        `- You\’ll see 12 tiles with descriptive words.\n` +
        `- These words are clues to 3 distinct topics.\n\n` +
        `Analyze the words and identify which belong to the same topic.\n\n` +
        `Submit your answers within 60 seconds to complete the round.\n\n` +
        `Complete 3 rounds of this challenge to win the game.\n\n` +
        `Scoring:\n` +
        `* 30 points for each correct word.\n` +
        `* 50 points for completing a round.\n` +
        `* Time Bonus:\n` +
        `   * Finish within 40 seconds: Earn 30 extra points.\n` +
        `   * Finish within 50 seconds: Earn 10 extra points.`,
        {
            font: STYLES.fonts.small(scene),
            fill: '#000000', // Black font color
            align: 'left',
            wordWrap: { width: popupWidth * 0.8 },
        }
    ).setOrigin(0.5);
    popup.add(instructions);

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
