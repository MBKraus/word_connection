// Device detection utility functions
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

export function isDesktop() {
    return !isMobile();
}