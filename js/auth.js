// auth.js
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
    // Set up containers and modal
    const authContainer = document.createElement('div');
    authContainer.id = 'auth-container';
    authContainer.style.cssText = `
        position: absolute; 
        top: ${(scene.game.scale.height * 0.003)}px;
        left: ${window.innerWidth < 728 ? '10px' : `${scene.game.scale.width * 0.14}px`};  /* Fixed calculation */
        z-index: 1000; 
        background: white;
        font-family: 'Poppins', sans-serif;
    `;
    scene.game.canvas.parentElement.appendChild(authContainer);

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
        background: rgba(255, 255, 255, 0); z-index: 1000;
    `;
    document.body.appendChild(overlay);

    const authButton = document.createElement('button');
    authButton.style.cssText = `
        background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%;
    `;
    authContainer.appendChild(authButton);

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            authContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: black;">
                        ${user.displayName || user.email}
                    </span>
                    <button id="logoutBtn" style="background: none; border: none; cursor: pointer; padding: 4px;">
                        <svg width="25" height="25" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            `;
            document.getElementById('logoutBtn').onclick = () => signOut(auth);
        } else {
            // User is signed out
            authContainer.innerHTML = `
                <button id="authBtn" style="background: none; border: none; cursor: pointer; padding: 4px;">
                    <svg width="24" height="24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </button>
            `;
            document.getElementById('authBtn').onclick = showAuthModal;
        }
    });

    function showAuthModal() {
        modalContainer.style.display = 'block';
        overlay.style.display = 'block';
        
        modalContainer.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif;">Sign In</h2>
        <form id="authForm">
            <input type="email" id="email" placeholder="Email" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <input type="password" id="password" placeholder="Password" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="width: 100%; padding: 8px; background: #4A90E2; color: white; border: none; border-radius: 4px; margin-bottom: 10px; cursor: pointer;">
                Sign In
            </button>
        </form>
        <p style="text-align: center; font-family: 'Poppins', sans-serif;">No account? <span id="signUpLink" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">Sign Up!</span></p>
        <p style="text-align: center; font-family: 'Poppins', sans-serif;">
            <span id="forgotPasswordLink" style="color: #4A90E2; cursor: pointer; text-decoration: underline;">Forgot Password?</span>
        </p>
        <button id="googleSignIn" style="width: 100%; padding: 8px; display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">
            <img src="https://www.google.com/favicon.ico" width="16">Continue with Google
        </button>
        <button id="closeModal" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer;">×</button>
        `;
    
        // Event listener for sign-in
        document.getElementById('authForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            try {
                await signInWithEmailAndPassword(auth, email, password);
                modalContainer.style.display = 'none';
                overlay.style.display = 'none';
                recenterScreen();  // Call recenter function on successful sign-in
            } catch (error) {
                alert("Sign-In Error: " + error.message);
            }
        };
    
        // Event listener for the "Sign Up!" link
        document.getElementById('signUpLink').onclick = () => {
            showSignUpForm();
        };
    
        // Event listener for "Forgot Password?"
        document.getElementById('forgotPasswordLink').onclick = () => {
            showForgotPasswordModal();
        };
    
        // Event listener for Google sign-in
        document.getElementById('googleSignIn').onclick = async () => {
            try {
                await signInWithPopup(auth, googleProvider);
                modalContainer.style.display = 'none';
                overlay.style.display = 'none';
                recenterScreen();  // Call recenter function on successful sign-in
            } catch (error) {
                alert("Google Sign-In Error: " + error.message);
            }
        };
    
        // Close modal event
        closeModal();
    }

    function showForgotPasswordModal() {
        modalContainer.style.display = 'block';
        overlay.style.display = 'block';
        
        modalContainer.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Poppins', sans-serif;">Reset Password</h2>
        <form id="resetPasswordForm">
            <input type="email" id="resetEmail" placeholder="Enter your email" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px;">
            <button type="submit" style="width: 100%; padding: 8px; background: #4A90E2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Reset Password
            </button>
        </form>
        <button id="closeResetModal" style="position: absolute; top: 10px; right: 10px; font-size: 20px; cursor: pointer;">×</button>
        `;
    
        // Event listener for reset password
        document.getElementById('resetPasswordForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value.trim();
            try {
                await sendPasswordResetEmail(auth, email);
                alert("Password reset email sent!");
                modalContainer.style.display = 'none';
                overlay.style.display = 'none';
                recenterScreen();  // Call recenter function on successful reset
            } catch (error) {
                alert("Error: " + error.message);
            }
        };
    
        // Close reset password modal
        closeModal();
    }

    function showSignUpForm() {
        modalContainer.style.display = 'block';
        overlay.style.display = 'block';
        
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
    
        // Event listener for sign up
        document.getElementById('signUpForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('signUpEmail').value.trim();
            const password = document.getElementById('signUpPassword').value.trim();
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                modalContainer.style.display = 'none';
                overlay.style.display = 'none';
                recenterScreen();  // Call recenter function on successful sign-up
            } catch (error) {
                alert("Sign Up Error: " + error.message);
            }
        };
    
        // Close sign-up modal
        closeModal();
    }

    function closeModal() {
        const closeButtons = document.querySelectorAll('#closeModal, #closeResetModal, #closeSignUpModal');
        closeButtons.forEach(button => {
            button.onclick = () => {
                modalContainer.style.display = 'none';
                overlay.style.display = 'none';
                recenterScreen();  // Call recenter function when modal is closed
            };
        });
    }

    function recenterScreen() {
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            window.scrollTo(0, 0); // Scroll to top for mobile
        }
    }
}
