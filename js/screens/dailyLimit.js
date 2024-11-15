import { GameStorage } from '../gameStorage.js';
import { getGameStats } from '../gameStorage.js';
import { auth } from '../auth.js';
import { createProgressCircles } from './statsPopUp.js';

export function createDailyLimitScreen(scene) {
    const screen = scene.add.container(0, 0);
    screen.setDepth(1000);
    screen.setVisible(false);

    // Create semi-transparent background
    const bg = scene.add.rectangle(0, 0, scene.game.scale.width, scene.game.scale.height, 0xffffff, 1);
    bg.setOrigin(0);
    screen.add(bg);

    // Title and message text
    const titleText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.2, "Thanks for Playing!", {
        fontSize: scene.scale.width * 0.08 + 'px',
        fontFamily: 'Poppins',
        color: '#000000',
        align: 'center'
    }).setOrigin(0.5);
    screen.add(titleText);

    const messageText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.3, 
        "Great job on today's puzzle!\nCome back tomorrow for a new challenge!", {
        fontSize: scene.scale.width * 0.04 + 'px',
        fontFamily: 'Poppins',
        color: '#000000',
        align: 'center',
        lineSpacing: 10
    }).setOrigin(0.5);
    screen.add(messageText);

    // Countdown text
    const countdownText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.4, "", {
        fontSize: scene.scale.width * 0.035 + 'px',
        fontFamily: 'Poppins',
        color: '#000000',
        align: 'center'
    }).setOrigin(0.5);
    screen.add(countdownText);

    // Placeholder for stats text and circles container (hidden until data loads)
    const statsText = scene.add.text(scene.scale.width * 0.5, scene.scale.height * 0.6, "Loading stats...", {
        fontSize: scene.scale.width * 0.035 + 'px',
        fontFamily: 'Poppins',
        color: '#000000',
        align: 'center',
        lineSpacing: 10
    }).setOrigin(0.5);
    statsText.setVisible(false);
    screen.add(statsText);

    const circlesContainer = scene.add.container(scene.scale.width * 0.5, scene.scale.height * 0.75);
    screen.add(circlesContainer);

    // Countdown timer function
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
        show: async () => {
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

            // If the user is logged in, fetch and display stats
            if (auth.currentUser) {
                const stats = await getGameStats(auth.currentUser.uid);
                if (stats) {
                    // Update stats text
                    statsText.setText([
                        `Total Games Played: ${stats.totalGamesPlayed}`,
                        `Average # Topics Guessed: ${stats.averageTopicsGuessed}`,
                        `Last Played: ${stats.lastPlayed ? stats.lastPlayed.toDateString() : 'N/A'}`
                    ]);
                    statsText.setVisible(true);

                    // Create progress circles
                    createProgressCircles(stats.recentSessions, scene, circlesContainer);
                } else {
                    statsText.setText("Error loading stats.");
                    statsText.setVisible(true);
                }
            }
        },
        hide: () => {
            screen.setVisible(false);
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }

            const adContainer = document.getElementById('ad-container');
            if (adContainer) {
                adContainer.style.display = 'flex';
            }

            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(true);
            }

            // Hide the stats text and clear circles
            statsText.setVisible(false);
            circlesContainer.removeAll(true); // Clear circles
        }
    };
}
