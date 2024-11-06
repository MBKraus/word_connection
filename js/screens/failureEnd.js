import {showScreen, hideScreen, createText, createScreen, createButton} from './helpers.js';

export function createFailureEndScreen(scene) {
    scene.failureEndScreen = createScreen(scene, 'failureEndScreen');

    scene.failureScoreText = createText(
        scene,
        scene.game.scale.width * 0.5,
        scene.game.scale.height * 0.4
    );
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
    scene.failureScoreText.setText(`Try Again tomorrow!\n\nYour Score: ${scene.score}`);
    showScreen(scene, 'failureEndScreen');
};
export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');