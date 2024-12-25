import { createScreen, createButton, hideScreen, showScreen, STYLES } from './helpers.js';
import { createLogo } from '../uiComponents.js';
import { showStatsPopup } from './statsPopUp.js';
import {showCountdown} from './countdown.js';


// Main screen creation functions
export function createCompletedRoundScreen(scene) {
    scene.completedRoundScreen = createScreen(scene, 'completedRoundScreen');
    const fontSize = Math.min(scene.scale.height * 0.08, 40);

    const logoWidth = scene.scale.width * 0.3;
    const logoHeight = logoWidth;
    const logoYPosition = scene.scale.height*0.05;
    const logoXPosition = 0.5
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
    scene.completedRoundScreen.add(logo);

    scene.completeTitle = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.25,
        ``, {
            fontSize: scene.scale.width * 0.06 + 'px',
            color: STYLES.colors.text,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
    }).setOrigin(0.5);
    scene.completedRoundScreen.add( scene.completeTitle);

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
    scene.completedRoundScreen.add(scene.completeSubTitle);

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
    scene.completedRoundScreen.add(scene.completeSubScoreText);

    scene.completeInterRoundScore = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.55,
        '', {
            fontSize: scene.scale.width * 0.06 + 'px',
            color: STYLES.colors.text,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
    }).setOrigin(0.5);
    scene.completedRoundScreen.add(scene.completeInterRoundScore);
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
    scene.completedRoundScreen.add(scene.completeFinalScoreLabel);
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
    scene.completedRoundScreen.add(scene.completeFinalScoreValue);
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
    scene.completedRoundScreen.add(scene.completeNextGameLabel);
    scene.completeNextGameLabel.setVisible(false)

    scene.completeNextGameTime = scene.add.text(
        scene.game.scale.width * 0.75,
        scene.game.scale.height * 0.59,
        ``,
        {
            fontFamily: 'Poppins',
            fontSize: scene.scale.width * 0.06 + 'px',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center',
        }
    ).setOrigin(0.5);
    scene.completedRoundScreen.add(scene.completeNextGameTime);
    scene.completeNextGameTime.setVisible(false);

    scene.okButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.74,
        'Next Round',
        () => {
            if (scene.currentRound >= scene.allRounds.length - 1) {
                showStatsPopup(scene);
            } else {
                hideCompletedRoundScreen(scene);
                scene.isGameActive = true;
                scene.currentRound++;
                showCountdown(scene);
            }
        },
        STYLES.colors.playButtonBg,
        STYLES.colors.playButtonText,
        STYLES.colors.playButtonBorder
    );
    scene.completedRoundScreen.add(scene.okButton);

    scene.nextGameTimer.setOnUpdate((text) => {
        scene.completeNextGameTime.setText(text);
    });
}

// Export show/hide functions
export const showCompletedRoundScreen = (scene) => showScreen(scene, 'completedRoundScreen');
export const hideCompletedRoundScreen = (scene) => hideScreen(scene, 'completedRoundScreen');