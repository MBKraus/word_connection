import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js';
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js';

const response = await fetch('https://mbkraus.github.io/word_connection/auth.txt');
const encodedData = await response.text();

const jsonString = atob(encodedData);
const firebaseConfig = JSON.parse(jsonString);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export function createAuthUI(scene) {
    const authContainerElement = document.createElement('div');
    authContainerElement.id = 'auth-container';
    authContainerElement.style.cssText = `
        position: absolute;
        background: white;
        font-family: 'Poppins', sans-serif;
        z-index: 1000;
    `;

    scene.authDOMElement = scene.add.dom(
        scene.game.scale.width * 0.02,
        scene.game.scale.height * 0.01,
        authContainerElement
    );

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

    const authButton = document.createElement('button');
    authButton.style.cssText = `
        background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%;
    `;
    authButton.innerHTML = `
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M56 49v-6a12 12 0 0 0-12-12H16a12 12 0 0 0-12 12v6"></path>
            <circle cx="32" cy="14" r="12"></circle>
        </svg>
    `;
    authContainerElement.appendChild(authButton);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            authContainerElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <span style="color: black; font-size: 35px !important;">
                ${user.displayName || user.email}
                </span>
                <button id="logoutBtn" style="background: none; border: none; cursor: pointer; padding: 8px;">
                <svg width="60" height="60" fill="none" stroke="black" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 42H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4h8"></path>
                <polyline points="32 34 42 24 32 14"></polyline>
                <line x1="42" y1="24" x2="18" y2="24"></line>
                </svg>
                </button>
            </div>
            `;
            document.getElementById('logoutBtn').onclick = () => signOut(auth);
        } else {
            authContainerElement.innerHTML = '';
            authContainerElement.appendChild(authButton);
            authButton.onclick = () => showAuthModal(modalContainer, overlay);
        }
    });
}

function recenterScreen() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function showAuthModal(modalContainer, overlay) {
    modalContainer.style.display = 'block';
    overlay.style.display = 'block';
    recenterScreen();

    modalContainer.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif;">Sign In</h2>
        <form id="authForm">
            <input type="email" id="email" placeholder="Email" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="password" id="password" placeholder="Password" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="width: 100%; padding: 8px; background: #4A90E2; color: white; border: none; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">
                Sign In
            </button>
            <p style="text-align: center; font-family: 'Poppins', sans-serif;">
                <span id="forgotPassword" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">Forgot Password?</span>
            </p>
        </form>
        <p style="text-align: center; font-family: 'Poppins', sans-serif;">No account? <span id="signUpLink" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">Sign Up!</span></p>
        <button id="googleSignIn" style="width: 100%; padding: 8px; display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">
            <img src="https://www.google.com/favicon.ico" width="16">Continue with Google
        </button>
        <button id="closeModal" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer;">×</button>
    `;

    document.getElementById('authForm').onsubmit = (e) => handleSignIn(e, modalContainer, overlay);
    document.getElementById('forgotPassword').onclick = () => showForgotPasswordModal(modalContainer);
    document.getElementById('signUpLink').onclick = () => showSignUpForm(modalContainer);
    document.getElementById('googleSignIn').onclick = () => handleGoogleSignIn(modalContainer, overlay);
    document.getElementById('closeModal').onclick = () => hideAuthModal(modalContainer, overlay);
}

function handleSignIn(e, modalContainer, overlay) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    signInWithEmailAndPassword(auth, email, password)
        .then(() => hideAuthModal(modalContainer, overlay))
        .catch((error) => alert("Sign-In Error: " + error.message));
}

function showSignUpForm(modalContainer) {
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

    document.getElementById('signUpForm').onsubmit = (e) => handleSignUp(e, modalContainer);
    document.getElementById('closeSignUpModal').onclick = () => hideAuthModal(modalContainer, overlay);
}

function handleSignUp(e, modalContainer) {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value.trim();
    createUserWithEmailAndPassword(auth, email, password)
        .then(() => hideAuthModal(modalContainer, overlay))
        .catch((error) => alert("Sign Up Error: " + error.message));
}

function showForgotPasswordModal(modalContainer) {
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

    document.getElementById('resetPasswordForm').onsubmit = (e) => handlePasswordReset(e, modalContainer);
    document.getElementById('closeResetModal').onclick = () => hideAuthModal(modalContainer, overlay);
}

function handlePasswordReset(e, modalContainer) {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value.trim();
    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Password reset email sent!");
            hideAuthModal(modalContainer, overlay);
        })
        .catch((error) => alert("Error: " + error.message));
}

function handleGoogleSignIn(modalContainer, overlay) {
    signInWithPopup(auth, googleProvider)
        .then(() => hideAuthModal(modalContainer, overlay))
        .catch((error) => alert("Google Sign-In Error: " + error.message));
}

function hideAuthModal(modalContainer, overlay) {
    modalContainer.style.display = 'none';
    overlay.style.display = 'none';
}