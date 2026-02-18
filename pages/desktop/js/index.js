import { createDraggable, animate } from 'animejs';

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
      resize: {}
    };
    this.canvasElement = document.getElementById('bgCanvas');
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
    };

    const onMouseMove = (e) => onPointerMove(e.clientX, e.clientY);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
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
// START BUTTON & TASKBAR ANIMATIONS
// ============================================================================

function initializeStartButton(windowManager) {
  const startButton = document.querySelector('.start-button');
  if (startButton) {
    startButton.addEventListener('click', () => {
      const svg = startButton.querySelector('svg');
      if (svg) {
        animate(svg, {
          scale: [0.7, 1.15, 1],
          duration: 600,
          ease: 'out(5)'
        });
      }
    });
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// SVG Icons
const SVG_ICONS = {
  browser: '<svg viewBox="0 0 24 24" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10" fill="#F4B400"/><circle cx="12" cy="12" r="7" fill="#0F9D58"/><circle cx="13" cy="11" r="2.5" fill="#4285F4"/><path d="M12 2 A10 10 0 0 1 19 5" fill="none" stroke="#EA4335" stroke-width="3" stroke-linecap="round"/><path d="M19 5 A10 10 0 0 1 22 12" fill="none" stroke="#F4B400" stroke-width="3" stroke-linecap="round"/><path d="M22 12 A10 10 0 0 1 12 22" fill="none" stroke="#0F9D58" stroke-width="3" stroke-linecap="round"/></svg>',
  cmd: '<svg viewBox="0 0 24 24" style="width:20px;height:20px;"><rect x="2" y="3" width="20" height="18" rx="2" fill="#000D26" stroke="#0078D4" stroke-width="1.5"/><text x="5" y="16" font-family="Courier" font-size="6" fill="#00FF00" font-weight="bold">C:\\</text><circle cx="20" cy="16" r="1.5" fill="#00FF00"/></svg>',
  email: '<svg viewBox="0 0 24 24" style="width:20px;height:20px;"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/><path d="M2 6l10 7 10-7" stroke="#ffffff" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>'
};

async function init() {
  const windowManager = new WindowManager();
  
  // Initialize background
  const bg = new BackgroundAnimation(document.getElementById('bgCanvas'));
  bg.init();
  
  // Initialize clock
  updateClock();
  setInterval(updateClock, 1000);
  
  // Initialize start button
  initializeStartButton(windowManager);
  // Add quick launch buttons to taskbar (persistent launchers)
  const taskbarCenter = document.getElementById('taskbarCenter');

  // Browser Button (persistent launcher)
  const browserBtn = document.createElement('button');
  browserBtn.className = 'taskbar-app';
  browserBtn.setAttribute('data-tooltip', 'Browser');
  browserBtn.setAttribute('data-launcher-type', 'browser');
  browserBtn.innerHTML = `<span>${SVG_ICONS.browser}</span>`;
  browserBtn.addEventListener('click', async () => {
    const span = browserBtn.querySelector('span');
    animate(span, {
      scale: [0.7, 1.15, 1],
      duration: 600,
      ease: 'out(5)'
    });

    // If a Browser window already exists, restore it
    const existingBrowser = Array.from(windowManager.windows.entries()).find(([, v]) => v.type === 'browser');
    if (existingBrowser) {
      const existingId = existingBrowser[0];
      windowManager.handleRestore(existingId);
      return;
    }

    try {
      await windowManager.createWindow('browser', 'Jakub Adamczyk', SVG_ICONS.browser);
    } catch (error) {
      console.error('Failed to create Browser window:', error);
    }
  });
  taskbarCenter.appendChild(browserBtn);

  // CMD Button (persistent launcher)
  const cmdBtn = document.createElement('button');
  cmdBtn.className = 'taskbar-app';
  cmdBtn.setAttribute('data-tooltip', 'MoMo Terminal');
  cmdBtn.setAttribute('data-launcher-type', 'cmd');
  cmdBtn.innerHTML = `<span>${SVG_ICONS.cmd}</span>`;
  cmdBtn.addEventListener('click', async () => {
    const span = cmdBtn.querySelector('span');
    animate(span, {
      scale: [0.7, 1.15, 1],
      duration: 600,
      ease: 'out(5)'
    });

    // If a CMD window already exists, restore it
    const existingCmd = Array.from(windowManager.windows.entries()).find(([, v]) => v.type === 'cmd');
    if (existingCmd) {
      const existingId = existingCmd[0];
      windowManager.handleRestore(existingId);
      return;
    }

    try {
      await windowManager.createWindow('cmd', 'MoMo Terminal', SVG_ICONS.cmd);
    } catch (error) {
      console.error('Failed to create CMD window:', error);
    }
  });
  taskbarCenter.appendChild(cmdBtn);

  // Email Button (persistent launcher)
  const emailBtn = document.createElement('button');
  emailBtn.className = 'taskbar-app';
  emailBtn.setAttribute('data-tooltip', 'Mail');
  emailBtn.setAttribute('data-launcher-type', 'email');
  emailBtn.innerHTML = `<span>${SVG_ICONS.email}</span>`;
  emailBtn.addEventListener('click', async () => {
    const span = emailBtn.querySelector('span');
    animate(span, {
      scale: [0.7, 1.15, 1],
      duration: 600,
      ease: 'out(5)'
    });

    // If an Email window already exists, restore it
    const existingEmail = Array.from(windowManager.windows.entries()).find(([, v]) => v.type === 'email');
    if (existingEmail) {
      const existingId = existingEmail[0];
      windowManager.handleRestore(existingId);
      return;
    }

    try {
      await windowManager.createWindow('email', 'Mail', SVG_ICONS.email);
    } catch (error) {
      console.error('Failed to create Email window:', error);
    }
  });
  taskbarCenter.appendChild(emailBtn);

  // Create initial windows on every load with a layout
  try {
    const browserId = await windowManager.createWindow('browser', 'Jakub Adamczyk', SVG_ICONS.browser);
    const cmdId = await windowManager.createWindow('cmd', 'MoMo Terminal', SVG_ICONS.cmd);
    const emailId = await windowManager.createWindow('email', 'Mail', SVG_ICONS.email);

    // Apply initial layout
    const browserEl = windowManager.windows.get(browserId).element;
    const cmdEl = windowManager.windows.get(cmdId).element;
    const emailEl = windowManager.windows.get(emailId).element;

    // Browser: left-center large
    browserEl.style.width = '60vw';
    browserEl.style.height = '93vh';
    browserEl.style.left = '0.5%';
    browserEl.style.top = '1.5%';

    // CMD: bottom-left smaller
    cmdEl.style.width = '34vw';
    cmdEl.style.height = '45vh';
    cmdEl.style.left = '61%';
    cmdEl.style.top = '1.5%';

    // Email: right side tall
    emailEl.style.width = '34vw';
    emailEl.style.height = '46.5vh';
    emailEl.style.left = '61%';
    emailEl.style.top = '50%';
  } catch (error) {
    console.error('Failed to create initial windows:', error);
  }

  // Expose windowManager globally for adding more windows
  window.windowManager = windowManager;
}

// Start the application
init();
