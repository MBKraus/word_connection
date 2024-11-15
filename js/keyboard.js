import { isMobile } from './utils.js';

function isAuthModalVisible() {
    const modalContainer = document.querySelector('div[style*="position: fixed"]');
    return modalContainer && window.getComputedStyle(modalContainer).display === 'block';
}

export function setupKeyboardInput(scene) {
    if (!isMobile()) {
      scene.input.keyboard.on('keydown', (event) => {
        // Only handle keyboard input if auth modal is not visible
        if (!isAuthModalVisible()) {
          // Prevent page from jumping on spacebar press
          if (event.keyCode === 32) {
            event.preventDefault();
          }
          handleKeyboardInput(event, scene);
        }
      });
    }
  }

  function handleKeyboardInput(event, scene) {
    if (event.keyCode === 8) { 
        scene.currentInputText = scene.currentInputText.slice(0, -1);
    } else if (event.keyCode === 13) {
        if (scene.currentInputText) {
            window.checkGuess(scene, scene.currentInputText.trim().toLowerCase());
            scene.currentInputText = '';
        }
    } else if (event.key.length === 1) {
        scene.currentInputText += event.key.toUpperCase();
    }
    scene.inputDisplay.setText(scene.currentInputText);
}

  export function createKeyboard(scene, game) {
    const keys = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ''],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '←'],  // Place backspace ("←") at the end of the "Z" row
        ['SPACE', '✓']  // Bottom row with space and enter
    ];

    const keyboardContainer = scene.add.container(0, 0);
    const keyboardWidth = game.scale.width;
    const keyboardHeight = game.scale.height * 0.28;

    const rowHeight = keyboardHeight / 4;
    const keyWidthRatio = 0.73;
    const keySpacing = 10;
    const rowSpacing = 10;
    const keyboardY = game.scale.height - keyboardHeight - 50;

    // Define left shift for the "Z" to "M" row keys
    const zRowLeftShift = 40;

    keys.forEach((row, rowIndex) => {
        let rowWidth = 0;

        // Calculate row width without special cases for "Z" row's backspace and the bottom row
        row.forEach((key) => {
            if (key === '') return;
            let keyWidth = rowHeight * keyWidthRatio;
            if (key === '✓') {
                keyWidth = rowHeight * keyWidthRatio * 2;
            } else if (key === 'SPACE') {
                keyWidth = rowHeight * keyWidthRatio * 7;
            } else if (key === '←' && rowIndex === 2) {
                return; // Skip backspace width calculation for "Z" row alignment
            }
            rowWidth += keyWidth + keySpacing;
        });
        rowWidth -= keySpacing;

        // Calculate startX position for rows with custom alignment
        let startX;
        if (rowIndex === keys.length - 1) { // Bottom row with right alignment
            startX = keyboardWidth - rowWidth - 20; // Right align the last row with padding
        } else if (rowIndex === 2) { // Z row: shift all keys to the left, except backspace
            startX = (keyboardWidth - rowWidth) / 2 - zRowLeftShift;
        } else { // Center alignment for all other rows
            startX = (keyboardWidth - rowWidth) / 2;
        }

        row.forEach((key) => {
            if (key === '') return;
            let keyWidth = rowHeight * keyWidthRatio;

            // Customize widths for special keys
            if (key === '←') {
                keyWidth = rowHeight * keyWidthRatio * 2;
            } else if (key === '✓') {
                keyWidth = rowHeight * keyWidthRatio * 2.45;
            } else if (key === 'SPACE') {
                keyWidth = rowHeight * keyWidthRatio * 6.75;
            }

            // Place backspace key to the far right if it's in the "Z" row
            const x = key === '←' && rowIndex === 2
                ? keyboardWidth - (keyWidth / 2) // Align to the far right with padding
                : startX + (keyWidth / 2);
            const y = (rowIndex * rowHeight) + (rowIndex * rowSpacing) + (rowHeight / 2);

            const button = scene.add.graphics();
            let keyText;

            // Set custom styling for each key
            if (key === '←') {  // Backspace key with lighter gray color
                button.fillStyle(0x666666, 1); // Lighter gray color
                keyText = scene.add.text(0, 0, key, {
                    fontSize: `${rowHeight * 0.4}px`,
                    color: '#FFFFFF', // White text for contrast
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            } else if (key === '✓') {
                button.fillStyle(0x51c878, 1); // Green color
                keyText = scene.add.text(0, 0, key, {
                    fontSize: `${rowHeight * 0.4}px`,
                    color: '#FFFFFF',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            } else if (key === 'SPACE') {
                button.fillStyle(0xE2E8F1, 1);
                keyText = scene.add.text(0, 0, '', {
                    fontSize: `${rowHeight * 0.4}px`,
                    color: '#000000',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            } else {
                button.fillStyle(0xE2E8F1, 1);
                keyText = scene.add.text(0, 0, key, {
                    fontSize: `${rowHeight * 0.4}px`,
                    color: '#000000',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            }

            button.fillRoundedRect(
                -keyWidth / 2,
                -rowHeight / 2,
                keyWidth,
                rowHeight,
                10
            );

            const keyButton = scene.add.container(x, y, [button, keyText]);
            keyButton.setSize(keyWidth, rowHeight);
            keyButton.setInteractive();

            keyButton.on('pointerdown', () => {
                if (!isAuthModalVisible()) {
                    if (key === '✓') {
                        if (scene.currentInputText) {
                            window.checkGuess(scene, scene.currentInputText.trim().toLowerCase());
                            scene.currentInputText = '';
                            scene.inputDisplay.setText(scene.currentInputText);
                        }
                    } else if (key === '←') {
                        scene.currentInputText = scene.currentInputText.slice(0, -1);
                        scene.inputDisplay.setText(scene.currentInputText);
                    } else if (key === 'SPACE') {
                        scene.currentInputText += ' ';
                        scene.inputDisplay.setText(scene.currentInputText);
                    } else {
                        scene.currentInputText += key;
                        scene.inputDisplay.setText(scene.currentInputText);
                    }
                }
            });

            keyboardContainer.add(keyButton);

            // Increment startX only for non-backspace keys in the "Z" row
            if (key !== '←' || rowIndex !== 2) {
                startX += keyWidth + keySpacing;
            }
        });
    });

    keyboardContainer.setY(keyboardY);
}





