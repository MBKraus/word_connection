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
    scene.failureEndScreen.add( scene.failureTitle);

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
    const fontSize = Math.min(scene.scale.height * 0.08, 35);
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
            const containerHeight = fontSize + entryFontSize + padding * 2;
        
            // Calculate the y-position for the current rectangle
            const rectX = scene.game.scale.width * 0.1; // x-position
            const rectY = yOffset; // y-position
            const rectCenterY = rectY + containerHeight / 2;
        
            // Create graphics for the rounded rectangle
            const graphics = scene.add.graphics();
            graphics.fillStyle(bgColor); // Background fill color
            graphics.fillRoundedRect(
                rectX, // x-position
                rectY, // y-position
                containerWidth, // Width
                containerHeight, // Height
                borderRadius // Corner radius
            );
        
            // Add topic text
            const topicText = scene.add.text(
                scene.game.scale.width * 0.5,
                rectY + padding, // Place topic text at the top with padding
                topicObj.topic[0],
                {
                    fontFamily: 'Poppins',
                    fontSize: fontSize,
                    color: '#FFFFFF',
                    align: 'center',
                }
            ).setOrigin(0.5);
        
            // Add entries text
            const entriesText = scene.add.text(
                scene.game.scale.width * 0.5,
                topicText.y + fontSize + padding / 2, // Add distance below the topic text
                topicObj.entries.join(' - '),
                {
                    fontFamily: 'Poppins',
                    fontSize: entryFontSize,
                    color: '#FFFFFF',
                    align: 'center',
                    wordWrap: {
                        width: containerWidth * 0.9,
                    },
                }
            ).setOrigin(0.5);
        
            // Dynamically adjust rectangle height to fit wrapped text
            const totalHeight = fontSize + padding + entriesText.height + padding; // Account for both texts and padding
            graphics.clear(); // Clear the existing rectangle
            graphics.fillStyle(bgColor); // Redraw the rectangle with updated height
            graphics.fillRoundedRect(
                rectX,
                rectY,
                containerWidth,
                totalHeight,
                borderRadius
            );
        
            // Update yOffset for next topic
            yOffset += totalHeight + spacing;
        
            // Add to the failureEndScreen group for cleanup
            scene.failureEndScreen.add(graphics);
            scene.failureEndScreen.add(topicText);
            scene.failureEndScreen.add(entriesText);
        });

        // Add score at the bottom
        const scoreText = scene.add.text(
            scene.game.scale.width * 0.5,
            scene.game.scale.height * 0.7,
            `Your Score: ${scene.score}`,
            {
                fontFamily: 'Poppins',
                fontSize: fontSize,
                color: '#bf53cf',
                align: 'center',
            }
        ).setOrigin(0.5);
        scoreText.descText = true; // Mark for cleanup
        scene.failureEndScreen.add(scoreText);
    }

    // Show the failure end screen
    showScreen(scene, 'failureEndScreen');
};


export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');