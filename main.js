// ViralVid Main JavaScript

/**
 * Main application initialization and global functionality
 */

class ViralVidApp {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.init();
  }

  init() {
    if (this.isInitialized) return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    try {
      // Initialize core components
      this.initializeNavigation();
      this.initializeScrollEffects();
      this.initializeAnimations();
      this.initializeLazyLoading();
      this.initializeServiceWorker();
      this.bindGlobalEvents();
      
      // Check authentication status
      this.updateAuthenticationUI();
      
      this.isInitialized = true;
      console.log('ViralVid application initialized successfully');
    } catch (error) {
      console.error('Error initializing ViralVid application:', error);
    }
  }

  initializeNavigation() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle && navMenu) {
      mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });

      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          mobileMenuToggle.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
          ViralVidUtils.Scroll.to(targetElement, headerHeight + 20);
          
          // Close mobile menu if open
          navMenu?.classList.remove('active');
          mobileMenuToggle?.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    // Update active navigation link based on scroll position
    this.updateActiveNavLink();
    window.addEventListener('scroll', ViralVidUtils.throttle(() => {
      this.updateActiveNavLink();
    }, 100));
  }

  updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  initializeScrollEffects() {
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', ViralVidUtils.throttle(() => {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }, 50));
    }

    // Parallax effect for hero section
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
      window.addEventListener('scroll', ViralVidUtils.throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
      }, 10));
    }

    // Fade in animations on scroll
    this.initializeScrollAnimations();
  }

  initializeScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
      '.section-header, .video-card, .category-card, .feature, .admin-card, .admin-stat-card'
    );
    
    animateElements.forEach(el => {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

  initializeAnimations() {
    // Add CSS for scroll animations
    if (!document.getElementById('scroll-animations')) {
      const style = document.createElement('style');
      style.id = 'scroll-animations';
      style.textContent = `
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .video-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .video-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .category-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .category-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
      `;
      document.head.appendChild(style);
    }
  }

  initializeLazyLoading() {
    // Lazy load images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }

  async initializeServiceWorker() {
    // Register service worker for offline functionality
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }

  bindGlobalEvents() {
    // Global error handling
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      // In production, you might want to send this to an error tracking service
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      e.preventDefault();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        ViralVidUtils.Modal.closeAll();
      }
      
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('videoSearch');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      ViralVidUtils.Message.success('Connection restored');
    });

    window.addEventListener('offline', () => {
      ViralVidUtils.Message.warning('You are offline. Some features may not work.');
    });

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden
        this.pauseAutoRefresh();
      } else {
        // Page is visible
        this.resumeAutoRefresh();
      }
    });
  }

  updateAuthenticationUI() {
    // Check if user is authenticated
    if (window.ViralVidAuth && ViralVidAuth.isAuthenticated) {
      this.currentUser = ViralVidAuth.currentUser;
      this.showAuthenticatedUI();
    } else {
      this.showUnauthenticatedUI();
    }
  }

  showAuthenticatedUI() {
    const navActions = document.querySelector('.nav-actions');
    if (navActions && this.currentUser) {
      navActions.innerHTML = `
        <div class="user-menu">
          <img src="${this.currentUser.avatar}" alt="${this.currentUser.firstName}" class="user-avatar">
          <span class="user-name">${this.currentUser.firstName}</span>
          <div class="user-dropdown">
            <button class="btn btn-outline dropdown-toggle" onclick="app.toggleUserDropdown()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </button>
            <div class="dropdown-menu" id="userDropdown">
              <a href="#" class="dropdown-item">Profile</a>
              <a href="#" class="dropdown-item">My Videos</a>
              <a href="#" class="dropdown-item">Settings</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" onclick="ViralVidAuth.logout()">Logout</a>
            </div>
          </div>
        </div>
      `;
    }
  }

  showUnauthenticatedUI() {
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      navActions.innerHTML = `
        <button class="btn btn-outline" onclick="openLoginModal()">Login</button>
        <button class="btn btn-primary" onclick="openSignupModal()">Sign Up</button>
        <button class="mobile-menu-toggle" onclick="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </button>
      `;
    }
  }

  toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
      dropdown.classList.toggle('active');
    }
  }

  pauseAutoRefresh() {
    // Pause any auto-refresh functionality when tab is hidden
    if (window.ViralVidAdminDashboard) {
      // Pause dashboard auto-refresh
    }
  }

  resumeAutoRefresh() {
    // Resume auto-refresh functionality when tab becomes visible
    if (window.ViralVidAdminDashboard) {
      // Resume dashboard auto-refresh
    }
  }

  // Utility methods
  showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="loading-spinner"><div class="spinner"></div>Loading...</div>';
    }
  }

  hideLoading(element) {
    if (element) {
      const spinner = element.querySelector('.loading-spinner');
      if (spinner) {
        spinner.remove();
      }
    }
  }

  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  // Performance monitoring
  measurePerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          console.log('Page load performance:', {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
            totalTime: perfData.loadEventEnd - perfData.fetchStart
          });
        }, 0);
      });
    }
  }
}

// Global utility functions for HTML event handlers
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    const headerHeight = document.querySelector('.navbar')?.offsetHeight || 0;
    ViralVidUtils.Scroll.to(element, headerHeight + 20);
  }
}

function toggleMobileMenu() {
  const navMenu = document.querySelector('.nav-menu');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  
  if (navMenu && mobileMenuToggle) {
    navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
    
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}

function goToTop() {
  ViralVidUtils.Scroll.toTop();
}

// Initialize the application
const app = new ViralVidApp();

// Add performance monitoring
app.measurePerformance();

// Export for global access
window.ViralVidApp = app;

// Add global styles for enhanced functionality
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  /* User Menu Styles */
  .user-menu {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    position: relative;
  }
  
  .user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-full);
    object-fit: cover;
  }
  
  .user-name {
    font-weight: 500;
    color: var(--secondary-700);
  }
  
  .user-dropdown {
    position: relative;
  }
  
  .dropdown-toggle {
    padding: var(--space-2);
    min-width: auto;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid var(--secondary-200);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    min-width: 150px;
    z-index: var(--z-dropdown);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all var(--transition-fast);
  }
  
  .dropdown-menu.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .dropdown-item {
    display: block;
    padding: var(--space-3) var(--space-4);
    color: var(--secondary-700);
    text-decoration: none;
    font-size: var(--text-sm);
    transition: background-color var(--transition-fast);
  }
  
  .dropdown-item:hover {
    background: var(--secondary-50);
    color: var(--secondary-900);
  }
  
  .dropdown-divider {
    height: 1px;
    background: var(--secondary-200);
    margin: var(--space-2) 0;
  }
  
  /* Loading Spinner */
  .loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-4);
    color: var(--secondary-500);
  }
  
  /* Video Player Modal */
  .video-player-modal .modal-content {
    max-width: 800px;
    width: 90vw;
  }
  
  .video-player-content {
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .video-player {
    aspect-ratio: 16/9;
    background: var(--secondary-900);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-4);
  }
  
  .video-placeholder {
    text-align: center;
    color: white;
  }
  
  .play-icon {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-2);
  }
  
  .video-details {
    padding: var(--space-4) 0;
  }
  
  .video-actions {
    display: flex;
    gap: var(--space-3);
    margin: var(--space-4) 0;
    flex-wrap: wrap;
  }
  
  .video-description {
    margin-top: var(--space-4);
  }
  
  .video-description h4 {
    margin-bottom: var(--space-2);
    color: var(--secondary-900);
  }
  
  /* Status Badges */
  .status-badge {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .status-badge.active {
    background: var(--accent-green);
    color: white;
  }
  
  .status-badge.pending {
    background: var(--accent-orange);
    color: white;
  }
  
  .status-badge.suspended {
    background: var(--accent-red);
    color: white;
  }
  
  /* Chart Placeholder */
  .chart-placeholder {
    text-align: center;
    padding: var(--space-8);
    background: var(--secondary-50);
    border-radius: var(--radius-lg);
    color: var(--secondary-500);
  }
  
  .chart-icon {
    font-size: var(--text-4xl);
    margin-bottom: var(--space-2);
  }
  
  /* Metric Cards */
  .metric-card {
    text-align: center;
    padding: var(--space-4);
    background: white;
    border-radius: var(--radius-lg);
    border: 1px solid var(--secondary-200);
  }
  
  .metric-icon {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-2);
  }
  
  .metric-value {
    font-size: var(--text-2xl);
    font-weight: 700;
    color: var(--secondary-900);
    margin-bottom: var(--space-1);
  }
  
  .metric-label {
    font-size: var(--text-sm);
    color: var(--secondary-600);
    margin-bottom: var(--space-2);
  }
  
  .metric-change {
    font-size: var(--text-xs);
    font-weight: 600;
  }
  
  .metric-change.positive {
    color: var(--accent-green);
  }
  
  .metric-change.negative {
    color: var(--accent-red);
  }
  
  /* Recent Items */
  .recent-item,
  .activity-item,
  .popular-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3);
    border-bottom: 1px solid var(--secondary-200);
  }
  
  .recent-item:last-child,
  .activity-item:last-child,
  .popular-item:last-child {
    border-bottom: none;
  }
  
  .recent-item-info h4,
  .activity-info h4 {
    font-size: var(--text-sm);
    font-weight: 600;
    margin-bottom: var(--space-1);
    color: var(--secondary-900);
  }
  
  .recent-item-info p,
  .activity-info p {
    font-size: var(--text-xs);
    color: var(--secondary-500);
    margin: 0;
  }
  
  .recent-item-stats,
  .activity-time {
    font-size: var(--text-xs);
    color: var(--secondary-500);
    text-align: right;
  }
  
  /* Popular Content */
  .popular-item-chart {
    width: 100px;
  }
  
  .mini-chart {
    height: 4px;
    background: var(--primary-500);
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
  }
  
  /* File Info */
  .file-info {
    margin-top: var(--space-2);
    padding: var(--space-2);
    background: var(--secondary-50);
    border-radius: var(--radius-md);
    font-size: var(--text-xs);
    color: var(--secondary-600);
  }
  
  /* Responsive adjustments */
  @media (max-width: 767px) {
    .user-menu {
      flex-direction: column;
      gap: var(--space-2);
    }
    
    .user-name {
      display: none;
    }
    
    .video-actions {
      flex-direction: column;
    }
    
    .video-actions .btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

document.head.appendChild(globalStyles);

console.log('ViralVid main application loaded successfully');

