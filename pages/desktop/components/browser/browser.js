// Browser Component JavaScript

const BROWSER_ICON = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="#F4B400"/><circle cx="24" cy="24" r="14" fill="#0F9D58"/><circle cx="26" cy="22" r="5" fill="#4285F4"/><path d="M24 4 A20 20 0 0 1 38 10" fill="none" stroke="#EA4335" stroke-width="5" stroke-linecap="round"/><path d="M38 10 A20 20 0 0 1 44 24" fill="none" stroke="#F4B400" stroke-width="5" stroke-linecap="round"/><path d="M44 24 A20 20 0 0 1 24 44" fill="none" stroke="#0F9D58" stroke-width="5" stroke-linecap="round"/></svg>';

export const htmlTemplate = `<!-- Browser Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">${BROWSER_ICON}</span>
        <span class="tab-title">Jakub Adamczyk</span>
        <button class="tab-close" title="Close tab">×</button>
      </div>
    </div>
    <button class="new-tab-button" title="New tab">+</button>
  </div>
  <div class="window-controls">
    <button class="control-btn minimize-btn" title="Minimize">−</button>
    <button class="control-btn maximize-btn" title="Maximize">□</button>
    <button class="control-btn close-btn" title="Close">×</button>
  </div>
</div>

<!-- Chrome-style Address Bar -->
<div class="address-bar">
  <div class="nav-buttons">
    <button class="nav-btn" title="Back" disabled>←</button>
    <button class="nav-btn" title="Forward" disabled>→</button>
    <button class="nav-btn" title="Reload">↻</button>
  </div>
  <div class="address-input">
    <span class="lock-icon">🔒</span>
    <span class="url">jakub-adamczyk.com</span>
    <span class="star-icon" title="Bookmark">☆</span>
  </div>
  <button class="menu-btn" title="Menu">⋮</button>
</div>

<!-- Window Content -->
<div class="window-content">
  <h1>Welcome to the desktop version of my portfolio website!</h1>
  <p>This is a window recreation on how a modern web application would look and behave in a desktop environment. \n if you dont like this version you can go back to a static page by clicking this button </p>
  
  <button class="cta-button" onclick="window.location.href='./pages/mobile/index.html'">Go to the Static site</button>
  <div class="feature-grid">
    <div class="feature-card">
      <h3>Feature 1</h3>
      <p>Amazing functionality here</p>
    </div>
    <div class="feature-card">
      <h3>Feature 2</h3>
      <p>More great features</p>
    </div>
  </div>
</div>

<!-- Resize Handles -->
<div class="resize-handle resize-top"></div>
<div class="resize-handle resize-right"></div>
<div class="resize-handle resize-bottom"></div>
<div class="resize-handle resize-left"></div>
<div class="resize-handle resize-corner-tl"></div>
<div class="resize-handle resize-corner-tr"></div>
<div class="resize-handle resize-corner-bl"></div>
<div class="resize-handle resize-corner-br"></div>`;

export function init(windowElement) {
  // Browser-specific initialization
  const tabClose = windowElement.querySelector('.tab-close');
  const newTabBtn = windowElement.querySelector('.new-tab-button');
  
  if (tabClose) {
    tabClose.addEventListener('click', () => {
      console.log('Close tab clicked');
    });
  }
  
  if (newTabBtn) {
    newTabBtn.addEventListener('click', () => {
      console.log('New tab clicked');
    });
  }
}

export default { htmlTemplate, init };
