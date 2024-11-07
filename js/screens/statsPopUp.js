import { getGameStats } from '../gameStorage.js';
import { showAuthModal, auth } from '../auth.js';
import { createButton, STYLES } from './helpers.js';

export async function createStatsPopup(scene, chartGraphics) {
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height * 0.50);
    popup.setVisible(false);
    popup.setDepth(1000);

    const popupWidth = scene.scale.width * 0.75;
    const popupHeight = scene.scale.height * 0.6;
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background
    const background = createBackground(scene, popupWidth, popupHeight, halfWidth, halfHeight);
    popup.add(background);

    // Create close button
    const closeButtonContainer = createCloseButtonContainer(scene, halfWidth, halfHeight);
    popup.add(closeButtonContainer);

    // Add title text
    const titleText = scene.add.text(0, -halfHeight * 0.8, auth.currentUser ? 'Your progress' : 'Want to start tracking\nyour stats and streaks?', {
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
        lineSpacing: 10
    }).setOrigin(0.5);
    popup.add(statsText);

    // Create signup button
    const { signupButton, signupButtonText } = createSignupButton(scene, popupWidth, halfHeight);
    popup.add(signupButton);
    popup.add(signupButtonText);

    // Initially hide signup button
    signupButton.setVisible(false);
    signupButtonText.setVisible(false);

    // Set up event handlers
    setupChartGraphicsHandler(chartGraphics, popup, statsText, signupButton, signupButtonText, circlesContainer, scene);
    setupCloseButtonHandler(closeButtonContainer, popup, circlesContainer, statsText, signupButton, signupButtonText);
    setupSignupButtonHandlers(signupButton, popup, signupButtonText, circlesContainer, statsText, scene);
}

// Helper function to create the background
function createBackground(scene, popupWidth, popupHeight, halfWidth, halfHeight) {
    const background = scene.add.graphics();
    background.fillStyle(STYLES.colors.overlay, 0.9);
    background.fillRoundedRect(-halfWidth, -halfHeight, popupWidth, popupHeight, 20);
    return background;
}

// Helper function to create the close button container
function createCloseButtonContainer(scene, halfWidth, halfHeight) {
    // Adjust the position for the larger close button
    const closeButtonContainer = scene.add.container(halfWidth - 50, -halfHeight + 50);

    // Create a larger, thicker, white close cross
    const closeButton = scene.add.graphics();
    closeButton.lineStyle(8, 0xFFFFFF); // Even thicker line (8) and white color
    closeButton.beginPath();
    closeButton.moveTo(-15, -15); // Larger cross
    closeButton.lineTo(15, 15);
    closeButton.moveTo(15, -15);
    closeButton.lineTo(-15, 15);
    closeButton.closePath();
    closeButton.strokePath();

    // Define the close button hit area with a larger clickable area
    const closeButtonHitArea = scene.add.rectangle(0, 0, 50, 50); // Increased size to 50x50 for easier clicking
    closeButtonHitArea.setInteractive({ useHandCursor: true });

    // Add closeButton and hit area to the container
    closeButtonContainer.add([closeButton, closeButtonHitArea]);

    return closeButtonContainer;
}

function createSignupButton(scene, popupWidth, halfHeight) {
    const signupButton = scene.add.rectangle(0, halfHeight * 0.5, popupWidth * 0.8, scene.scale.height * 0.07, 0x167D60)
        .setInteractive();
    const signupButtonText = scene.add.text(0, halfHeight * 0.5, 'Create a free account', {
        font: STYLES.fonts.small(scene),
        fill: '#FFFFFF'  // White color
    }).setOrigin(0.5);
    return { signupButton, signupButtonText };
}

// Helper function to create progress circles
function createProgressCircles(sessions, scene, circlesContainer) {
    circlesContainer.removeAll(true);
    const circleRadius = 75;
    const spacing = 140;
    const startX = -(spacing * (sessions.length - 1)) / 2;

    sessions.forEach((session, index) => {
        const x = startX + (index * spacing);
        const circle = scene.add.graphics();
        circle.lineStyle(10, getBorderColor(session.totalTopicsGuessed));
        circle.fillStyle(0xFFFFFF);
        circle.fillCircle(x, 0, circleRadius);
        circle.strokeCircle(x, 0, circleRadius);
        const date = new Date(session.date);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
        const dayText = scene.add.text(x, -13, day, { font: STYLES.fonts.small(scene), fill: '#000000', fontSize: '18px' }).setOrigin(0.5);
        const monthText = scene.add.text(x, 28, month, { font: STYLES.fonts.small(scene), fill: '#000000', fontSize: '14px' }).setOrigin(0.5);
        circlesContainer.add([circle, dayText, monthText]);
    });
}

// Helper function to determine border color
function getBorderColor(topicsGuessed) {
    if (topicsGuessed >= 9) return 0x00FF00;
    if (topicsGuessed >= 6) return 0x90EE90;
    if (topicsGuessed >= 3) return 0xFFA500;
    if (topicsGuessed >= 1) return 0xFF0000;
    return 0x8B0000;
}

function setupChartGraphicsHandler(chartGraphics, popup, statsText, loginButton, loginButtonText, circlesContainer, scene) {
    chartGraphics.on('pointerdown', async () => {
        cleanupPopup(circlesContainer, statsText, loginButton, loginButtonText);
        popup.setVisible(true);

        // Update title text based on auth state
        const titleText = popup.list.find(item => item instanceof Phaser.GameObjects.Text 
            && (item.text === 'Your progress' || item.text.includes('Want to start tracking')));
        if (titleText) {
            titleText.setText(auth.currentUser ? 'Your progress' : 'Want to start tracking\nyour stats and streaks?');
        }

        if (auth.currentUser) {
            loginButton.setVisible(false);
            loginButtonText.setVisible(false);
            const stats = await getGameStats(auth.currentUser.uid);
            if (stats) {
                createProgressCircles(stats.recentSessions, scene, circlesContainer);
                statsText.setText([
                    `Total Games Played: ${stats.totalGamesPlayed}`,
                    `Average # Topics Guessed: ${stats.averageTopicsGuessed}`,
                    `Last Played: ${stats.lastPlayed ? stats.lastPlayed.toDateString() : 'N/A'}`
                ]);
            } else {
                statsText.setText('Error loading stats.');
            }
        } else {
            statsText.setText('-');
            loginButton.setVisible(true);
            loginButtonText.setVisible(true);
        }
    });
}

// Event handler for close button
function setupCloseButtonHandler(closeButtonContainer, popup, circlesContainer, statsText, loginButton, loginButtonText) {
    const closeButtonHitArea = closeButtonContainer.list[1]; // Ensure you are targeting the rectangle hit area

    closeButtonHitArea.on('pointerdown', () => {
        // Clean up and hide popup
        cleanupPopup(circlesContainer, statsText, loginButton, loginButtonText);
        popup.setVisible(false);
    });
}

function setupSignupButtonHandlers(signupButton, popup, signupButtonText, circlesContainer, statsText, scene) {
    signupButton.on('pointerdown', async () => {
        popup.setVisible(false);
        await showAuthModal('signup');
        if (auth.currentUser) {
            popup.setVisible(true);
            const stats = await getGameStats(auth.currentUser.uid);
            if (stats) {
                createProgressCircles(stats.recentSessions, scene, circlesContainer);
                statsText.setText([
                    `Total Games Played: ${stats.totalGamesPlayed}`,
                    `Average # Topics Guessed: ${stats.averageTopicsGuessed}`,
                    `Last Played: ${stats.lastPlayed ? stats.lastPlayed.toDateString() : 'N/A'}`
                ]);
            }
        }
    });
}

// Helper function to clean up popup content
function cleanupPopup(circlesContainer, statsText, loginButton, loginButtonText) {
    circlesContainer.list.forEach(child => {
        child.destroy();
    });
    circlesContainer.removeAll(true);
    statsText.setText('Loading...');
    loginButton.setVisible(false);
    loginButtonText.setVisible(false);
}
