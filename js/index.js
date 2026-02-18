import { createDraggable, animate } from 'animejs';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  window: {
    minWidth: 400,
    minHeight: 300,
    borderRadius: 8
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
    colors: ['#667eea', '#764ba2', '#f093fb']
  }
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
  window: document.querySelector('.draggable'),
  container: document.querySelector('.large.row.centered'),
  titleBar: document.querySelector('.window-titlebar'),
  content: document.querySelector('.window-content'),
  addressBar: document.querySelector('.address-bar'),
  controls: {
    minimize: document.querySelector('.window-controls span:nth-child(1)'),
    maximize: document.querySelector('.window-controls span:nth-child(2)'),
    close: document.querySelector('.window-controls span:nth-child(3)')
  },
  taskbar: {
    browserIcon: document.querySelector('.taskbar-app.active')
  },
  clock: {
    time: document.querySelector('.time'),
    date: document.querySelector('.date')
  },
  resize: {
    top: document.querySelector('.resize-top'),
    right: document.querySelector('.resize-right'),
    bottom: document.querySelector('.resize-bottom'),
    left: document.querySelector('.resize-left'),
    cornerTL: document.querySelector('.resize-corner-tl'),
    cornerTR: document.querySelector('.resize-corner-tr'),
    cornerBL: document.querySelector('.resize-corner-bl'),
    cornerBR: document.querySelector('.resize-corner-br')
  },
  canvas: document.getElementById('bgCanvas')
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  isMaximized: false,
  isResizing: false,
  previousSize: { width: 0, height: 0, top: 0, left: 0 },
  resize: {
    currentHandle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0
  },
  background: {
    gradientOffset: 0
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Centers the window in the container
 */
function centerWindow() {
  const containerRect = elements.container.getBoundingClientRect();
  const windowWidth = elements.window.offsetWidth;
  const windowHeight = elements.window.offsetHeight;
  
  elements.window.style.left = `${(containerRect.width - windowWidth) / 2}px`;
  elements.window.style.top = `${(containerRect.height - windowHeight) / 2}px`;
}

/**
 * Updates the taskbar clock display
 */
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
  
  if (elements.clock.time) elements.clock.time.textContent = time;
  if (elements.clock.date) elements.clock.date.textContent = date;
}

/**
 * Resets window transform and opacity to default
 */
function resetWindowStyles() {
  elements.window.style.transform = 'scale(1) translate(0, 0)';
  elements.window.style.opacity = '1';
}

/**
 * Updates taskbar icon active state
 */
function setTaskbarActive(isActive) {
  elements.taskbar.browserIcon.classList.toggle('active', isActive);
}

// ============================================================================
// WINDOW POSITIONING & DRAGGING
// ============================================================================

function initializeWindow() {
  centerWindow();
  
  // Initialize draggable functionality
  createDraggable(elements.window, {
    container: elements.container,
    handle: elements.titleBar
  });
  
  // Prevent dragging from content areas
  [elements.content, elements.addressBar].forEach(element => {
    element.addEventListener('mousedown', e => e.stopPropagation());
  });
  
  // Recenter on window resize
  window.addEventListener('resize', centerWindow);
}

// ============================================================================
// WINDOW CONTROLS (MINIMIZE, MAXIMIZE, CLOSE)
// ============================================================================

function handleMaximize() {
  if (!state.isMaximized) {
    // Save current position and size
    state.previousSize = {
      width: elements.window.offsetWidth,
      height: elements.window.offsetHeight,
      top: elements.window.offsetTop,
      left: elements.window.offsetLeft
    };
    
    // Animate to fullscreen
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - CONFIG.taskbar.height;
    
    animate(elements.window, {
      width: [`${maxWidth}px`],
      height: [`${maxHeight}px`],
      top: ['0px'],
      left: ['0px'],
      borderRadius: ['0px'],
      duration: CONFIG.animation.duration.maximize,
      ease: CONFIG.animation.easing.default
    });
    
    state.isMaximized = true;
  } else {
    // Restore to previous size
    animate(elements.window, {
      width: [`${state.previousSize.width}px`],
      height: [`${state.previousSize.height}px`],
      top: [`${state.previousSize.top}px`],
      left: [`${state.previousSize.left}px`],
      borderRadius: [`${CONFIG.window.borderRadius}px`],
      duration: CONFIG.animation.duration.maximize,
      ease: CONFIG.animation.easing.default
    });
    
    state.isMaximized = false;
  }
}

function handleMinimize() {
  const taskbarRect = elements.taskbar.browserIcon.getBoundingClientRect();
  const windowRect = elements.window.getBoundingClientRect();
  
  setTaskbarActive(false);
  
  animate(elements.window, {
    scale: [0.3],
    translateX: [taskbarRect.left - windowRect.left],
    translateY: [taskbarRect.top - windowRect.top],
    opacity: [0],
    duration: CONFIG.animation.duration.minimize,
    ease: CONFIG.animation.easing.inOut
  }).then(() => {
    elements.window.style.display = 'none';
    resetWindowStyles();
  });
}

function handleRestore() {
  if (elements.window.style.display === 'none') {
    elements.window.style.display = 'flex';
    elements.window.style.opacity = '0';
    elements.window.style.transform = 'scale(0.3)';
    
    setTaskbarActive(true);
    
    animate(elements.window, {
      scale: [1],
      opacity: [1],
      duration: CONFIG.animation.duration.minimize,
      ease: CONFIG.animation.easing.default
    });
  }
}

function handleClose() {
  setTaskbarActive(false);
  
  animate(elements.window, {
    scale: [0.9],
    opacity: [0],
    duration: CONFIG.animation.duration.close,
    ease: CONFIG.animation.easing.in
  }).then(() => {
    elements.window.style.display = 'none';
    resetWindowStyles();
  });
}

function initializeWindowControls() {
  elements.controls.maximize.addEventListener('click', handleMaximize);
  elements.controls.minimize.addEventListener('click', handleMinimize);
  elements.controls.close.addEventListener('click', handleClose);
  elements.taskbar.browserIcon.addEventListener('click', handleRestore);
}

// ============================================================================
// WINDOW RESIZING
// ============================================================================

function initResize(event, handle) {
  state.isResizing = true;
  state.resize.currentHandle = handle;
  state.resize.startX = event.clientX;
  state.resize.startY = event.clientY;
  state.resize.startWidth = elements.window.offsetWidth;
  state.resize.startHeight = elements.window.offsetHeight;
  state.resize.startLeft = elements.window.offsetLeft;
  state.resize.startTop = elements.window.offsetTop;
  
  event.preventDefault();
  event.stopPropagation();
}

function handleResize(event) {
  if (!state.isResizing) return;
  
  const { currentHandle, startX, startY, startWidth, startHeight, startLeft, startTop } = state.resize;
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;
  const { resize } = elements;
  
  // Right edge resize
  if ([resize.right, resize.cornerTR, resize.cornerBR].includes(currentHandle)) {
    const newWidth = Math.max(CONFIG.window.minWidth, startWidth + deltaX);
    elements.window.style.width = `${newWidth}px`;
  }
  
  // Left edge resize
  if ([resize.left, resize.cornerTL, resize.cornerBL].includes(currentHandle)) {
    const newWidth = Math.max(CONFIG.window.minWidth, startWidth - deltaX);
    if (newWidth > CONFIG.window.minWidth) {
      elements.window.style.width = `${newWidth}px`;
      elements.window.style.left = `${startLeft + deltaX}px`;
    }
  }
  
  // Bottom edge resize
  if ([resize.bottom, resize.cornerBL, resize.cornerBR].includes(currentHandle)) {
    const newHeight = Math.max(CONFIG.window.minHeight, startHeight + deltaY);
    elements.window.style.height = `${newHeight}px`;
  }
  
  // Top edge resize
  if ([resize.top, resize.cornerTL, resize.cornerTR].includes(currentHandle)) {
    const newHeight = Math.max(CONFIG.window.minHeight, startHeight - deltaY);
    if (newHeight > CONFIG.window.minHeight) {
      elements.window.style.height = `${newHeight}px`;
      elements.window.style.top = `${startTop + deltaY}px`;
    }
  }
}

function stopResize() {
  state.isResizing = false;
  state.resize.currentHandle = null;
}

function initializeResizeHandles() {
  // Attach event listeners to all resize handles
  Object.values(elements.resize).forEach(handle => {
    handle.addEventListener('mousedown', e => initResize(e, handle));
  });
  
  // Global resize and stop listeners
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

function resizeCanvas() {
  elements.canvas.width = elements.canvas.offsetWidth;
  elements.canvas.height = elements.canvas.offsetHeight;
}

function animateBackground() {
  const ctx = elements.canvas.getContext('2d');
  state.background.gradientOffset += CONFIG.background.animationSpeed;
  
  // Create rotating gradient
  const gradient = ctx.createLinearGradient(
    0, 
    0, 
    elements.canvas.width * Math.cos(state.background.gradientOffset), 
    elements.canvas.height * Math.sin(state.background.gradientOffset)
  );
  
  // Apply color stops
  CONFIG.background.colors.forEach((color, index) => {
    gradient.addColorStop(index / (CONFIG.background.colors.length - 1), color);
  });
  
  // Render gradient
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);
  
  requestAnimationFrame(animateBackground);
}

function initializeBackground() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  animateBackground();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  initializeWindow();
  initializeWindowControls();
  initializeResizeHandles();
  initializeBackground();
  
  // Start clock
  updateClock();
  setInterval(updateClock, 1000);
}

// Start the application
init();