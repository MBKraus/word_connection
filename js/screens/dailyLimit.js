import { createScreen, STYLES } from './helpers.js';
import { createLogo } from '../uiComponents.js';
import { createNextGameTimer } from '../utils.js';
import { GameStorage } from '../gameStorage.js';

export function createDailyLimitScreen(scene) {
    scene.dailyLimitScreen = createScreen(scene, 'dailyLimitScreen');

    const fontSize = Math.min(scene.scale.height * 0.08, 40);

    // Create logo
    const logoWidth = scene.scale.width * 0.3;
    const logoHeight = logoWidth;
    const logoYPosition = scene.scale.height*0.05;
    const logoXPosition = 0.5
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

    // Next game time

    scene.nextGameLabel = scene.add.text(
        scene.scale.width * 0.5,
        scene.scale.height * 0.63,
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
        scene.game.scale.height * 0.67,
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

    // Create and start the timer globally
    scene.nextGameTimer = createNextGameTimer(
        GameStorage.getNextPlayTime,
        (text) => {
            // Placeholder for global updates, if needed.
        }
    );
    scene.nextGameTimer.start();

    scene.nextGameTimer.setOnUpdate((text) => {
        scene.nextGameTime.setText(text);
    });

    return {
        show: async () => {
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
