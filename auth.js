// ViralVid Authentication System

/**
 * Authentication management for ViralVid platform
 */

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    // Check for existing session
    this.checkSession();
    
    // Bind event listeners
    this.bindEvents();
  }

  bindEvents() {
    // Modal close events
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target.id);
      }
    });

    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ViralVidUtils.Modal.closeAll();
      }
    });

    // Password strength checking
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      if (input.name === 'password' && input.closest('#signupForm, #signupModal')) {
        input.addEventListener('input', (e) => {
          this.checkPasswordStrength(e.target);
        });
      }
    });

    // Confirm password matching
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirmPassword"]');
    confirmPasswordInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.checkPasswordMatch(e.target);
      });
    });

    // Username availability checking (debounced)
    const usernameInputs = document.querySelectorAll('input[name="username"]');
    usernameInputs.forEach(input => {
      input.addEventListener('input', ViralVidUtils.debounce((e) => {
        this.checkUsernameAvailability(e.target);
      }, 500));
    });
  }

  checkSession() {
    const userData = ViralVidUtils.Storage.get('viralvid_user');
    const sessionToken = ViralVidUtils.Storage.get('viralvid_session');
    
    if (userData && sessionToken) {
      // Verify session is still valid (check expiration)
      const sessionData = ViralVidUtils.Storage.get('viralvid_session_data');
      if (sessionData && new Date(sessionData.expires) > new Date()) {
        this.currentUser = userData;
        this.isAuthenticated = true;
        this.updateUI();
      } else {
        // Session expired, clear data
        this.logout();
      }
    }
  }

  async login(credentials) {
    try {
      // Simulate API call delay
      await this.delay(1000);

      // Validate credentials
      const validation = this.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Check against stored users or default admin
      const user = this.authenticateUser(credentials);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Create session
      this.createSession(user);
      
      ViralVidUtils.Message.success('Login successful! Welcome back.');
      
      // Redirect based on user type
      setTimeout(() => {
        if (user.role === 'admin') {
          window.location.href = 'admin/dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 1000);

      return { success: true, user };
    } catch (error) {
      ViralVidUtils.Message.error(error.message);
      throw error;
    }
  }

  async signup(userData) {
    try {
      // Simulate API call delay
      await this.delay(1500);

      // Validate user data
      const validation = this.validateSignupData(userData);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Check if user already exists
      if (this.userExists(userData.email, userData.username)) {
        throw new Error('User with this email or username already exists');
      }

      // Create new user
      const newUser = this.createUser(userData);
      
      // Create session
      this.createSession(newUser);
      
      ViralVidUtils.Message.success('Account created successfully! Welcome to ViralVid.');
      
      // Redirect to main page
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

      return { success: true, user: newUser };
    } catch (error) {
      ViralVidUtils.Message.error(error.message);
      throw error;
    }
  }

  async facebookLogin() {
    try {
      // Simulate Facebook SDK integration
      await this.delay(800);
      
      // Mock Facebook user data
      const facebookUser = {
        id: 'fb_' + ViralVidUtils.generateId(),
        email: 'user@facebook.com',
        firstName: 'Facebook',
        lastName: 'User',
        username: 'facebook_user_' + Date.now(),
        avatar: 'https://via.placeholder.com/100x100?text=FB',
        provider: 'facebook',
        role: 'user',
        createdAt: new Date().toISOString()
      };

      // Create session
      this.createSession(facebookUser);
      
      ViralVidUtils.Message.success('Facebook login successful!');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

      return { success: true, user: facebookUser };
    } catch (error) {
      ViralVidUtils.Message.error('Facebook login failed. Please try again.');
      throw error;
    }
  }

  async googleLogin() {
    try {
      // Simulate Google OAuth integration
      await this.delay(800);
      
      // Mock Google user data
      const googleUser = {
        id: 'google_' + ViralVidUtils.generateId(),
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
        username: 'google_user_' + Date.now(),
        avatar: 'https://via.placeholder.com/100x100?text=G',
        provider: 'google',
        role: 'user',
        createdAt: new Date().toISOString()
      };

      // Create session
      this.createSession(googleUser);
      
      ViralVidUtils.Message.success('Google login successful!');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

      return { success: true, user: googleUser };
    } catch (error) {
      ViralVidUtils.Message.error('Google login failed. Please try again.');
      throw error;
    }
  }

  logout() {
    // Clear all session data
    ViralVidUtils.Storage.remove('viralvid_user');
    ViralVidUtils.Storage.remove('viralvid_session');
    ViralVidUtils.Storage.remove('viralvid_session_data');
    
    this.currentUser = null;
    this.isAuthenticated = false;
    
    ViralVidUtils.Message.info('You have been logged out.');
    
    // Redirect to home page
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }

  validateLoginCredentials(credentials) {
    if (!credentials.email || !credentials.password) {
      return { isValid: false, message: 'Email and password are required' };
    }

    if (!ViralVidUtils.Validator.email(credentials.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    if (credentials.password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters' };
    }

    return { isValid: true };
  }

  validateSignupData(userData) {
    // Required fields
    if (!userData.firstName || !userData.lastName || !userData.email || 
        !userData.username || !userData.password || !userData.confirmPassword) {
      return { isValid: false, message: 'All fields are required' };
    }

    // Name validation
    if (!ViralVidUtils.Validator.name(userData.firstName)) {
      return { isValid: false, message: 'Please enter a valid first name' };
    }

    if (!ViralVidUtils.Validator.name(userData.lastName)) {
      return { isValid: false, message: 'Please enter a valid last name' };
    }

    // Email validation
    if (!ViralVidUtils.Validator.email(userData.email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    // Username validation
    if (!ViralVidUtils.Validator.username(userData.username)) {
      return { isValid: false, message: 'Username must be 3-20 characters, letters, numbers, and underscores only' };
    }

    // Password validation
    if (!ViralVidUtils.Validator.password(userData.password)) {
      return { isValid: false, message: 'Password must be at least 8 characters with uppercase, lowercase, and number' };
    }

    // Password confirmation
    if (userData.password !== userData.confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }

    // Terms agreement
    if (!userData.agreeTerms) {
      return { isValid: false, message: 'You must agree to the Terms of Service' };
    }

    return { isValid: true };
  }

  authenticateUser(credentials) {
    // Check against stored users
    const users = ViralVidUtils.Storage.get('viralvid_users', []);
    const user = users.find(u => u.email === credentials.email);
    
    if (user && user.password === credentials.password) {
      // Remove password from returned user object
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    // Check against default admin (for demo purposes)
    if (credentials.email === 'admin@viralvid.com' && credentials.password === 'Admin@123') {
      return {
        id: 'admin_001',
        email: 'admin@viralvid.com',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: 'admin',
        avatar: 'https://via.placeholder.com/100x100?text=A',
        createdAt: '2024-01-01T00:00:00.000Z'
      };
    }

    return null;
  }

  userExists(email, username) {
    const users = ViralVidUtils.Storage.get('viralvid_users', []);
    return users.some(user => user.email === email || user.username === username);
  }

  createUser(userData) {
    const users = ViralVidUtils.Storage.get('viralvid_users', []);
    
    const newUser = {
      id: 'user_' + ViralVidUtils.generateId(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      password: userData.password, // In production, this would be hashed
      role: 'user',
      avatar: `https://via.placeholder.com/100x100?text=${userData.firstName[0]}${userData.lastName[0]}`,
      newsletter: userData.newsletter || false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    ViralVidUtils.Storage.set('viralvid_users', users);

    // Remove password from returned user object
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  createSession(user) {
    const sessionToken = ViralVidUtils.generateId(32);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24); // 24 hour session

    const sessionData = {
      token: sessionToken,
      userId: user.id,
      expires: expirationTime.toISOString(),
      createdAt: new Date().toISOString()
    };

    ViralVidUtils.Storage.set('viralvid_user', user);
    ViralVidUtils.Storage.set('viralvid_session', sessionToken);
    ViralVidUtils.Storage.set('viralvid_session_data', sessionData);

    this.currentUser = user;
    this.isAuthenticated = true;
    this.updateUI();
  }

  updateUI() {
    // Update navigation based on authentication status
    const navActions = document.querySelector('.nav-actions');
    if (navActions && this.isAuthenticated) {
      navActions.innerHTML = `
        <div class="user-menu">
          <img src="${this.currentUser.avatar}" alt="${this.currentUser.firstName}" class="user-avatar">
          <span class="user-name">${this.currentUser.firstName}</span>
          <button class="btn btn-outline" onclick="auth.logout()">Logout</button>
        </div>
      `;
    }
  }

  checkPasswordStrength(passwordInput) {
    const strengthElement = document.querySelector('#passwordStrength');
    if (!strengthElement) return;

    const password = passwordInput.value;
    if (!password) {
      strengthElement.style.display = 'none';
      return;
    }

    const strength = ViralVidUtils.PasswordStrength.check(password);
    strengthElement.style.display = 'block';
    strengthElement.className = `password-strength active ${strength.strength}`;
    strengthElement.textContent = ViralVidUtils.PasswordStrength.getStrengthText(strength.strength);

    if (strength.feedback.length > 0) {
      strengthElement.textContent += ` (Missing: ${strength.feedback.join(', ')})`;
    }
  }

  checkPasswordMatch(confirmPasswordInput) {
    const passwordInput = document.querySelector('input[name="password"]');
    const errorElement = document.querySelector('#confirmPasswordError');
    
    if (!passwordInput || !errorElement) return;

    if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
      errorElement.textContent = 'Passwords do not match';
      errorElement.classList.add('active');
    } else {
      errorElement.classList.remove('active');
    }
  }

  async checkUsernameAvailability(usernameInput) {
    const username = usernameInput.value;
    const errorElement = document.querySelector('#usernameError');
    
    if (!username || !errorElement) return;

    if (!ViralVidUtils.Validator.username(username)) {
      errorElement.textContent = 'Username must be 3-20 characters, letters, numbers, and underscores only';
      errorElement.classList.add('active');
      return;
    }

    // Simulate API call to check availability
    await this.delay(300);
    
    const users = ViralVidUtils.Storage.get('viralvid_users', []);
    const exists = users.some(user => user.username === username);
    
    if (exists) {
      errorElement.textContent = 'Username is already taken';
      errorElement.classList.add('active');
    } else {
      errorElement.classList.remove('active');
    }
  }

  async forgotPassword(email) {
    try {
      await this.delay(1000);
      
      if (!ViralVidUtils.Validator.email(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Simulate sending reset email
      ViralVidUtils.Message.success('Password reset link sent to your email!');
      ViralVidUtils.Modal.close('forgotPasswordModal');
      
      return { success: true };
    } catch (error) {
      ViralVidUtils.Message.error(error.message);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize authentication manager
const auth = new AuthManager();

// Global functions for HTML event handlers
function openLoginModal() {
  ViralVidUtils.Modal.open('loginModal');
}

function openSignupModal() {
  ViralVidUtils.Modal.open('signupModal');
}

function closeModal(modalId) {
  ViralVidUtils.Modal.close(modalId);
}

function switchModal(fromModalId, toModalId) {
  ViralVidUtils.Modal.close(fromModalId);
  setTimeout(() => {
    ViralVidUtils.Modal.open(toModalId);
  }, 100);
}

function showForgotPassword() {
  ViralVidUtils.Modal.open('forgotPasswordModal');
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const toggle = input.nextElementSibling.querySelector('.toggle-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    toggle.textContent = '🙈';
  } else {
    input.type = 'password';
    toggle.textContent = '👁️';
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = ViralVidUtils.Form.serialize(form);
  
  // Clear previous errors
  ViralVidUtils.Form.clearErrors(form);
  
  // Set loading state
  ViralVidUtils.Form.setLoading(submitButton, true);
  
  try {
    await auth.login(formData);
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    ViralVidUtils.Form.setLoading(submitButton, false);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = ViralVidUtils.Form.serialize(form);
  
  // Clear previous errors
  ViralVidUtils.Form.clearErrors(form);
  
  // Set loading state
  ViralVidUtils.Form.setLoading(submitButton, true);
  
  try {
    await auth.signup(formData);
  } catch (error) {
    console.error('Signup error:', error);
  } finally {
    ViralVidUtils.Form.setLoading(submitButton, false);
  }
}

async function handleFacebookLogin() {
  try {
    await auth.facebookLogin();
  } catch (error) {
    console.error('Facebook login error:', error);
  }
}

async function handleFacebookSignup() {
  try {
    await auth.facebookLogin(); // Same process for signup
  } catch (error) {
    console.error('Facebook signup error:', error);
  }
}

async function handleGoogleLogin() {
  try {
    await auth.googleLogin();
  } catch (error) {
    console.error('Google login error:', error);
  }
}

async function handleGoogleSignup() {
  try {
    await auth.googleLogin(); // Same process for signup
  } catch (error) {
    console.error('Google signup error:', error);
  }
}

async function handleForgotPassword(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = ViralVidUtils.Form.serialize(form);
  
  ViralVidUtils.Form.setLoading(submitButton, true);
  
  try {
    await auth.forgotPassword(formData.email);
    ViralVidUtils.Form.reset(form);
  } catch (error) {
    console.error('Forgot password error:', error);
  } finally {
    ViralVidUtils.Form.setLoading(submitButton, false);
  }
}

// Export for use in other files
window.ViralVidAuth = auth;

