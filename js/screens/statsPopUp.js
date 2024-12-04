import { fetchGameStats } from '../gameStorage.js';
import { showAuthModal, auth } from '../auth.js';
import { createButton, STYLES } from './helpers.js';
import { pauseTimer, resumeTimer } from '../timer.js';

export async function createStatsPopup(scene, chartGraphics) {
    // Make the popup container cover the entire screen
    const popup = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    popup.setVisible(false);
    popup.setDepth(1000);

    // Set popup width and height to cover entire screen
    const popupWidth = scene.scale.width;
    const popupHeight = scene.scale.height;
    const halfWidth = popupWidth / 2;
    const halfHeight = popupHeight / 2;

    // Create background
    const background = createBackground(scene, popupWidth, popupHeight, halfWidth, halfHeight);
    popup.add(background);

    // Create close button
    const closeButtonContainer = createCloseButtonContainer(scene, halfWidth, halfHeight);
    popup.add(closeButtonContainer);

    // Add title text
    const titleText = scene.add.text(0, -halfHeight * 0.70, auth.currentUser ? 'Your progress' : 'Want to start tracking\nyour stats and streaks?', {
        font: STYLES.fonts.medium(scene),
        fill: '#000000',
    }).setOrigin(0.5);
    popup.add(titleText);

    // Create container for progress circles
    const circlesContainer = scene.add.container(0, -halfHeight * 0.45);
    popup.add(circlesContainer);

    const statsText = scene.add.text(0, -halfHeight * 0.02, 'Loading...', {
        font: STYLES.fonts.small(scene),
        fill: STYLES.colors.text,
        align: 'center',
        lineSpacing: 10
    }).setOrigin(0.5);
    popup.add(statsText);

    // Create signup button
    const { signupButton, signupButtonText, graphics } = createSignupButton(scene, popupWidth, halfHeight);
    popup.add(graphics);
    popup.add(signupButton);
    popup.add(signupButtonText);
    // Initially hide signup button
    signupButton.setVisible(false);
    signupButtonText.setVisible(false);
    graphics.setVisible(false);

    // Set up event handlers
    setupChartGraphicsHandler(chartGraphics, popup, statsText, signupButton, signupButtonText, graphics, circlesContainer, scene);
    setupCloseButtonHandler(scene, closeButtonContainer, popup, circlesContainer, statsText, signupButton, signupButtonText, graphics);
    setupSignupButtonHandlers(signupButton, popup, signupButtonText, graphics, circlesContainer, statsText, scene);
}

// Helper function to create the background
function createBackground(scene, popupWidth, popupHeight, halfWidth, halfHeight) {
    const background = scene.add.graphics();
    background.fillStyle(STYLES.colors.overlay, 1);
    background.fillRect(-halfWidth, -halfHeight, popupWidth, popupHeight); // Fullscreen rectangle
    return background;
}

// Helper function to create the close button container
function createCloseButtonContainer(scene, halfWidth, halfHeight) {
    const closeButtonContainer = scene.add.container(halfWidth - 50, -halfHeight * 0.75);

    // Create a larger, thicker, black close cross
    const closeButton = scene.add.graphics();
    closeButton.lineStyle(8, 0x000000); // Black color for the cross
    closeButton.beginPath();
    closeButton.moveTo(-15, -15); // Larger cross
    closeButton.lineTo(15, 15);
    closeButton.moveTo(15, -15);
    closeButton.lineTo(-15, 15);
    closeButton.closePath();
    closeButton.strokePath();

    // Define the close button hit area with a larger clickable area
    const closeButtonHitArea = scene.add.rectangle(0, 0, 50, 50);
    closeButtonHitArea.setInteractive({ useHandCursor: true });

    // Add closeButton and hit area to the container
    closeButtonContainer.add([closeButton, closeButtonHitArea]);

    return closeButtonContainer;
}

function createSignupButton(scene, popupWidth, halfHeight) {
    const graphics = scene.add.graphics();
    const textWidth = popupWidth * 0.8;
    const textHeight = scene.scale.height * 0.07;
    const yPos = scene.scale.height * -0.1;

    const drawButton = (graphics, fillColor, borderCol) => {
        graphics.clear();
        graphics.lineStyle(6, parseInt(borderCol.replace('#', ''), 16));
        graphics.fillStyle(parseInt(fillColor.replace('#', ''), 16));

        const radius = STYLES.borderRadius.sides;
        const halfWidth = textWidth / 2;
        const buttonHalfHeight = textHeight / 2;

        graphics.beginPath();
        graphics.moveTo(-halfWidth + radius, -buttonHalfHeight);
        graphics.lineTo(halfWidth - radius, -buttonHalfHeight);
        graphics.arc(halfWidth - radius, -buttonHalfHeight + radius, radius, -Math.PI/2, 0);
        graphics.lineTo(halfWidth, buttonHalfHeight - radius);
        graphics.arc(halfWidth - radius, buttonHalfHeight - radius, radius, 0, Math.PI/2);
        graphics.lineTo(-halfWidth + radius, buttonHalfHeight);
        graphics.arc(-halfWidth + radius, buttonHalfHeight - radius, radius, Math.PI/2, Math.PI);
        graphics.lineTo(-halfWidth, -buttonHalfHeight + radius);
        graphics.arc(-halfWidth + radius, -buttonHalfHeight + radius, radius, Math.PI, -Math.PI/2);
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    };

    // Create the hitbox for interactions
    const signupButton = scene.add.rectangle(0, yPos, textWidth, textHeight)
        .setInteractive()
        .setOrigin(0.5);

    // Create the button text
    const signupButtonText = scene.add.text(0, yPos, 'Create a free account', {
        fontSize: scene.scale.width * 0.04 + 'px',
        fontFamily: 'Poppins',
        color: STYLES.colors.playButtonText
    }).setOrigin(0.5);

    // Position graphics at the same position as the button
    graphics.setPosition(0, yPos);

    // Initial button draw
    drawButton(graphics, STYLES.colors.playButtonBg, STYLES.colors.playButtonBorder);

    // Add hover effects to the hitbox
    signupButton
        .on('pointerover', () => {
            drawButton(graphics, STYLES.colors.buttonHover, STYLES.colors.playButtonBorder);
        })
        .on('pointerout', () => {
            drawButton(graphics, STYLES.colors.playButtonBg, STYLES.colors.playButtonBorder);
        });

    // Initially hide all elements
    signupButton.setVisible(false);
    signupButtonText.setVisible(false);
    graphics.setVisible(false);

    return { signupButton, signupButtonText, graphics };
}

// Helper function to create progress circles
export function createProgressCircles(sessions, scene, circlesContainer) {
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
export function getBorderColor(topicsGuessed) {
    if (topicsGuessed >= 6) return 0x9bcf53; // Light Green
    if (topicsGuessed >= 3) return 0xFFA500; // Orange 
    if (topicsGuessed >= 1) return 0x8B0000; // Dark Red 
    return 0x8B0000;                         // Dark Red 
}

function setupChartGraphicsHandler(chartGraphics, popup, statsText, signupButton, signupButtonText, graphics, circlesContainer, scene) {
    chartGraphics.on('pointerdown', async () => {
        cleanupPopup(circlesContainer, statsText, signupButton, signupButtonText, graphics);
        popup.setVisible(true);
        
        pauseTimer(scene);

        const titleText = popup.list.find(item => item instanceof Phaser.GameObjects.Text 
            && (item.text === 'Your progress' || item.text.includes('Want to start tracking')));
        if (titleText) {
            titleText.setText(auth.currentUser ? 'Your progress' : 'Want to start tracking\nyour stats and streaks?');
        }

        if (auth.currentUser) {
            signupButton.setVisible(false);
            signupButtonText.setVisible(false);
            graphics.setVisible(false);
            const stats = await fetchGameStats(auth.currentUser.uid);
            if (stats) {
                createProgressCircles(stats.recentSessions, scene, circlesContainer);
                statsText.setText([
                    `Current Streak (# of days): ${stats.currentStreak}`,
                    `Longest Streak (# of days): ${stats.longestStreak}`,
                    ``,
                    `Daily Average Score: ${stats.averageScore}`,
                    `Daily Average # Topics Guessed: ${stats.averageTopicsGuessed}`,
                    ``,
                    `Total Games Played: ${stats.totalGamesPlayed}`,
                    `Last Played: ${stats.lastPlayed ? stats.lastPlayed.toDateString() : 'N/A'}`
                ]);
            } else {
                statsText.setText('Error loading stats.');
            }
        } else {
            statsText.setText('');
            signupButton.setVisible(true);
            signupButtonText.setVisible(true);
            graphics.setVisible(true);
        }
    });
}

// Event handler for close button
function setupCloseButtonHandler(scene, closeButtonContainer, popup, circlesContainer, statsText, signupButton, signupButtonText, graphics) {
    const closeButtonHitArea = closeButtonContainer.list[1];

    closeButtonHitArea.on('pointerdown', () => {
        cleanupPopup(circlesContainer, statsText, signupButton, signupButtonText, graphics);
        popup.setVisible(false);
        
        // Resume the timer when closing the popup
        resumeTimer(scene);
    });
}


function setupSignupButtonHandlers(signupButton, popup, signupButtonText, graphics, circlesContainer, statsText, scene) {
    signupButton.on('pointerdown', async () => {
        popup.setVisible(false);
        // Resume timer when hiding popup for auth
        resumeTimer(scene);
        
        await showAuthModal('signup');
        if (auth.currentUser) {
            popup.setVisible(true);
            // Pause timer again if showing stats after auth
            pauseTimer(scene);
            
            signupButton.setVisible(false);
            signupButtonText.setVisible(false);
            graphics.setVisible(false);
            const stats = await fetchGameStats(auth.currentUser.uid);
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

function cleanupPopup(circlesContainer, statsText, signupButton, signupButtonText, graphics) {
    circlesContainer.list.forEach(child => {
        child.destroy();
    });
    circlesContainer.removeAll(true);
    statsText.setText('Loading...');
    signupButton.setVisible(false);
    signupButtonText.setVisible(false);
    graphics.setVisible(false);
}