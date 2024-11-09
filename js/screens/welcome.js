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

    // Get the current date and format it
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);

    // Create the date text element
    const dateText = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.85, // Position below the login button
        formattedDate,
        {
            fontSize: scene.scale.width * 0.0375 + 'px', // Adjust font size to match other text
            fontFamily: 'Poppins',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center'
        }
    ).setOrigin(0.5);
    scene.welcomeScreen.add(dateText);

    // Game number
    const gameNumber = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.88, // Position below the login button
        "# 1",
        {
            fontSize: scene.scale.width * 0.0355 + 'px', // Adjust font size to match other text
            fontFamily: 'Poppins',
            color: STYLES.colors.text,
            align: 'center'
        }
    ).setOrigin(0.5);
    scene.welcomeScreen.add(gameNumber);


    return {
        show: () => showScreen(scene, 'welcomeScreen'),
        hide: () => hideScreen(scene, 'welcomeScreen')
    };
}

export const showWelcomeScreen = (scene) => showScreen(scene, 'welcomeScreen');
export const hideWelcomeScreen = (scene) => hideScreen(scene, 'welcomeScreen');