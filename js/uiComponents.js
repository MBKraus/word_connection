import { createQuestionMarkPopup, createStatsPopup} from './screens.js';
import { isMobile } from './utils.js';

export function createHeader(scene) {
    scene.headerText = scene.add.text(
        scene.cameras.main.centerX, 
        scene.game.scale.height * 0.025, 
        'Word game', 
        {
            fontSize: scene.game.scale.width * 0.05 + 'px',
            color: '#000000',
            fontFamily: 'Play',
            fontWeight: 'bold',
        }
    ).setOrigin(0.5);
}

export function createAdContainer() {
    const adContainer = document.getElementById('ad-container');
    const adElement = adContainer.querySelector('.adsbygoogle');
    
    if (isMobile()) {
        adElement.style.width = '300px';
        adElement.style.height = '50px';
        adElement.dataset.adFormat = 'mobile';
    } else {
        adElement.style.width = '728px';
        adElement.style.height = '90px';
        adElement.dataset.adFormat = 'horizontal';
    }

    // Ensure display is set to flex by default
    adContainer.style.display = 'flex';
    adContainer.style.top = '50px';  // Adjust as needed

    // Initialize AdSense
    (adsbygoogle = window.adsbygoogle || []).push({});
}

export function createInputDisplay(scene) {
    // Background for input
    const inputBgWidth = scene.game.scale.width * 0.98;
    const inputBgHeight = scene.game.scale.height * 0.055;
    const inputBgGraphics = scene.add.graphics();
    inputBgGraphics.fillStyle(0xD3D3D3, 1);
    inputBgGraphics.fillRoundedRect(
        scene.game.scale.width * 0.5 - inputBgWidth / 2,
        scene.game.scale.height * 0.70 - inputBgHeight / 2,
        inputBgWidth,
        inputBgHeight,
        20
    );

    // Input Text Display
    scene.inputDisplay = scene.add.text(scene.game.scale.width * 0.5, scene.game.scale.height * 0.70, scene.currentInputText, {
        fontSize: `${scene.game.scale.width * 0.045}px`,
        color: '#000000',
        fontFamily: 'Poppins',
        wordWrap: { width: inputBgWidth - 20 }
    }).setOrigin(0.5).setDepth(2);

    // Timer bar inside input display
    scene.timeBar = scene.add.graphics();
    scene.timeBar.fillStyle(0xB8B8B8, 1).setDepth(1);
}

export function createRoundDisplay(scene) {
    scene.roundText = scene.add.text(scene.game.scale.width * 0.5, scene.game.scale.height * 0.22, `Round: ${scene.currentRound + 1}`, {
        fontSize: `${scene.game.scale.width * 0.04}px`,
        color: '#000000',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
}

export function createScoreDisplay(scene) {
    scene.scoreText = scene.add.text(scene.game.scale.width * 0.85, scene.game.scale.height * 0.22, 'Score: 0', {
        fontSize: `${scene.game.scale.width * 0.04}px`,
        color: '#000000',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
}

export function createTimerDisplay(scene) {
    scene.timerText = scene.add.text(scene.game.scale.width * 0.15, scene.game.scale.height * 0.22, `Time: ${scene.timer_duration}`, {
        fontSize: `${scene.game.scale.width * 0.04}px`,
        color: '#000000',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);
}

export function createHeaderIcons(scene) {
    // Create bar chart icon using graphics
    const chartGraphics = scene.add.graphics();
    chartGraphics.setPosition(scene.scale.width * 0.85, scene.scale.height * 0.03);
    
    // Set fill style
    chartGraphics.fillStyle(0x000000, 1);
    
    // Scale factor for the bars
    const scale = scene.scale.width * 0.02; // Base scale remains the same
    
    // Draw the three bars with increased heights
    // Middle height bar (left)
    chartGraphics.fillRect(-scale*1.5, -scale*1.2, scale*0.8, scale*1.8); // Was 1.2, now 1.8
    
    // Highest bar (middle)
    chartGraphics.fillRect(-scale*0.3, -scale*1.6, scale*0.8, scale*2.2); // Was 1.6, now 2.2
    
    // Shortest bar (right)
    chartGraphics.fillRect(scale*0.9, -scale*0.8, scale*0.8, scale*1.4); // Was 0.9, now 1.4
    
    // Adjust hit area to match taller bars
    const hitArea = new Phaser.Geom.Rectangle(-scale*1.5, -scale*1.6, scale*3, scale*2.2);
    chartGraphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    // Create stats popup for chart icon
    createStatsPopup(scene, chartGraphics);

    // Question mark icon (existing code)
    const questionIcon = scene.add.image(scene.scale.width * 0.95, scene.scale.height * 0.0225, 'question')
        .setScale(0.12)
        .setInteractive();
    createQuestionMarkPopup(scene, questionIcon);
}

export function createFeedbackIcons(scene) {
    const inputBgWidth = scene.game.scale.width * 0.98;

    scene.checkmark = scene.add.sprite(0, 0, 'check')
        .setOrigin(0, 0.5)
        .setVisible(false)
        .setDepth(2)
        .setScale(scene.game.scale.width * 0.00008)
        .setPosition(scene.inputDisplay.x + inputBgWidth * 0.4, scene.inputDisplay.y);

    scene.cross = scene.add.sprite(0, 0, 'cross')
        .setOrigin(0, 0.5)
        .setVisible(false)
        .setDepth(2)
        .setScale(scene.game.scale.width * 0.000028)
        .setPosition(scene.inputDisplay.x + inputBgWidth * 0.4, scene.inputDisplay.y);
}

export function createCorrectGuessContainer(scene) {
    scene.correctGuessContainer = scene.add.container(scene.game.scale.width * 0.03, scene.game.scale.height * 0.55);
} 

export function initializeCorrectGuessPlaceholders(scene) {
    scene.currentTopics.forEach((topic, index) => {
        const yOffset = index * (scene.game.scale.height * 0.045);
        const circleRadius = scene.game.scale.width * 0.023;

        scene.guessContainer = scene.add.container(0, yOffset);
        const circle = scene.add.graphics();
        circle.lineStyle(10, 0x167D60); // Green border
        circle.fillStyle(0xFFFFFF); // White fill
        circle.strokeCircle(0, 0, circleRadius);
        circle.fillCircle(0, 0, circleRadius);

        scene.guessContainer.add(circle);
        scene.correctGuessContainer.add(scene.guessContainer);

        scene.correctGuessTexts.push({ guessContainer: scene.guessContainer, circle, topicName: topic.name, text: null });
    });
}

export function updateScoreDisplay(scene) {
    scene.scoreText.setText(`Score: ${scene.score}`);
}