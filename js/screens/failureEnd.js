import {showScreen, hideScreen, createText, createScreen, createButton, STYLES} from './helpers.js';
import {createLogo} from '../uiComponents.js';

export function createFailureEndScreen(scene) {
    scene.failureEndScreen = createScreen(scene, 'failureEndScreen');

    const logoWidth = scene.scale.width * 0.3;
    const logoHeight = logoWidth;
    const logoYPosition = scene.scale.height*0.05;
    const logoXPosition = 0.5
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
    scene.failureEndScreen.add(logo);

    scene.failureTitle = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.25,
        'Out of Time!', {
            fontSize: scene.scale.width * 0.06 + 'px',
            color: STYLES.colors.text,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
    }).setOrigin(0.5);
    scene.failureEndScreen.add(scene.failureTitle);


    // Add score at the bottom
    scene.scoreLabel = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.63,
        `Your Score`,
    {
        fontFamily: 'Poppins Light',
        fontSize: scene.scale.width * 0.03 + 'px',
        color: STYLES.colors.text,
        align: 'center',
    }
    ).setOrigin(0.5);
    scene.failureEndScreen.add(scene.scoreLabel);

    scene.scoreValue = scene.add.text(
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.67,
        `${scene.score}`,
        {
            fontFamily: 'Poppins',
            fontSize: scene.scale.width * 0.06 + 'px',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.failureEndScreen.add(scene.scoreValue);

    scene.nextGameLabel = scene.add.text(
        scene.scale.width * 0.75,
        scene.scale.height * 0.63,
        `Next game available in`,
    {
        fontFamily: 'Poppins Light',
        fontSize: scene.scale.width * 0.03 + 'px',
        color: STYLES.colors.text,
        align: 'center',
    }
    ).setOrigin(0.5);
    scene.failureEndScreen.add(scene.nextGameLabel);
    scene.nextGameLabel.setVisible(false)

    scene.nextGameTime = scene.add.text(
        scene.game.scale.width * 0.75,
        scene.game.scale.height * 0.67,
        `test`,
        {
            fontFamily: 'Poppins',
            fontSize: scene.scale.width * 0.06 + 'px',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.failureEndScreen.add(scene.nextGameTime);
    scene.nextGameTime.setVisible(false);

    // Add Next Round button at the bottom
    const buttonText = scene.currentRound >= scene.allRounds.length - 1 ? 'Statistics' : 'Next Round';
    scene.nextRoundButton = createButton(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.75,  // Position at bottom
        buttonText,
        () => {
            if (scene.currentRound >= scene.allRounds.length - 1) {
                window.endGame(scene);
            } else {
                hideFailureEndScreen(scene);
                startNextRound(scene);
            }
        },
        STYLES.colors.playButtonBg,
        STYLES.colors.playButtonText,
        STYLES.colors.playButtonBorder
    );
    scene.failureEndScreen.add(scene.nextRoundButton);
}

export const showFailureEndScreen = (scene) => {
    const fontSize = Math.min(scene.scale.height * 0.08, 40);
    const entryFontSize = fontSize * 0.7; // Smaller font size for entries

    // Clear any existing topic texts from previous games
    scene.failureEndScreen.getAll().forEach(child => {
        if (child.topicText || child.descText) {
            child.destroy();
        }
    });

    // Find missed topics
    const missedTopics = scene.currentTopics.filter(topicObj =>
        !scene.correctGuessTexts.some(entry =>
            entry.text !== null &&
            entry.text.text.toLowerCase() === topicObj.topic[0].toLowerCase()
        )
    );

    if (missedTopics.length > 0) {
        const topicsLeft = missedTopics.length;
        const noun = topicsLeft === 1 ? 'topic' : 'topics';

        // Show header message
        const headerText = scene.add.text(
            scene.game.scale.width * 0.5,
            scene.game.scale.height * 0.30,
            `So close, but ${topicsLeft} ${noun} slipped by!`,
            {
                fontFamily: 'Poppins Light',
                fontSize: fontSize,
                color: '#000000',
                align: 'center',
            }
        ).setOrigin(0.5);
        headerText.descText = true; // Mark for cleanup
        scene.failureEndScreen.add(headerText);

        const colors = [0xbf53cf, 0x9bcf53, 0x6d92e6]; // Colors for backgrounds
        const padding = 20; // Padding around rectangles
        const spacing = 25; // Space between topic rectangles
        const borderRadius = 15; // Corner radius

        // Start placing topics
        let yOffset = scene.game.scale.height * 0.35;

        missedTopics.forEach((topicObj, index) => {
            const bgColor = colors[index % colors.length];
            const containerWidth = scene.game.scale.width * 0.8;

            // Calculate text bounds
            const topicText = scene.add.text(0, 0, topicObj.topic[0], {
                fontFamily: 'Poppins',
                fontSize: fontSize,
                color: '#FFFFFF',
                align: 'center',
            }).setWordWrapWidth(containerWidth * 0.9).setOrigin(0.5);

            topicText.descText = true; // Mark for cleanup

            const entriesText = scene.add.text(0, 0, topicObj.entries.join(' - '), {
                fontFamily: 'Poppins',
                fontSize: entryFontSize,
                color: '#FFFFFF',
                align: 'center',
                wordWrap: { width: containerWidth * 0.9 },
            }).setOrigin(0.5);

            entriesText.descText = true; // Mark for cleanup

            // Calculate total height
            const totalHeight = padding * 2 + topicText.height + entriesText.height;

            // Create graphics for the rounded rectangle
            const graphics = scene.add.graphics();
            graphics.fillStyle(bgColor);
            graphics.fillRoundedRect(
                scene.game.scale.width * 0.1, // x
                yOffset, // y
                containerWidth, // width
                totalHeight, // height
                borderRadius // radius
            );

            graphics.descText = true; // Mark for cleanup

            // Position the topic and entries text inside the rectangle
            topicText.setPosition(
                scene.game.scale.width * 0.5, // x
                yOffset + padding + topicText.height / 2 // y
            );

            entriesText.setPosition(
                scene.game.scale.width * 0.5, // x
                topicText.y + topicText.height / 2 + entriesText.height / 2 // y
            );

            // Update yOffset for the next rectangle
            yOffset += totalHeight + spacing;

            // Add everything to the failureEndScreen group for cleanup
            scene.failureEndScreen.add(graphics);
            scene.failureEndScreen.add(topicText);
            scene.failureEndScreen.add(entriesText);
        });
        
    }

    scene.nextGameTimer.setOnUpdate((text) => {
        scene.nextGameTime.setText(text);
    });

    // Show the failure end screen
    showScreen(scene, 'failureEndScreen');
};


export const hideFailureEndScreen = (scene) => {
    const failureEndScreen = scene.failureEndScreen;

    // Destroy all dynamically added children marked as descText
    failureEndScreen.getAll().forEach(child => {
        if (child.descText) {
            child.destroy(); // Destroy the child from the scene
        }
    });

    // Hide the screen
    hideScreen(scene, 'failureEndScreen');
};
