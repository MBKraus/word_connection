import { createScreen, showScreen, hideScreen, createButton, createText, STYLES } from './helpers.js';
import { showAuthModal} from '../auth.js';
import { createLogo } from '../uiComponents.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

export function createWelcomeScreen(scene) {

    scene.welcomeScreen = createScreen(scene, 'welcomeScreen', true);

    const logoWidth = scene.scale.width * 0.4;
    const logoHeight = logoWidth;
    const logoYPosition = scene.scale.height * 0.05;
    const logoXPosition = 0.5;
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
    scene.welcomeScreen.add(logo);

    const titleText = createText(
        scene,
        scene.scale.width * 0.5,
        scene.scale.height * 0.30,
        'Word Connections Game'
    );
    scene.welcomeScreen.add(titleText);

    const explainerText = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.35,
        'Can you crack the 3 secret themes?',
        {
            fontSize: scene.scale.width * 0.035 + 'px',
            fontFamily: 'Poppins Light',
            fontWeight: '300',
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
    loginButton.setVisible(false);

    // Set up cookie wall interactions
    setupCookieWallInteractions(scene, playButton, loginButton);

    // Listen for auth state changes
    onAuthStateChanged(window.auth, (user) => {
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
            fontSize: scene.scale.width * 0.04 + 'px',
            fontFamily: 'Poppins Light',
            color: STYLES.colors.text,
            align: 'center'
        }
    ).setOrigin(0.5);
    scene.welcomeScreen.add(dateText);

    return {
        show: () => showScreen(scene, 'welcomeScreen'),
        hide: () => hideScreen(scene, 'welcomeScreen')
    };
}

function setupCookieWallInteractions(scene, playButton, loginButton) {
    const checkCookieStatus = () => {
        const cookiewall = document.getElementById('cookiewall');
        const isVisible = cookiewall && cookiewall.style.display !== 'none';

        if (isVisible) {
            playButton.disableInteractive();
            loginButton.disableInteractive();
        } else {
            playButton.setInteractive();
            loginButton.setInteractive();
        }
    };

    // Initial check
    checkCookieStatus();

    // Add listeners for cookie acceptance and rejection
    window.addEventListener('cookiesAccepted', () => {
        playButton.setInteractive();
        loginButton.setInteractive();
    });

    window.addEventListener('cookiesRejected', () => {
        playButton.disableInteractive();
        loginButton.disableInteractive();
        // Optionally, you could add additional handling for rejected cookies
    });

    window.addEventListener('cookiesBlocking', () => {
        playButton.disableInteractive();
        loginButton.disableInteractive();
    });

    // Add a mutation observer to watch for cookiewall changes
    const observeCookiewall = () => {
        const cookiewall = document.getElementById('cookiewall');
        if (!cookiewall) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    checkCookieStatus();
                }
            });
        });

        observer.observe(cookiewall, { attributes: true });
    };

    observeCookiewall();
}

export const showWelcomeScreen = (scene) => showScreen(scene, 'welcomeScreen');
export const hideWelcomeScreen = (scene) => hideScreen(scene, 'welcomeScreen');
