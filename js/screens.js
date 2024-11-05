import { GameStorage, getGameStats} from './gameStorage.js';
import { showAuthModal, auth } from './auth.js';

// Common styling configurations
const STYLES = {
    fonts: {
        large: (scene) => `${scene.scale.width * 0.08}px Poppins`,
        medium: (scene) => `${scene.scale.width * 0.06}px Poppins`,
        small: (scene) => `${scene.scale.width * 0.04}px Poppins`
    },
    colors: {
        text: '#ffffff',
        buttonBg: '#4a4a4a',
        buttonHover: '#666666',
        overlay: 0x000000
    },
    padding: {
        button: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10
        }
    }
};

// Helper functions for common UI elements
function createOverlay(scene, container) {
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, STYLES.colors.overlay);
    bg.setOrigin(0);
    container.add(bg);
    return bg;
}

function createButton(scene, x, y, text, onClick) {
    const button = scene.add.text(x, y, text, {
        fontSize: scene.scale.width * 0.06 + 'px',
        fontFamily: 'Poppins',
        color: STYLES.colors.text,
        backgroundColor: STYLES.colors.buttonBg,
        padding: STYLES.padding.button
    }).setOrigin(0.5).setInteractive();

    button.on('pointerdown', onClick);
    return button;
}

function createText(scene, x, y, initialText = '') {
    return scene.add.text(x, y, initialText, {
        fontSize: scene.scale.width * 0.08 + 'px',
        color: STYLES.colors.text,
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
}

function createScreen(scene, name) {
    const screen = scene.add.container(0, 0);
    screen.setDepth(1000);
    createOverlay(scene, screen);
    screen.setVisible(false);
    return screen;
}

// Screen management functions
function showScreen(scene, screenName) {
    scene[screenName].setVisible(true);
    window.hideGameElements(scene);
    
    // Hide ad container
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'none';
    }

    // Hide auth elements (both Phaser DOM element and HTML container)
    if (scene.authDOMElement) {  // Store this reference when creating auth UI
        scene.authDOMElement.setVisible(false);
    }
}

function hideScreen(scene, screenName) {
    scene[screenName].setVisible(false);
    window.showGameElements(scene);
    
    // Show ad container
    const adContainer = document.getElementById('ad-container');
    if (adContainer) {
        adContainer.style.display = 'flex';
    }

    // Show auth elements
    if (scene.authDOMElement) {
        scene.authDOMElement.setVisible(true);
    }
}

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

export function createQuestionMarkPopup(scene, triggerImage) {
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height * 0.45);
    popup.setVisible(false);
    popup.setDepth(1000);

    const popupWidth = scene.scale.width * 0.6;
    const popupHeight = scene.scale.height * 0.5;
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background
    const background = scene.add.graphics();
    background.fillStyle(STYLES.colors.overlay, 0.9);
    background.fillRoundedRect(-halfWidth, -halfHeight, popupWidth, popupHeight, 20);
    popup.add(background);

    // Add text
    const text = scene.add.text(0, -halfHeight * 0.7, 'Hello World', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text
    }).setOrigin(0.5);
    popup.add(text);

    // Create button
    const buttonWidth = scene.scale.width * 0.1;
    const buttonHeight = scene.scale.height * 0.06;
    const button = scene.add.rectangle(0, halfHeight * 0.5, buttonWidth, buttonHeight, STYLES.colors.buttonBg)
        .setInteractive();
    
    const buttonText = scene.add.text(0, halfHeight * 0.5, 'OK', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text
    }).setOrigin(0.5);

    // Add event handlers
    triggerImage.on('pointerdown', () => popup.setVisible(true));
    button.on('pointerdown', () => popup.setVisible(false));
    button.on('pointerover', () => button.setFillStyle(STYLES.colors.buttonHover));
    button.on('pointerout', () => button.setFillStyle(STYLES.colors.buttonBg));

    popup.add(button);
    popup.add(buttonText);
}

export async function createStatsPopup(scene, chartGraphics) {
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height * 0.50);
    popup.setVisible(false);
    popup.setDepth(1000);

    const popupWidth = scene.scale.width * 0.75;
    const popupHeight = scene.scale.height * 0.6;
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background
    const background = scene.add.graphics();
    background.fillStyle(STYLES.colors.overlay, 0.9);
    background.fillRoundedRect(-halfWidth, -halfHeight, popupWidth, popupHeight, 20);
    popup.add(background);

    // Add title text
    const titleText = scene.add.text(0, -halfHeight * 0.8, 'Your progress', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text
    }).setOrigin(0.5);
    popup.add(titleText);

    // Create container for progress circles
    const circlesContainer = scene.add.container(0, -halfHeight * 0.3);
    popup.add(circlesContainer);

    const statsText = scene.add.text(0, halfHeight * 0.1, 'Loading...', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text,
        align: 'center',
        lineSpacing: 10  // Add some spacing between lines
    }).setOrigin(0.5);
    popup.add(statsText);

    // Button to close the popup
    const buttonWidth = scene.scale.width * 0.1;
    const buttonHeight = scene.scale.height * 0.06;
    const button = scene.add.rectangle(0, halfHeight * 0.5, buttonWidth, buttonHeight, STYLES.colors.buttonBg)
        .setInteractive();
    const buttonText = scene.add.text(0, halfHeight * 0.5, 'OK', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text
    }).setOrigin(0.5);

    popup.add(button);
    popup.add(buttonText);

    // Function to get border color based on topics guessed
    const getBorderColor = (topicsGuessed) => {
        if (topicsGuessed >= 9) return 0x00FF00;  // Thick green
        if (topicsGuessed >= 6) return 0x90EE90;  // Light green
        if (topicsGuessed >= 3) return 0xFFA500;  // Orange
        if (topicsGuessed >= 1) return 0xFF0000;  // Red
        return 0x8B0000;  // Dark red
    };

    // Modified createProgressCircles function with proper cleanup
    const createProgressCircles = (sessions) => {
        // First destroy all existing objects
        circlesContainer.list.forEach(child => {
            child.destroy();
        });
        circlesContainer.removeAll();
    
        const circleRadius = 75;
        const spacing = 140;
        const startX = -(spacing * (sessions.length - 1)) / 2;
    
        sessions.forEach((session, index) => {
            const x = startX + (index * spacing);
            
            // Create circle background
            const circle = scene.add.graphics();
            circle.lineStyle(10, getBorderColor(session.totalTopicsGuessed));
            circle.fillStyle(0xFFFFFF);
            circle.fillCircle(x, 0, circleRadius);
            circle.strokeCircle(x, 0, circleRadius);
            
            const date = new Date(session.date);
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    
            const dayText = scene.add.text(x, -13, day, {
                font: STYLES.fonts.small(scene),
                fill: '#000000',
                fontSize: '18px'
            }).setOrigin(0.5);
    
            const monthText = scene.add.text(x, 28, month, {
                font: STYLES.fonts.small(scene),
                fill: '#000000',
                fontSize: '14px'
            }).setOrigin(0.5);
    
            // Add all elements to the container
            circlesContainer.add([circle, dayText, monthText]);
        });
    };
    
    const cleanupPopup = () => {
        circlesContainer.list.forEach(child => {
            child.destroy();
        });
        circlesContainer.removeAll();
        statsText.setText('Loading...');
    };

    // Event handlers for button and chartGraphics
    chartGraphics.on('pointerdown', async () => {
        cleanupPopup();
        popup.setVisible(true);

        // Load and display game stats if logged in
        if (auth.currentUser) {
            const stats = await getGameStats(auth.currentUser.uid);
            if (stats) {
                // Create progress circles
                createProgressCircles(stats.recentSessions);

                // Update stats text
                statsText.setText([
                    `Total Games Played: ${stats.totalGamesPlayed}`,
                    `Average # Topics Guessed: ${stats.averageTopicsGuessed}`,
                    `Last Played: ${stats.lastPlayed ? stats.lastPlayed.toDateString() : 'N/A'}`
                ]);
            } else {
                statsText.setText('Error loading stats.');
            }
        } else {
            statsText.setText('Please log in to view your stats.');
        }
    });

    button.on('pointerdown', () => {
        cleanupPopup();
        popup.setVisible(false);
    });
    button.on('pointerover', () => button.setFillStyle(STYLES.colors.buttonHover));
    button.on('pointerout', () => button.setFillStyle(STYLES.colors.buttonBg));
}


export function createDailyLimitScreen(scene) {
    const screen = scene.add.container(0, 0);
    screen.setDepth(1000);
    screen.setVisible(false);

    // Create semi-transparent background
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, 0x000000, 0.8);
    bg.setOrigin(0);
    screen.add(bg);

    // Create title text
    const titleText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.35, "Thanks for Playing!", {
        fontSize: scene.scale.width * 0.08 + 'px',
        fontFamily: 'Poppins',
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);
    screen.add(titleText);

    // Create message text
    const messageText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.45, 
        "Great job on today's puzzle!\nCome back tomorrow for a new challenge!", {
        fontSize: scene.scale.width * 0.04 + 'px',
        fontFamily: 'Poppins',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
    }).setOrigin(0.5);
    screen.add(messageText);

    // Create countdown text
    const countdownText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.55, "", {
        fontSize: scene.scale.width * 0.035 + 'px',
        fontFamily: 'Poppins',
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);
    screen.add(countdownText);

    // Update countdown timer
    let countdownInterval;
    function updateCountdown() {
        const now = new Date();
        const nextPlay = GameStorage.getNextPlayTime();
        const diff = nextPlay - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownText.setText(
            `Next puzzle available in:\n${hours}h ${minutes}m ${seconds}s`
        );
    }

    scene.dailyLimitScreen = screen;

    return {
        show: () => {
            screen.setVisible(true);
            updateCountdown();
            countdownInterval = setInterval(updateCountdown, 1000);
            
            // Hide ad container if it exists
            const adContainer = document.getElementById('ad-container');
            if (adContainer) {
                adContainer.style.display = 'none';
            }

            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(false);
            }
        },
        hide: () => {
            screen.setVisible(false);
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Show ad container if it exists
            const adContainer = document.getElementById('ad-container');
            if (adContainer) {
                adContainer.style.display = 'flex';
            }

            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(true);
            }
        }
    };
}

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

// Export show/hide functions
export const showInterRoundScreen = (scene) => showScreen(scene, 'interRoundScreen');
export const hideInterRoundScreen = (scene) => hideScreen(scene, 'interRoundScreen');

export const showFailureEndScreen = (scene) => {
    scene.failureScoreText.setText(`Try Again tomorrow!\n\nYour Score: ${scene.score}`);
    showScreen(scene, 'failureEndScreen');
};
export const hideFailureEndScreen = (scene) => hideScreen(scene, 'failureEndScreen');

export const showWelcomeScreen = (scene) => showScreen(scene, 'welcomeScreen');
export const hideWelcomeScreen = (scene) => hideScreen(scene, 'welcomeScreen');

