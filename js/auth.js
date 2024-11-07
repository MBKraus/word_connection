// Modified auth.js
import { getFirebaseApp } from './firebaseInit.js';
import { hasPlayedTodayDB } from './gameStorage.js';
import { createDailyLimitScreen } from './screens/dailyLimit.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { hideWelcomeScreen } from './screens/welcome.js';

const app = await getFirebaseApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Create and manage modal containers
const modalContainer = document.createElement('div');
modalContainer.style.cssText = `
    display: none; position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%); background: white; padding: 20px;
    border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); z-index: 1001;
    width: 300px;
`;
document.body.appendChild(modalContainer);

const overlay = document.createElement('div');
overlay.style.cssText = `
    display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.5); z-index: 1000;
`;
document.body.appendChild(overlay);

// Track modal state
let isAuthModalOpen = false;

function recenterScreen() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

// Only start checking for daily limit after successful auth and modal close
onAuthStateChanged(auth, async (user) => {
    if (user && !isAuthModalOpen) {
        const hasPlayed = await hasPlayedTodayDB(user.uid);
        if (hasPlayed) {
            const dailyLimitScreen = createDailyLimitScreen(window.gameScene);
            dailyLimitScreen.show();
        }
    }
});

function showAuthModal(mode = 'signin') {
    isAuthModalOpen = true;
    modalContainer.style.display = 'block';
    overlay.style.display = 'block';
    recenterScreen();

    const title = mode === 'signup' ? 'Sign Up' : 'Sign In';
    const buttonText = mode === 'signup' ? 'Sign Up' : 'Sign In';
    const altText = mode === 'signup' ? 'Already have an account? Sign In' : 'No account? Sign Up!';
    const altMode = mode === 'signup' ? 'signin' : 'signup';


    modalContainer.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif;">${title}</h2>
        <form id="authForm">
            <input type="email" id="email" placeholder="Email" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="password" id="password" placeholder="Password" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="width: 100%; padding: 8px; background: #4A90E2; color: white; border: none; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">
                ${buttonText}
            </button>
            ${mode === 'signin' ? `
            <p style="text-align: center; font-family: 'Poppins', sans-serif;">
                <span id="forgotPassword" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">Forgot Password?</span>
            </p>
            ` : ''}
        </form>
        <p style="text-align: center; font-family: 'Poppins', sans-serif;">
            <span id="altModeLink" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">${altText}</span>
        </p>
        <button id="googleSignIn" style="width: 100%; padding: 8px; display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">
            <img src="https://www.google.com/favicon.ico" width="16">Continue with Google
        </button>
        <button id="closeModal" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer;">×</button>
    `;

    document.getElementById('authForm').onsubmit = mode === 'signup' ? handleSignUp : handleSignIn;
    if (mode === 'signin') {
        document.getElementById('forgotPassword').onclick = showForgotPasswordModal;
    }
    document.getElementById('altModeLink').onclick = () => showAuthModal(altMode);
    document.getElementById('googleSignIn').onclick = handleGoogleSignIn;
    document.getElementById('closeModal').onclick = hideAuthModal;
}


// Check if user has played today (via the DB). 
// If so, show daily limit screen. Otherwise, proceed with game start
async function handleAuthSuccess() {
    if (!auth.currentUser) return;
    
    const hasPlayed = await hasPlayedTodayDB(auth.currentUser.uid);
    
    // Only proceed if the modal is closed
    if (!isAuthModalOpen) {
        if (hasPlayed) {
            const dailyLimitScreen = createDailyLimitScreen(window.gameScene);
            dailyLimitScreen.show();
        } else {
            hideWelcomeScreen(window.gameScene);
            window.startGame(window.gameScene);
        }
    }
}

function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            hideAuthModal();
        })
        .catch((error) => alert("Sign-In Error: " + error.message));
}

function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value.trim();
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            hideAuthModal();
        })
        .catch((error) => alert("Sign Up Error: " + error.message));
}

function handleGoogleSignIn() {
    signInWithPopup(auth, googleProvider)
        .then(() => {
            hideAuthModal();
        })
        .catch((error) => alert("Google Sign-In Error: " + error.message));
}


function showSignUpForm() {
    modalContainer.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif;">Sign Up</h2>
        <form id="signUpForm">
            <input type="email" id="signUpEmail" placeholder="Email" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="password" id="signUpPassword" placeholder="Password" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="width: 100%; padding: 8px; background: #4A90E2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Sign Up
            </button>
        </form>
        <button id="closeSignUpModal" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer;">×</button>
    `;

    document.getElementById('signUpForm').onsubmit = handleSignUp;
    document.getElementById('closeSignUpModal').onclick = hideAuthModal;
}



function showForgotPasswordModal() {
    modalContainer.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif;">Reset Password</h2>
        <form id="resetPasswordForm">
            <input type="email" id="resetEmail" placeholder="Enter your email" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="width: 100%; padding: 8px; background: #4A90E2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Send Reset Link
            </button>
        </form>
        <button id="closeResetModal" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer;">×</button>
    `;

    document.getElementById('resetPasswordForm').onsubmit = handlePasswordReset;
    document.getElementById('closeResetModal').onclick = hideAuthModal;
}

function handlePasswordReset(e) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password reset email sent!");
            hideAuthModal();
        })
        .catch((error) => alert("Error: " + error.message));
}

function hideAuthModal() {
    modalContainer.style.display = 'none';
    overlay.style.display = 'none';
    isAuthModalOpen = false;
    
    // Now that the modal is closed, we can check auth state and proceed
    if (auth.currentUser) {
        handleAuthSuccess();
    }
}

export { showAuthModal, auth, hideAuthModal };