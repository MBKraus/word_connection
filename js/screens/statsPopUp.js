import { fetchGameStats } from '../gameStorage.js';
import { showAuthModal, auth } from '../auth.js';
import { STYLES } from './helpers.js';
import { pauseTimer, resumeTimer } from '../timer.js';
import { createLogo } from '../uiComponents.js';

export async function createStatsPopup(scene) {
    // Make the popup container cover the entire screen
    scene.statsPopup = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    scene.statsPopup.setVisible(false).setDepth(1000);

    // Create background
    const background = scene.add.graphics();
    background.fillStyle(STYLES.colors.overlay, 1);
    background.fillRect(-scene.scale.width / 2, -scene.scale.height / 2, scene.scale.width , scene.scale.height); // Fullscreen rectangle
    scene.statsPopup.add(background);

    const halfHeight = scene.scale.height / 2;
    const logoWidth = scene.scale.width * 0.3;
    const logoHeight = logoWidth;
    const logoYPosition = -halfHeight * 0.95;
    const logoXPosition = -0.22;
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
    scene.statsPopup.add(logo);

    // title
    scene.statsTitle = scene.add.text(
        0,
        -halfHeight * 0.55,
        'Track statistics?', {
            fontSize: scene.scale.width * 0.06 + 'px',
            color: STYLES.colors.text,
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
            align: 'center',
    }).setOrigin(0.5);
    scene.statsTitle.name = 'statsTitle';
    scene.statsPopup.add( scene.statsTitle);

    // Add title text
    scene.statsSubTitleText = scene.add.text(0, -halfHeight * 0.35, 
        'Create a free account to start tracking your streaks,\npoints and number of games played!', { // Start with empty text
        fontSize: scene.scale.width * 0.035 + 'px',
        fontFamily: 'Poppins Light',
        fontWeight: '300',
        fill: '#000000',
        align: 'center',
        wordWrap: { width: scene.scale.width * 0.9 },
    }).setOrigin(0.5);
    
    // Give it a name to easily find it later
    scene.statsSubTitleText.name = 'subTitleText';
    scene.statsPopup.add(scene.statsSubTitleText);

    // Create close button
    const closeButton = createCloseButton(scene);
    scene.statsPopup.add(closeButton);

    // Create signup button
    createSignupButton(scene);
    scene.statsPopup.add(scene.signupButton);
}


// Helper function to create the close button container
function createCloseButton(scene) {
    const halfWidth = scene.scale.width / 2;
    const halfHeight = scene.scale.height / 2;

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

    closeButtonHitArea.on('pointerdown', () => {
        cleanupPopup(scene);
        scene.statsPopup.setVisible(false);
        
        // Resume the timer when closing the popup
        resumeTimer(scene);

    });

    return closeButtonContainer;
}

function createSignupButton(scene) {

    const popupWidth = scene.scale.width;
    const halfHeight = scene.scale.height / 2;
    const textWidth = popupWidth * 0.5;
    const textHeight = scene.scale.height * 0.07;
    const yPos = halfHeight * 0.1;

    // Create an interactive container
    scene.signupButton = scene.add.container(0, yPos).setInteractive(
        new Phaser.Geom.Rectangle(-textWidth/2, -textHeight/2, textWidth, textHeight),
        Phaser.Geom.Rectangle.Contains
    );

    const graphics = scene.add.graphics();
    
    const drawButton = (graphics, fillColor, borderCol) => {
        graphics.clear();
        const fillColorNum = parseInt(fillColor.replace('#', ''), 16);
        const borderColorNum = parseInt(borderCol.replace('#', ''), 16);
        
        graphics.fillStyle(fillColorNum);
        graphics.lineStyle(6, borderColorNum);
        graphics.fillRoundedRect(-textWidth/2, -textHeight/2, textWidth, textHeight, STYLES.borderRadius.sides);
        graphics.strokeRoundedRect(-textWidth/2, -textHeight/2, textWidth, textHeight, STYLES.borderRadius.sides);
    };

    // Create the visual rectangle (non-interactive now)
    const signupButton = scene.add.rectangle(0, 0, textWidth, textHeight)
        .setOrigin(0.5);

    // Create the button text
    const signupButtonText = scene.add.text(0, 0, 'Create account', {
        fontSize: scene.scale.width * 0.03 + 'px',
        fontFamily: 'Poppins',
        color: STYLES.colors.playButtonText
    }).setOrigin(0.5);

    // Initial button draw
    drawButton(graphics, STYLES.colors.playButtonBg, STYLES.colors.playButtonBorder);

    // Handle all interactions on the container
    scene.signupButton
        .on('pointerover', () => {
            drawButton(graphics, STYLES.colors.buttonHover, STYLES.colors.playButtonBorder);
        })
        .on('pointerout', () => {
            drawButton(graphics, STYLES.colors.playButtonBg, STYLES.colors.playButtonBorder);
        })
        .on('pointerdown', async () => {
            scene.statsPopup.setVisible(false);
            // Resume timer when hiding popup for auth
            resumeTimer(scene);
            
            await showAuthModal('signup');
            if (auth.currentUser) {
                scene.statsPopup.setVisible(true);
                // Pause timer again if showing stats after auth
                pauseTimer(scene);
                
                scene.signupButton.setVisible(false);
                const stats = await fetchGameStats(auth.currentUser.uid);
            }
        });

    // Add all elements to the container
    scene.signupButton.add([graphics, signupButton, signupButtonText]);
    
    // Hide the container initially
    scene.signupButton.setVisible(false);
}


export function createMetricsContainer(scene, stats, popupWidth, halfHeight, type, alignTo) {
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

export function createLastPlayedText(scene, stats, halfHeight) {
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

export async function showStatsPopup(scene) {

    const popupWidth = scene.scale.width;
    const halfHeight = scene.scale.height / 2;

    cleanupPopup(scene);
    scene.statsPopup.setDepth(10000);
    scene.statsPopup.setVisible(true);

    pauseTimer(scene);

    const titleText = scene.statsPopup.list.find(item => item.name === 'statsTitle');
    if (titleText) {
        titleText.setText(auth.currentUser 
            ? 'Statistics' 
            : 'Track statistics?');
    }

    if (auth.currentUser) {
        scene.signupButton.setVisible(false);
        scene.statsSubTitleText.setVisible(false);

        const stats = await fetchGameStats(auth.currentUser.uid);
        if (stats) {
            const topMetricsContainer = createMetricsContainer(scene, stats, popupWidth, halfHeight, 'top');
            topMetricsContainer.name = 'topMetricsContainer';
            scene.statsPopup.add(topMetricsContainer);
            
            const streakMetricsContainer = createMetricsContainer(scene, stats, popupWidth, halfHeight, 'streak', topMetricsContainer);
            streakMetricsContainer.name = 'streakMetricsContainer';
            scene.statsPopup.add(streakMetricsContainer);

            const lastPlayedText = createLastPlayedText(scene, stats, halfHeight);
            lastPlayedText.name = 'lastPlayedText';
            scene.statsPopup.add(lastPlayedText);

        } else {
            console.log('Error loading stats.');
        }
    } else {
        scene.signupButton.setVisible(true);
        scene.statsSubTitleText.setVisible(true);
    }
}

export function cleanupPopup(scene) {
    // Hide and reset signup button elements
    scene.signupButton.setVisible(false);
    
    // Helper function to remove and destroy elements by name
    const removeElementByName = (name) => {
        const element =  scene.statsPopup.list.find(item => item.name === name);
        if (element) {
            scene.statsPopup.remove(element);
            element.destroy(); // Ensure the element is fully removed
        }
    };

    // Remove last played text if it exists
    removeElementByName('lastPlayedText');

    // Remove top and streak metrics containers
    removeElementByName('topMetricsContainer');
    removeElementByName('streakMetricsContainer');
}
