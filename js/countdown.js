import { resetTimerAndBar} from './timer.js';
import { hideTiles} from './tiles.js';

export function createCountdown(scene) {
    // Create countdown circle and text and assign them to the scene
    scene.countdownCircle = scene.add.graphics();
    scene.countdownText = scene.add.text(
        scene.scale.width / 2, 
        scene.scale.height * 0.3, 
        '', 
        {
            fontSize: '64px',
            color: '#FFFFFF',
            fontFamily: 'Poppins',
        }
    ).setOrigin(0.5);
}

export function showCountdown(scene) {

    // Disable stats and revealTopics button during countdown
    scene.chartIcon.disableInteractive();
    scene.revealTopicsButton.disableInteractive();

    scene.guessedTopicsOrder = [];

    let countdownTime = 3;
    scene.roundText.setText(`Round: ${scene.currentRound + 1}`);
    scene.roundText.setVisible(true);

    scene.countdownCircle.clear();
    scene.countdownCircle.fillStyle(0x9bcf53, 1);
    const radius = 100;
    scene.countdownCircle.fillCircle(scene.game.scale.width / 2, scene.game.scale.height * 0.3, radius);

    scene.countdownText.setText(countdownTime);
    scene.countdownText.setVisible(true);
    scene.countdownCircle.setVisible(true);

    scene.timerText.setVisible(false);
    scene.timeBar.setVisible(false);

    hideTiles(scene);

    let countdownStartTime = Date.now();

    scene.inputDisplay.setText("Type your answer")
    
    const countdownInterval = setInterval(() => {
        const elapsedTime = (Date.now() - countdownStartTime) / 1000;
        countdownTime = Math.max(0, 3 - Math.floor(elapsedTime));
        scene.countdownText.setText(countdownTime);

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            scene.countdownCircle.setVisible(false);
            scene.countdownText.setVisible(false);

            resetTimerAndBar(scene);
            startRound(scene);
        }
    }, 100); // Update more frequently for smoother countdown
}
