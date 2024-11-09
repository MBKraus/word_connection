import { createScreen, createText, createButton, hideScreen, showScreen } from './helpers.js';

// Main screen creation functions
export function createInterRoundScreen(scene) {
    scene.interRoundScreen = createScreen(scene, 'interRoundScreen');

    scene.interRoundScoreText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.4
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
        }
    );
    scene.interRoundScreen.add(scene.okButton);
}

// Export show/hide functions
export const showInterRoundScreen = (scene) => showScreen(scene, 'interRoundScreen');
export const hideInterRoundScreen = (scene) => hideScreen(scene, 'interRoundScreen');