import {showScreen, hideScreen, createText, createScreen, createButton} from './helpers.js';

export function createFailureEndScreen(scene) {
    scene.failureEndScreen = createScreen(scene, 'failureEndScreen');

    scene.failureScoreText = createText(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.4
    );
    
    // Increased base font size to 24px and adjusted scaling
    scene.failureScoreText.setStyle({
        fontFamily: 'Poppins',
        fontSize: '35px', // Increased from 18px
        color: '#FFFFFF',
        align: 'center',
        fontStyle: 'bold'
    });
    scene.failureEndScreen.add(scene.failureScoreText);

    const shareButton = createButton(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.7,
        'Share your score!',
        () => {
            hideScreen(scene, 'failureEndScreen');
        }
    );
    scene.failureEndScreen.add(shareButton);
}

export const showFailureEndScreen = (scene) => {
    // Adjusted font scaling to be more readable but not excessive
    const fontSize = Math.min(scene.scale.height * 0.08, 45); // Caps at 32px
    scene.failureScoreText.setFontSize(fontSize);

    // Retrieve missed topics
    const missedTopics = scene.currentTopics.filter(topic => 
        !scene.correctGuessTexts.some(entry => 
            entry.topicName.toLowerCase() === topic.name.toLowerCase() && entry.text !== null
        )
    );

    // Create the message for the missed topics
    let missedTopicsMessage = '';
    if (missedTopics.length > 0) {
        const topicsLeft = missedTopics.length;
        const noun = topicsLeft === 1 ? 'topic' : 'topics';
        const desc_text = topicsLeft === 1 ? 'which one it was' : 'what they were';
        missedTopicsMessage = `Out of time!\nSo close, but ${topicsLeft} ${noun} slipped by.\n\nLet's see ${desc_text}:\n\n`;
        
        missedTopics.forEach((topic, index) => {
            const description = topic.words.join(', ');
            missedTopicsMessage += `${topic.name}\n${description}\n\n`;
        });
    }

    scene.failureScoreText.setText(
        `${missedTopicsMessage}\nYour Score: ${scene.score}\n\nCome back tomorrow for another puzzle!`
    );

    showScreen(scene, 'failureEndScreen');
};

export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');