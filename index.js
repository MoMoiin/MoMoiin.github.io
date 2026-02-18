import { createDraggable, animate } from 'animejs';

const target = document.querySelector('.draggable');
const container = document.querySelector('.large.row.centered');
const handle = document.querySelector('.window-titlebar');

// Center the window initially
function centerWindow() {
  const containerRect = container.getBoundingClientRect();
  const targetWidth = target.offsetWidth;
  const targetHeight = target.offsetHeight;
  
  target.style.left = (containerRect.width - targetWidth) / 2 + 'px';
  target.style.top = (containerRect.height - targetHeight) / 2 + 'px';
}

centerWindow();

// Recenter window when viewport resizes
window.addEventListener('resize', () => {
  centerWindow();
});

const draggable = createDraggable(target, {
  container: container,
  handle: handle
});

// Prevent dragging from content area
const windowContent = document.querySelector('.window-content');
const addressBar = document.querySelector('.address-bar');

[windowContent, addressBar].forEach(element => {
  element.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  });
});

// Resize functionality
const resizeTop = document.querySelector('.resize-top');
const resizeRight = document.querySelector('.resize-right');
const resizeBottom = document.querySelector('.resize-bottom');
const resizeLeft = document.querySelector('.resize-left');
const resizeCornerTL = document.querySelector('.resize-corner-tl');
const resizeCornerTR = document.querySelector('.resize-corner-tr');
const resizeCornerBL = document.querySelector('.resize-corner-bl');
const resizeCornerBR = document.querySelector('.resize-corner-br');

let isResizing = false;
let currentResizer = null;
let startX, startY, startWidth, startHeight, startLeft, startTop;

function initResize(e, resizer) {
  isResizing = true;
  currentResizer = resizer;
  startX = e.clientX;
  startY = e.clientY;
  startWidth = target.offsetWidth;
  startHeight = target.offsetHeight;
  startLeft = target.offsetLeft;
  startTop = target.offsetTop;
  e.preventDefault();
  e.stopPropagation();
}

function resize(e) {
  if (!isResizing) return;

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;

  // Right edge or corners with right
  if (currentResizer === resizeRight || currentResizer === resizeCornerTR || currentResizer === resizeCornerBR) {
    const newWidth = Math.max(400, startWidth + deltaX);
    target.style.width = newWidth + 'px';
  }

  // Left edge or corners with left
  if (currentResizer === resizeLeft || currentResizer === resizeCornerTL || currentResizer === resizeCornerBL) {
    const newWidth = Math.max(400, startWidth - deltaX);
    if (newWidth > 400) {
      target.style.width = newWidth + 'px';
      target.style.left = (startLeft + deltaX) + 'px';
    }
  }

  // Bottom edge or corners with bottom
  if (currentResizer === resizeBottom || currentResizer === resizeCornerBL || currentResizer === resizeCornerBR) {
    const newHeight = Math.max(300, startHeight + deltaY);
    target.style.height = newHeight + 'px';
  }

  // Top edge or corners with top
  if (currentResizer === resizeTop || currentResizer === resizeCornerTL || currentResizer === resizeCornerTR) {
    const newHeight = Math.max(300, startHeight - deltaY);
    if (newHeight > 300) {
      target.style.height = newHeight + 'px';
      target.style.top = (startTop + deltaY) + 'px';
    }
  }
}

function stopResize() {
  isResizing = false;
  currentResizer = null;
}

// Add event listeners for all resize handles
resizeTop.addEventListener('mousedown', (e) => initResize(e, resizeTop));
resizeRight.addEventListener('mousedown', (e) => initResize(e, resizeRight));
resizeBottom.addEventListener('mousedown', (e) => initResize(e, resizeBottom));
resizeLeft.addEventListener('mousedown', (e) => initResize(e, resizeLeft));
resizeCornerTL.addEventListener('mousedown', (e) => initResize(e, resizeCornerTL));
resizeCornerTR.addEventListener('mousedown', (e) => initResize(e, resizeCornerTR));
resizeCornerBL.addEventListener('mousedown', (e) => initResize(e, resizeCornerBL));
resizeCornerBR.addEventListener('mousedown', (e) => initResize(e, resizeCornerBR));

document.addEventListener('mousemove', resize);
document.addEventListener('mouseup', stopResize);

// Update taskbar clock
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const date = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  
  const timeElement = document.querySelector('.time');
  const dateElement = document.querySelector('.date');
  
  if (timeElement) timeElement.textContent = time;
  if (dateElement) dateElement.textContent = date;
}

updateClock();
setInterval(updateClock, 1000);

// Get window control elements
const browserTaskbarBtn = document.querySelector('.taskbar-app.active');
const maximizeBtn = document.querySelector('.window-controls span:nth-child(2)');
const minimizeBtn = document.querySelector('.window-controls span:nth-child(1)');
const closeBtn = document.querySelector('.window-controls span:nth-child(3)');

// Window controls: Maximize/Restore functionality
let isMaximized = false;
let previousSize = { width: 0, height: 0, top: 0, left: 0 };

maximizeBtn.addEventListener('click', () => {
  if (!isMaximized) {
    // Save current size and position
    previousSize = {
      width: target.offsetWidth,
      height: target.offsetHeight,
      top: target.offsetTop,
      left: target.offsetLeft
    };
    
    // Calculate maximize dimensions
    const maxWidth = window.innerWidth;
    const maxHeight = window.innerHeight - 48; // Subtract taskbar height
    
    // Maximize with animation
    animate(target, {
      width: [maxWidth + 'px'],
      height: [maxHeight + 'px'],
      top: ['0px'],
      left: ['0px'],
      borderRadius: ['0px'],
      duration: 200,
      ease: 'out(3)'
    });
    isMaximized = true;
  } else {
    // Restore previous size with animation
    animate(target, {
      width: [previousSize.width + 'px'],
      height: [previousSize.height + 'px'],
      top: [previousSize.top + 'px'],
      left: [previousSize.left + 'px'],
      borderRadius: ['8px'],
      duration: 200,
      ease: 'out(3)'
    });
    isMaximized = false;
  }
});

// Minimize functionality
minimizeBtn.addEventListener('click', () => {
  const taskbarRect = browserTaskbarBtn.getBoundingClientRect();
  const windowRect = target.getBoundingClientRect();
  
  // Remove active class when minimizing
  browserTaskbarBtn.classList.remove('active');
  
  const anim = animate(target, {
    scale: [0.3],
    translateX: [taskbarRect.left - windowRect.left],
    translateY: [taskbarRect.top - windowRect.top],
    opacity: [0],
    duration: 300,
    ease: 'inOut(3)'
  });
  
  anim.then(() => {
    target.style.display = 'none';
    target.style.transform = 'scale(1) translate(0, 0)';
    target.style.opacity = '1';
  });
});

// Restore from taskbar
browserTaskbarBtn.addEventListener('click', () => {
  if (target.style.display === 'none') {
    target.style.display = 'flex';
    target.style.opacity = '0';
    target.style.transform = 'scale(0.3)';
    
    // Add active class when restoring
    browserTaskbarBtn.classList.add('active');
    
    animate(target, {
      scale: [1],
      opacity: [1],
      duration: 300,
      ease: 'out(3)'
    });
  }
});

// Close functionality
closeBtn.addEventListener('click', () => {
  // Remove active class when closing
  browserTaskbarBtn.classList.remove('active');
  
  const anim = animate(target, {
    scale: [0.9],
    opacity: [0],
    duration: 150,
    ease: 'in(3)'
  });
  
  anim.then(() => {
    target.style.display = 'none';
    target.style.transform = 'scale(1)';
    target.style.opacity = '1';
  });
});

// Animated Background
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Gradient animation variables
let gradientOffset = 0;

function animateBackground() {
  // Update gradient offset
  gradientOffset += 0.002;
  
  // Create moving gradient
  const gradient = ctx.createLinearGradient(
    0, 
    0, 
    canvas.width * Math.cos(gradientOffset), 
    canvas.height * Math.sin(gradientOffset)
  );
  
  // Color stops
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(0.5, '#764ba2');
  gradient.addColorStop(1, '#f093fb');
  
  // Fill canvas
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Continue animation
  requestAnimationFrame(animateBackground);
}

// Start animation
animateBackground();