import { createDraggable, animate } from 'animejs';
import { WINDOW_TYPES, ICON_TYPES, SVG_ICONS, APP_DEFINITIONS, CONTEXT_MENU_ITEMS } from './constants.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  window: {
    minWidth: 400,
    minHeight: 300,
    borderRadius: 12
  },
  taskbar: {
    height: 48
  },
  animation: {
    duration: {
      maximize: 200,
      minimize: 300,
      close: 150
    },
    easing: {
      default: 'out(3)',
      inOut: 'inOut(3)',
      in: 'in(3)'
    }
  },
  background: {
    animationSpeed: 0.002,
    colors: ['#1f2937', '#535964', '#af928e']
  }
};

// ============================================================================
// WINDOW MANAGER
// ============================================================================

class WindowManager {
  constructor() {
    this.windows = new Map();
    this.container = document.getElementById('windowsContainer');
    this.taskbarCenter = document.getElementById('taskbarCenter');
    this.maxZIndex = 10;
    this.state = {
      isResizing: false,
      resize: {},
      isDraggingWindow: false,
      snapZone: null
    };
    this.canvasElement = document.getElementById('bgCanvas');
    this.snapThreshold = 20; // pixels from edge to trigger snap
  }

  async createWindow(type, title, icon) {
    const windowId = `window-${type}-${Date.now()}`;
    
    // Import the component
    const componentModule = await import(`../components/${type}/${type}.js`);
    const Component = componentModule.default;
    
    // Create window element
    const windowEl = document.createElement('div');
    windowEl.className = 'window';
    windowEl.id = windowId;
    windowEl.innerHTML = componentModule.htmlTemplate;
    
    this.container.appendChild(windowEl);
    
    // Apply component CSS
    const componentLink = document.createElement('link');
    componentLink.rel = 'stylesheet';
    componentLink.href = `./components/${type}/${type}.css`;
    document.head.appendChild(componentLink);
    
    // Reset transform to ensure proper positioning and dragging
    windowEl.style.transform = 'none';
    windowEl.style.opacity = '1';
    windowEl.style.display = 'flex';
    
    // Initialize window controls
    this.initializeWindowControls(windowEl);
    this.initializeResizeHandles(windowEl);
    
    // Bring window to front on any click
    windowEl.addEventListener('mousedown', () => this.bringToFront(windowId));
    windowEl.addEventListener('touchstart', () => this.bringToFront(windowId));
    
    this.centerWindow(windowEl);
    this.makeWindowDraggable(windowEl, windowId);
    
    // Add taskbar button
    this.addTaskbarButton(windowId, icon, type);
    
    // Initialize component-specific logic
    if (Component.init) {
      Component.init(windowEl);
    }
    
    this.windows.set(windowId, {
      element: windowEl,
      type: type,
      isMaximized: false,
      wasMaximized: false,
      previousSize: { width: 0, height: 0, top: 0, left: 0 }
    });
    
    // Bring newly created window to front
    this.bringToFront(windowId);
    
    return windowId;
  }

  bringToFront(windowId) {
    const windowData = this.windows.get(windowId);
    if (windowData) {
      this.maxZIndex++;
      windowData.element.style.zIndex = this.maxZIndex;
    }
  }

  centerWindow(windowEl) {
    const containerRect = this.container.getBoundingClientRect();
    let windowWidth = windowEl.offsetWidth;
    let windowHeight = windowEl.offsetHeight;
    
    // If dimensions aren't calculated yet, force a layout recalculation
    if (windowWidth === 0 || windowHeight === 0) {
      windowEl.style.visibility = 'hidden';
      windowEl.style.display = 'flex';
      windowWidth = windowEl.offsetWidth || 960;  // fallback to default
      windowHeight = windowEl.offsetHeight || 540; // fallback to default
      windowEl.style.visibility = '';
    }
    
    windowEl.style.left = `${(containerRect.width - windowWidth) / 2}px`;
    windowEl.style.top = `${(containerRect.height - windowHeight) / 2}px`;
  }

  makeWindowDraggable(windowEl, windowId) {
    const titleBar = windowEl.querySelector('.chrome-tabs');
    if (!titleBar) return;

    // Custom title-bar-only dragging (mouse + touch)
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    const onPointerMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;
      const newLeft = Math.max(0, startLeft + dx);
      const newTop = Math.max(0, startTop + dy);
      windowEl.style.left = `${newLeft}px`;
      windowEl.style.top = `${newTop}px`;
      
      // Check for snap zones
      this.checkSnapZone(clientX, clientY, windowEl);
    };

    const onMouseMove = (e) => onPointerMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      this.state.isDraggingWindow = false;
      
      // Apply snap if in snap zone
      if (this.state.snapZone) {
        this.applySnap(windowEl, windowId, this.state.snapZone);
        this.state.snapZone = null;
      }
      
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', stopDrag);
    };

    const startDrag = (clientX, clientY) => {
      // Bring window to front when starting drag
      this.bringToFront(windowId);
      
      // record start positions
      isDragging = true;
      this.state.isDraggingWindow = true;
      startX = clientX;
      startY = clientY;
      const rect = windowEl.getBoundingClientRect();
      // Convert to container-relative coordinates if container is positioned
      const containerRect = this.container.getBoundingClientRect();
      startLeft = rect.left - containerRect.left + this.container.scrollLeft;
      startTop = rect.top - containerRect.top + this.container.scrollTop;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', stopDrag);
    };

    titleBar.addEventListener('mousedown', (e) => {
      // don't start drag when clicking controls inside title bar
      if (e.target.closest('.control-btn, .tab-close, .new-tab-button, .nav-btn, .address-input, .menu-btn')) return;
      startDrag(e.clientX, e.clientY);
      e.preventDefault();
    });

    titleBar.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        // don't start drag when touching controls
        if (e.target.closest('.control-btn, .tab-close, .new-tab-button, .nav-btn, .address-input, .menu-btn')) return;
        startDrag(t.clientX, t.clientY);
        e.preventDefault();
      }
    }, { passive: false });
  }

  checkSnapZone(x, y, windowEl) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - CONFIG.taskbar.height;
    
    // Check if near left edge
    if (x < this.snapThreshold) {
      this.state.snapZone = 'left';
      this.showSnapPreview('left');
    }
    // Check if near right edge
    else if (x > screenWidth - this.snapThreshold) {
      this.state.snapZone = 'right';
      this.showSnapPreview('right');
    }
    // Check if near top edge (maximize)
    else if (y < this.snapThreshold) {
      this.state.snapZone = 'top';
      this.showSnapPreview('top');
    }
    else {
      this.state.snapZone = null;
      this.hideSnapPreview();
    }
  }

  showSnapPreview(zone) {
    let preview = document.getElementById('snapPreview');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'snapPreview';
      preview.style.position = 'fixed';
      preview.style.border = '2px solid rgba(139, 92, 246, 0.8)';
      preview.style.background = 'rgba(139, 92, 246, 0.2)';
      preview.style.pointerEvents = 'none';
      preview.style.zIndex = '9998';
      preview.style.transition = 'all 0.1s ease';
      document.body.appendChild(preview);
    }
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - CONFIG.taskbar.height;
    
    if (zone === 'left') {
      preview.style.left = '0';
      preview.style.top = '0';
      preview.style.width = `${screenWidth / 2}px`;
      preview.style.height = `${screenHeight}px`;
    } else if (zone === 'right') {
      preview.style.left = `${screenWidth / 2}px`;
      preview.style.top = '0';
      preview.style.width = `${screenWidth / 2}px`;
      preview.style.height = `${screenHeight}px`;
    } else if (zone === 'top') {
      preview.style.left = '0';
      preview.style.top = '0';
      preview.style.width = `${screenWidth}px`;
      preview.style.height = `${screenHeight}px`;
    }
    
    preview.style.display = 'block';
  }

  hideSnapPreview() {
    const preview = document.getElementById('snapPreview');
    if (preview) {
      preview.style.display = 'none';
    }
  }

  applySnap(windowEl, windowId, zone) {
    const windowData = this.windows.get(windowId);
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - CONFIG.taskbar.height;
    
    // Save previous size if not maximized
    if (!windowData.isMaximized) {
      windowData.previousSize = {
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight,
        top: windowEl.offsetTop,
        left: windowEl.offsetLeft
      };
    }
    
    windowEl.style.maxWidth = 'none';
    windowEl.style.maxHeight = 'none';
    
    if (zone === 'left') {
      windowData.isMaximized = false;
      animate(windowEl, {
        width: [`${screenWidth / 2}px`],
        height: [`${screenHeight}px`],
        top: ['0px'],
        left: ['0px'],
        borderRadius: ['0px'],
        duration: CONFIG.animation.duration.maximize,
        ease: CONFIG.animation.easing.default
      });
    } else if (zone === 'right') {
      windowData.isMaximized = false;
      animate(windowEl, {
        width: [`${screenWidth / 2}px`],
        height: [`${screenHeight}px`],
        top: ['0px'],
        left: [`${screenWidth / 2}px`],
        borderRadius: ['0px'],
        duration: CONFIG.animation.duration.maximize,
        ease: CONFIG.animation.easing.default
      });
    } else if (zone === 'top') {
      windowData.isMaximized = true;
      animate(windowEl, {
        width: [`${screenWidth}px`],
        height: [`${screenHeight}px`],
        top: ['0px'],
        left: ['0px'],
        borderRadius: ['0px'],
        duration: CONFIG.animation.duration.maximize,
        ease: CONFIG.animation.easing.default
      });
    }
    
    this.hideSnapPreview();
  }

  initializeWindowControls(windowEl) {
    const minimize = windowEl.querySelector('.minimize-btn');
    const maximize = windowEl.querySelector('.maximize-btn');
    const close = windowEl.querySelector('.close-btn');
    const windowId = windowEl.id;
    
    if (minimize) {
      minimize.addEventListener('click', () => this.handleMinimize(windowId));
    }
    if (maximize) {
      maximize.addEventListener('click', () => this.handleMaximize(windowId));
    }
    if (close) {
      close.addEventListener('click', () => this.handleClose(windowId));
    }
  }

  handleMaximize(windowId) {
    const windowData = this.windows.get(windowId);
    const windowEl = windowData.element;
    
    if (!windowData.isMaximized) {
      windowData.previousSize = {
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight,
        top: windowEl.offsetTop,
        left: windowEl.offsetLeft
      };
      
      const maxWidth = window.innerWidth;
      const maxHeight = window.innerHeight - CONFIG.taskbar.height;
      
      windowEl.style.maxWidth = 'none';
      windowEl.style.maxHeight = 'none';
      
      windowData.isMaximized = true;
      
      animate(windowEl, {
        width: [`${maxWidth}px`],
        height: [`${maxHeight}px`],
        top: ['0px'],
        left: ['0px'],
        borderRadius: ['0px'],
        duration: CONFIG.animation.duration.maximize,
        ease: CONFIG.animation.easing.default
      });
    } else {
      windowData.isMaximized = false;
      windowEl.style.maxWidth = '';
      windowEl.style.maxHeight = '';
      
      animate(windowEl, {
        width: [`${windowData.previousSize.width}px`],
        height: [`${windowData.previousSize.height}px`],
        top: [`${windowData.previousSize.top}px`],
        left: [`${windowData.previousSize.left}px`],
        borderRadius: [`${CONFIG.window.borderRadius}px`],
        duration: CONFIG.animation.duration.maximize,
        ease: CONFIG.animation.easing.default
      });
    }
  }

  handleMinimize(windowId) {
    const windowData = this.windows.get(windowId);
    const windowEl = windowData.element;
    const taskbarBtn = document.querySelector(`[data-window-id="${windowId}"]`);
    
    if (taskbarBtn) {
      taskbarBtn.classList.remove('active');
    }
    
    // Save current position before minimizing
    windowData.savedPosition = {
      top: windowEl.offsetTop,
      left: windowEl.offsetLeft
    };
    
    windowData.wasMaximized = windowData.isMaximized;
    
    const taskbarRect = taskbarBtn?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const windowRect = windowEl.getBoundingClientRect();
    
    const iconCenterX = taskbarRect.left + taskbarRect.width / 2;
    const iconCenterY = taskbarRect.top + taskbarRect.height / 2;
    const windowCenterX = windowRect.left + windowRect.width / 2;
    const windowCenterY = windowRect.top + windowRect.height / 2;
    
    animate(windowEl, {
      scale: [0.3],
      translateX: [iconCenterX - windowCenterX],
      translateY: [iconCenterY - windowCenterY],
      opacity: [0],
      duration: CONFIG.animation.duration.minimize,
      ease: CONFIG.animation.easing.inOut
    }).then(() => {
      // Hide without resetting transform yet - prevents visible jump
      windowEl.style.display = 'none';
      windowEl.style.opacity = '1';
    });
  }

  handleRestore(windowId) {
    const windowData = this.windows.get(windowId);
    const windowEl = windowData.element;
    const taskbarBtn = document.querySelector(`[data-window-id="${windowId}"]`);
    
    // Bring window to front when restoring
    this.bringToFront(windowId);
    
    if (taskbarBtn) {
      taskbarBtn.classList.add('active');
    }
    
    if (windowEl.style.display === 'none') {
      // Reset transform while window is hidden to prevent visible jump
      windowEl.style.transform = 'none';
      
      // Restore saved position before showing
      if (windowData.savedPosition) {
        windowEl.style.left = `${windowData.savedPosition.left}px`;
        windowEl.style.top = `${windowData.savedPosition.top}px`;
      }
      
      windowEl.style.display = 'flex';
      windowEl.style.opacity = '0';
      
      animate(windowEl, {
        opacity: [1],
        duration: CONFIG.animation.duration.minimize,
        ease: CONFIG.animation.easing.default
      }).then(() => {
        if (windowData.wasMaximized) {
          windowData.wasMaximized = false;
          this.handleMaximize(windowId);
        }
      });
    } else {
      this.handleMinimize(windowId);
    }
  }

  handleClose(windowId) {
    const windowData = this.windows.get(windowId);
    const windowEl = windowData.element;
    const taskbarBtn = document.querySelector(`[data-window-id="${windowId}"]`);

    if (taskbarBtn) {
      taskbarBtn.classList.remove('active');
      // If this button is a persistent launcher (has data-launcher-type), keep it
      if (taskbarBtn.hasAttribute('data-launcher-type')) {
        taskbarBtn.removeAttribute('data-window-id');
      }
    }

    animate(windowEl, {
      scale: [0.9],
      opacity: [0],
      duration: CONFIG.animation.duration.close,
      ease: CONFIG.animation.easing.in
    }).then(() => {
      windowEl.remove();
      this.windows.delete(windowId);
      // If button exists and is NOT a launcher, remove it
      if (taskbarBtn && !taskbarBtn.hasAttribute('data-launcher-type')) {
        taskbarBtn.remove();
      }
    });
  }

  addTaskbarButton(windowId, icon, type) {
    // If a persistent launcher exists for this type, reuse it
    const launcher = this.taskbarCenter.querySelector(`[data-launcher-type="${type}"]`);
    if (launcher) {
      launcher.classList.add('active');
      launcher.setAttribute('data-window-id', windowId);
      // Don't override the launcher's original click handler - it checks if a window exists
      // and either restores or creates a new one
      return;
    }

    const button = document.createElement('button');
    button.className = 'taskbar-app active';
    button.setAttribute('data-tooltip', type.charAt(0).toUpperCase() + type.slice(1));
    button.setAttribute('data-window-id', windowId);
    button.innerHTML = `<span>${icon}</span>`;

    button.addEventListener('click', () => {
      this.handleRestore(windowId);
    });

    this.taskbarCenter.appendChild(button);

    // Animate icon click
    button.addEventListener('click', (e) => {
      const span = button.querySelector('span');
      if (span) {
        animate(span, {
          scale: [0.7, 1.15, 1],
          duration: 600,
          ease: 'out(5)'
        });
      }
    });
  }

  initializeResizeHandles(windowEl) {
    const handles = {
      top: windowEl.querySelector('.resize-top'),
      right: windowEl.querySelector('.resize-right'),
      bottom: windowEl.querySelector('.resize-bottom'),
      left: windowEl.querySelector('.resize-left'),
      cornerTL: windowEl.querySelector('.resize-corner-tl'),
      cornerTR: windowEl.querySelector('.resize-corner-tr'),
      cornerBL: windowEl.querySelector('.resize-corner-bl'),
      cornerBR: windowEl.querySelector('.resize-corner-br')
    };
    
    Object.values(handles).forEach(handle => {
      if (handle) {
        handle.addEventListener('mousedown', (e) => this.initResize(e, handle, windowEl));
      }
    });
    
    document.addEventListener('mousemove', (e) => this.handleResize(e, windowEl));
    document.addEventListener('mouseup', () => this.stopResize());
  }

  initResize(event, handle, windowEl) {
    this.state.isResizing = true;
    this.state.resize = {
      currentHandle: handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: windowEl.offsetWidth,
      startHeight: windowEl.offsetHeight,
      startLeft: windowEl.offsetLeft,
      startTop: windowEl.offsetTop,
      windowEl: windowEl
    };
    
    event.preventDefault();
    event.stopPropagation();
  }

  handleResize(event, windowEl) {
    if (!this.state.isResizing || !this.state.resize.windowEl) return;
    
    const resizeData = this.state.resize;
    const deltaX = event.clientX - resizeData.startX;
    const deltaY = event.clientY - resizeData.startY;
    const handle = resizeData.currentHandle;
    const el = resizeData.windowEl;
    
    const handles = {
      top: el.querySelector('.resize-top'),
      right: el.querySelector('.resize-right'),
      bottom: el.querySelector('.resize-bottom'),
      left: el.querySelector('.resize-left'),
      cornerTL: el.querySelector('.resize-corner-tl'),
      cornerTR: el.querySelector('.resize-corner-tr'),
      cornerBL: el.querySelector('.resize-corner-bl'),
      cornerBR: el.querySelector('.resize-corner-br')
    };
    
    if ([handles.right, handles.cornerTR, handles.cornerBR].includes(handle)) {
      const newWidth = Math.max(CONFIG.window.minWidth, resizeData.startWidth + deltaX);
      el.style.width = `${newWidth}px`;
    }
    
    if ([handles.left, handles.cornerTL, handles.cornerBL].includes(handle)) {
      const newWidth = Math.max(CONFIG.window.minWidth, resizeData.startWidth - deltaX);
      if (newWidth > CONFIG.window.minWidth) {
        el.style.width = `${newWidth}px`;
        el.style.left = `${resizeData.startLeft + deltaX}px`;
      }
    }
    
    if ([handles.bottom, handles.cornerBL, handles.cornerBR].includes(handle)) {
      const newHeight = Math.max(CONFIG.window.minHeight, resizeData.startHeight + deltaY);
      el.style.height = `${newHeight}px`;
    }
    
    if ([handles.top, handles.cornerTL, handles.cornerTR].includes(handle)) {
      const newHeight = Math.max(CONFIG.window.minHeight, resizeData.startHeight - deltaY);
      if (newHeight > CONFIG.window.minHeight) {
        el.style.height = `${newHeight}px`;
        el.style.top = `${resizeData.startTop + deltaY}px`;
      }
    }
  }

  stopResize() {
    this.state.isResizing = false;
    this.state.resize = {};
  }
}

// ============================================================================
// BACKGROUND ANIMATION
// ============================================================================

class BackgroundAnimation {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.state = { gradientOffset: 0 };
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    
    const ctx = this.canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    this.canvas.displayWidth = rect.width;
    this.canvas.displayHeight = rect.height;
  }

  animate() {
    const ctx = this.canvas.getContext('2d', { alpha: false });
    this.state.gradientOffset += CONFIG.background.animationSpeed;
    
    const width = this.canvas.displayWidth || this.canvas.width;
    const height = this.canvas.displayHeight || this.canvas.height;
    
    const gradient = ctx.createLinearGradient(
      0,
      0,
      width * Math.cos(this.state.gradientOffset),
      height * Math.sin(this.state.gradientOffset)
    );
    
    CONFIG.background.colors.forEach((color, index) => {
      gradient.addColorStop(index / (CONFIG.background.colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    requestAnimationFrame(() => this.animate());
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas(), { passive: true });
    this.animate();
  }
}

// ============================================================================
// CLOCK & TIME MANAGEMENT
// ============================================================================

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const date = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
  
  const timeEl = document.querySelector('.time');
  const dateEl = document.querySelector('.date');
  
  if (timeEl) timeEl.textContent = time;
  if (dateEl) dateEl.textContent = date;
}

// ============================================================================
// DESKTOP ICONS MANAGER
// ============================================================================

class DesktopIconsManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.container = document.getElementById('desktopIcons');
    this.icons = [];
  }

  createIcon(name, icon, type) {
    const iconEl = document.createElement('div');
    iconEl.className = 'desktop-icon';
    iconEl.innerHTML = `
      <div class="desktop-icon-image">${icon}</div>
      <div class="desktop-icon-label">${name}</div>
    `;
    
    // Double-click to open
    let clickCount = 0;
    let clickTimer = null;
    
    iconEl.addEventListener('click', (e) => {
      // Don't stop propagation so desktop click handler can still work
      
      // Clear previous selections
      document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
        if (icon !== iconEl) icon.classList.remove('selected');
      });
      
      // Select this icon
      iconEl.classList.add('selected');
      
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        this.openIcon(type, name, icon);
      }
    });
    
    this.container.appendChild(iconEl);
    this.icons.push({ element: iconEl, name, type });
    
    return iconEl;
  }

  async openIcon(type, name, icon) {
    const implementedTypes = [WINDOW_TYPES.BROWSER, WINDOW_TYPES.TERMINAL, WINDOW_TYPES.EMAIL, WINDOW_TYPES.EXPLORER];
    
    if (implementedTypes.includes(type)) {
      // Check if window already exists
      const existing = Array.from(this.windowManager.windows.entries()).find(([, v]) => v.type === type);
      if (existing) {
        this.windowManager.handleRestore(existing[0]);
      } else {
        await this.windowManager.createWindow(type, name, icon);
      }
    } else if (type === ICON_TYPES.RECYCLE_BIN) {
      alert('Recycle Bin is empty');
    }
  }

  clearSelection() {
    document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
      icon.classList.remove('selected');
    });
  }
}

// ============================================================================
// START MENU MANAGER
// ============================================================================

class StartMenuManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.menu = document.getElementById('startMenu');
    this.startButton = document.querySelector('.start-button');
    this.isOpen = false;
    
    this.initializeStartButton();
    this.populateApps();
  }

  initializeStartButton() {
    this.startButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
      
      const svg = this.startButton.querySelector('svg');
      if (svg) {
        animate(svg, {
          scale: [0.7, 1.15, 1],
          duration: 600,
          ease: 'out(5)'
        });
      }
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && !this.startButton.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('open');
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('open');
  }

  populateApps() {
    const appGrid = document.getElementById('pinnedApps');
    
    APP_DEFINITIONS.forEach(app => {
      const appEl = document.createElement('button');
      appEl.className = 'start-menu-app';
      appEl.innerHTML = `
        <div class="start-menu-app-icon">${app.icon}</div>
        <div class="start-menu-app-name">${app.name}</div>
      `;
      
      appEl.addEventListener('click', async () => {
        this.close();
        
        const implementedTypes = [WINDOW_TYPES.BROWSER, WINDOW_TYPES.TERMINAL, WINDOW_TYPES.EMAIL, WINDOW_TYPES.EXPLORER];
        
        if (implementedTypes.includes(app.type)) {
          // Check if window already exists
          const existing = Array.from(this.windowManager.windows.entries()).find(([, v]) => v.type === app.type);
          if (existing) {
            this.windowManager.handleRestore(existing[0]);
          } else {
            await this.windowManager.createWindow(app.type, app.name, app.icon);
          }
        } else {
          alert(`${app.name} is not implemented yet`);
        }
      });
      
      appGrid.appendChild(appEl);
    });
  }
}

// ============================================================================
// CONTEXT MENU MANAGER
// ============================================================================

class ContextMenuManager {
  constructor(desktopIconsManager) {
    this.desktopIconsManager = desktopIconsManager;
    this.menu = document.getElementById('contextMenu');
    this.initializeContextMenu();
  }

  initializeContextMenu() {
    // Right-click on desktop
    document.addEventListener('contextmenu', (e) => {
      // Only show on desktop background, not on windows or icons
      if (e.target.closest('.window, .desktop-icon, .taskbar, .start-menu')) {
        return;
      }
      
      e.preventDefault();
      this.show(e.clientX, e.clientY);
    });
    
    // Close when clicking anywhere
    document.addEventListener('click', () => {
      this.close();
    });
  }

  show(x, y) {
    const items = CONTEXT_MENU_ITEMS.map(item => {
      if (item.type === 'separator') {
        return '<div class="context-menu-separator"></div>';
      }
      return `
        <button class="context-menu-item" data-action="${item.action}">
          <span class="context-menu-icon">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `;
    }).join('');
    
    this.menu.innerHTML = items;
    
    // Add click handlers
    this.menu.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = item.getAttribute('data-action');
        this.handleContextAction(action);
        this.close();
      });
    });
    
    // Position the menu
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    this.menu.classList.add('open');
    
    // Adjust if menu goes off screen
    const rect = this.menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
      this.menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
  }

  handleContextAction(action) {
    const actions = {
      'refresh': () => location.reload(),
      'new-folder': () => alert('New Folder is not implemented yet'),
      'new-document': () => alert('New Text Document is not implemented yet'),
      'personalize': () => alert('Personalize is not implemented yet'),
      'display-settings': () => alert('Display settings is not implemented yet')
    };

    if (actions[action]) {
      actions[action]();
    }
  }

  close() {
    this.menu.classList.remove('open');
  }
}

// ============================================================================
// SYSTEM TRAY MANAGER
// ============================================================================

class SystemTrayManager {
  constructor() {
    this.trayIcons = document.querySelectorAll('.tray-icon');
    this.datetime = document.querySelector('.datetime');
    this.initialize();
  }

  initialize() {
    this.initializeTrayIcons();
    this.initializeDatetime();
  }

  initializeTrayIcons() {
    this.trayIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const tooltip = icon.getAttribute('data-tooltip');
        this.handleTrayIconClick(tooltip);
      });
    });
  }

  handleTrayIconClick(tooltip) {
    const actions = {
      'Volume': () => alert('Volume control is not implemented yet'),
      'Network': () => alert('Network settings is not implemented yet'),
      'Battery': () => alert('Battery: 85% (Plugged in)')
    };

    if (actions[tooltip]) {
      actions[tooltip]();
    }
  }

  initializeDatetime() {
    if (this.datetime) {
      this.datetime.style.cursor = 'pointer';
      this.datetime.addEventListener('click', () => {
        alert('Calendar is not implemented yet');
      });
    }
  }
}

// ============================================================================
// TASKBAR MANAGER
// ============================================================================

class TaskbarManager {
  constructor(windowManager) {
    this.windowManager = windowManager;
    this.taskbarCenter = document.getElementById('taskbarCenter');
  }

  createLauncher(config) {
    const { type, name, icon, tooltip } = config;
    const button = document.createElement('button');
    button.className = 'taskbar-app';
    button.setAttribute('data-tooltip', tooltip);
    button.setAttribute('data-launcher-type', type);
    button.innerHTML = `<span>${icon}</span>`;

    button.addEventListener('click', async () => {
      this.animateLauncherClick(button);
      await this.handleLauncherClick(type, name, icon);
    });

    this.taskbarCenter.appendChild(button);
    return button;
  }

  animateLauncherClick(button) {
    const span = button.querySelector('span');
    if (span) {
      animate(span, {
        scale: [0.7, 1.15, 1],
        duration: 600,
        ease: 'out(5)'
      });
    }
  }

  async handleLauncherClick(type, name, icon) {
    // Check if window already exists
    const existing = Array.from(this.windowManager.windows.entries())
      .find(([, v]) => v.type === type);

    if (existing) {
      this.windowManager.handleRestore(existing[0]);
    } else {
      try {
        await this.windowManager.createWindow(type, name, icon);
      } catch (error) {
        console.error(`Failed to create ${type} window:`, error);
      }
    }
  }

  initializeDefaultLaunchers() {
    this.createLauncher({
      type: WINDOW_TYPES.BROWSER,
      name: 'Jakub Adamczyk',
      icon: SVG_ICONS.browser,
      tooltip: 'Browser'
    });

    this.createLauncher({
      type: WINDOW_TYPES.TERMINAL,
      name: 'MoMo Terminal',
      icon: SVG_ICONS.cmd,
      tooltip: 'MoMo Terminal'
    });

    this.createLauncher({
      type: WINDOW_TYPES.EMAIL,
      name: 'Mail',
      icon: SVG_ICONS.email,
      tooltip: 'Mail'
    });
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  const windowManager = new WindowManager();
  
  // Initialize background
  const bg = new BackgroundAnimation(document.getElementById('bgCanvas'));
  bg.init();
  
  // Initialize clock
  updateClock();
  setInterval(updateClock, 1000);
  
  // Initialize desktop icons
  const desktopIconsManager = new DesktopIconsManager(windowManager);
  desktopIconsManager.createIcon('This PC', SVG_ICONS.thispc, ICON_TYPES.THIS_PC);
  desktopIconsManager.createIcon('Recycle Bin', SVG_ICONS.recyclebin, ICON_TYPES.RECYCLE_BIN);
  desktopIconsManager.createIcon('Browser', SVG_ICONS.browser, WINDOW_TYPES.BROWSER);
  desktopIconsManager.createIcon('Terminal', SVG_ICONS.cmd, WINDOW_TYPES.TERMINAL);
  
  // Click on desktop background to clear selections
  document.querySelector('.large.row.centered').addEventListener('click', (e) => {
    // Clear selection if clicking on desktop background (not on icons or windows)
    if (!e.target.closest('.desktop-icon, .window, .taskbar, .start-menu, .context-menu')) {
      desktopIconsManager.clearSelection();
    }
  });
  
  // Initialize start menu
  const startMenuManager = new StartMenuManager(windowManager);
  
  // Initialize context menu
  const contextMenuManager = new ContextMenuManager(desktopIconsManager);
  
  // Initialize system tray
  new SystemTrayManager();
  
  // Initialize taskbar launchers
  const taskbarManager = new TaskbarManager(windowManager);
  taskbarManager.initializeDefaultLaunchers();

  // Create initial windows on every load with a layout
  try {
    const browserId = await windowManager.createWindow(WINDOW_TYPES.BROWSER, 'Jakub Adamczyk', SVG_ICONS.browser);
    const cmdId = await windowManager.createWindow(WINDOW_TYPES.TERMINAL, 'MoMo Terminal', SVG_ICONS.cmd);
    const emailId = await windowManager.createWindow(WINDOW_TYPES.EMAIL, 'Mail', SVG_ICONS.email);

    // Apply initial layout
    const browserEl = windowManager.windows.get(browserId).element;
    const cmdEl = windowManager.windows.get(cmdId).element;
    const emailEl = windowManager.windows.get(emailId).element;

    // Browser
    browserEl.style.width = '32vw';
    browserEl.style.height = '64vh';
    browserEl.style.left = '0.5%';
    browserEl.style.top = '1.5%';

    // CMD
    cmdEl.style.width = '35vw';
    cmdEl.style.height = '50vh';
    cmdEl.style.left = '37%';
    cmdEl.style.top = '25%';

    // Email
    emailEl.style.width = '15vw';
    emailEl.style.height = '63vh';
    emailEl.style.left = '75%';
    emailEl.style.top = '20%';
  } catch (error) {
    console.error('Failed to create initial windows:', error);
  }

  // Expose windowManager globally for adding more windows
  window.windowManager = windowManager;
}

// Start the application
init();
