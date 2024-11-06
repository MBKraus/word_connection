import { GameStorage} from '../gameStorage.js';

export function createDailyLimitScreen(scene) {
    const screen = scene.add.container(0, 0);
    screen.setDepth(1000);
    screen.setVisible(false);

    // Create semi-transparent background
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, 0x000000, 1);
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