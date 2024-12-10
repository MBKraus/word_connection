import { createScreen, createText, createButton, hideScreen, showScreen, STYLES } from './helpers.js';
import { createLogo } from '../uiComponents.js';

// Main screen creation functions
export function createCompleteScreen(scene) {
    scene.completeScreen = createScreen(scene, 'completeScreen');
    const fontSize = Math.min(scene.scale.height * 0.08, 40);

    const logoWidth = scene.scale.width * 0.3;
    const logoHeight = logoWidth;
    const logoYPosition = scene.scale.height*0.05;
    const logoXPosition = 0.5
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
    scene.completeScreen.add(logo);

    scene.completeTitle = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.25,
        ``, {
            fontSize: scene.scale.width * 0.06 + 'px',
            color: STYLES.colors.text,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
    }).setOrigin(0.5);
    scene.completeScreen.add( scene.completeTitle);

    scene.completeSubTitle = scene.add.text(
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.30,
        ``,
        {
            fontFamily: 'Poppins Light',
            fontSize: fontSize,
            color: '#000000',
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.completeSubTitle.descText = true; // Mark for cleanup
    scene.completeScreen.add(scene.completeSubTitle);

    scene.completeSubScoreText = scene.add.text(
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.40,
        ``,
        {
            fontFamily: 'Poppins Light',
            fontSize: scene.scale.width * 0.04 + 'px',
            color: '#000000',
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.completeScreen.add(scene.completeSubScoreText);

    scene.completeInterRoundScore = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.55,
        '', {
            fontSize: scene.scale.width * 0.06 + 'px',
            color: STYLES.colors.text,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
    }).setOrigin(0.5);
    scene.completeScreen.add(scene.completeInterRoundScore);
    scene.completeInterRoundScore.setVisible(false);

    // Add end of game score / time at
    scene.completeFinalScoreLabel = scene.add.text(
        scene.scale.width * 0.25,
        scene.scale.height * 0.55,
        `Final Score`,
    {
        fontFamily: 'Poppins Light',
        fontSize: scene.scale.width * 0.03 + 'px',
        color: STYLES.colors.text,
        align: 'center',
    }
    ).setOrigin(0.5);
    scene.completeScreen.add(scene.completeFinalScoreLabel);
    scene.completeFinalScoreLabel.setVisible(false)

    scene.completeFinalScoreValue = scene.add.text(
        scene.game.scale.width * 0.25,
        scene.game.scale.height * 0.59,
        `${scene.score}`,
        {
            fontFamily: 'Poppins',
            fontSize: scene.scale.width * 0.06 + 'px',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.completeScreen.add(scene.completeFinalScoreValue);
    scene.completeFinalScoreValue.setVisible(false)

    scene.completeNextGameLabel = scene.add.text(
        scene.scale.width * 0.75,
        scene.scale.height * 0.55,
        `Next game available in`,
    {
        fontFamily: 'Poppins Light',
        fontSize: scene.scale.width * 0.03 + 'px',
        color: STYLES.colors.text,
        align: 'center',
    }
    ).setOrigin(0.5);
    scene.completeScreen.add(scene.completeNextGameLabel);
    scene.completeNextGameLabel.setVisible(false)

    scene.completeNextGameTime = scene.add.text(
        scene.game.scale.width * 0.75,
        scene.game.scale.height * 0.59,
        `test`,
        {
            fontFamily: 'Poppins',
            fontSize: scene.scale.width * 0.06 + 'px',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.completeScreen.add(scene.completeNextGameTime);
    scene.completeNextGameTime.setVisible(false);

    scene.okButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.74,
        'Next Round',
        () => {
            hideCompleteScreen(scene);
            window.startNextRound(scene);
        },
        STYLES.colors.playButtonBg,
        STYLES.colors.playButtonText,
        STYLES.colors.playButtonBorder
    );
    scene.completeScreen.add(scene.okButton);

    scene.nextGameTimer.setOnUpdate((text) => {
        scene.completeNextGameTime.setText(text);
    });
}

// Export show/hide functions
export const showCompleteScreen = (scene) => showScreen(scene, 'completeScreen');
export const hideCompleteScreen = (scene) => hideScreen(scene, 'completeScreen');