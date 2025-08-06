// ViralVid Video Management System

/**
 * Video management functionality for ViralVid platform
 */

class VideoManager {
  constructor() {
    this.videos = [];
    this.currentPage = 1;
    this.videosPerPage = 12;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.init();
  }

  init() {
    this.loadVideos();
    this.bindEvents();
    this.setupInfiniteScroll();
  }

  bindEvents() {
    // Category filter clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-card')) {
        const category = e.target.getAttribute('data-category');
        if (category) {
          this.filterByCategory(category);
        }
      }
    });

    // Search functionality
    const searchInput = document.getElementById('videoSearch');
    if (searchInput) {
      searchInput.addEventListener('input', ViralVidUtils.debounce((e) => {
        this.searchVideos(e.target.value);
      }, 300));
    }

    // Video upload handling
    const uploadForm = document.getElementById('videoUploadForm');
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => {
        this.handleVideoUpload(e);
      });
    }

    // Video player events
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('video-play-btn')) {
        const videoId = e.target.getAttribute('data-video-id');
        this.playVideo(videoId);
      }
    });
  }

  async loadVideos() {
    try {
      // Get videos from storage
      const storedVideos = ViralVidUtils.Storage.get('viralvid_videos', []);
      
      if (storedVideos.length === 0) {
        // Generate demo videos if none exist
        this.videos = this.generateDemoVideos();
        ViralVidUtils.Storage.set('viralvid_videos', this.videos);
      } else {
        this.videos = storedVideos;
      }

      this.renderVideos();
    } catch (error) {
      console.error('Error loading videos:', error);
      this.showEmptyState();
    }
  }

  renderVideos() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    // Filter videos based on current filters
    const filteredVideos = this.getFilteredVideos();
    
    if (filteredVideos.length === 0) {
      this.showEmptyState();
      return;
    }

    // Get videos for current page
    const startIndex = (this.currentPage - 1) * this.videosPerPage;
    const endIndex = startIndex + this.videosPerPage;
    const videosToShow = filteredVideos.slice(0, endIndex);

    // Render video cards
    videoGrid.innerHTML = videosToShow.map(video => this.renderVideoCard(video)).join('');

    // Show/hide load more button
    this.updateLoadMoreButton(filteredVideos.length, videosToShow.length);
  }

  renderVideoCard(video) {
    const timeAgo = ViralVidUtils.DateUtils.timeAgo(video.uploadedAt);
    const views = this.formatViews(video.views);
    
    return `
      <div class="video-card" data-video-id="${video.id}">
        <div class="video-thumbnail">
          <img src="${video.thumbnail || this.getDefaultThumbnail(video.category)}" 
               alt="${video.title}" 
               loading="lazy">
          <div class="video-overlay">
            <button class="video-play-btn" data-video-id="${video.id}">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
          <div class="video-duration">${video.duration || '0:00'}</div>
        </div>
        
        <div class="video-info">
          <h3 class="video-title">${video.title}</h3>
          <div class="video-meta">
            <span class="video-views">${views} views</span>
            <span class="video-separator">•</span>
            <span class="video-time">${timeAgo}</span>
          </div>
          <div class="video-channel">
            <img src="${video.uploaderAvatar || this.getDefaultAvatar()}" 
                 alt="${video.uploaderName || 'Unknown'}" 
                 class="channel-avatar">
            <span class="channel-name">${video.uploaderName || 'Anonymous'}</span>
          </div>
          <div class="video-stats">
            <div class="stat">
              <span class="stat-icon">👁️</span>
              <span class="stat-value">${views}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">❤️</span>
              <span class="stat-value">${this.formatViews(video.likes || 0)}</span>
            </div>
            <div class="stat">
              <span class="stat-icon">💬</span>
              <span class="stat-value">${this.formatViews(video.comments || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredVideos() {
    let filtered = [...this.videos];

    // Filter by category
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(video => video.category === this.currentCategory);
    }

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query) ||
        video.category.toLowerCase().includes(query)
      );
    }

    // Sort by upload date (newest first)
    filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    return filtered;
  }

  filterByCategory(category) {
    this.currentCategory = category;
    this.currentPage = 1;
    this.renderVideos();

    // Update category UI
    document.querySelectorAll('.category-card').forEach(card => {
      card.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
  }

  searchVideos(query) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.renderVideos();
  }

  loadMoreVideos() {
    this.currentPage++;
    this.renderVideos();
  }

  updateLoadMoreButton(totalVideos, shownVideos) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    if (shownVideos < totalVideos) {
      loadMoreBtn.style.display = 'block';
      loadMoreBtn.textContent = `Load More Videos (${totalVideos - shownVideos} remaining)`;
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }

  showEmptyState() {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;

    let message = 'No videos found';
    let actionButton = '';

    if (this.searchQuery) {
      message = `No videos found for "${this.searchQuery}"`;
      actionButton = '<button class="btn btn-outline" onclick="videoManager.clearSearch()">Clear Search</button>';
    } else if (this.currentCategory !== 'all') {
      message = `No videos found in ${this.currentCategory} category`;
      actionButton = '<button class="btn btn-outline" onclick="videoManager.showAllVideos()">Show All Videos</button>';
    } else {
      actionButton = '<button class="btn btn-primary" onclick="openLoginModal()">Upload First Video</button>';
    }

    videoGrid.innerHTML = `
      <div class="video-placeholder">
        <div class="placeholder-icon">🎬</div>
        <h3>${message}</h3>
        <p>Try adjusting your filters or search terms</p>
        ${actionButton}
      </div>
    `;
  }

  clearSearch() {
    this.searchQuery = '';
    const searchInput = document.getElementById('videoSearch');
    if (searchInput) {
      searchInput.value = '';
    }
    this.renderVideos();
  }

  showAllVideos() {
    this.currentCategory = 'all';
    this.renderVideos();
    
    // Update category UI
    document.querySelectorAll('.category-card').forEach(card => {
      card.classList.remove('active');
    });
  }

  async playVideo(videoId) {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) return;

    try {
      // Increment view count
      video.views = (video.views || 0) + 1;
      this.updateVideo(video);

      // Create video player modal
      this.showVideoPlayer(video);

      // Log video view
      this.logVideoView(videoId);
    } catch (error) {
      console.error('Error playing video:', error);
      ViralVidUtils.Message.error('Failed to play video');
    }
  }

  showVideoPlayer(video) {
    // Create modal for video player
    const modal = document.createElement('div');
    modal.className = 'modal video-player-modal active';
    modal.innerHTML = `
      <div class="modal-content video-player-content">
        <div class="modal-header">
          <h3>${video.title}</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="video-player">
            <div class="video-placeholder">
              <div class="play-icon">▶️</div>
              <p>Video Player</p>
              <small>In a real implementation, this would show the actual video</small>
            </div>
          </div>
          <div class="video-details">
            <div class="video-meta">
              <span>${this.formatViews(video.views)} views</span>
              <span>•</span>
              <span>${ViralVidUtils.DateUtils.timeAgo(video.uploadedAt)}</span>
            </div>
            <div class="video-actions">
              <button class="btn btn-outline" onclick="videoManager.likeVideo('${video.id}')">
                ❤️ ${this.formatViews(video.likes || 0)}
              </button>
              <button class="btn btn-outline" onclick="videoManager.shareVideo('${video.id}')">
                📤 Share
              </button>
              <button class="btn btn-outline" onclick="videoManager.reportVideo('${video.id}')">
                🚩 Report
              </button>
            </div>
            <div class="video-description">
              <h4>Description</h4>
              <p>${video.description || 'No description available'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  async likeVideo(videoId) {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) return;

    // Check if user is logged in
    if (!ViralVidAuth.isAuthenticated) {
      ViralVidUtils.Message.info('Please log in to like videos');
      openLoginModal();
      return;
    }

    try {
      // Toggle like
      const userLikes = ViralVidUtils.Storage.get('viralvid_user_likes', []);
      const hasLiked = userLikes.includes(videoId);

      if (hasLiked) {
        // Unlike
        video.likes = Math.max((video.likes || 0) - 1, 0);
        const index = userLikes.indexOf(videoId);
        userLikes.splice(index, 1);
        ViralVidUtils.Message.info('Video unliked');
      } else {
        // Like
        video.likes = (video.likes || 0) + 1;
        userLikes.push(videoId);
        ViralVidUtils.Message.success('Video liked!');
      }

      ViralVidUtils.Storage.set('viralvid_user_likes', userLikes);
      this.updateVideo(video);

      // Update UI
      this.renderVideos();
    } catch (error) {
      console.error('Error liking video:', error);
      ViralVidUtils.Message.error('Failed to like video');
    }
  }

  async shareVideo(videoId) {
    const video = this.videos.find(v => v.id === videoId);
    if (!video) return;

    const shareUrl = `${window.location.origin}/video/${videoId}`;
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: video.title,
          text: video.description || 'Check out this video on ViralVid!',
          url: shareUrl
        });
      } else {
        // Fallback to clipboard
        await ViralVidUtils.copyToClipboard(shareUrl);
        ViralVidUtils.Message.success('Video link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
      ViralVidUtils.Message.error('Failed to share video');
    }
  }

  reportVideo(videoId) {
    if (!ViralVidAuth.isAuthenticated) {
      ViralVidUtils.Message.info('Please log in to report videos');
      openLoginModal();
      return;
    }

    // In a real implementation, this would open a report form
    ViralVidUtils.Message.info('Video reported. Thank you for helping keep our community safe.');
  }

  updateVideo(video) {
    const index = this.videos.findIndex(v => v.id === video.id);
    if (index !== -1) {
      this.videos[index] = video;
      ViralVidUtils.Storage.set('viralvid_videos', this.videos);
    }
  }

  logVideoView(videoId) {
    const views = ViralVidUtils.Storage.get('viralvid_video_views', []);
    views.push({
      videoId,
      timestamp: new Date().toISOString(),
      userId: ViralVidAuth.currentUser?.id || 'anonymous'
    });
    
    // Keep only last 1000 views
    if (views.length > 1000) {
      views.splice(0, views.length - 1000);
    }
    
    ViralVidUtils.Storage.set('viralvid_video_views', views);
  }

  setupInfiniteScroll() {
    let isLoading = false;

    window.addEventListener('scroll', ViralVidUtils.throttle(() => {
      if (isLoading) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      if (scrollTop + clientHeight >= scrollHeight - 1000) {
        const filteredVideos = this.getFilteredVideos();
        const shownVideos = this.currentPage * this.videosPerPage;
        
        if (shownVideos < filteredVideos.length) {
          isLoading = true;
          setTimeout(() => {
            this.loadMoreVideos();
            isLoading = false;
          }, 500);
        }
      }
    }, 200));
  }

  generateDemoVideos() {
    const categories = ['entertainment', 'comedy', 'music', 'sports', 'lifestyle', 'tech'];
    const titles = [
      'Amazing Cat Compilation 2024',
      'Epic Fail Moments That Will Make You Laugh',
      'Viral Dance Challenge - TikTok Edition',
      'Funny Pet Reactions to Magic Tricks',
      'Incredible Parkour Stunts in the City',
      'Comedy Gold: Stand-up Highlights',
      'Music Video Mashup - Top Hits',
      'Sports Highlights: Best Goals Ever',
      'Life Hacks That Actually Work',
      'Tech Reviews: Latest Smartphone',
      'Cooking Fails vs Success Stories',
      'Travel Vlog: Hidden Gems',
      'DIY Projects Gone Wrong',
      'Gaming Moments: Epic Wins',
      'Fashion Trends 2024',
      'Workout Motivation Videos',
      'Art Time-lapse Creations',
      'Science Experiments at Home',
      'Movie Trailer Reactions',
      'Music Cover Performances'
    ];

    const descriptions = [
      'This video will make your day better! Watch till the end for the best part.',
      'You won\'t believe what happens next! Like and subscribe for more content.',
      'The most viral content on the internet right now. Don\'t miss out!',
      'Amazing compilation that everyone is talking about.',
      'This is why the internet exists. Pure entertainment gold!'
    ];

    const uploaderNames = [
      'VideoMaster', 'ContentCreator', 'ViralKing', 'TrendSetter', 'MediaGuru',
      'CreativeStudio', 'FunnyGuy', 'TechReviewer', 'LifestyleVlogger', 'MusicLover'
    ];

    return Array.from({ length: 24 }, (_, i) => {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const uploaderName = uploaderNames[Math.floor(Math.random() * uploaderNames.length)];
      
      return {
        id: ViralVidUtils.generateId(),
        title: titles[i % titles.length],
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        category,
        views: this.getRandomNumber(1000, 500000),
        likes: this.getRandomNumber(50, 10000),
        comments: this.getRandomNumber(10, 1000),
        duration: this.getRandomDuration(),
        uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        uploaderName,
        uploaderAvatar: `https://via.placeholder.com/40x40?text=${uploaderName[0]}`,
        thumbnail: this.getDefaultThumbnail(category),
        status: 'active'
      };
    });
  }

  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomDuration() {
    const minutes = this.getRandomNumber(1, 15);
    const seconds = this.getRandomNumber(0, 59);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getDefaultThumbnail(category) {
    const thumbnails = {
      entertainment: 'https://via.placeholder.com/320x180/FF6B6B/FFFFFF?text=Entertainment',
      comedy: 'https://via.placeholder.com/320x180/4ECDC4/FFFFFF?text=Comedy',
      music: 'https://via.placeholder.com/320x180/45B7D1/FFFFFF?text=Music',
      sports: 'https://via.placeholder.com/320x180/96CEB4/FFFFFF?text=Sports',
      lifestyle: 'https://via.placeholder.com/320x180/FFEAA7/000000?text=Lifestyle',
      tech: 'https://via.placeholder.com/320x180/DDA0DD/FFFFFF?text=Tech'
    };
    
    return thumbnails[category] || 'https://via.placeholder.com/320x180/CCCCCC/FFFFFF?text=Video';
  }

  getDefaultAvatar() {
    return 'https://via.placeholder.com/40x40/007BFF/FFFFFF?text=U';
  }

  formatViews(views) {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  }
}

// Initialize video manager
const videoManager = new VideoManager();

// Global functions for HTML event handlers
function loadMoreVideos() {
  videoManager.loadMoreVideos();
}

function filterByCategory(category) {
  videoManager.filterByCategory(category);
}

// Export for use in other files
window.ViralVidVideoManager = videoManager;

