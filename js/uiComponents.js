// uiComponents.js

import { isMobile } from './utils.js';

export function createHeader(scene) {
    const headerText = scene.add.text(
        scene.cameras.main.centerX, 
        scene.game.scale.height * 0.025, 
        'Word game', 
        {
            fontSize: scene.game.scale.width * 0.05 + 'px',
            color: '#000000',
            fontFamily: 'Play',
            fontWeight: 'bold',
        }
    ).setOrigin(0.5);
    return headerText;
}

export function createAdContainer() {
    const adContainer = document.getElementById('ad-container');
    const adElement = adContainer.querySelector('.adsbygoogle');
    
    if (isMobile()) {
        adElement.style.width = '300px';
        adElement.style.height = '50px';
        adElement.dataset.adFormat = 'mobile';
    } else {
        adElement.style.width = '728px';
        adElement.style.height = '90px';
        adElement.dataset.adFormat = 'horizontal';
    }

    adContainer.style.top = '50px';  // Adjust as needed

    // Initialize AdSense
    (adsbygoogle = window.adsbygoogle || []).push({});
}