import { startRound } from './countdown.js';

// Helper function: Get configuration values for tiles layout
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
    const startY = scene.game.scale.height * 0.24;
    const startX = (scene.game.scale.width - (cols * tileWidth + totalHorizontalGaps)) / 2;

    return { cols, rows, startX, startY, tileWidth, tileHeight, horizontalGap, verticalGap, cornerRadius };
}

// Helper function: Create tiles based on the configuration
export function createTiles(scene, config) {
    scene.currentTopics = scene.allRounds[scene.currentRound];
    let allWords = scene.currentTopics.flatMap(topic => topic.words);
    Phaser.Utils.Array.Shuffle(allWords);

    for (let i = 0; i < config.cols; i++) {
        for (let j = 0; j < config.rows; j++) {
            const x = config.startX + i * (config.tileWidth + config.horizontalGap);
            const y = config.startY + j * (config.tileHeight + config.verticalGap);

            let graphics = scene.add.graphics();
            graphics.fillStyle(0xE2E8F1, 1);
            drawRoundedRect(graphics, x, y, config.tileWidth, config.tileHeight, config.cornerRadius);

            const word = allWords[i + j * config.cols];
            const text = scene.add.text(x + config.tileWidth / 2, y + config.tileHeight / 2, word.toUpperCase(), {
                fontSize: `${Math.max(32, Math.floor(config.tileHeight * 0.27))}px`,
                color: '#000000',
                fontFamily: 'Poppins',
                fontWeight: 'bold',
            }).setOrigin(0.5);

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

export function highlightTiles(scene, words) {
    scene.tiles.forEach(tile => {
        if (words.includes(tile.word)) {
            // Clear the previous graphics
            tile.tile.clear();
            
            // Draw with new color
            tile.tile.fillStyle(0x167D60, 1);
            drawRoundedRect(
                tile.tile, 
                tile.x,
                tile.y,
                tile.width,
                tile.height,
                15  // cornerRadius
            );
        }
    });
}

export function hideTiles(scene) {
    scene.tiles.forEach(tileObj => {
        tileObj.tile.setVisible(false);
        tileObj.text.setVisible(false);
    });
}

export function showTiles(scene) {
    // Call startRound to generate and show tiles
    startRound(scene);
}