import { createScreen, STYLES, createButton } from './helpers.js';
import { createLogo } from '../uiComponents.js';
import { createNextGameTimer, getNextPlayTime } from '../utils.js';
import { showStatsPopup } from './statsPopUp.js';

export function createDailyLimitScreen(scene, user) {
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.style.display = 'block';

    const setupScreen = async () => {
        return new Promise((resolve) => {
            scene.dailyLimitScreen = createScreen(scene, 'dailyLimitScreen');

            const fontSize = Math.min(scene.scale.height * 0.08, 40);

            // Create logo
            const logoWidth = scene.scale.width * 0.3;
            const logoHeight = logoWidth;
            const logoYPosition = scene.scale.height * 0.05;
            const logoXPosition = 0.5;
            const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);
            scene.dailyLimitScreen.add(logo);

            // Title and SubTitle text
            scene.dailyLimitTitle = scene.add.text(
                scene.scale.width * 0.5,
                scene.scale.height * 0.25,
                "Thanks for Playing!", {
                    fontSize: scene.scale.width * 0.06 + 'px',
                    color: STYLES.colors.text,
                    fontFamily: 'Helvetica Neue, Arial, sans-serif',
                    fontWeight: 'bold',
                }).setOrigin(0.5);
            scene.dailyLimitScreen.add(scene.dailyLimitTitle);

            scene.dailyLimitSubTitle = scene.add.text(
                scene.game.scale.width * 0.5,
                scene.game.scale.height * 0.30,
                "Great job on today's puzzle!\nCome back tomorrow for a new challenge!",
                {
                    fontFamily: 'Poppins Light',
                    fontSize: fontSize,
                    color: '#000000',
                    align: 'center',
                }
            ).setOrigin(0.5);
            scene.dailyLimitScreen.add(scene.dailyLimitSubTitle);

            // Next game time elements
            scene.nextGameLabel = scene.add.text(
                scene.scale.width * 0.5,
                scene.scale.height * 0.40,
                `Next game available in`,
                {
                    fontFamily: 'Poppins Light',
                    fontSize: scene.scale.width * 0.03 + 'px',
                    color: STYLES.colors.text,
                    align: 'center',
                }
            ).setOrigin(0.5);
            scene.dailyLimitScreen.add(scene.nextGameLabel);

            scene.nextGameTime = scene.add.text(
                scene.game.scale.width * 0.5,
                scene.game.scale.height * 0.435,
                ``,
                {
                    fontFamily: 'Poppins',
                    fontSize: scene.scale.width * 0.06 + 'px',
                    fontWeight: 'bold',
                    color: STYLES.colors.text,
                    align: 'center',
                }
            ).setOrigin(0.5);
            scene.dailyLimitScreen.add(scene.nextGameTime);

            scene.dailyLimitStatsButton = createButton(
                scene,
                scene.game.scale.width * 0.5,
                scene.game.scale.height * 0.57,  // Position at bottom
                'Statistics',
                () => {
                        showStatsPopup(scene);
                    },
                STYLES.colors.playButtonBg,
                STYLES.colors.playButtonText,
                STYLES.colors.playButtonBorder
            );

            scene.dailyLimitScreen.add(scene.dailyLimitStatsButton);

            if (user) {
                scene.dailyLimitStatsButton.setVisible(true);
            } else {
            scene.dailyLimitStatsButton.setVisible(false)
            }
            
            // Create and start the timer
            scene.nextGameTimer = createNextGameTimer(
                getNextPlayTime,
                (text) => {
                    // Placeholder for global updates
                }
            );

            scene.nextGameTimer.setOnUpdate((text, isUpdate) => {
                scene.nextGameTime.setText(text);
                if (isUpdate) {
                    loadingSpinner.style.display = 'none';
                    resolve();
                }
            });

            scene.nextGameTimer.start();
        });
    };

    return {
        show: async () => {
            loadingSpinner.style.display = 'block';
            await setupScreen();

            scene.dailyLimitScreen.setVisible(true);
            
            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(false);
            }
        },
        hide: () => {
            scene.dailyLimitScreen.setVisible(false);

            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(true);
            }
        }
    };
}