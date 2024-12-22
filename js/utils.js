// Screen utility functions

export function isDesktop() {
    return !isMobile();
}

export function isMobile() {
    return isPhone() || isTablet();
}

export function isPhone() {
    return /Android(?!.*Tablet)|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTablet() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Detect iPads (both pre-iPadOS 13 and post-iPadOS 13, including desktop-mode iPads)
    const isIPad = /iPad/i.test(userAgent) || 
                   (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

    // Detect Android tablets
    const isAndroidTablet = /Android/i.test(userAgent) && !/Mobile/i.test(userAgent);

    // Generic "Tablet" keyword check
    const isGenericTablet = /Tablet/i.test(userAgent);

    return isIPad || isAndroidTablet || isGenericTablet;
}

export function recenterScreen() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Game logic helpers

export function isFuzzyMatchSimple(input, word) {
    // Character-by-Character Comparison with Early Exit
    if (Math.abs(input.length - word.length) > 1) return false; // Quick length check

    let mismatches = 0;
    let i = 0, j = 0;

    while (i < input.length && j < word.length) {
        if (input[i] !== word[j]) {
            mismatches++;
            if (mismatches > 1) return false;

            // Handle insertions/deletions by advancing the longer string
            if (input.length > word.length) {
                i++;
            } else if (input.length < word.length) {
                j++;
            } else {
                i++;
                j++;
            }
        } else {
            i++;
            j++;
        }
    }

    // Account for leftover characters
    mismatches += Math.abs((input.length - i) - (word.length - j));
    return mismatches <= 1;
}

export function calculateRoundPoints(timeRemaining, topicsGuessed) {
    const points = {
        wordPoints: topicsGuessed * 30,
        roundBonus: 50,
        timeBonus: 0
    };

    if (timeRemaining >= 30) {
        points.timeBonus = 30;
    } else if (timeRemaining >= 10 && timeRemaining < 30) {
        points.timeBonus = 10;
    }

    return points;
}

// Timer helpers

export function createNextGameTimer(getNextPlayTime, defaultOnUpdate) {
    let interval;
    let currentOnUpdate = defaultOnUpdate;
    let initialUpdateComplete = false;

    const update = () => {
        const now = new Date();
        const nextPlay = getNextPlayTime();
        const diff = nextPlay - now;

        if (diff <= 0) {
            currentOnUpdate("Next puzzle available now!", true);
            initialUpdateComplete = true;
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        currentOnUpdate(`${hours}h ${minutes}m ${seconds}s`, true);
        initialUpdateComplete = true;
    };

    const start = () => {
        update(); // Run immediately
        interval = setInterval(update, 1000);
    };

    const setOnUpdate = (callback) => {
        currentOnUpdate = callback || defaultOnUpdate;
    };

    const isInitialUpdateComplete = () => initialUpdateComplete;

    return { start, setOnUpdate, isInitialUpdateComplete };
}

export function getNextPlayTime() {
    // Get tomorrow's date at 00:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
}
