import { getFirebaseApp } from './firebaseInit.js';
import { GameStorage } from './gameStorage.js';
import { createDailyLimitScreen } from './screens/dailyLimit.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { hideWelcomeScreen } from './screens/welcome.js';

const app = await getFirebaseApp();
const auth = getAuth(app);
window.auth = auth; 
const googleProvider = new GoogleAuthProvider();

let isAuthSuccess = false;

// Modified modal container for fullscreen
const modalContainer = document.createElement('div');
modalContainer.style.cssText = `
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
document.body.appendChild(modalContainer);

// Modified overlay (can be used for background effects)
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
        const hasPlayed = await GameStorage.hasPlayedTodayDB(user.uid);
        if (hasPlayed) {
            console.log("has played per DB check ")
            // const dailyLimitScreen = createDailyLimitScreen(window.gameScene);
            // dailyLimitScreen.show();
        } 
    }
});

function showAuthModal(mode = 'signin') {
    isAuthModalOpen = true;
    isAuthSuccess = false;
    modalContainer.style.display = 'block';
    overlay.style.display = 'block';
    recenterScreen();

    const title = mode === 'signup' ? 'Sign Up' : 'Sign In';
    const buttonText = mode === 'signup' ? 'Sign Up' : 'Sign In';
    const altText = mode === 'signup' ? 'Already have an account? Sign In' : 'No account? Sign Up!';
    const altMode = mode === 'signup' ? 'signin' : 'signup';

    modalContainer.innerHTML = `
        <div style="
            max-width: 400px;
            margin: 40px auto;
            padding: 20px;
            box-sizing: border-box;
        ">
            <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif; text-align: center;">${title}</h2>
            <form id="authForm">
                <input type="email" id="email" placeholder="Email" required style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                ">
                <input type="password" id="password" placeholder="Password" required style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                ">
                <button type="submit" style="
                    width: 100%;
                    padding: 12px;
                    background: black;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">
                    ${buttonText}
                </button>
                ${mode === 'signin' ? 
                `<p style="text-align: center; font-family: 'Poppins', sans-serif;">
                    <span id="forgotPassword" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">Forgot Password?</span>
                </p>` : ''}
            </form>
            <p style="text-align: center; font-family: 'Poppins', sans-serif;">
                <span id="altModeLink" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">${altText}</span>
            </p>
            <button id="googleSignIn" style="
                width: 100%;
                padding: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                background: white;
                border: 1px solid #ccc;
                border-radius: 8px;
                cursor: pointer;
                margin-bottom: 16px;
                font-size: 16px;
            ">
                <img src="https://www.google.com/favicon.ico" width="16">Continue with Google
            </button>
            <button id="closeModal" style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                font-size: 24px;
                cursor: pointer;
                background: none;
                border: none;
                color: #666;
            ">×</button>
        </div>
    `;

    document.getElementById('authForm').onsubmit = mode === 'signup' ? handleSignUp : handleSignIn;
    if (mode === 'signin') {
        document.getElementById('forgotPassword').onclick = showForgotPasswordModal;
    }
    document.getElementById('altModeLink').onclick = () => showAuthModal(altMode);
    document.getElementById('googleSignIn').onclick = handleGoogleSignIn;
    document.getElementById('closeModal').onclick = hideAuthModal;
}

// Modified password reset modal to be fullscreen as well
function showForgotPasswordModal() {
    modalContainer.innerHTML = `
        <div style="
            max-width: 400px;
            margin: 40px auto;
            padding: 20px;
            box-sizing: border-box;
        ">
            <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif; text-align: center;">Reset Password</h2>
            <form id="resetPasswordForm">
                <input type="email" id="resetEmail" placeholder="Enter your email" required style="
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                ">
                <button type="submit" style="
                    width: 100%;
                    padding: 12px;
                    background: black;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 500;
                ">
                    Send Reset Link
                </button>
            </form>
            <button id="closeResetModal" style="
                position: fixed;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                font-size: 24px;
                cursor: pointer;
                background: none;
                border: none;
                color: #666;
            ">×</button>
        </div>
    `;

    document.getElementById('resetPasswordForm').onsubmit = handlePasswordReset;
    document.getElementById('closeResetModal').onclick = hideAuthModal;
}

// Rest of the functions remain the same
async function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
        await signInWithEmailAndPassword(auth, email, password);
        isAuthSuccess = true;
        await hideAuthModal();
    } catch (error) {
        let errorMessage;
        console.log(error.code)
        switch (error.code) {
            case 'auth/invalid-credential':
                errorMessage = 'Invalid credentials. Please try again.';
                break
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email. Please sign up or check your email address.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again or reset your password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'The email address is not valid. Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
                break;
            default:
                errorMessage = 'Sign-In Error: ' + error.message;
        }
        alert(errorMessage);
    }
}

async function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        isAuthSuccess = true;
        await hideAuthModal();
    } catch (error) {
        alert("Sign Up Error: " + error.message);
    }
}

async function handleGoogleSignIn() {
    try {
        await signInWithPopup(auth, googleProvider);
        isAuthSuccess = true;
        await hideAuthModal();
    } catch (error) {
        alert("Google Sign-In Error: " + error.message);
    }
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

async function hideAuthModal() {

    // if (isAuthSuccess && auth.currentUser) {
    //     const hasPlayed = await GameStorage.hasPlayedTodayDB(auth.currentUser.uid);
        
    //     if (hasPlayed) {
    //         modalContainer.style.display = 'none';
    //         overlay.style.display = 'none';
    //         isAuthModalOpen = false;
    //         const dailyLimitScreen = createDailyLimitScreen(window.gameScene);
    //         dailyLimitScreen.show();
    //     } else if (window.gameScene) {
    //         modalContainer.style.display = 'none';
    //         overlay.style.display = 'none';
    //         isAuthModalOpen = false;
    //         hideWelcomeScreen(window.gameScene);
    //         window.startGame(window.gameScene);
    //     }} else {
    //         modalContainer.style.display = 'none';
    //         overlay.style.display = 'none';
    //         isAuthModalOpen = false;
    //     }


    if (isAuthSuccess && auth.currentUser) {
        const hasPlayed = await GameStorage.hasPlayedTodayDB(auth.currentUser.uid);
            
        modalContainer.style.display = 'none';
        overlay.style.display = 'none';
        isAuthModalOpen = false;
        
        hideWelcomeScreen(window.gameScene);
        window.startGame(window.gameScene);
    } else {
        modalContainer.style.display = 'none';
        overlay.style.display = 'none';
        isAuthModalOpen = false;
        }
}

export { showAuthModal, auth, hideAuthModal };
