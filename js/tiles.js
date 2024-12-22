export function getTileConfig(scene) {
    const cols = 3;
    const rows = 4;
    const horizontalGap = 20;
    const verticalGap = 15;
    const cornerRadius = 15;
    
    const totalHorizontalGaps = (cols - 1) * horizontalGap;
    const availableWidth = scene.game.scale.width * 0.3325 * cols;
    const tileWidth = (availableWidth - totalHorizontalGaps) / cols;
    const tileHeight = tileWidth * 0.36;
    
    const startY = window.innerWidth < 728 
        ? scene.game.scale.height * 0.13 
        : scene.game.scale.height * 0.13;
    
    const startX = (scene.game.scale.width - (cols * tileWidth + totalHorizontalGaps)) / 2;

    return { 
        cols, 
        rows, 
        startX, 
        startY, 
        tileWidth, 
        tileHeight, 
        horizontalGap, 
        verticalGap, 
        cornerRadius 
    };
}

// Helper function: Create tiles based on the configuration
export function createTiles(scene, config) {
    // Get topics for the current round
    scene.currentTopics = scene.allRounds[scene.currentRound];

    // Combine all entries (words) from the topics into a single array
    let allWords = scene.currentTopics.flatMap(topic => topic.entries);
    Phaser.Utils.Array.Shuffle(allWords); // Shuffle the words

    for (let i = 0; i < config.cols; i++) {
        for (let j = 0; j < config.rows; j++) {
            const x = config.startX + i * (config.tileWidth + config.horizontalGap);
            const y = config.startY + j * (config.tileHeight + config.verticalGap);

            let graphics = scene.add.graphics();
            graphics.fillStyle(0xe2e8f0, 1);
            drawRoundedRect(graphics, x, y, config.tileWidth, config.tileHeight, config.cornerRadius);

            const wordIndex = i + j * config.cols;
            const word = allWords[wordIndex] || ""; // Handle cases where there are fewer words than tiles

            // Create text for the tile
            const text = scene.add.text(x + config.tileWidth / 2, y + config.tileHeight / 2, word.toUpperCase(), {
                fontSize: `${Math.max(24, Math.floor(config.tileHeight * 0.27))}px`,
                color: '#000000',
                fontFamily: 'Poppins',
                fontWeight: 'bold',
                wordWrap: { width: config.tileWidth - 25 },
                align: 'center'
            }).setOrigin(0.5);

            // Adjust text size if it's still too tall
            while (text.height > config.tileHeight - 20 && text.style.fontSize.replace('px', '') > 12) {
                const currentSize = parseInt(text.style.fontSize);
                text.setFontSize(currentSize - 2);
            }

            // Add the tile to the scene
            scene.tiles.push({
                tile: graphics,
                text,
                word,
                x,
                y,
                width: config.tileWidth,
                height: config.tileHeight
            });
        }
    }
}

function drawRoundedRect(graphics, x, y, width, height, radius) {
    graphics.beginPath();
    
    // Top-left
    graphics.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    // Top line
    graphics.lineTo(x + width - radius, y);
    // Top-right
    graphics.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, 0);
    // Right line
    graphics.lineTo(x + width, y + height - radius);
    // Bottom-right
    graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    // Bottom line
    graphics.lineTo(x + radius, y + height);
    // Bottom-left
    graphics.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    // Left line
    graphics.lineTo(x, y + radius);
    
    graphics.closePath();
    graphics.fillPath();
}

export function highlightTiles(scene, words, topicIndex) {
    // Define the colors for the guessed topics
    const colors = [0xbf53cf, 0x6d92e6, 0x9bcf53];  // purple, blue, green
    
    // We need to assign the correct color based on the order of guesses
    const fillColor = colors[scene.guessedTopicsOrder.length % colors.length];
    
    scene.tiles.forEach(tile => {
        if (words.includes(tile.word)) {
            // Clear the previous graphics
            tile.tile.clear();
            
            // Draw the main tile with the new color
            tile.tile.fillStyle(fillColor, 1);
            drawRoundedRect(
                tile.tile,
                tile.x,
                tile.y,
                tile.width,
                tile.height,
                15
            );

            // Change the text color to white
            tile.text.setColor('#FFFFFF');
            
            // Create flash overlay exactly matching the tile
            const flashGraphics = scene.add.graphics();
            flashGraphics.fillStyle(0xFFFFFF, 1); // White flash
            drawRoundedRect(
                flashGraphics,
                tile.x,
                tile.y,
                tile.width,
                tile.height,
                15
            );
            
            // Animate the flash to fade out
            scene.tweens.add({
                targets: flashGraphics,
                alpha: { from: 0.8, to: 0 },
                duration: 300,
                ease: 'Linear',
                onComplete: () => {
                    flashGraphics.destroy();
                }
            });
        }
    });
}

export function hideTiles(scene) {
    scene.tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
}