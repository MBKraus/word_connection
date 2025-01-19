import { gameConfig } from './config.js';
import { GameStorage, updateUserAndInitializeStats } from './gameStorage.js';
import { createDailyLimitScreen } from './screens/dailyLimit.js';
import { recenterScreen, TemplateLoader } from './utils.js';
import { hideWelcomeScreen } from './screens/welcome.js';

const firebaseAuth = await import(
    `https://www.gstatic.com/firebasejs/${gameConfig.firebaseVersion}/firebase-auth.js`
);

const { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    sendPasswordResetEmail 
} = firebaseAuth;

let isAuthSuccess = false;
let isAuthModalOpen = false;

// Cache templates
let authModalTemplate = null;
let resetPasswordTemplate = null;

// Global listener for auth events
// Fetches stats and checks if user has played today
export async function handleAuthStateChange(user) {
    await updateUserAndInitializeStats(user);
    let hasPlayedPerDB = null;
    
    if (user && !isAuthModalOpen) {
        hasPlayedPerDB = await GameStorage.hasPlayedTodayDB(user.uid);
        if (hasPlayedPerDB) {
            window.scene.dailyLimitControls = createDailyLimitScreen(window.scene, user);
            window.scene.dailyLimitControls.show();
        }
    }
    
    return hasPlayedPerDB;
}

// Load templates on init
async function initTemplates() {
    try {
        authModalTemplate = await TemplateLoader.loadTemplate('templates/auth-modal.html');
        resetPasswordTemplate = await TemplateLoader.loadTemplate('templates/reset-password.html');
    } catch (error) {
        console.error('Failed to load templates:', error);
    }
}

// UI Elements Setup
const modalContainer = setupModalContainer();
const overlay = setupOverlay();

function setupModalContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 1001;
        overflow-y: auto;
    `;
    document.body.appendChild(container);
    return container;
}

function setupOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    `;
    document.body.appendChild(overlay);
    return overlay;
}

// Auth Handler Functions
async function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
        await signInWithEmailAndPassword(window.auth, email, password);
        isAuthSuccess = true;
        await hideAuthModal();
    } catch (error) {
        const errorMessage = getAuthErrorMessage(error.code, 'signin');
        alert(errorMessage);
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        await createUserWithEmailAndPassword(window.auth, email, password);
        isAuthSuccess = true;
        await hideAuthModal();
    } catch (error) {
        const errorMessage = getAuthErrorMessage(error.code, 'signup');
        alert("Sign Up Error: " + errorMessage);
    }
}

async function handleGoogleSignIn() {
    try {
        await signInWithPopup(window.auth, googleProvider);
        isAuthSuccess = true;
        await hideAuthModal();
    } catch (error) {
        alert("Google Sign-In Error: " + error.message);
    }
}

function handlePasswordReset(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    sendPasswordResetEmail(window.auth, email)
        .then(() => {
            alert("Password reset email sent!");
            hideAuthModal();
        })
        .catch((error) => alert("Error: " + error.message));
}

// Error Message Handler
function getAuthErrorMessage(errorCode, mode) {
    const errorMessages = {
        signin: {
            'auth/invalid-credential': 'Invalid credentials. Please try again.',
            'auth/user-not-found': 'No account found with this email. Please sign up or check your email address.',
            'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
            'auth/invalid-email': 'The email address is not valid. Please enter a valid email address.',
            'auth/too-many-requests': 'Too many unsuccessful login attempts. Please try again later or reset your password.'
        },
        signup: {
            'auth/email-already-exists': 'The email address is already in use by another account.',
            'auth/invalid-email': 'The email address is not valid. Please enter a valid email.',
            'auth/password-does-not-meet-requirements': 'Password must meet the following requirements:\n- At least one uppercase letter\n- At least one numeric character\n- At least one non-alphanumeric character (e.g., !@#$%^&*)',
            'auth/operation-not-allowed': 'Sign-up is currently disabled. Please contact support.'
        }
    };

    return errorMessages[mode][errorCode] || 'An unexpected error occurred. Please try again later.';
}

// Modal Management Functions
async function showAuthModal(mode = 'signin') {
    if (!authModalTemplate) {
        await initTemplates();
    }

    isAuthModalOpen = true;
    isAuthSuccess = false;
    modalContainer.style.display = 'block';
    overlay.style.display = 'block';
    recenterScreen();

    const templateData = {
        title: mode === 'signup' ? 'Sign Up' : 'Sign In',
        buttonText: mode === 'signup' ? 'Sign Up' : 'Sign In',
        altText: mode === 'signup' ? 'Already have an account? Sign In' : 'No account? Sign Up!',
        showForgotPassword: mode === 'signin'
    };

    modalContainer.innerHTML = TemplateLoader.compile(authModalTemplate, templateData);

    // Event Listeners
    document.getElementById('authForm').onsubmit = mode === 'signup' ? handleSignUp : handleSignIn;
    if (mode === 'signin') {
        document.getElementById('forgotPassword').onclick = showForgotPasswordModal;
    }
    document.getElementById('altModeLink').onclick = () => showAuthModal(mode === 'signup' ? 'signin' : 'signup');
    document.getElementById('googleSignIn').onclick = handleGoogleSignIn;
    document.getElementById('closeModal').onclick = hideAuthModal;
}

async function hideAuthModal() {

    // Comment below out to turn off daily limit screen

    if (isAuthSuccess && window.auth.currentUser) {
        const hasPlayedPerDB = await GameStorage.hasPlayedTodayDB(auth.currentUser.uid);

        if (hasPlayedPerDB) {
            window.scene.dailyLimitControls = createDailyLimitScreen(window.scene, window.auth.currentUser);
            window.scene.dailyLimitControls.show();
        } else {
            try { hideWelcomeScreen(window.scene); } catch (error) {}
            try { window.scene.dailyLimitScreen.hide(); } catch (error) {}
            window.startGame(window.scene);
        }
    }
    
    modalContainer.style.display = 'none';
    overlay.style.display = 'none';
    isAuthModalOpen = false;
}

async function showForgotPasswordModal() {
    if (!resetPasswordTemplate) {
        await initTemplates();
    }

    modalContainer.innerHTML = resetPasswordTemplate;

    document.getElementById('resetPasswordForm').onsubmit = handlePasswordReset;
    document.getElementById('closeResetModal').onclick = hideAuthModal;
}

// Initialize templates
initTemplates();

export { showAuthModal, hideAuthModal};