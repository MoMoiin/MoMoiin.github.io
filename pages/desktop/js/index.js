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
    
    // Initialize window controls
    this.initializeWindowControls(windowEl);
    this.initializeResizeHandles(windowEl);
    this.centerWindow(windowEl);
    this.makeWindowDraggable(windowEl);
    
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
    
    return windowId;
  }

  centerWindow(windowEl) {
    const containerRect = this.container.getBoundingClientRect();
    const windowWidth = windowEl.offsetWidth;
    const windowHeight = windowEl.offsetHeight;
    
    windowEl.style.left = `${(containerRect.width - windowWidth) / 2}px`;
    windowEl.style.top = `${(containerRect.height - windowHeight) / 2}px`;
  }

  makeWindowDraggable(windowEl) {
    const titleBar = windowEl.querySelector('.chrome-tabs');
    if (!titleBar) return;
    
    createDraggable(windowEl, {
      container: this.container,
      handle: titleBar
    });
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
      windowEl.style.display = 'none';
      windowEl.style.transform = 'scale(1) translate(0, 0)';
      windowEl.style.opacity = '1';
    });
  }

  handleRestore(windowId) {
    const windowData = this.windows.get(windowId);
    const windowEl = windowData.element;
    const taskbarBtn = document.querySelector(`[data-window-id="${windowId}"]`);
    
    if (taskbarBtn) {
      taskbarBtn.classList.add('active');
    }
    
    if (windowEl.style.display === 'none') {
      windowEl.style.display = 'flex';
      windowEl.style.opacity = '0';
      windowEl.style.transform = 'scale(0.3)';
      
      animate(windowEl, {
        scale: [1],
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
    }
    
    animate(windowEl, {
      scale: [0.9],
      opacity: [0],
      duration: CONFIG.animation.duration.close,
      ease: CONFIG.animation.easing.in
    }).then(() => {
      windowEl.remove();
      this.windows.delete(windowId);
      if (taskbarBtn) {
        taskbarBtn.remove();
      }
    });
  }

  addTaskbarButton(windowId, icon, type) {
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
  
  // Create initial Browser window
  try {
    await windowManager.createWindow('browser', 'Jakub Adamczyk', '🌐');
  } catch (error) {
    console.error('Failed to create Browser window:', error);
  }
  
  // Add quick launch buttons to taskbar
  const taskbarCenter = document.getElementById('taskbarCenter');
  
  // CMD Button
  const cmdBtn = document.createElement('button');
  cmdBtn.className = 'taskbar-app';
  cmdBtn.setAttribute('data-tooltip', 'Command Prompt');
  cmdBtn.innerHTML = '<span>💻</span>';
  cmdBtn.addEventListener('click', async () => {
    const span = cmdBtn.querySelector('span');
    animate(span, {
      scale: [0.7, 1.15, 1],
      duration: 600,
      ease: 'out(5)'
    });
    try {
      await windowManager.createWindow('cmd', 'Command Prompt', '💻');
    } catch (error) {
      console.error('Failed to create CMD window:', error);
    }
  });
  taskbarCenter.appendChild(cmdBtn);
  
  // Email Button
  const emailBtn = document.createElement('button');
  emailBtn.className = 'taskbar-app';
  emailBtn.setAttribute('data-tooltip', 'Mail');
  emailBtn.innerHTML = '<span>✉️</span>';
  emailBtn.addEventListener('click', async () => {
    const span = emailBtn.querySelector('span');
    animate(span, {
      scale: [0.7, 1.15, 1],
      duration: 600,
      ease: 'out(5)'
    });
    try {
      await windowManager.createWindow('email', 'Mail', '✉️');
    } catch (error) {
      console.error('Failed to create Email window:', error);
    }
  });
  taskbarCenter.appendChild(emailBtn);
  
  // Expose windowManager globally for adding more windows
  window.windowManager = windowManager;
}

// Start the application
init();
