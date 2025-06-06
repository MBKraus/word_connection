import { showAuthModal} from '../auth.js';
import {currentUser, getCachedOrFetchGameStats} from '../gameStorage.js';
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
    const yPos = halfHeight * -0.1;

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
            if (window.auth.currentUser) {
                scene.statsPopup.setVisible(true);
                // Pause timer again if showing stats after auth
                pauseTimer(scene);
                
                scene.signupButton.setVisible(false);
                const stats = await fetchGameStats(window.auth.currentUser.uid);
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
        { label: 'Played', value: stats.totalGamesPlayed, tooltip: 'Number of games\nyou have played' },
        { label: 'Average Score', value: stats.averageScore, tooltip: 'Your average score\nper day' },
        { label: '\nAverage # Topics\nGuessed', value: stats.averageTopicsGuessed, tooltip: 'Average number of topics\nguessed per day' },
    ] : [
        { label: 'Current Streak', value: stats.currentStreak, tooltip: "Your current streak of consecutive days\n you've guessed all topics correctly\n in every round." },
        { label: 'Longest Streak', value: stats.longestStreak, tooltip: "Your record for the longest streak\n of consecutive days where you guessed\n all topics correctly in every round." },
    ];

    const container = scene.add.container(0, isTop ? -halfHeight * 0.35 : -halfHeight * 0.10);
    const segmentWidth = popupWidth / metrics.length;

    metrics.forEach((metric, index) => {
        const metricX = alignTo
            ? alignTo.list[index].x
            : (index - (metrics.length - 1) / 2) * segmentWidth;

        const metricContainer = scene.add.container(metricX, 0);

        // Metric value
        const valueText = scene.add.text(0, -25, metric.value, {
            fontSize: scene.scale.width * 0.075 + 'px',
            fontFamily: 'Poppins',
            color: '#000000',
        }).setOrigin(0.5);

        // Metric label
        const labelText = scene.add.text(0, 45, metric.label, {
            fontSize: scene.scale.width * 0.03 + 'px',
            fontFamily: 'Poppins Light',
            color: '#555555',
            align: 'center',
        }).setOrigin(0.5);

        // Question mark with circle
        const questionMarkContainer = scene.add.container(130, -90);
        
        // Create hit area first
        const hitArea = new Phaser.GameObjects.Zone(
            scene,
            0,    // x position
            0,    // y position
            60,   // width
            60    // height
        ).setOrigin(0.5) 
         .setInteractive(
        );

        // Create circle and question mark
        const circle = scene.add.graphics();
        circle.lineStyle(4, 0x000000, 1);
        circle.fillStyle(0xffffff, 1);
        circle.fillCircle(0, 0, 20);
        circle.strokeCircle(0, 0, 20);

        const questionMarkText = scene.add.text(0, 0, '?', {
            fontSize: '20px',
            fontFamily: 'Poppins',
            color: '#000000',
        }).setOrigin(0.5);

        // Tooltip
        const tooltipWidth = popupWidth * 0.75;
        const tooltip = scene.add.text(0, -120, metric.tooltip, {
            fontSize: scene.scale.width * 0.03 + 'px',
            fontFamily: 'Poppins Light',
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 12, y: 8 },
            align: 'center',
            wordWrap: { width: tooltipWidth },
        }).setOrigin(0.5).setVisible(false).setDepth(11000);

        // Center tooltip above the metric value
        tooltip.setX(0);

        // Add hover events
        hitArea.on('pointerover', () => {
            tooltip.setVisible(true);

            // Adjust tooltip position to prevent overflow
            const bounds = tooltip.getBounds();
            const screenWidth = scene.scale.width;

            if (bounds.left < 0) {
                tooltip.setX(tooltip.x + Math.abs(bounds.left));
            } else if (bounds.right > screenWidth) {
                tooltip.setX(tooltip.x - (bounds.right - screenWidth));
            }

            // Optional: show hover state
            circle.clear();
            circle.lineStyle(4, 0x000000, 1);
            circle.fillStyle(0xdddddd, 1);
            circle.fillCircle(0, 0, 20);
            circle.strokeCircle(0, 0, 20);
        });

        hitArea.on('pointerout', () => {
            tooltip.setVisible(false);
            // Optional: restore normal state
            circle.clear();
            circle.lineStyle(4, 0x000000, 1);
            circle.fillStyle(0xffffff, 1);
            circle.fillCircle(0, 0, 20);
            circle.strokeCircle(0, 0, 20);
        });

        // Add all elements to containers
        questionMarkContainer.add([hitArea, circle, questionMarkText]);
        metricContainer.add([valueText, labelText, questionMarkContainer, tooltip]);
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
        titleText.setText(window.auth.currentUser 
            ? 'Statistics' 
            : 'Track statistics?');
    }

    if (currentUser)  {
        scene.signupButton.setVisible(false);
        scene.statsSubTitleText.setVisible(false);

        const stats = await getCachedOrFetchGameStats();
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
