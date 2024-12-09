import { createScreen, createText, createButton, hideScreen, showScreen, STYLES } from './helpers.js';

// Main screen creation functions
export function createCompleteScreen(scene) {
    scene.completeScreen = createScreen(scene, 'completeScreen');

    scene.completeScoreText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.35
    );
    scene.completeScreen.add(scene.completeScoreText);

    scene.okButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.74,
        'Next Round',
        () => {
            hideCompleteScreen(scene);
            window.startNextRound(scene);
        },
        STYLES.colors.loginButtonBg,
        STYLES.colors.loginButtonText,
        STYLES.colors.loginButtonBorder
    );
    scene.completeScreen.add(scene.okButton);
}

// Export show/hide functions
export const showCompleteScreen = (scene) => showScreen(scene, 'completeScreen');
export const hideCompleteScreen = (scene) => hideScreen(scene, 'completeScreen');