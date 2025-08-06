// ViralVid Admin Dashboard Management

/**
 * Admin dashboard functionality for ViralVid platform
 */

class AdminDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.videos = [];
    this.users = [];
    this.analytics = {};
    this.init();
  }

  init() {
    // Check admin authentication
    if (!adminAuth.isAuthenticated) {
      window.location.href = 'login.html';
      return;
    }

    // Initialize dashboard
    this.loadDashboardData();
    this.bindEvents();
    this.startAutoRefresh();
  }

  bindEvents() {
    // Section navigation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('admin-nav-link')) {
        e.preventDefault();
        const section = e.target.getAttribute('href').substring(1);
        this.showSection(section);
      }
    });

    // File upload preview
    const videoFileInput = document.getElementById('videoFile');
    if (videoFileInput) {
      videoFileInput.addEventListener('change', (e) => {
        this.handleFilePreview(e.target);
      });
    }

    // Auto-save settings
    const settingsForms = document.querySelectorAll('#generalSettingsForm, #securitySettingsForm');
    settingsForms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('change', ViralVidUtils.debounce(() => {
          this.autoSaveSettings(form);
        }, 1000));
      });
    });
  }

  async loadDashboardData() {
    try {
      // Load all dashboard data
      await Promise.all([
        this.loadStats(),
        this.loadRecentVideos(),
        this.loadSystemActivity(),
        this.loadVideos(),
        this.loadUsers(),
        this.loadAnalytics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      ViralVidUtils.Message.error('Failed to load dashboard data');
    }
  }

  async loadStats() {
    // Simulate API call
    await this.delay(500);

    const stats = {
      totalVideos: this.getRandomNumber(1000, 2000),
      totalUsers: this.getRandomNumber(5000, 10000),
      totalViews: this.formatNumber(this.getRandomNumber(1000000, 5000000)),
      viralVideos: this.getRandomNumber(50, 150)
    };

    // Update stats in UI
    this.updateElement('totalVideos', stats.totalVideos.toLocaleString());
    this.updateElement('totalUsers', stats.totalUsers.toLocaleString());
    this.updateElement('totalViews', stats.totalViews);
    this.updateElement('viralVideos', stats.viralVideos);

    // Update user stats
    this.updateElement('activeUsers', (stats.totalUsers - 50).toLocaleString());
    this.updateElement('suspendedUsers', '23');
    this.updateElement('newUsersToday', this.getRandomNumber(20, 80));
  }

  async loadRecentVideos() {
    const container = document.getElementById('recentVideos');
    if (!container) return;

    try {
      await this.delay(800);

      // Get videos from storage or generate mock data
      const videos = ViralVidUtils.Storage.get('viralvid_videos', []);
      const recentVideos = videos.slice(0, 5);

      if (recentVideos.length === 0) {
        // Generate mock recent videos
        const mockVideos = this.generateMockVideos(5);
        container.innerHTML = this.renderRecentVideosList(mockVideos);
      } else {
        container.innerHTML = this.renderRecentVideosList(recentVideos);
      }
    } catch (error) {
      container.innerHTML = '<div class="admin-empty">Failed to load recent videos</div>';
    }
  }

  async loadSystemActivity() {
    const container = document.getElementById('systemActivity');
    if (!container) return;

    try {
      await this.delay(600);

      const activities = adminAuth.getAdminActivities(10);
      
      if (activities.length === 0) {
        // Generate mock activities
        const mockActivities = this.generateMockActivities(8);
        container.innerHTML = this.renderActivityList(mockActivities);
      } else {
        container.innerHTML = this.renderActivityList(activities);
      }
    } catch (error) {
      container.innerHTML = '<div class="admin-empty">Failed to load system activity</div>';
    }
  }

  async loadVideos() {
    const tableBody = document.getElementById('videosTableBody');
    if (!tableBody) return;

    try {
      await this.delay(1000);

      const videos = ViralVidUtils.Storage.get('viralvid_videos', []);
      
      if (videos.length === 0) {
        // Generate mock videos for demo
        const mockVideos = this.generateMockVideos(15);
        this.videos = mockVideos;
        tableBody.innerHTML = this.renderVideosTable(mockVideos);
      } else {
        this.videos = videos;
        tableBody.innerHTML = this.renderVideosTable(videos);
      }
    } catch (error) {
      tableBody.innerHTML = '<tr><td colspan="6" class="admin-empty">Failed to load videos</td></tr>';
    }
  }

  async loadUsers() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    try {
      await this.delay(1200);

      const users = ViralVidUtils.Storage.get('viralvid_users', []);
      
      if (users.length === 0) {
        // Generate mock users for demo
        const mockUsers = this.generateMockUsers(20);
        this.users = mockUsers;
        tableBody.innerHTML = this.renderUsersTable(mockUsers);
      } else {
        this.users = users;
        tableBody.innerHTML = this.renderUsersTable(users);
      }
    } catch (error) {
      tableBody.innerHTML = '<tr><td colspan="6" class="admin-empty">Failed to load users</td></tr>';
    }
  }

  async loadAnalytics() {
    const container = document.getElementById('popularContent');
    if (!container) return;

    try {
      await this.delay(900);

      // Generate mock popular content
      const popularContent = this.generateMockPopularContent(5);
      container.innerHTML = this.renderPopularContent(popularContent);
    } catch (error) {
      container.innerHTML = '<div class="admin-empty">Failed to load analytics</div>';
    }
  }

  showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.admin-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[href="#${sectionName}"]`)?.classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`)?.classList.add('active');

    this.currentSection = sectionName;

    // Load section-specific data if needed
    if (sectionName === 'analytics') {
      this.loadAnalytics();
    }
  }

  async handleVideoUpload(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const formData = ViralVidUtils.Form.serialize(form);
    const fileInput = form.querySelector('#videoFile');

    // Clear previous errors
    ViralVidUtils.Form.clearErrors(form);

    // Validate form
    if (!this.validateVideoUpload(formData, fileInput.files[0])) {
      return;
    }

    // Set loading state
    ViralVidUtils.Form.setLoading(submitButton, true);

    try {
      await this.delay(2000); // Simulate upload time

      // Create video object
      const video = {
        id: ViralVidUtils.generateId(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        filename: fileInput.files[0].name,
        fileSize: fileInput.files[0].size,
        uploadedBy: adminAuth.currentAdmin.id,
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        status: 'active',
        thumbnail: formData.thumbnail ? 'thumbnail_' + ViralVidUtils.generateId() + '.jpg' : null
      };

      // Save video
      const videos = ViralVidUtils.Storage.get('viralvid_videos', []);
      videos.unshift(video);
      ViralVidUtils.Storage.set('viralvid_videos', videos);

      // Log admin activity
      adminAuth.logAdminActivity('video_upload', {
        adminId: adminAuth.currentAdmin.id,
        action: 'Video Upload',
        details: `Uploaded video: ${video.title}`,
        videoId: video.id
      });

      ViralVidUtils.Message.success('Video uploaded successfully!');
      ViralVidUtils.Form.reset(form);

      // Refresh videos list
      this.loadVideos();
      this.loadStats();

    } catch (error) {
      ViralVidUtils.Message.error('Failed to upload video. Please try again.');
    } finally {
      ViralVidUtils.Form.setLoading(submitButton, false);
    }
  }

  validateVideoUpload(formData, file) {
    if (!formData.title || formData.title.trim().length < 3) {
      ViralVidUtils.Form.showError('title', 'Title must be at least 3 characters');
      return false;
    }

    if (!formData.category) {
      ViralVidUtils.Form.showError('category', 'Please select a category');
      return false;
    }

    if (!file) {
      ViralVidUtils.Form.showError('file', 'Please select a video file');
      return false;
    }

    if (!ViralVidUtils.FileUtils.isVideo(file.name)) {
      ViralVidUtils.Form.showError('file', 'Please select a valid video file');
      return false;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      ViralVidUtils.Form.showError('file', 'File size must be less than 100MB');
      return false;
    }

    return true;
  }

  handleFilePreview(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    // Show file info
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    fileInfo.innerHTML = `
      <small>
        <strong>${file.name}</strong><br>
        Size: ${ViralVidUtils.FileUtils.formatSize(file.size)}<br>
        Type: ${file.type}
      </small>
    `;

    // Remove existing file info
    const existingInfo = fileInput.parentNode.querySelector('.file-info');
    if (existingInfo) {
      existingInfo.remove();
    }

    fileInput.parentNode.appendChild(fileInfo);
  }

  async deleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      const videos = ViralVidUtils.Storage.get('viralvid_videos', []);
      const updatedVideos = videos.filter(v => v.id !== videoId);
      ViralVidUtils.Storage.set('viralvid_videos', updatedVideos);

      // Log admin activity
      adminAuth.logAdminActivity('video_delete', {
        adminId: adminAuth.currentAdmin.id,
        action: 'Video Delete',
        details: `Deleted video with ID: ${videoId}`,
        videoId: videoId
      });

      ViralVidUtils.Message.success('Video deleted successfully');
      this.loadVideos();
      this.loadStats();
    } catch (error) {
      ViralVidUtils.Message.error('Failed to delete video');
    }
  }

  async suspendUser(userId) {
    if (!confirm('Are you sure you want to suspend this user?')) {
      return;
    }

    try {
      const users = ViralVidUtils.Storage.get('viralvid_users', []);
      const user = users.find(u => u.id === userId);
      
      if (user) {
        user.status = 'suspended';
        user.suspendedAt = new Date().toISOString();
        user.suspendedBy = adminAuth.currentAdmin.id;
        
        ViralVidUtils.Storage.set('viralvid_users', users);

        // Log admin activity
        adminAuth.logAdminActivity('user_suspend', {
          adminId: adminAuth.currentAdmin.id,
          action: 'User Suspend',
          details: `Suspended user: ${user.email}`,
          userId: userId
        });

        ViralVidUtils.Message.success('User suspended successfully');
        this.loadUsers();
        this.loadStats();
      }
    } catch (error) {
      ViralVidUtils.Message.error('Failed to suspend user');
    }
  }

  async handleGeneralSettings(event) {
    event.preventDefault();

    const form = event.target;
    const formData = ViralVidUtils.Form.serialize(form);

    try {
      await this.delay(500);

      // Save settings
      ViralVidUtils.Storage.set('viralvid_settings', formData);

      // Log admin activity
      adminAuth.logAdminActivity('settings_update', {
        adminId: adminAuth.currentAdmin.id,
        action: 'Settings Update',
        details: 'Updated general settings'
      });

      ViralVidUtils.Message.success('Settings saved successfully');
    } catch (error) {
      ViralVidUtils.Message.error('Failed to save settings');
    }
  }

  async handleSecuritySettings(event) {
    event.preventDefault();

    const form = event.target;
    const formData = ViralVidUtils.Form.serialize(form);

    try {
      await this.delay(500);

      // Save security settings
      ViralVidUtils.Storage.set('viralvid_security_settings', formData);

      // Log admin activity
      adminAuth.logAdminActivity('security_update', {
        adminId: adminAuth.currentAdmin.id,
        action: 'Security Update',
        details: 'Updated security settings'
      });

      ViralVidUtils.Message.success('Security settings updated successfully');
    } catch (error) {
      ViralVidUtils.Message.error('Failed to update security settings');
    }
  }

  autoSaveSettings(form) {
    const formData = ViralVidUtils.Form.serialize(form);
    const settingsKey = form.id === 'generalSettingsForm' ? 'viralvid_settings' : 'viralvid_security_settings';
    
    ViralVidUtils.Storage.set(settingsKey, formData);
    
    // Show subtle feedback
    const saveIndicator = document.createElement('span');
    saveIndicator.textContent = ' ✓ Saved';
    saveIndicator.style.color = 'var(--accent-green)';
    saveIndicator.style.fontSize = 'var(--text-sm)';
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.appendChild(saveIndicator);
    
    setTimeout(() => {
      if (saveIndicator.parentNode) {
        saveIndicator.remove();
      }
    }, 2000);
  }

  startAutoRefresh() {
    // Refresh stats every 30 seconds
    setInterval(() => {
      if (this.currentSection === 'dashboard') {
        this.loadStats();
      }
    }, 30000);

    // Refresh activity every 60 seconds
    setInterval(() => {
      if (this.currentSection === 'dashboard') {
        this.loadSystemActivity();
      }
    }, 60000);
  }

  // Utility methods
  generateMockVideos(count) {
    const categories = ['entertainment', 'comedy', 'music', 'sports', 'lifestyle', 'tech'];
    const titles = [
      'Amazing Cat Compilation',
      'Epic Fail Moments',
      'Viral Dance Challenge',
      'Funny Pet Reactions',
      'Incredible Stunts',
      'Comedy Gold',
      'Music Video Mashup',
      'Sports Highlights',
      'Life Hacks',
      'Tech Reviews'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: ViralVidUtils.generateId(),
      title: titles[i % titles.length] + ` #${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      views: this.getRandomNumber(1000, 100000),
      uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: Math.random() > 0.1 ? 'active' : 'pending',
      uploadedBy: 'user_' + ViralVidUtils.generateId(4)
    }));
  }

  generateMockUsers(count) {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];

    return Array.from({ length: count }, (_, i) => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      return {
        id: ViralVidUtils.generateId(),
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`,
        videoCount: this.getRandomNumber(0, 50),
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.05 ? 'active' : 'suspended'
      };
    });
  }

  generateMockActivities(count) {
    const actions = [
      'User Registration',
      'Video Upload',
      'Video Delete',
      'User Suspend',
      'Settings Update',
      'Security Update',
      'Admin Login',
      'Content Moderation'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: ViralVidUtils.generateId(),
      action: actions[Math.floor(Math.random() * actions.length)],
      details: `System activity #${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      adminId: adminAuth.currentAdmin?.id || 'admin_001'
    }));
  }

  generateMockPopularContent(count) {
    const titles = [
      'Viral Cat Video Goes Crazy',
      'Epic Dance Battle',
      'Funny Moments Compilation',
      'Amazing Sports Highlights',
      'Tech Review: Latest Gadget'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: ViralVidUtils.generateId(),
      title: titles[i % titles.length],
      views: this.getRandomNumber(50000, 500000),
      engagement: this.getRandomNumber(70, 95)
    }));
  }

  // Render methods
  renderRecentVideosList(videos) {
    if (videos.length === 0) {
      return '<div class="admin-empty">No recent videos</div>';
    }

    return videos.map(video => `
      <div class="recent-item">
        <div class="recent-item-info">
          <h4>${video.title}</h4>
          <p>${video.category} • ${ViralVidUtils.DateUtils.timeAgo(video.uploadedAt)}</p>
        </div>
        <div class="recent-item-stats">
          <span>${video.views.toLocaleString()} views</span>
        </div>
      </div>
    `).join('');
  }

  renderActivityList(activities) {
    if (activities.length === 0) {
      return '<div class="admin-empty">No recent activity</div>';
    }

    return activities.map(activity => `
      <div class="activity-item">
        <div class="activity-info">
          <h4>${activity.action}</h4>
          <p>${activity.details}</p>
        </div>
        <div class="activity-time">
          <span>${ViralVidUtils.DateUtils.timeAgo(activity.timestamp)}</span>
        </div>
      </div>
    `).join('');
  }

  renderVideosTable(videos) {
    if (videos.length === 0) {
      return '<tr><td colspan="6" class="admin-empty">No videos found</td></tr>';
    }

    return videos.map(video => `
      <tr>
        <td>
          <div style="font-weight: 500;">${video.title}</div>
          <div style="font-size: var(--text-xs); color: var(--secondary-500);">ID: ${video.id}</div>
        </td>
        <td>${video.category}</td>
        <td>${video.views.toLocaleString()}</td>
        <td>${ViralVidUtils.DateUtils.timeAgo(video.uploadedAt)}</td>
        <td>
          <span class="status-badge ${video.status}">
            ${video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </span>
        </td>
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn edit" onclick="editVideo('${video.id}')" title="Edit">✏️</button>
            <button class="admin-action-btn delete" onclick="dashboard.deleteVideo('${video.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderUsersTable(users) {
    if (users.length === 0) {
      return '<tr><td colspan="6" class="admin-empty">No users found</td></tr>';
    }

    return users.map(user => `
      <tr>
        <td>
          <div style="font-weight: 500;">${user.firstName} ${user.lastName}</div>
          <div style="font-size: var(--text-xs); color: var(--secondary-500);">@${user.username}</div>
        </td>
        <td>${user.email}</td>
        <td>${user.videoCount || 0}</td>
        <td>${ViralVidUtils.DateUtils.timeAgo(user.createdAt)}</td>
        <td>
          <span class="status-badge ${user.status || 'active'}">
            ${(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
          </span>
        </td>
        <td>
          <div class="admin-actions">
            <button class="admin-action-btn edit" onclick="editUser('${user.id}')" title="Edit">✏️</button>
            <button class="admin-action-btn delete" onclick="dashboard.suspendUser('${user.id}')" title="Suspend">⏸️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderPopularContent(content) {
    if (content.length === 0) {
      return '<div class="admin-empty">No popular content data</div>';
    }

    return content.map(item => `
      <div class="popular-item">
        <div class="popular-item-info">
          <h4>${item.title}</h4>
          <p>${item.views.toLocaleString()} views • ${item.engagement}% engagement</p>
        </div>
        <div class="popular-item-chart">
          <div class="mini-chart" style="width: ${item.engagement}%"></div>
        </div>
      </div>
    `).join('');
  }

  // Helper methods
  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize dashboard
const dashboard = new AdminDashboard();

// Global functions for HTML event handlers
function showSection(sectionName) {
  dashboard.showSection(sectionName);
}

async function handleVideoUpload(event) {
  await dashboard.handleVideoUpload(event);
}

async function handleGeneralSettings(event) {
  await dashboard.handleGeneralSettings(event);
}

async function handleSecuritySettings(event) {
  await dashboard.handleSecuritySettings(event);
}

function editVideo(videoId) {
  ViralVidUtils.Message.info('Video editing feature coming soon!');
}

function editUser(userId) {
  ViralVidUtils.Message.info('User editing feature coming soon!');
}

function handleChangePassword() {
  ViralVidUtils.Message.info('Password change feature coming soon!');
}

function handleEnable2FA() {
  ViralVidUtils.Message.info('2FA setup feature coming soon!');
}

function handleViewLogs() {
  const activities = adminAuth.getAdminActivities(50);
  console.log('Admin Activity Logs:', activities);
  ViralVidUtils.Message.info('Activity logs displayed in console');
}

// Export for use in other files
window.ViralVidAdminDashboard = dashboard;

