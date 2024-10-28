import { createQuestionMarkPopup} from './screens.js';
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