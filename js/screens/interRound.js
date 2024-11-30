import { createScreen, createText, createButton, hideScreen, showScreen, STYLES } from './helpers.js';

// Main screen creation functions
export function createInterRoundScreen(scene) {
    scene.interRoundScreen = createScreen(scene, 'interRoundScreen');

    scene.interRoundScoreText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.35
    );
    scene.interRoundScreen.add(scene.interRoundScoreText);

    scene.okButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.74,
        'Next Round',
        () => {
            hideScreen(scene, 'interRoundScreen');
            window.startNextRound(scene);
        },
        STYLES.colors.loginButtonBg,
        STYLES.colors.loginButtonText,
        STYLES.colors.loginButtonBorder
    );
    scene.interRoundScreen.add(scene.okButton);
}

// Export show/hide functions
export const showInterRoundScreen = (scene) => showScreen(scene, 'interRoundScreen');
export const hideInterRoundScreen = (scene) => hideScreen(scene, 'interRoundScreen');