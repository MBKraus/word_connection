import { getGameStats} from '../gameStorage.js';
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
        circlesContainer.removeAll(true);
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
        // Ensure each child is destroyed and removed from the container
        circlesContainer.list.forEach(child => {
            child.destroy();
        });
        circlesContainer.removeAll(true); // The 'true' parameter removes all children permanently.
        
        // Reset the stats text
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
            statsText.setText('You are after your stats? Login to track your progress!');
        }
    });

    button.on('pointerdown', () => {
        cleanupPopup();
        popup.setVisible(false);
    });
    button.on('pointerover', () => button.setFillStyle(STYLES.colors.buttonHover));
    button.on('pointerout', () => button.setFillStyle(STYLES.colors.buttonBg));
}
