# ViralVid Setup Guide

This guide will help you set up and run the ViralVid video sharing platform on your local machine or deploy it to production.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Web Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+
- **Local Server** (optional but recommended): Python 3.6+, Node.js 12+, or PHP 7.4+

### Development Tools (Optional)
- **Code Editor**: VS Code, Sublime Text, or similar
- **Git**: For version control
- **Browser DevTools**: For debugging and testing

## 🚀 Quick Start (5 Minutes)

### Option 1: Direct Browser Access
1. **Download** the project files
2. **Extract** to your desired directory
3. **Open** `index.html` in your web browser
4. **Navigate** to `admin/login.html` for admin access

### Option 2: Local Server (Recommended)
```bash
# Navigate to project directory
cd viralvid

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have npx)
npx serve .

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 📁 Project Structure Overview

```
viralvid/
├── 📄 index.html              # Main homepage - START HERE
├── 📁 public/                 # Public user pages
│   ├── login.html            # User login
│   └── signup.html           # User registration
├── 📁 admin/                  # Admin interface
│   ├── login.html            # Admin login - USE: admin@viralvid.com / Admin@123
│   └── dashboard.html        # Admin dashboard
├── 📁 css/                    # Stylesheets
│   ├── main.css              # Main styles
│   ├── auth.css              # Authentication styles
│   ├── admin.css             # Admin styles
│   └── responsive.css        # Mobile responsiveness
├── 📁 js/                     # JavaScript files
│   ├── utils.js              # Utility functions
│   ├── auth.js               # User authentication
│   ├── admin-auth.js         # Admin authentication
│   ├── admin-dashboard.js    # Dashboard functionality
│   ├── videos.js             # Video management
│   └── main.js               # Main application
├── 📁 assets/                 # Static assets (future use)
├── 📄 README.md               # Main documentation
├── 📄 SETUP.md                # This setup guide
└── 📄 testing-results.md      # Testing report
```

## 🔑 Default Credentials

### Admin Access
- **URL**: `/admin/login.html`
- **Email**: `admin@viralvid.com`
- **Password**: `Admin@123`

### Demo User (for testing)
- **Email**: `user@example.com`
- **Password**: `password123`

## 🎯 Step-by-Step Setup

### Step 1: Download and Extract
1. Download the ViralVid project files
2. Extract to a folder like `C:\viralvid` or `~/viralvid`
3. Ensure all files are in the correct structure

### Step 2: Choose Your Server Method

#### Method A: Python Server (Recommended)
```bash
# Open terminal/command prompt
cd path/to/viralvid

# Start server
python -m http.server 8000

# Access at: http://localhost:8000
```

#### Method B: Node.js Server
```bash
# Install serve globally (one-time)
npm install -g serve

# Start server
serve .

# Access at: http://localhost:3000
```

#### Method C: PHP Server
```bash
# Start PHP built-in server
php -S localhost:8000

# Access at: http://localhost:8000
```

#### Method D: Direct File Access
- Simply double-click `index.html`
- Some features may be limited due to browser security

### Step 3: Verify Installation
1. **Homepage**: Should load with video grid and navigation
2. **Login Modal**: Click "Login" button to test modal
3. **Admin Access**: Navigate to `/admin/login.html`
4. **Admin Login**: Use provided credentials to access dashboard

## 🔧 Configuration Options

### Customizing the Platform

#### 1. Branding
```html
<!-- Update in index.html and admin files -->
<title>Your Platform Name</title>
<meta name="description" content="Your platform description">
```

#### 2. Admin Credentials
```javascript
// In js/admin-auth.js, update the authenticateAdmin function
if (credentials.email === 'your-admin@domain.com' && 
    credentials.password === 'YourSecurePassword') {
    // Admin authentication logic
}
```

#### 3. Video Categories
```javascript
// In js/videos.js, update the categories array
const categories = ['entertainment', 'comedy', 'music', 'sports', 'lifestyle', 'tech'];
```

#### 4. Platform Settings
```javascript
// In js/utils.js or main.js
const PLATFORM_CONFIG = {
    siteName: 'Your Platform',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedVideoTypes: ['mp4', 'avi', 'mov', 'wmv'],
    videosPerPage: 12
};
```

### Styling Customization

#### 1. Color Scheme
```css
/* In css/main.css, update CSS custom properties */
:root {
    --primary-500: #your-primary-color;
    --secondary-500: #your-secondary-color;
    --accent-color: #your-accent-color;
}
```

#### 2. Typography
```css
/* Update font imports in CSS files */
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;600;700&display=swap');

:root {
    --font-family: 'YourFont', sans-serif;
}
```

## 🌐 Deployment Options

### Option 1: Static Hosting (Current Setup)

#### Netlify
1. Create account at netlify.com
2. Drag and drop the `viralvid` folder
3. Configure custom domain (optional)

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow deployment prompts

#### GitHub Pages
1. Create GitHub repository
2. Upload project files
3. Enable GitHub Pages in repository settings

### Option 2: VPS/Cloud Hosting

#### Basic Setup
```bash
# Upload files to server
scp -r viralvid/ user@your-server.com:/var/www/html/

# Configure web server (Apache/Nginx)
# Point document root to /var/www/html/viralvid/
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/viralvid;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Videos Not Loading
- **Cause**: Browser security restrictions with file:// protocol
- **Solution**: Use a local server (Python, Node.js, or PHP)

#### 2. Admin Login Not Working
- **Cause**: JavaScript not loading or incorrect credentials
- **Solution**: 
  - Check browser console for errors
  - Verify credentials: `admin@viralvid.com` / `Admin@123`
  - Ensure JavaScript files are loading

#### 3. Styles Not Applied
- **Cause**: CSS files not loading correctly
- **Solution**: 
  - Check file paths in HTML
  - Verify CSS files exist in `/css/` directory
  - Clear browser cache

#### 4. Modal Not Opening
- **Cause**: JavaScript errors or missing event listeners
- **Solution**: 
  - Check browser console for errors
  - Ensure all JS files are loaded
  - Verify click event handlers

### Browser-Specific Issues

#### Chrome
- May block some features with file:// protocol
- Use local server for full functionality

#### Firefox
- Generally works well with file:// protocol
- May need to enable local file access

#### Safari
- Strict security policies
- Local server recommended

#### Edge
- Similar to Chrome behavior
- Local server recommended

### Performance Issues

#### Slow Loading
- **Check**: Internet connection for Google Fonts
- **Solution**: Use local fonts or CDN

#### Memory Usage
- **Cause**: Large number of demo videos
- **Solution**: Reduce demo data in `js/videos.js`

## 📱 Mobile Testing

### Testing on Mobile Devices

#### Method 1: Local Network Access
```bash
# Find your local IP address
ipconfig getifaddr en0  # macOS
ip route get 1.2.3.4 | awk '{print $7}'  # Linux
ipconfig  # Windows

# Start server with network access
python -m http.server 8000 --bind 0.0.0.0

# Access from mobile: http://YOUR_IP:8000
```

#### Method 2: Browser DevTools
1. Open Chrome DevTools
2. Click device toolbar icon
3. Select mobile device simulation
4. Test responsive design

## 🔒 Security Considerations

### Development Environment
- Current setup uses localStorage for demo purposes
- Admin credentials are hardcoded for testing
- No server-side validation

### Production Recommendations
1. **Backend Integration**: Add proper server and database
2. **Authentication**: Implement secure login system
3. **Input Validation**: Server-side validation required
4. **File Upload**: Secure file handling and storage
5. **HTTPS**: Enable SSL/TLS encryption

## 📊 Monitoring and Analytics

### Built-in Analytics
- Admin dashboard shows platform statistics
- User activity tracking (demo data)
- Video performance metrics

### Adding Real Analytics
```html
<!-- Add to <head> section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

## 🆘 Getting Help

### Documentation
- **README.md**: Complete feature overview
- **Code Comments**: Detailed inline documentation
- **Testing Report**: `testing-results.md`

### Support Channels
- **GitHub Issues**: For bug reports and feature requests
- **Code Review**: Check JavaScript console for errors
- **Community**: Share with developer communities

### Self-Help Checklist
- [ ] All files downloaded and extracted correctly
- [ ] Local server running (if using)
- [ ] Browser console shows no errors
- [ ] Correct admin credentials used
- [ ] JavaScript enabled in browser
- [ ] Modern browser version

---

## 🎉 You're Ready!

Once setup is complete, you should have:
- ✅ Working homepage with video grid
- ✅ Functional login/signup modals
- ✅ Admin dashboard access
- ✅ Video player functionality
- ✅ Responsive design on all devices

**Next Steps:**
1. Explore the admin dashboard
2. Test video upload functionality
3. Customize branding and colors
4. Plan backend integration for production

**Happy coding!** 🚀

