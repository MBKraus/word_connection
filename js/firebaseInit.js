// firebaseInit.js

let firebaseAppPromise = null;

export async function initializeFirebase() {
    // Only initialize once
    if (!firebaseAppPromise) {
        firebaseAppPromise = (async () => {
            try {
                const response = await fetch('./auth.txt');
                const encodedData = await response.text();
                const jsonString = atob(encodedData);
                const firebaseConfig = JSON.parse(jsonString);
                
                const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');
                const app = initializeApp(firebaseConfig);
                return app;
            } catch (error) {
                console.error('Error initializing Firebase:', error);
                throw error;
            }
        })();
    }
    return firebaseAppPromise;
}

export async function getFirebaseApp() {
    if (!firebaseAppPromise) {
        return initializeFirebase();
    }
    return firebaseAppPromise;
}
