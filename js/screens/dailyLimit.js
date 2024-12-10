
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

    scene.dailyLimitScreen = screen;

    return {
        show: async () => {
            screen.setVisible(true);
            scene.nextGameTimer.onUpdate = (text) => countdownText.setText(text);

            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(false);
            }
        },
        hide: () => {
            screen.setVisible(false);

            if (scene.authDOMElement) {
                scene.authDOMElement.setVisible(true);
            }

            // Hide the stats text
            statsText.setVisible(false);
        }
    };
}
