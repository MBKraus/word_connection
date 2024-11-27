import { isMobile, isTablet, isPhone, isDesktop } from './utils.js';

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
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '←'],
        ['SPACE', '✓']
    ];

    // Adjust keyboard height based on device type
    const keyboardHeightRatio = isTablet() ? 0.24 : 0.26; // Less reduction for tablets
    const bottomPadding = isTablet() ? 80 : 210; // More padding for tablets than before

    const keyboardContainer = scene.add.container(0, 0);
    const keyboardWidth = game.scale.width;
    const keyboardHeight = game.scale.height * keyboardHeightRatio;

    const rowHeight = keyboardHeight / 4;
    const keyWidthRatio = isTablet() ? 0.7 : 0.8; // Less reduction in width for tablets
    const keySpacing = isTablet() ? 9 : 10; // Similar spacing
    const rowSpacing = isTablet() ? 9 : 10;
    const keyboardY = game.scale.height - keyboardHeight - bottomPadding;

    const zRowLeftShift = isTablet() ? 35 : 40; // Less shift for tablets

    keys.forEach((row, rowIndex) => {
        let rowWidth = 0;

        row.forEach((key) => {
            if (key === '') return;
            let keyWidth = rowHeight * keyWidthRatio;
            if (key === '✓') {
                keyWidth = rowHeight * keyWidthRatio * 2;
            } else if (key === 'SPACE') {
                keyWidth = rowHeight * keyWidthRatio * (isTablet() ? 6.5 : 7); // Slightly shorter spacebar for tablets
            } else if (key === '←' && rowIndex === 2) {
                return;
            }
            rowWidth += keyWidth + keySpacing;
        });
        rowWidth -= keySpacing;

        let startX;
        if (rowIndex === keys.length - 1) {
            startX = keyboardWidth - rowWidth - (isTablet() ? 120 : 20);
        } else if (rowIndex === 2) {
            startX = (keyboardWidth - rowWidth) / 2 - zRowLeftShift;
        } else {
            startX = (keyboardWidth - rowWidth) / 2;
        }

        row.forEach((key) => {
            if (key === '') return;
            let keyWidth = rowHeight * keyWidthRatio;

            if (key === '←') {
                keyWidth = rowHeight * keyWidthRatio * 1.9;
            } else if (key === '✓') {
                keyWidth = rowHeight * keyWidthRatio * (isTablet() ? 2.3 : 2.45);
            } else if (key === 'SPACE') {
                keyWidth = rowHeight * keyWidthRatio * (isTablet() ? 6.5 : 6.75);
            }

            const x = key === '←' && rowIndex === 2
                ? keyboardWidth - (keyWidth / 2) - (isTablet() ? 100 : 0) // Added 100px left offset for tablets
                : startX + (keyWidth / 2);
            const y = (rowIndex * rowHeight) + (rowIndex * rowSpacing) + (rowHeight / 2);

            const button = scene.add.graphics();
            let keyText;

            // Adjust font size for tablets
            const fontSize = isTablet() ? `${rowHeight * 0.38}px` : `${rowHeight * 0.4}px`;

            if (key === '←') {
                button.fillStyle(0x666666, 1);
                keyText = scene.add.text(0, 0, key, {
                    fontSize,
                    color: '#FFFFFF',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            } else if (key === '✓') {
                button.fillStyle(0x51c878, 1);
                keyText = scene.add.text(0, 0, key, {
                    fontSize,
                    color: '#FFFFFF',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            } else if (key === 'SPACE') {
                button.fillStyle(0xE2E8F1, 1);
                keyText = scene.add.text(0, 0, '', {
                    fontSize,
                    color: '#000000',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            } else {
                button.fillStyle(0xE2E8F1, 1);
                keyText = scene.add.text(0, 0, key, {
                    fontSize,
                    color: '#000000',
                    fontFamily: 'Poppins',
                }).setOrigin(0.5);
            }

            button.fillRoundedRect(
                -keyWidth / 2,
                -rowHeight / 2,
                keyWidth,
                rowHeight,
                isTablet() ? 9 : 10 // Similar border radius
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

            if (key !== '←' || rowIndex !== 2) {
                startX += keyWidth + keySpacing;
            }
        });
    });

    keyboardContainer.setY(keyboardY);
}
