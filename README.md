# Responsive Website with Dual Views

This project features an intelligent routing system that serves different experiences based on device type.

## 📁 Project Structure

```
MoMoiin.github.io/
├── index.html           # Router - Auto-detects device and redirects
├── mobile.html          # Mobile-optimized website
├── desktop.html         # Desktop OS simulator
├── css/
│   ├── style.css        # Desktop OS styles
│   └── mobile.css       # Mobile website styles
├── js/
│   └── index.js         # Desktop OS functionality
├── package.json
└── node_modules/
    └── animejs/         # Animation library
```

## 🚀 How It Works

### 1. **index.html** (Router)
- Entry point for all visitors
- Detects screen size (breakpoint: 1024px)
- Automatically redirects to appropriate version:
  - **< 1024px** → mobile.html
  - **≥ 1024px** → desktop.html
- Remembers user preference via localStorage
- Provides manual override buttons

### 2. **mobile.html** (Mobile View)
- Clean, modern mobile-first design
- Responsive navigation with hamburger menu
- Touch-optimized interface
- Sections: Hero, About, Projects, Contact
- Smooth animations and transitions
- Link to switch to desktop view

### 3. **desktop.html** (Desktop View)
- Windows 11-style OS simulator
- Interactive draggable browser window
- Resizable window (8-way resize handles)
- Window controls: minimize, maximize, close
- Animated background (rotating gradient)
- Taskbar with Start button, apps, system tray
- Live clock display
- Link to switch to mobile view (📱 icon in taskbar)

## 🎨 Features

### Mobile Features
- Hamburger menu navigation
- Smooth scroll to sections
- Project cards with hover effects
- Contact section with links
- Fully responsive design
- Gradient hero section

### Desktop Features
- Draggable windows with anime.js
- 8-directional resizing
- Window animations (minimize/maximize/close)
- Windows 11 design system
- Animated gradient background
- System tray with clock
- Taskbar with active states

## 💾 User Preference

The router saves user preference in localStorage:
- If you manually choose "Mobile View", it remembers
- If you manually choose "Desktop View", it remembers
- Clear localStorage to reset to auto-detection

## 🔧 Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling, animations, flexbox
- **Vanilla JavaScript** - No frameworks
- **anime.js v4** - Animation library (desktop only)
- **Canvas API** - Animated background (desktop only)

## 📱 Breakpoints

- **Mobile**: < 1024px
- **Desktop**: ≥ 1024px

## 🎯 Use Cases

- Portfolio website with interactive desktop experience
- Showcase projects differently based on device
- Provide optimal UX for each device type
- Demonstrate responsive design skills

## 🔄 Switching Views

Users can manually switch between views:
- From **mobile.html**: Click "Switch to Desktop View" in footer
- From **desktop.html**: Click 📱 icon in system tray

The preference is saved and persists across visits.
