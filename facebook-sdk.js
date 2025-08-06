/**
 * Facebook SDK Integration for ViralVid
 * Handles Facebook Login authentication
 */

class FacebookSDK {
    constructor() {
        this.isInitialized = false;
        this.appId = null;
        this.apiVersion = 'v18.0';
        this.initPromise = null;
    }

    /**
     * Initialize Facebook SDK
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                // Get Facebook app configuration from backend
                const configResponse = await fetch('/api/facebook/config');
                const config = await configResponse.json();
                
                this.appId = config.app_id;
                this.apiVersion = config.version || 'v18.0';

                // Load Facebook SDK
                await this.loadSDK();

                // Initialize Facebook SDK
                window.FB.init({
                    appId: this.appId,
                    cookie: true,
                    xfbml: true,
                    version: this.apiVersion
                });

                this.isInitialized = true;
                console.log('Facebook SDK initialized successfully');
                resolve();
            } catch (error) {
                console.error('Failed to initialize Facebook SDK:', error);
                reject(error);
            }
        });

        return this.initPromise;
    }

    /**
     * Load Facebook SDK script
     */
    loadSDK() {
        return new Promise((resolve, reject) => {
            // Check if SDK is already loaded
            if (window.FB) {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                console.log('Facebook SDK script loaded');
                resolve();
            };

            script.onerror = () => {
                reject(new Error('Failed to load Facebook SDK script'));
            };

            // Add to document
            document.head.appendChild(script);
        });
    }

    /**
     * Check if user is logged in to Facebook
     */
    async getLoginStatus() {
        if (!this.isInitialized) {
            await this.init();
        }

        return new Promise((resolve) => {
            window.FB.getLoginStatus((response) => {
                resolve(response);
            });
        });
    }

    /**
     * Login with Facebook
     */
    async login(permissions = ['email', 'public_profile']) {
        if (!this.isInitialized) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            window.FB.login((response) => {
                if (response.authResponse) {
                    console.log('Facebook login successful:', response);
                    resolve(response);
                } else {
                    console.log('Facebook login failed or cancelled');
                    reject(new Error('Facebook login failed or cancelled'));
                }
            }, { scope: permissions.join(',') });
        });
    }

    /**
     * Logout from Facebook
     */
    async logout() {
        if (!this.isInitialized) {
            await this.init();
        }

        return new Promise((resolve) => {
            window.FB.logout((response) => {
                console.log('Facebook logout successful:', response);
                resolve(response);
            });
        });
    }

    /**
     * Get user profile information
     */
    async getUserProfile(fields = 'id,name,email,picture') {
        if (!this.isInitialized) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            window.FB.api('/me', { fields: fields }, (response) => {
                if (response && !response.error) {
                    resolve(response);
                } else {
                    reject(response.error || new Error('Failed to get user profile'));
                }
            });
        });
    }

    /**
     * Verify access token with backend
     */
    async verifyToken(accessToken) {
        try {
            const response = await fetch('/api/facebook/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Token verification failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete login process with backend
     */
    async completeLogin(accessToken) {
        try {
            const response = await fetch('/api/facebook/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_token: accessToken
                })
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Backend login failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Complete logout process with backend
     */
    async completeLogout() {
        try {
            const response = await fetch('/api/facebook/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Backend logout failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Create global instance
window.FacebookSDK = new FacebookSDK();

/**
 * Facebook Login Handler for ViralVid
 */
class FacebookLoginHandler {
    constructor() {
        this.sdk = window.FacebookSDK;
        this.currentUser = null;
        this.isLoggedIn = false;
    }

    /**
     * Initialize Facebook login handler
     */
    async init() {
        try {
            await this.sdk.init();
            await this.checkLoginStatus();
        } catch (error) {
            console.error('Failed to initialize Facebook login handler:', error);
            this.showError('Failed to initialize Facebook login. Please refresh the page.');
        }
    }

    /**
     * Check current login status
     */
    async checkLoginStatus() {
        try {
            const status = await this.sdk.getLoginStatus();
            
            if (status.status === 'connected') {
                // User is logged in to Facebook and has authorized the app
                const accessToken = status.authResponse.accessToken;
                const verification = await this.sdk.verifyToken(accessToken);
                
                if (verification.success) {
                    this.currentUser = verification.user;
                    this.isLoggedIn = true;
                    this.updateUI();
                } else {
                    console.log('Token verification failed:', verification.error);
                    this.logout();
                }
            } else {
                // User is not logged in or hasn't authorized the app
                this.isLoggedIn = false;
                this.currentUser = null;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        }
    }

    /**
     * Handle Facebook login
     */
    async login() {
        try {
            this.showLoading('Connecting to Facebook...');
            
            const loginResponse = await this.sdk.login(['email', 'public_profile']);
            const accessToken = loginResponse.authResponse.accessToken;
            
            this.showLoading('Verifying your account...');
            
            // Verify token and complete login with backend
            const loginResult = await this.sdk.completeLogin(accessToken);
            
            if (loginResult.success) {
                this.currentUser = loginResult.user;
                this.isLoggedIn = true;
                this.updateUI();
                this.showSuccess('Login successful! Welcome to ViralVid.');
                
                // Store session data
                localStorage.setItem('viralvid_user', JSON.stringify(this.currentUser));
                localStorage.setItem('viralvid_session', loginResult.session_token);
                
                // Close login modal if open
                this.closeLoginModal();
                
            } else {
                throw new Error(loginResult.error || 'Login failed');
            }
            
        } catch (error) {
            console.error('Facebook login error:', error);
            this.showError('Login failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle logout
     */
    async logout() {
        try {
            this.showLoading('Logging out...');
            
            // Logout from Facebook
            await this.sdk.logout();
            
            // Complete logout with backend
            await this.sdk.completeLogout();
            
            // Clear local data
            this.currentUser = null;
            this.isLoggedIn = false;
            localStorage.removeItem('viralvid_user');
            localStorage.removeItem('viralvid_session');
            
            this.updateUI();
            this.showSuccess('Logged out successfully.');
            
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Logout failed: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Update UI based on login status
     */
    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const userProfile = document.getElementById('user-profile');
        
        if (this.isLoggedIn && this.currentUser) {
            // Hide login/signup buttons
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            
            // Show user profile
            if (userProfile) {
                userProfile.style.display = 'flex';
                userProfile.innerHTML = `
                    <img src="${this.currentUser.picture || '/assets/default-avatar.png'}" 
                         alt="${this.currentUser.name}" 
                         class="user-avatar">
                    <span class="user-name">${this.currentUser.name}</span>
                    <button onclick="facebookLoginHandler.logout()" class="logout-btn">Logout</button>
                `;
            }
        } else {
            // Show login/signup buttons
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            
            // Hide user profile
            if (userProfile) {
                userProfile.style.display = 'none';
                userProfile.innerHTML = '';
            }
        }
    }

    /**
     * Show loading state
     */
    showLoading(message) {
        // Implementation depends on your UI framework
        console.log('Loading:', message);
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        console.log('Loading complete');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        console.log('Success:', message);
        // You can implement toast notifications here
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error('Error:', message);
        alert(message); // Replace with better UI notification
    }

    /**
     * Close login modal
     */
    closeLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Create global instance
window.facebookLoginHandler = new FacebookLoginHandler();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.facebookLoginHandler.init();
});

