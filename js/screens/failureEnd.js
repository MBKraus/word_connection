import {showScreen, hideScreen, createText, createScreen, createButton, STYLES} from './helpers.js';

export function createFailureEndScreen(scene) {
    scene.failureEndScreen = createScreen(scene, 'failureEndScreen');

    scene.failureScoreText = createText(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.25  // Moved up to make room for topics
    );
    
    scene.failureScoreText.setStyle({
        fontFamily: 'Poppins',
        fontSize: `${scene.scale.width * 0.08}px`,
        color: '#000000',
        align: 'center',
        fontStyle: 'bold'
    });
    scene.failureEndScreen.add(scene.failureScoreText);

    // const shareButton = createButton(
    //     scene,
    //     scene.game.scale.width * 0.5,
    //     scene.game.scale.height * 0.85,  // Moved down
    //     'Share your score!',
    //     () => {
    //         hideScreen(scene, 'failureEndScreen');
    //     },
    //     STYLES.colors.loginButtonBg,
    //     STYLES.colors.loginButtonText,
    //     STYLES.colors.loginButtonBorder
    // );
    // scene.failureEndScreen.add(shareButton);
}

export const showFailureEndScreen = (scene) => {
    const fontSize = Math.min(scene.scale.height * 0.08, 52);
    scene.failureScoreText.setFontSize(fontSize);

    // Clear any existing topic texts from previous games
    scene.failureEndScreen.getAll().forEach(child => {
        if (child.topicText || child.descText) {
            child.destroy();
        }
    });

    const missedTopics = scene.currentTopics.filter(topic => 
        !scene.correctGuessTexts.some(entry => 
            entry.topicName.toLowerCase() === topic.name.toLowerCase() && entry.text !== null
        )
    );

    if (missedTopics.length > 0) {
        const topicsLeft = missedTopics.length;
        const noun = topicsLeft === 1 ? 'topic' : 'topics';
        const desc_text = topicsLeft === 1 ? 'which one it was' : 'what they were';
        const introText = `Out of time!\nSo close, but ${topicsLeft} ${noun} slipped by.\n\nLet's see ${desc_text}:`;
        scene.failureScoreText.setText(introText);

        // Calculate initial Y position after the intro text
        let currentY = scene.failureScoreText.y + scene.failureScoreText.height + 25;
        
        // Create and position text for each topic
        missedTopics.forEach((topic, index) => {
            // Topic name in red
            const topicText = scene.add.text(
                scene.game.scale.width * 0.5,
                currentY,
                " "+topic.name+" ",
                {
                    fontFamily: 'Poppins',
                    fontSize: fontSize,
                    color: '#000000',
                    align: 'center',
                    fontStyle: 'bold',
                    backgroundColor: '#51c878',
                }
            ).setOrigin(0.5);
            topicText.topicText = true;
            scene.failureEndScreen.add(topicText);
            
            // Description below the topic name
            const descText = scene.add.text(
                scene.game.scale.width * 0.5,
                currentY + fontSize + 10,
                topic.words.join(', '),
                {
                    fontFamily: 'Poppins',
                    fontSize: Math.max(fontSize * 0.8, 24),  // Slightly smaller font for description
                    color: '#000000',
                    align: 'center',
                    wordWrap: { width: scene.game.scale.width * 0.8 }  // Wrap text if too long
                }
            ).setOrigin(0.5);
            descText.descText = true;
            scene.failureEndScreen.add(descText);

            // Update currentY for the next topic-description pair
            // Add more spacing if there are more topics to come
            currentY = descText.y + descText.height + (index < missedTopics.length - 1 ? 40 : 20);
        });

        // Add score text at the bottom after all topics
        const scoreText = scene.add.rexBBCodeText(
            scene.game.scale.width * 0.5,
            currentY + 175,
            `[bgcolor=#51c878] Your Score: ${scene.score} [/bgcolor]\n\nCome back tomorrow for another puzzle!`,
            {
                fontFamily: 'Poppins',
                fontSize: fontSize,
                color: '#000000',
                align: 'center'
            }
        ).setOrigin(0.5);
        scoreText.descText = true;  // Mark for cleanup
        scene.failureEndScreen.add(scoreText);
    } else {
        scene.failureScoreText.setText(
            `Your Score: ${scene.score}\n\nCome back tomorrow for another puzzle!`
        );
    }

    showScreen(scene, 'failureEndScreen');
};

export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');