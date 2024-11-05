import { createScreen, showScreen, hideScreen, createButton, createText, STYLES } from './helpers.js';
import { showAuthModal} from '../auth.js';

export function createWelcomeScreen(scene) {
    // Store scene reference for auth callbacks
    window.gameScene = scene;
    
    scene.welcomeScreen = createScreen(scene, 'welcomeScreen');

    const titleText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.3,
        'Word Connection'
    );
    scene.welcomeScreen.add(titleText);

    const explainerText = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.45,
        'Uncover the hidden connections – can you crack the 3 secret themes?',
        {
            fontSize: scene.scale.width * 0.04 + 'px',
            fontFamily: 'Poppins',
            color: STYLES.colors.text,
            align: 'center',
            wordWrap: { width: scene.scale.width * 0.8 }
        }
    ).setOrigin(0.5);
    scene.welcomeScreen.add(explainerText);

    const playButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.65,
        'Play',
        () => {
            hideScreen(scene, 'welcomeScreen');
            startGame(scene);
        }
    );
    scene.welcomeScreen.add(playButton);

    const loginButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.75,
        'Login',
        () => {
            showAuthModal();
        }
    );
    scene.welcomeScreen.add(loginButton);

    return {
        show: () => showScreen(scene, 'welcomeScreen'),
        hide: () => hideScreen(scene, 'welcomeScreen')
    };
}

export const showWelcomeScreen = (scene) => showScreen(scene, 'welcomeScreen');
export const hideWelcomeScreen = (scene) => hideScreen(scene, 'welcomeScreen');