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
        ['✓', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←', '']
    ];

    const keyboardContainer = scene.add.container(0, 0);

    const keyboardWidth = game.scale.width; 
    const keyboardHeight = game.scale.height * 0.24;

    const rowHeight = keyboardHeight / 3;
    const keyWidthRatio = 0.645; 

    const keySpacing = 10; 
    const rowSpacing = 10;

    const keyboardY = game.scale.height - keyboardHeight - 50; 

    keys.forEach((row, rowIndex) => {
        let rowWidth = 0;

        row.forEach((key) => {
            if (key === '') return;
            let keyWidth = rowHeight * keyWidthRatio;
            if (key === '✓' || key === '←') {
                keyWidth = rowHeight * keyWidthRatio * 1.5;
            }
            rowWidth += keyWidth + keySpacing;
        });
        rowWidth -= keySpacing;

        let startX = (keyboardWidth - rowWidth) / 2;

        row.forEach((key, colIndex) => {
            if (key === '') return;

            let keyWidth = rowHeight * keyWidthRatio;
            if (key === '✓' || key === '←') {
                keyWidth = rowHeight * keyWidthRatio * 1.5;
            }

            const x = startX + (keyWidth / 2);
            const y = (rowIndex * rowHeight) + (rowIndex * rowSpacing) + (rowHeight / 2);

            const button = scene.add.graphics();

            let keyText;

            if (key === '✓') {
                button.fillStyle(0x167D60, 1);
                keyText = scene.add.text(0, 0, key, {
                    fontSize: `${rowHeight * 0.4}px`,
                    color: '#FFFFFF',
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
                // Only handle virtual keyboard input if auth modal is not visible
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
                    } else {
                        scene.currentInputText += key;
                        scene.inputDisplay.setText(scene.currentInputText);
                    }
                }
            });

            keyboardContainer.add(keyButton);
            startX += keyWidth + keySpacing;
        });
    });

    keyboardContainer.setY(keyboardY);
}