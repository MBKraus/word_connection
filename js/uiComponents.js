import { createStatsPopup} from './screens/statsPopUp.js';
import { isMobile, isTablet } from './utils.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { showWelcomeScreen } from './screens/welcome.js'; 


export function createLogo(scene, width, height, yPosition, xPosition) {
    const logo = scene.add.graphics();

    const baseColor = 0xe2e8f0;
    const highlightColor = 0x9bcf53;
    const greyColor = 0xD7D7D7;

    // Outer margin (relative to width)
    const outerMargin = width * 0.1;

    // Set the xPosition passed in the argument
    const rectX = (scene.scale.width - width) * xPosition + outerMargin;
    const rectY = yPosition;

    const borderRadius = width * 0.1;

    // Calculate the actual base rectangle dimensions
    const baseWidth = width - outerMargin * 2;
    const baseHeight = height - outerMargin * 2;

    // Draw the main base rectangle
    logo.fillStyle(baseColor, 1);
    logo.fillRoundedRect(rectX, rectY, baseWidth, baseHeight, borderRadius);

    // Adjust outer grid padding
    const outerGridPadding = width * 0.06;
    const gridPadding = width * 0.02;

    // Calculate sub-rectangle dimensions
    // Divide the remaining space by 3 to get the sub-rectangle dimensions
    const subRectWidth = (baseWidth - (outerGridPadding * 2) - (gridPadding * 2)) / 3;
    const subRectHeight = (baseHeight - (outerGridPadding * 2) - (gridPadding * 2)) / 3;
    const subRadius = subRectWidth * 0.15;

    // Draw the 3x3 grid of sub-rectangles
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const x = rectX + outerGridPadding + col * (subRectWidth + gridPadding);
            const y = rectY + outerGridPadding + row * (subRectHeight + gridPadding);
            
            let fillColor = greyColor;
            if (
                (row === 0 && col === 1) || 
                (row === 1 && col === 1) || 
                (row === 2 && col === 2)
            ) {
                fillColor = highlightColor;
            }

            logo.fillStyle(fillColor, 1);
            logo.fillRoundedRect(x, y, subRectWidth, subRectHeight, subRadius);
        }
    }

    logo.setDepth(1);
    return logo;
}

export function createHeader(scene) {

    // Create the logo
    const logoWidth = scene.scale.width * 0.08;
    const logoHeight = scene.scale.height * 0.0475;
    const logoYPosition = scene.scale.height * 0.015;
    const logoXPosition = 0.42;
    const logo = createLogo(scene, logoWidth, logoHeight, logoYPosition, logoXPosition);

    scene.headerText = scene.add.text(
        scene.game.scale.width * 0.56, 
        scene.game.scale.height * 0.035, 
        'Connections\nGame', 
        {
            fontSize: scene.game.scale.width * 0.03 + 'px',
            color: '#000000',
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            fontWeight: 'bold',
        }
    ).setOrigin(0.5);
    
}


export function getStartY(scene) {
    return window.innerWidth < 728 
        ? scene.game.scale.height * 0.5975 
        : scene.game.scale.height * 0.605;
}

export function createInputDisplay(scene) {
    const inputBgWidth = scene.game.scale.width * 0.88;
    const inputBgHeight = scene.game.scale.height * 0.055;
    const startY = getStartY(scene);

    // Store the initial Y position for the timebar
    scene.initialTimeBarY = startY - inputBgHeight / 2;

    // Background for input
    const inputBgGraphics = scene.add.graphics();
    inputBgGraphics.fillStyle(0xE2E8F1, 1);
    inputBgGraphics.fillRoundedRect(
        scene.game.scale.width * 0.12,
        scene.initialTimeBarY,
        inputBgWidth,
        inputBgHeight,
        20
    );

    // Input Text Display with Placeholder
    const placeholderText = "Type your answer";
    scene.inputDisplay = scene.add.text(
        scene.game.scale.width * 0.57,
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

export function createGiveUpButton(scene) {
    const buttonWidth = scene.game.scale.width * 0.10;
    const buttonHeight = scene.game.scale.height * 0.055;
    const buttonX = scene.game.scale.width * 0.05;
    const buttonY = getStartY(scene);

    const cornerRadius = 15;
    const defaultColor = 0xE2E8F1;
    const hoverColor = 0xD8DEE7;

    // Create a container for the button
    scene.giveUpButton = scene.add.container(buttonX, buttonY);

    // Create the button graphics
    const buttonGraphics = scene.add.graphics();
    scene.giveUpButton.add(buttonGraphics);

    // Initial button state
    buttonGraphics.fillStyle(defaultColor, 1);
    buttonGraphics.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        cornerRadius
    );

    // Add text
    const buttonText = scene.add.text(0, 0, 'Give\nUp', {
        fontFamily: 'Poppins',
        fontSize: scene.scale.width * 0.0275 + 'px',
        color: '#000000',
        align: 'center'
    }).setOrigin(0.5);
    scene.giveUpButton.add(buttonText);

    // Make the container interactive
    scene.giveUpButton.setSize(buttonWidth, buttonHeight);
    scene.giveUpButton.setInteractive();

    // Add hover effects
    scene.giveUpButton.on('pointerover', () => {
        buttonGraphics.clear();
        buttonGraphics.fillStyle(hoverColor, 1);
        buttonGraphics.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
    });

    scene.giveUpButton.on('pointerout', () => {
        buttonGraphics.clear();
        buttonGraphics.fillStyle(defaultColor, 1);
        buttonGraphics.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
    });

    scene.giveUpButton.on('pointerdown', () => {
        window.handleRoundEndNotAllTopicsGuessed(scene);
    });
}


export function createRoundDisplay(scene) {

    function updateRoundPosition() {
        const isMobile = window.innerWidth < 728; // Check actual window width
        const yPos = isMobile ? scene.game.scale.height * 0.10 : scene.game.scale.height * 0.10;

        // Update timerText position and font size
        if (scene.roundText) {
            scene.roundText.setPosition(scene.game.scale.width * 0.5, yPos);
            scene.roundText.setFontSize(scene.game.scale.width * 0.035);
        }
    }

    scene.roundText = scene.add.text(scene.game.scale.width * 0.5, scene.game.scale.height * 0.10, `Round: ${scene.currentRound + 1}`, {
        fontSize: `${scene.game.scale.width * 0.035}px`,
        color: '#000000',
        fontFamily: 'Poppins Light',
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
            scene.scoreText.setFontSize(scene.game.scale.width * 0.035);
        }
    }

    scene.scoreText = scene.add.text(scene.game.scale.width * 0.85, scene.game.scale.height * 0.10, 'Score: 0', {
        fontSize: `${scene.game.scale.width * 0.035}px`,
        color: '#000000',
        fontFamily: 'Poppins Light',
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
            scene.timerText.setFontSize(scene.game.scale.width * 0.035);
        }
    }

    // Create the timer text initially
    scene.timerText = scene.add.text(
        scene.game.scale.width * 0.15,
        scene.game.scale.height * 0.15,  // Initial position for desktop
        `Time: ${scene.timer_duration}`,
        {
            fontSize: `${scene.game.scale.width * 0.035}px`,
            color: '#000000',
            fontFamily: 'Poppins Light',
        }
    ).setOrigin(0.5);

    // Adjust the timer position initially
    updateTimerPosition();

    // Listen for the resize event on the window to update the timer position dynamically
    window.addEventListener('resize', updateTimerPosition);
}

function createHamburgerMenu(scene, x, y, scale) {
    const menuContainer = scene.add.container(x, y);
    
    // Create graphics for the hamburger menu
    const menuGraphics = scene.add.graphics();
    
    function drawBars(color) {
        menuGraphics.clear();
        menuGraphics.fillStyle(color, 1);
        
        // Draw three horizontal bars
        menuGraphics.fillRect(-scale * 1.5, -scale, scale * 3, scale * 0.4);
        menuGraphics.fillRect(-scale * 1.5, 0, scale * 3, scale * 0.4);
        menuGraphics.fillRect(-scale * 1.5, scale, scale * 3, scale * 0.4);
    }
    
    // Initial drawing
    drawBars(0x000000);
    
    // Add graphics to container
    menuContainer.add(menuGraphics);
    
    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(-scale * 1.5, -scale, scale * 3, scale * 2);
    menuGraphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    // Add hover effects
    menuGraphics.on('pointerover', () => drawBars(0x444444));
    menuGraphics.on('pointerout', () => drawBars(0x000000));
    
    // Create a rectangle for the 'Logout' button
    const buttonBackground = scene.add.graphics();
    const buttonWidth = scale * 8;
    const buttonHeight = scale * 3;
    
    buttonBackground.fillStyle(0xFFFFFF, 1);  // White background
    buttonBackground.lineStyle(14, 0x000000);  // Black border with 2px thickness
    buttonBackground.strokeRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
    buttonBackground.fillRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
    
    // Create the text inside the button
    const logoutText = scene.add.text(0, 0, 'Logout', {
        fontFamily: 'Poppins',
        fontSize: scene.scale.width * 0.04 + 'px',
        color: '#000000',  // Black text
    }).setOrigin(0.5);
    
    // Create a container for both the background and the text
    const logoutButton = scene.add.container(scale * 2, scale * 4.5, [buttonBackground, logoutText]).setVisible(false);
    
    // Add logout button to the main container
    menuContainer.add(logoutButton);
    
    // Toggle menu visibility on click
    let isMenuOpen = false;
    menuGraphics.on('pointerdown', () => {
        isMenuOpen = !isMenuOpen;
        logoutButton.setVisible(isMenuOpen);
    });
    
    // Handle logout button interaction
    logoutButton.setSize(buttonWidth, buttonHeight);  // Set the interactive area to match the rectangle
    logoutButton.setInteractive();
    logoutButton.on('pointerdown', async () => {
        try {
            await signOut(auth);  // Firebase sign out
            console.log('Logout successful');
            
            // Show the welcome screen after logging out
            showWelcomeScreen(scene);  
        } catch (error) {
            console.error('Logout Error: ', error.message);
        }
    });

    // Hover effect for the Logout button
    logoutButton.on('pointerover', () => {
        // Change background color to #666666 when hovered
        buttonBackground.clear();
        buttonBackground.fillStyle(0x666666, 1);  // #666666 background
        buttonBackground.fillRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        buttonBackground.strokeRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);

        // Keep text color as black (no change)
        logoutText.setColor('#000000');
    });

    logoutButton.on('pointerout', () => {
        // Restore original colors when hover ends
        buttonBackground.clear();
        buttonBackground.fillStyle(0xFFFFFF, 1);  // White background
        buttonBackground.lineStyle(14, 0x000000);
        buttonBackground.strokeRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        buttonBackground.fillRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);

        // Keep text color as black (no change)
        logoutText.setColor('#000000');
    });
    
    // Method to change position
    menuContainer.updatePosition = (newX, newY) => {
        menuContainer.setPosition(newX, newY);
    };

    return menuContainer;
}

export function createHeaderIcons(scene) {

    // Hamburger Menu
    const menuScale = scene.scale.width * 0.02;
    scene.hamburgerMenu = createHamburgerMenu(
        scene,
        scene.scale.width * 0.065,  // Initial X position
        scene.scale.height * 0.03,  // Initial Y position
        menuScale
    );
    scene.hamburgerMenu.setDepth(1);
    
    // Create bar chart icon using graphics
    scene.chartGraphics = scene.add.graphics();
    scene.chartGraphics.setPosition(scene.scale.width * 0.85, scene.scale.height * 0.04);
    
    // Set fill style
    scene.chartGraphics.fillStyle(0x000000, 1);
    
    // Scale factor for the bars
    const scale = scene.scale.width * 0.02; // Base scale remains the same
    
    // Draw the three bars with increased heights
    // Middle height bar (left)
    scene.chartGraphics.fillRect(-scale * 1.5, -scale * 1.4, scale * 0.8, scale * 2.0); // Increased height to 2.0
    
    // Highest bar (middle)
    scene.chartGraphics.fillRect(-scale * 0.3, -scale * 1.8, scale * 0.8, scale * 2.4); // Increased height to 2.4
    
    // Shortest bar (right)
    scene.chartGraphics.fillRect(scale * 0.9, -scale * 1.0, scale * 0.8, scale * 1.6); // Increased height to 1.6
    
    // Adjust hit area to match taller bars
    const hitArea = new Phaser.Geom.Rectangle(-scale * 1.5, -scale * 1.8, scale * 3, scale * 2.4); // Adjusted to fit the tallest bar
    scene.chartGraphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    // Create stats popup for chart icon
    createStatsPopup(scene);

    // Question mark icon (existing code)
    const questionIcon = scene.add.image(scene.scale.width * 0.94, scene.scale.height * 0.0325, 'question')
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
    const lineWidth = scene.scale.width * 0.99; // 90% of screen width
    const lineX = scene.scale.width * 0.01; // Start 5% from the left edge
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
        .fillStyle(0x9bcf53) // Green fill color
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
    ? scene.game.scale.height * 0.445 
    : scene.game.scale.height * 0.45;

    scene.correctGuessContainer = scene.add.container(scene.game.scale.width * 0.02, startY);
} 

export function initializeCorrectGuessPlaceholders(scene) {
    scene.currentTopics.forEach((topic, index) => {
        const yOffset = index * (scene.game.scale.height * 0.045);
        const circleRadius = scene.game.scale.width * 0.0125;

        scene.guessContainer = scene.add.container(scene.game.scale.width * 0.02, yOffset);
        const circle = scene.add.graphics();
   
        // Set border color based on index
        let borderColor;
        if (index === 0) {
            borderColor = 0x6d92e6;
        } else if (index === 1) {
            borderColor = 0x9bcf53;
        } else if (index === 2) {
            borderColor = 0xbf53cf;
        }

        // Apply border color
        circle.lineStyle(10, borderColor); 
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