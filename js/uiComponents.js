import { createStatsPopup} from './screens/statsPopUp.js';
import { isMobile, isTablet } from './utils.js';

export function createHeader(scene) {
    scene.headerText = scene.add.text(
        scene.cameras.main.centerX, 
        scene.game.scale.height * 0.035, 
        'Word Connection', 
        {
            fontSize: scene.game.scale.width * 0.05 + 'px',
            color: '#000000',
            fontFamily: 'Play',
            fontWeight: 'bold',
        }
    ).setOrigin(0.5);
}


export function getStartY(scene) {
    return window.innerWidth < 728 
        ? scene.game.scale.height * 0.65 
        : scene.game.scale.height * 0.605;
}

export function createInputDisplay(scene) {
    const inputBgWidth = scene.game.scale.width * 0.98;
    const inputBgHeight = scene.game.scale.height * 0.055;
    const startY = getStartY(scene);

    // Store the initial Y position for the timebar
    scene.initialTimeBarY = startY - inputBgHeight / 2;

    // Background for input
    const inputBgGraphics = scene.add.graphics();
    inputBgGraphics.fillStyle(0xE2E8F1, 1);
    inputBgGraphics.fillRoundedRect(
        scene.game.scale.width * 0.5 - inputBgWidth / 2,
        scene.initialTimeBarY,
        inputBgWidth,
        inputBgHeight,
        20
    );

    // Input Text Display with Placeholder
    const placeholderText = "Type your answer";
    scene.inputDisplay = scene.add.text(
        scene.game.scale.width * 0.5,
        startY,
        scene.currentInputText || placeholderText, // Show placeholder if no input
        {
            fontSize: `${scene.game.scale.width * 0.04}px`,
            color: '#5A5A5A', // Gray color for placeholder
            fontFamily: 'Poppins',
            wordWrap: { width: inputBgWidth - 20 }
        }
    ).setOrigin(0.5).setDepth(2);

    // Timer bar inside input display
    scene.timeBar = scene.add.graphics();
    scene.timeBar.fillStyle(0xB8B8B8, 1).setDepth(1);
}

export function createRoundDisplay(scene) {

    function updateRoundPosition() {
        const isMobile = window.innerWidth < 728; // Check actual window width
        const yPos = isMobile ? scene.game.scale.height * 0.10 : scene.game.scale.height * 0.10;

        // Update timerText position and font size
        if (scene.roundText) {
            scene.roundText.setPosition(scene.game.scale.width * 0.5, yPos);
            scene.roundText.setFontSize(scene.game.scale.width * 0.04);
        }
    }

    scene.roundText = scene.add.text(scene.game.scale.width * 0.5, scene.game.scale.height * 0.10, `Round: ${scene.currentRound + 1}`, {
        fontSize: `${scene.game.scale.width * 0.04}px`,
        color: '#000000',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);

    updateRoundPosition();

    window.addEventListener('resize', updateRoundPosition);
}

export function createScoreDisplay(scene) {
    function updateScorePosition() {
        const isMobile = window.innerWidth < 728; // Check actual window width
        const yPos = isMobile ? scene.game.scale.height * 0.10 : scene.game.scale.height * 0.10;

        // Update timerText position and font size
        if (scene.scoreText) {
            scene.scoreText.setPosition(scene.game.scale.width * 0.85, yPos);
            scene.scoreText.setFontSize(scene.game.scale.width * 0.04);
        }
    }

    scene.scoreText = scene.add.text(scene.game.scale.width * 0.85, scene.game.scale.height * 0.10, 'Score: 0', {
        fontSize: `${scene.game.scale.width * 0.04}px`,
        color: '#000000',
        fontFamily: 'Poppins',
    }).setOrigin(0.5);

    updateScorePosition();

    window.addEventListener('resize', updateScorePosition);
}


export function createTimerDisplay(scene) {
    // Define a function to update the timer's position based on actual screen width
    function updateTimerPosition() {
        const isMobile = window.innerWidth < 728; // Check actual window width
        const yPos = isMobile ? scene.game.scale.height * 0.10 : scene.game.scale.height * 0.10;

        // Update timerText position and font size
        if (scene.timerText) {
            scene.timerText.setPosition(scene.game.scale.width * 0.15, yPos);
            scene.timerText.setFontSize(scene.game.scale.width * 0.04);
        }
    }

    // Create the timer text initially
    scene.timerText = scene.add.text(
        scene.game.scale.width * 0.15,
        scene.game.scale.height * 0.15,  // Initial position for desktop
        `Time: ${scene.timer_duration}`,
        {
            fontSize: `${scene.game.scale.width * 0.04}px`,
            color: '#000000',
            fontFamily: 'Poppins',
        }
    ).setOrigin(0.5);

    // Adjust the timer position initially
    updateTimerPosition();

    // Listen for the resize event on the window to update the timer position dynamically
    window.addEventListener('resize', updateTimerPosition);
}

export function createHeaderIcons(scene) {
    // Create bar chart icon using graphics
    const chartGraphics = scene.add.graphics();
    chartGraphics.setPosition(scene.scale.width * 0.85, scene.scale.height * 0.04);
    
    // Set fill style
    chartGraphics.fillStyle(0x000000, 1);
    
    // Scale factor for the bars
    const scale = scene.scale.width * 0.02; // Base scale remains the same
    
    // Draw the three bars with increased heights
    // Middle height bar (left)
    chartGraphics.fillRect(-scale * 1.5, -scale * 1.4, scale * 0.8, scale * 2.0); // Increased height to 2.0
    
    // Highest bar (middle)
    chartGraphics.fillRect(-scale * 0.3, -scale * 1.8, scale * 0.8, scale * 2.4); // Increased height to 2.4
    
    // Shortest bar (right)
    chartGraphics.fillRect(scale * 0.9, -scale * 1.0, scale * 0.8, scale * 1.6); // Increased height to 1.6
    
    // Adjust hit area to match taller bars
    const hitArea = new Phaser.Geom.Rectangle(-scale * 1.5, -scale * 1.8, scale * 3, scale * 2.4); // Adjusted to fit the tallest bar
    chartGraphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    // Create stats popup for chart icon
    createStatsPopup(scene, chartGraphics);

    // Question mark icon (existing code)
    const questionIcon = scene.add.image(scene.scale.width * 0.95, scene.scale.height * 0.03, 'question')
        .setScale(0.12)
        .setInteractive();
    
    // Add event listener for questionIcon to scroll to the HTML div
    questionIcon.on('pointerdown', () => {
        const targetDiv = document.getElementById('targetDiv');
        if (targetDiv) {
            targetDiv.scrollIntoView({ behavior: 'smooth' }); // Smooth scrolling
        } else {
            console.warn('Target div not found!');
        }
    });

    // Add grey horizontal line with rounded edges
    const lineGraphics = scene.add.graphics();
    lineGraphics.lineStyle(4, 0xA0A0A0, 1); // 4px thick, grey color, full opacity
    lineGraphics.beginPath();

    // Calculate line width and position
    const lineWidth = scene.scale.width * 0.9; // 90% of screen width
    const lineX = scene.scale.width * 0.05; // Start 5% from the left edge
    const lineY = scene.scale.height * 0.065; // Positioned just below the header

    // Draw rounded horizontal line
    lineGraphics.moveTo(lineX, lineY);
    lineGraphics.lineTo(lineX + lineWidth, lineY);
    lineGraphics.strokePath();

    // Optional: Add rounded line caps
    const capRadius = 2; // Adjust as needed
    lineGraphics.fillStyle(0x808080, 1);
    lineGraphics.fillCircle(lineX, lineY, capRadius);
    lineGraphics.fillCircle(lineX + lineWidth, lineY, capRadius);
}



export function createCrossIcon(scene) {
    const inputBgWidth = scene.game.scale.width * 0.98;

    scene.cross = scene.add.sprite(0, 0, 'cross')
        .setOrigin(0, 0.5)
        .setVisible(false)
        .setDepth(2)
        .setScale(scene.game.scale.width * 0.000028)
        .setPosition(scene.inputDisplay.x + inputBgWidth * 0.4, scene.inputDisplay.y);
}

export function createCheckmark(scene, x, y) {
    const checkmarkRadius = scene.game.scale.width * 0.03;

    // Create the circle
    const checkmarkCircle = scene.add.graphics()
        .fillStyle(0x51c878) // Green fill color
        .fillCircle(0, 0, checkmarkRadius)
        .setVisible(false);

    // Create the checkmark text
    const checkmarkText = scene.add.text(0, 0, '✔', {
        fontSize: checkmarkRadius * 1.5 + 'px',
        fontFamily: 'Poppins',
        fontWeight: 'bold',
        color: '#FFFFFF' // White color
    })
        .setOrigin(0.5)
        .setVisible(false);

    // Combine them into a container
    const checkmarkGroup = scene.add.container(x, y, [
        checkmarkCircle,
        checkmarkText
    ]).setDepth(10);

    // Attach components to the scene for easy access
    scene.checkmarkCircle = checkmarkCircle;
    scene.checkmarkText = checkmarkText;
    scene.checkmarkGroup = checkmarkGroup;
}

export function createCorrectGuessContainer(scene) {
    const startY = window.innerWidth < 728  
    ? scene.game.scale.height * 0.47 
    : scene.game.scale.height * 0.45;

    scene.correctGuessContainer = scene.add.container(scene.game.scale.width * 0.04, startY);
} 

export function initializeCorrectGuessPlaceholders(scene) {
    scene.currentTopics.forEach((topic, index) => {
        const yOffset = index * (scene.game.scale.height * 0.045);
        const circleRadius = scene.game.scale.width * 0.0125;

        scene.guessContainer = scene.add.container(scene.game.scale.width * 0.035, yOffset);
        const circle = scene.add.graphics();
        circle.lineStyle(10, 0x51c878); // Green border
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