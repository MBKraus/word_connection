import { createScreen, showScreen, hideScreen, createButton, createText, STYLES } from './helpers.js';
import { showAuthModal, auth } from '../auth.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

export function createWelcomeScreen(scene) {
    // Store scene reference for auth callbacks
    window.gameScene = scene;
    
    scene.welcomeScreen = createScreen(scene, 'welcomeScreen', true);

    const titleText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.25,
        'Word Connection'
    );
    scene.welcomeScreen.add(titleText);

    const explainerText = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.35,
        'Can you crack the 3 secret themes?',
        {
            fontSize: scene.scale.width * 0.047 + 'px',
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
        scene.scale.height * 0.50,
        'Play',
        () => {
            hideScreen(scene, 'welcomeScreen');
            window.startGame(scene);
        },
        STYLES.colors.playButtonBg,
        STYLES.colors.playButtonText,
        STYLES.colors.playButtonBorder,
        170,
        170,
        33,
        33
    );
    scene.welcomeScreen.add(playButton);
    
    const loginButton = createButton(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.59,
        'Login',
        () => {
            showAuthModal();
        },
        STYLES.colors.loginButtonBg,
        STYLES.colors.loginButtonText,
        STYLES.colors.loginButtonBorder,
        143,
        143,
        30,
        30
    );
    scene.welcomeScreen.add(loginButton);
    loginButton.setVisible(false); // Initially hidden

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginButton.setVisible(false);
        } else {
            loginButton.setVisible(true);
        }
    });

    // Date and game number
    const date = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);

    const dateText = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.75,
        formattedDate,
        {
            fontSize: scene.scale.width * 0.045 + 'px',
            fontFamily: 'Poppins',
            fontWeight: 'bold',
            color: STYLES.colors.text,
            align: 'center'
        }
    ).setOrigin(0.5);
    scene.welcomeScreen.add(dateText);

    const gameNumber = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.78,
        "# 1",
        {
            fontSize: scene.scale.width * 0.045 + 'px',
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
