/**
 * SaleFinder Authentication Script
 * Provides user registration, login, state persistence, tab toggling, and toast feedback.
 */

// Initialize state & local storage
const STORAGE_KEY = 'salefinder_users';
let currentMode = 'register'; // 'register' or 'login'

// Helper to get registered users from localStorage
function getUsers() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading localStorage:', e);
        return [];
    }
}

// Helper to save users to localStorage
function saveUsers(users) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

/**
 * Switch form mode between 'register' and 'login'
 * @param {'register'|'login'} mode 
 */
function switchMode(mode) {
    currentMode = mode;
    const body = document.body;
    const tabRegister = document.getElementById('tab-register');
    const tabLogin = document.getElementById('tab-login');
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const btnRegister = document.getElementById('btn-create-account');
    const btnLogin = document.getElementById('btn-login-action');
    const orDivider = document.getElementById('or-divider');
    const footerText = document.getElementById('footer-text');

    if (mode === 'register') {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');

        if (nameGroup) nameGroup.style.display = 'block';
        if (roleGroup) roleGroup.style.display = 'block';
        if (btnRegister) btnRegister.style.display = 'inline-flex';
        if (btnLogin) btnLogin.style.display = 'inline-flex';
        if (orDivider) orDivider.style.display = 'flex';

        if (footerText) {
            footerText.innerHTML = `By signing up, you agree to our <a href="#">Terms of Service</a> & <a href="#">Privacy Policy</a>.`;
        }
    } else {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');

        if (nameGroup) nameGroup.style.display = 'none';
        if (roleGroup) roleGroup.style.display = 'none';
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnLogin) {
            btnLogin.style.display = 'inline-flex';
            btnLogin.className = 'btn btn-primary'; // Make login button the primary action
        }
        if (orDivider) orDivider.style.display = 'none';

        if (footerText) {
            footerText.innerHTML = `Don't have an account yet? <a href="#" onclick="switchMode('register')">Sign up here</a>.`;
        }
    }
}

/**
 * Toggle password input visibility
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('password-eye-icon');

    if (!passwordInput || !eyeIcon) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

/**
 * Show a toast notification on screen
 * @param {string} title 
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 */
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-desc">${message}</div>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove toast after 3.5 seconds
    setTimeout(() => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * Validate email address format
 * @param {string} email 
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

/**
 * Register User Function (Invoked by Create Account button)
 */
function register() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleInput = document.getElementById('role');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const role = roleInput ? roleInput.value : 'customer';

    // Validation
    if (!name) {
        showToast('Validation Error', 'Please enter your full name.', 'error');
        nameInput.focus();
        return;
    }

    if (!email) {
        showToast('Validation Error', 'Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Invalid Email', 'Please enter a valid email address (e.g. name@domain.com).', 'error');
        emailInput.focus();
        return;
    }

    if (!password) {
        showToast('Validation Error', 'Please choose a password.', 'error');
        passwordInput.focus();
        return;
    }

    if (password.length < 6) {
        showToast('Weak Password', 'Password must be at least 6 characters long.', 'error');
        passwordInput.focus();
        return;
    }

    // Check if user already exists
    const users = getUsers();
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
        showToast('Account Exists', `An account with ${email} already exists. Please log in.`, 'error');
        return;
    }

    // Store new user
    const newUser = {
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    showToast('Registration Successful!', `Welcome to SaleFinder, ${name}! Your ${role} account has been created.`, 'success');

    // Optionally switch to login tab or clear fields
    setTimeout(() => {
        switchMode('login');
        if (emailInput) emailInput.value = email;
        if (passwordInput) passwordInput.value = '';
    }, 1200);
}

/**
 * Login User Function (Invoked by Login button)
 */
function login() {
    // If user clicked login while on register view and wants to switch
    if (currentMode === 'register' && !document.getElementById('email').value) {
        switchMode('login');
        return;
    }

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    // Validation
    if (!email) {
        showToast('Validation Error', 'Please enter your email address.', 'error');
        emailInput.focus();
        return;
    }

    if (!password) {
        showToast('Validation Error', 'Please enter your password.', 'error');
        passwordInput.focus();
        return;
    }

    // Check credentials
    const users = getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!matchedUser) {
        // Provide demo hint if local storage is empty
        if (users.length === 0) {
            showToast('No Users Found', 'No accounts registered yet. Please create an account first!', 'info');
        } else {
            showToast('Authentication Failed', 'Invalid email or password. Please try again.', 'error');
        }
        return;
    }

    // Successful login
    showToast(
        'Login Successful!',
        `Welcome back, ${matchedUser.name}! Logged in as ${matchedUser.role.toUpperCase()}.`,
        'success'
    );

    // Save session in localStorage / sessionStorage
    sessionStorage.setItem('current_user', JSON.stringify({
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role
    }));

    // Redirect to sale-details.html after short delay
    setTimeout(() => {
        window.location.href = 'sale-details.html';
    }, 1200);

    console.log('Logged in user:', matchedUser);
}

// Attach Enter key press handler for quick submission
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (currentMode === 'register') {
                    register();
                } else {
                    login();
                }
            }
        });
    }
});
