// ViralVid Utility Functions

/**
 * Utility functions for ViralVid platform
 */

// DOM Utilities
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Local Storage Utilities
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

// Session Storage Utilities
const SessionStorage = {
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Session storage set error:', error);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Session storage get error:', error);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Session storage remove error:', error);
      return false;
    }
  }
};

// Form Validation Utilities
const Validator = {
  email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  username(username) {
    // 3-20 characters, alphanumeric and underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  },

  name(name) {
    // At least 2 characters, letters and spaces only
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    return nameRegex.test(name.trim());
  },

  required(value) {
    return value && value.toString().trim().length > 0;
  }
};

// Password Strength Checker
const PasswordStrength = {
  check(password) {
    let score = 0;
    let feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[^a-zA-Z\d]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    let strength = 'weak';
    if (score >= 4) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return { score, strength, feedback };
  },

  getStrengthText(strength) {
    const texts = {
      weak: 'Weak password',
      medium: 'Medium strength',
      strong: 'Strong password'
    };
    return texts[strength] || 'Weak password';
  }
};

// Message/Notification System
const Message = {
  container: null,

  init() {
    this.container = $('#messageContainer');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'messageContainer';
      this.container.className = 'message-container';
      document.body.appendChild(this.container);
    }
  },

  show(text, type = 'info', duration = 5000) {
    this.init();

    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    this.container.appendChild(message);

    // Auto remove after duration
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, duration);

    return message;
  },

  success(text, duration) {
    return this.show(text, 'success', duration);
  },

  error(text, duration) {
    return this.show(text, 'error', duration);
  },

  warning(text, duration) {
    return this.show(text, 'warning', duration);
  },

  info(text, duration) {
    return this.show(text, 'info', duration);
  }
};

// Modal Utilities
const Modal = {
  open(modalId) {
    const modal = $(`#${modalId}`);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus first input
      const firstInput = modal.querySelector('input, textarea, select');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
      }
    }
  },

  close(modalId) {
    const modal = $(`#${modalId}`);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  closeAll() {
    $$('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }
};

// Form Utilities
const Form = {
  serialize(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    
    return data;
  },

  reset(form) {
    form.reset();
    // Clear custom error states
    form.querySelectorAll('.form-error.active').forEach(error => {
      error.classList.remove('active');
    });
    form.querySelectorAll('.form-group.error').forEach(group => {
      group.classList.remove('error');
    });
  },

  showError(fieldName, message) {
    const field = $(`[name="${fieldName}"]`);
    const errorElement = $(`#${fieldName}Error`);
    
    if (field) {
      field.closest('.form-group')?.classList.add('error');
    }
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('active');
    }
  },

  clearErrors(form) {
    form.querySelectorAll('.form-error.active').forEach(error => {
      error.classList.remove('active');
    });
    form.querySelectorAll('.form-group.error').forEach(group => {
      group.classList.remove('error');
    });
  },

  setLoading(button, loading = true) {
    const textElement = button.querySelector('.btn-text');
    const loadingElement = button.querySelector('.btn-loading');
    
    if (loading) {
      button.disabled = true;
      if (textElement) textElement.style.display = 'none';
      if (loadingElement) loadingElement.style.display = 'flex';
    } else {
      button.disabled = false;
      if (textElement) textElement.style.display = 'flex';
      if (loadingElement) loadingElement.style.display = 'none';
    }
  }
};

// URL Utilities
const URL = {
  getParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (let [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  },

  setParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url);
  },

  removeParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.pushState({}, '', url);
  }
};

// Date Utilities
const DateUtils = {
  format(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }
};

// File Utilities
const FileUtils = {
  formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  isVideo(filename) {
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const extension = this.getExtension(filename).toLowerCase();
    return videoExtensions.includes(extension);
  },

  isImage(filename) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = this.getExtension(filename).toLowerCase();
    return imageExtensions.includes(extension);
  }
};

// Animation Utilities
const Animation = {
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.min(progress / duration, 1);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  },

  fadeOut(element, duration = 300) {
    let start = null;
    const initialOpacity = parseFloat(getComputedStyle(element).opacity);
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(initialOpacity - (progress / duration), 0);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
      }
    }
    
    requestAnimationFrame(animate);
  },

  slideUp(element, duration = 300) {
    const height = element.offsetHeight;
    element.style.overflow = 'hidden';
    element.style.height = height + 'px';
    
    let start = null;
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const newHeight = Math.max(height - (height * progress / duration), 0);
      
      element.style.height = newHeight + 'px';
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        element.style.display = 'none';
        element.style.height = '';
        element.style.overflow = '';
      }
    }
    
    requestAnimationFrame(animate);
  }
};

// Debounce Utility
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle Utility
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Random ID Generator
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Copy to Clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Scroll Utilities
const Scroll = {
  to(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  },

  toTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },

  toBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
};

// Export utilities for use in other files
window.ViralVidUtils = {
  $,
  $$,
  Storage,
  SessionStorage,
  Validator,
  PasswordStrength,
  Message,
  Modal,
  Form,
  URL,
  DateUtils,
  FileUtils,
  Animation,
  debounce,
  throttle,
  generateId,
  copyToClipboard,
  Scroll
};

