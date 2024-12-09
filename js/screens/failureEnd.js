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
    const fontSize = Math.min(scene.scale.height * 0.08, 45);
    
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
        const desc_text = topicsLeft === 1 ? 'which one it was' : 'what they were';
        
        // Build the complete BBCode text content
        let content = `Out of time!\nSo close, but ${topicsLeft} ${noun} slipped by.\n\nLet's see ${desc_text}:\n\n`;
        
        const colors = [0xbf53cf, 0x9bcf53, 0x6d92e6]

        // Add each topic and its descriptions
        missedTopics.forEach((topicObj, index) => {

            const bgColor = colors[index % colors.length].toString(16); // Convert to hex string
            const formattedBgColor = `#${bgColor.padStart(6, '0')}`; // Ensure the hex color is properly formatted
        
            content += `[bgcolor=${formattedBgColor}][color=white] ${topicObj.topic[0]} [/color][/bgcolor]\n`; // Topic name with background
            content += `${topicObj.entries.join(', ')}`; // Descriptions
            
            // Add spacing between topic sections
            if (index < missedTopics.length - 1) {
                content += '\n\n';
            }
        });
        
        // Add score at the bottom
        content += `\n\n[bgcolor=#bf53cf][color=white]Your Score: ${scene.score} [/color][/bgcolor]\n\nCome back tomorrow for another puzzle!`;
        
        // Create single rexBBCodeText instance
        const endScreenText = scene.add.rexBBCodeText(
            scene.game.scale.width * 0.5,
            scene.game.scale.height * 0.40,
            content,
            {
                fontFamily: 'Poppins',
                fontSize: fontSize,
                color: '#000000',
                align: 'center',
                lineSpacing: 10,
                wrap: {
                    mode: 'word',
                    width: scene.game.scale.width * 0.8
                }
            }
        ).setOrigin(0.5);
        
        endScreenText.descText = true; // Mark for cleanup
        scene.failureEndScreen.add(endScreenText);
        
    } else {
        // If no missed topics, just show the score
        const endScreenText = scene.add.rexBBCodeText(
            scene.game.scale.width * 0.5,
            scene.game.scale.height * 0.5,
            `[bgcolor=#bf53cf][color=white]Your Score: ${scene.score} [/color][/bgcolor]\n\nCome back tomorrow for another puzzle!`,
            {
                fontFamily: 'Poppins',
                fontSize: fontSize,
                color: '#000000',
                align: 'center',
                lineSpacing: 10
            }
        ).setOrigin(0.5);
        
        endScreenText.descText = true;
        scene.failureEndScreen.add(endScreenText);
    }
    
    showScreen(scene, 'failureEndScreen');
};

export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');