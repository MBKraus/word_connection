let confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
let confettiAnimationId = null;

export function createConfettiEffect() {
    // Cancel any existing confetti animation
    if (confettiAnimationId) {
        clearInterval(confettiAnimationId);
    }

    const duration = 3000; // 3 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 2000, // Ensure confetti appears above all game elements
        shapes: ['square', 'circle'],
        colors: confettiColors,
        disableForReducedMotion: true // Accessibility consideration
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    // Create the confetti animation interval
    confettiAnimationId = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(confettiAnimationId);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Fire confetti from multiple origins for better coverage
        // Left side
        confetti(Object.assign({}, defaults, {
            particleCount: particleCount / 3,
            origin: { x: randomInRange(0.2, 0.3), y: 0.5 }
        }));

        // Center
        confetti(Object.assign({}, defaults, {
            particleCount: particleCount / 3,
            origin: { x: randomInRange(0.4, 0.6), y: 0.5 }
        }));

        // Right side
        confetti(Object.assign({}, defaults, {
            particleCount: particleCount / 3,
            origin: { x: randomInRange(0.7, 0.8), y: 0.5 }
        }));
    }, 250);
}