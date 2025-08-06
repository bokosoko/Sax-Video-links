// ViralVid Admin Authentication System

/**
 * Admin authentication management for ViralVid platform
 */

class AdminAuthManager {
  constructor() {
    this.currentAdmin = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    // Check for existing admin session
    this.checkAdminSession();
    
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

    // Auto-fill admin credentials for demo
    this.autoFillAdminCredentials();
  }

  autoFillAdminCredentials() {
    // Pre-fill admin credentials for demo purposes
    const emailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('adminPassword');
    
    if (emailInput && !emailInput.value) {
      emailInput.value = 'admin@viralvid.com';
    }
  }

  checkAdminSession() {
    const adminData = ViralVidUtils.Storage.get('viralvid_admin');
    const sessionToken = ViralVidUtils.Storage.get('viralvid_admin_session');
    
    if (adminData && sessionToken) {
      // Verify session is still valid (check expiration)
      const sessionData = ViralVidUtils.Storage.get('viralvid_admin_session_data');
      if (sessionData && new Date(sessionData.expires) > new Date()) {
        this.currentAdmin = adminData;
        this.isAuthenticated = true;
        this.redirectToDashboard();
      } else {
        // Session expired, clear data
        this.logout();
      }
    }
  }

  async adminLogin(credentials) {
    try {
      // Simulate API call delay
      await this.delay(1200);

      // Validate credentials
      const validation = this.validateAdminCredentials(credentials);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Authenticate admin
      const admin = this.authenticateAdmin(credentials);
      if (!admin) {
        throw new Error('Invalid administrator credentials');
      }

      // Create admin session
      this.createAdminSession(admin);
      
      ViralVidUtils.Message.success('Admin authentication successful!');
      
      // Redirect to admin dashboard
      setTimeout(() => {
        this.redirectToDashboard();
      }, 1000);

      return { success: true, admin };
    } catch (error) {
      ViralVidUtils.Message.error(error.message);
      throw error;
    }
  }

  validateAdminCredentials(credentials) {
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

  authenticateAdmin(credentials) {
    // Check against default admin credentials
    if (credentials.email === 'admin@viralvid.com' && credentials.password === 'Admin@123') {
      return {
        id: 'admin_001',
        email: 'admin@viralvid.com',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: 'admin',
        permissions: [
          'user_management',
          'video_management',
          'analytics_view',
          'system_settings',
          'content_moderation'
        ],
        avatar: 'https://via.placeholder.com/100x100?text=A',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01T00:00:00.000Z'
      };
    }

    // Check against stored admin users (for future expansion)
    const admins = ViralVidUtils.Storage.get('viralvid_admins', []);
    const admin = admins.find(a => a.email === credentials.email);
    
    if (admin && admin.password === credentials.password) {
      // Remove password from returned admin object
      const { password, ...adminWithoutPassword } = admin;
      return {
        ...adminWithoutPassword,
        lastLogin: new Date().toISOString()
      };
    }

    return null;
  }

  createAdminSession(admin) {
    const sessionToken = ViralVidUtils.generateId(32);
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 8); // 8 hour admin session (shorter for security)

    const sessionData = {
      token: sessionToken,
      adminId: admin.id,
      expires: expirationTime.toISOString(),
      createdAt: new Date().toISOString(),
      ipAddress: 'localhost', // In production, get real IP
      userAgent: navigator.userAgent
    };

    ViralVidUtils.Storage.set('viralvid_admin', admin);
    ViralVidUtils.Storage.set('viralvid_admin_session', sessionToken);
    ViralVidUtils.Storage.set('viralvid_admin_session_data', sessionData);

    this.currentAdmin = admin;
    this.isAuthenticated = true;

    // Log admin login activity
    this.logAdminActivity('login', {
      timestamp: new Date().toISOString(),
      adminId: admin.id,
      action: 'Admin Login',
      details: 'Administrator logged into the system'
    });
  }

  logout() {
    if (this.currentAdmin) {
      // Log admin logout activity
      this.logAdminActivity('logout', {
        timestamp: new Date().toISOString(),
        adminId: this.currentAdmin.id,
        action: 'Admin Logout',
        details: 'Administrator logged out of the system'
      });
    }

    // Clear all admin session data
    ViralVidUtils.Storage.remove('viralvid_admin');
    ViralVidUtils.Storage.remove('viralvid_admin_session');
    ViralVidUtils.Storage.remove('viralvid_admin_session_data');
    
    this.currentAdmin = null;
    this.isAuthenticated = false;
    
    ViralVidUtils.Message.info('Admin session ended.');
    
    // Redirect to admin login page
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  }

  redirectToDashboard() {
    // Check if we're already on the dashboard
    if (window.location.pathname.includes('dashboard.html')) {
      return;
    }
    
    window.location.href = 'dashboard.html';
  }

  logAdminActivity(type, data) {
    const activities = ViralVidUtils.Storage.get('viralvid_admin_activities', []);
    
    const activity = {
      id: ViralVidUtils.generateId(),
      type,
      timestamp: new Date().toISOString(),
      ...data
    };

    activities.unshift(activity); // Add to beginning
    
    // Keep only last 1000 activities
    if (activities.length > 1000) {
      activities.splice(1000);
    }
    
    ViralVidUtils.Storage.set('viralvid_admin_activities', activities);
  }

  getAdminActivities(limit = 50) {
    const activities = ViralVidUtils.Storage.get('viralvid_admin_activities', []);
    return activities.slice(0, limit);
  }

  hasPermission(permission) {
    if (!this.isAuthenticated || !this.currentAdmin) {
      return false;
    }
    
    return this.currentAdmin.permissions && this.currentAdmin.permissions.includes(permission);
  }

  requirePermission(permission) {
    if (!this.hasPermission(permission)) {
      ViralVidUtils.Message.error('You do not have permission to perform this action.');
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  async changeAdminPassword(currentPassword, newPassword) {
    try {
      await this.delay(800);

      if (!this.isAuthenticated) {
        throw new Error('You must be logged in to change password');
      }

      // Validate current password
      if (currentPassword !== 'Admin@123') { // In production, check against stored hash
        throw new Error('Current password is incorrect');
      }

      // Validate new password
      if (!ViralVidUtils.Validator.password(newPassword)) {
        throw new Error('New password must be at least 8 characters with uppercase, lowercase, and number');
      }

      // In production, this would update the password in the database
      ViralVidUtils.Message.success('Password changed successfully!');
      
      // Log password change activity
      this.logAdminActivity('password_change', {
        timestamp: new Date().toISOString(),
        adminId: this.currentAdmin.id,
        action: 'Password Change',
        details: 'Administrator changed their password'
      });

      return { success: true };
    } catch (error) {
      ViralVidUtils.Message.error(error.message);
      throw error;
    }
  }

  async enable2FA() {
    try {
      await this.delay(1000);

      if (!this.isAuthenticated) {
        throw new Error('You must be logged in to enable 2FA');
      }

      // Simulate 2FA setup
      const secret = ViralVidUtils.generateId(16);
      
      // In production, this would integrate with an authenticator app
      ViralVidUtils.Message.success('Two-factor authentication enabled successfully!');
      
      // Log 2FA enable activity
      this.logAdminActivity('2fa_enable', {
        timestamp: new Date().toISOString(),
        adminId: this.currentAdmin.id,
        action: '2FA Enabled',
        details: 'Administrator enabled two-factor authentication'
      });

      return { success: true, secret };
    } catch (error) {
      ViralVidUtils.Message.error(error.message);
      throw error;
    }
  }

  getSessionInfo() {
    if (!this.isAuthenticated) {
      return null;
    }

    const sessionData = ViralVidUtils.Storage.get('viralvid_admin_session_data');
    return {
      admin: this.currentAdmin,
      session: sessionData,
      timeRemaining: sessionData ? new Date(sessionData.expires) - new Date() : 0
    };
  }

  extendSession() {
    if (!this.isAuthenticated) {
      return false;
    }

    const sessionData = ViralVidUtils.Storage.get('viralvid_admin_session_data');
    if (sessionData) {
      const newExpirationTime = new Date();
      newExpirationTime.setHours(newExpirationTime.getHours() + 8);
      
      sessionData.expires = newExpirationTime.toISOString();
      ViralVidUtils.Storage.set('viralvid_admin_session_data', sessionData);
      
      return true;
    }
    
    return false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize admin authentication manager
const adminAuth = new AdminAuthManager();

// Global functions for HTML event handlers
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

async function handleAdminLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = ViralVidUtils.Form.serialize(form);
  
  // Clear previous errors
  ViralVidUtils.Form.clearErrors(form);
  
  // Set loading state
  ViralVidUtils.Form.setLoading(submitButton, true);
  
  try {
    await adminAuth.adminLogin(formData);
  } catch (error) {
    console.error('Admin login error:', error);
  } finally {
    ViralVidUtils.Form.setLoading(submitButton, false);
  }
}

// Session monitoring
setInterval(() => {
  if (adminAuth.isAuthenticated) {
    const sessionInfo = adminAuth.getSessionInfo();
    if (sessionInfo && sessionInfo.timeRemaining <= 0) {
      ViralVidUtils.Message.warning('Your admin session has expired.');
      adminAuth.logout();
    } else if (sessionInfo && sessionInfo.timeRemaining <= 300000) { // 5 minutes warning
      ViralVidUtils.Message.warning('Your admin session will expire in 5 minutes.');
    }
  }
}, 60000); // Check every minute

// Export for use in other files
window.ViralVidAdminAuth = adminAuth;

