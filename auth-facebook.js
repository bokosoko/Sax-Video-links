/**
 * Facebook-Only Authentication System for ViralVid
 * Handles user login and signup exclusively through Facebook
 */

// Global authentication state
let currentUser = null;
let isAuthenticated = false;

/**
 * Initialize authentication system
 */
function initAuth() {
    // Check for existing session
    checkExistingSession();
    
    // Initialize Facebook SDK integration
    if (window.facebookLoginHandler) {
        window.facebookLoginHandler.init();
    }
}

/**
 * Check for existing user session
 */
function checkExistingSession() {
    const userData = localStorage.getItem('viralvid_user');
    const sessionToken = localStorage.getItem('viralvid_session');
    
    if (userData && sessionToken) {
        try {
            currentUser = JSON.parse(userData);
            isAuthenticated = true;
            updateAuthUI();
        } catch (error) {
            console.error('Error parsing user data:', error);
            clearSession();
        }
    }
}

/**
 * Handle Facebook login (called from UI)
 */
async function handleFacebookLogin() {
    if (window.facebookLoginHandler) {
        await window.facebookLoginHandler.login();
    } else {
        showError('Facebook login is not available. Please refresh the page.');
    }
}

/**
 * Handle traditional login (now disabled for public users)
 */
function handleLogin(event) {
    event.preventDefault();
    
    // Show Facebook-only message
    showError('Traditional login is no longer available. Please use Facebook login for security.');
    
    // Close current modal and open Facebook login
    closeModal('loginModal');
    setTimeout(() => {
        openLoginModal();
    }, 500);
}

/**
 * Handle traditional signup (now disabled for public users)
 */
function handleSignup(event) {
    event.preventDefault();
    
    // Show Facebook-only message
    showError('Traditional signup is no longer available. Please use Facebook signup for security.');
    
    // Close current modal and open Facebook signup
    closeModal('signupModal');
    setTimeout(() => {
        openSignupModal();
    }, 500);
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        // Use Facebook logout handler if available
        if (window.facebookLoginHandler) {
            await window.facebookLoginHandler.logout();
        } else {
            // Fallback logout
            clearSession();
            updateAuthUI();
            showSuccess('Logged out successfully.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showError('Logout failed. Please try again.');
    }
}

/**
 * Clear user session
 */
function clearSession() {
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('viralvid_user');
    localStorage.removeItem('viralvid_session');
}

/**
 * Update authentication UI
 */
function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const userProfile = document.getElementById('user-profile');
    
    if (isAuthenticated && currentUser) {
        // Hide login/signup buttons
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        
        // Show user profile
        if (userProfile) {
            userProfile.style.display = 'flex';
            userProfile.innerHTML = `
                <img src="${currentUser.picture || '/assets/default-avatar.png'}" 
                     alt="${currentUser.name}" 
                     class="user-avatar">
                <span class="user-name">${currentUser.name}</span>
                <button onclick="handleLogout()" class="logout-btn">Logout</button>
            `;
        }
        
        // Update other UI elements
        updateVideoUploadAccess(true);
        
    } else {
        // Show login/signup buttons
        if (loginBtn) loginBtn.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'block';
        
        // Hide user profile
        if (userProfile) {
            userProfile.style.display = 'none';
            userProfile.innerHTML = '';
        }
        
        // Update other UI elements
        updateVideoUploadAccess(false);
    }
}

/**
 * Update video upload access based on authentication
 */
function updateVideoUploadAccess(hasAccess) {
    const uploadButtons = document.querySelectorAll('.upload-video-btn, .btn[onclick*="upload"]');
    
    uploadButtons.forEach(button => {
        if (hasAccess) {
            button.disabled = false;
            button.onclick = () => openVideoUpload();
        } else {
            button.onclick = () => {
                showError('Please log in with Facebook to upload videos.');
                openLoginModal();
            };
        }
    });
}

/**
 * Check if user is authenticated
 */
function isUserAuthenticated() {
    return isAuthenticated && currentUser !== null;
}

/**
 * Get current user data
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Require authentication for protected actions
 */
function requireAuth(callback, errorMessage = 'Please log in to continue.') {
    if (isUserAuthenticated()) {
        callback();
    } else {
        showError(errorMessage);
        openLoginModal();
    }
}

/**
 * Modal management functions
 */
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openSignupModal() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function switchModal(fromModalId, toModalId) {
    closeModal(fromModalId);
    setTimeout(() => {
        if (toModalId === 'loginModal') {
            openLoginModal();
        } else if (toModalId === 'signupModal') {
            openSignupModal();
        }
    }, 300);
}

/**
 * Utility functions for user feedback
 */
function showSuccess(message) {
    console.log('Success:', message);
    showNotification(message, 'success');
}

function showError(message) {
    console.error('Error:', message);
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4caf50, #81c784)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #e57373)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #2196f3, #64b5f6)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Initialize authentication when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

// Close modals when clicking outside
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        const modalId = event.target.id;
        closeModal(modalId);
    }
});

// Close modals with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="flex"]');
        openModals.forEach(modal => {
            closeModal(modal.id);
        });
    }
});

