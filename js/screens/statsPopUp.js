import { fetchGameStats } from '../gameStorage.js';
import { showAuthModal, auth } from '../auth.js';
import { createButton, STYLES } from './helpers.js';
import { pauseTimer, resumeTimer } from '../timer.js';
import { createLogo } from '../uiComponents.js';

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

    const logoWidth = scene.scale.width * 0.3;
    const logoHeight = logoWidth;
    const logoYPosition = -halfHeight * 0.95;
    const logoXPosition = -0.22;
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
    popup.add(logo);

    // Create close button
    const closeButtonContainer = createCloseButtonContainer(scene, halfWidth, halfHeight);
    popup.add(closeButtonContainer);

    // Add title text
    const titleText = scene.add.text(0, -halfHeight * 0.55, auth.currentUser 
        ? 'Statistics' 
        : 'Create an account to start tracking your streaks,\npoints and number of games played!', {
            fontSize: scene.scale.width * 0.035 + 'px',
            fontFamily: 'Poppins Light',
            fontWeight: '300',
            fill: '#000000',
            align: 'center', // Center the text alignment
            wordWrap: { width: scene.scale.width * 0.9 }, // Wrap text within 80% of the screen width
        }).setOrigin(0.5); // Center the text origin
    popup.add(titleText);

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
    setupChartGraphicsHandler(chartGraphics, popup, statsText, signupButton, signupButtonText, graphics, halfHeight, popupWidth, scene);
    setupCloseButtonHandler(scene, closeButtonContainer, popup, statsText, signupButton, signupButtonText, graphics);
    setupSignupButtonHandlers(signupButton, popup, signupButtonText, graphics, statsText, scene);


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
    const closeButtonContainer = scene.add.container(halfWidth - 50, -halfHeight * 0.95);

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
    const textWidth = popupWidth * 0.5;
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
        fontSize: scene.scale.width * 0.03 + 'px',
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


function createMetricsContainer(scene, stats, popupWidth, halfHeight, type, alignTo) {
    const isTop = type === 'top';
    const metrics = isTop ? [
        { label: 'Played', value: stats.totalGamesPlayed },
        { label: 'Average Score', value: stats.averageScore },
        { label: 'Avg Topics Guessed', value: stats.averageTopicsGuessed },
    ] : [
        { label: 'Current Streak', value: stats.currentStreak },
        { label: 'Longest Streak', value: stats.longestStreak },
    ];

    // Create the container for the metrics
    const container = scene.add.container(0, isTop ? -halfHeight * 0.35 : -halfHeight * 0.10);
    const segmentWidth = popupWidth / metrics.length;

    metrics.forEach((metric, index) => {
        // Calculate position to center metrics
        const metricX = alignTo
            ? alignTo.list[index].x // Use the horizontal alignment from the top metrics
            : (index - (metrics.length - 1) / 2) * segmentWidth;

        const metricContainer = scene.add.container(metricX, 0);

        const valueText = scene.add.text(0, -25, metric.value, { // Slightly smaller offset
            fontSize: scene.scale.width * 0.07 + 'px',
            fontFamily: 'Poppins',
            color: '#000000',
        }).setOrigin(0.5);
        
        const labelText = scene.add.text(0, 45, metric.label, { // Slightly smaller offset
            fontSize: scene.scale.width * 0.03 + 'px',
            fontFamily: 'Poppins Light',
            color: '#555555',
        }).setOrigin(0.5);
        
        metricContainer.add([valueText, labelText]);
        container.add(metricContainer);
    });

    return container;
}

function createLastPlayedText(scene, stats, halfHeight) {
    const lastPlayedFormatted = stats.lastPlayed
        ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: '2-digit' }).format(stats.lastPlayed)
        : 'N/A';

    const lastPlayedText = scene.add.text(0, halfHeight * 0.14, `Last played\n${lastPlayedFormatted}`, {
        fontSize: scene.scale.width * 0.03 + 'px',
        fontFamily: 'Poppins Light',
        align: 'center',
        color: '#555555',
    }).setOrigin(0.5);

    return lastPlayedText;
}

function setupChartGraphicsHandler(chartGraphics, popup, statsText, signupButton, signupButtonText, graphics, halfHeight, popupWidth, scene) {
    chartGraphics.on('pointerdown', async () => {
        // Remove any existing metrics containers
        const existingTopMetrics = popup.list.find(item => 
            item.name === 'topMetricsContainer');
        const existingStreakMetrics = popup.list.find(item => 
            item.name === 'streakMetricsContainer');
        const existingLastPlayedText = popup.list.find(item => 
            item.name === 'lastPlayedText');

        if (existingTopMetrics) popup.remove(existingTopMetrics);
        if (existingStreakMetrics) popup.remove(existingStreakMetrics);
        if (existingLastPlayedText) popup.remove(existingLastPlayedText);

        cleanupPopup(statsText, signupButton, signupButtonText, graphics, popup);
        popup.setVisible(true);
    
        pauseTimer(scene);
    
        const titleText = popup.list.find(item => item instanceof Phaser.GameObjects.Text 
            && (item.text === 'Statistics' || item.text.includes('Want to start tracking')));
        
        if (titleText) {
            titleText.setText(auth.currentUser ? 'Statistics' : 'Want to start tracking\nyour stats and streaks?');
        }
    
        if (auth.currentUser) {
            signupButton.setVisible(false);
            signupButtonText.setVisible(false);
            graphics.setVisible(false);
    
            const stats = await fetchGameStats(auth.currentUser.uid);
            if (stats) {
                statsText.setText('');
    
                const topMetricsContainer = createMetricsContainer(scene, stats, popupWidth, halfHeight, 'top');
                topMetricsContainer.name = 'topMetricsContainer';
                popup.add(topMetricsContainer);
                
                const streakMetricsContainer = createMetricsContainer(scene, stats, popupWidth, halfHeight, 'streak', topMetricsContainer);
                streakMetricsContainer.name = 'streakMetricsContainer';
                popup.add(streakMetricsContainer);

                const lastPlayedText = createLastPlayedText(scene, stats, halfHeight);
                lastPlayedText.name = 'lastPlayedText';
                popup.add(lastPlayedText);

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
function setupCloseButtonHandler(scene, closeButtonContainer, popup, statsText, signupButton, signupButtonText, graphics) {
    const closeButtonHitArea = closeButtonContainer.list[1];

    closeButtonHitArea.on('pointerdown', () => {
        cleanupPopup(statsText, signupButton, signupButtonText, graphics, popup);
        popup.setVisible(false);
        
        // Resume the timer when closing the popup
        resumeTimer(scene);
    });
}


function setupSignupButtonHandlers(signupButton, popup, signupButtonText, graphics, statsText, scene) {
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
                statsText.setText([
                    `Total Games Played: ${stats.totalGamesPlayed}`,
                    `Average # Topics Guessed: ${stats.averageTopicsGuessed}`,
                    `Last Played: ${stats.lastPlayed ? stats.lastPlayed.toDateString() : 'N/A'}`
                ]);
            }
        }
    });
}

function cleanupPopup(statsText, signupButton, signupButtonText, graphics, popup) {
    // Reset stats text
    statsText.setText('Loading...');

    // Hide and reset signup button elements
    signupButton.setVisible(false);
    signupButtonText.setVisible(false);
    graphics.setVisible(false);

    // Helper function to remove and destroy elements by name
    const removeElementByName = (name) => {
        const element = popup.list.find(item => item.name === name);
        if (element) {
            popup.remove(element);
            element.destroy(); // Ensure the element is fully removed
        }
    };

    // Remove last played text if it exists
    removeElementByName('lastPlayedText');

    // Remove top and streak metrics containers
    removeElementByName('topMetricsContainer');
    removeElementByName('streakMetricsContainer');
}
