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
    <button class="nav-btn browser-back" title="Back">←</button>
    <button class="nav-btn browser-forward" title="Forward">→</button>
    <button class="nav-btn browser-reload" title="Reload">↻</button>
  </div>
  <div class="address-input">
    <span class="lock-icon">🔒</span>
    <span class="url">momoiin.github.io</span>
    <span class="star-icon" title="Bookmark">☆</span>
  </div>
  <button class="menu-btn browser-open-full" title="Open in full page">⋮</button>
</div>

<!-- Window Content: the real portfolio site, rendered inside the "browser" -->
<div class="window-content" style="padding:0;overflow:hidden;">
  <iframe class="browser-frame" src="../../index.html" title="Jakub Adamczyk — Portfolio"
    style="display:block;width:100%;height:100%;border:none;background:#f2f2f2;"></iframe>
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
  const frame = windowElement.querySelector('.browser-frame');
  const backBtn = windowElement.querySelector('.browser-back');
  const forwardBtn = windowElement.querySelector('.browser-forward');
  const reloadBtn = windowElement.querySelector('.browser-reload');
  const openFullBtn = windowElement.querySelector('.browser-open-full');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      try { frame.contentWindow.history.back(); } catch (e) { /* cross-origin page */ }
    });
  }

  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
      try { frame.contentWindow.history.forward(); } catch (e) { /* cross-origin page */ }
    });
  }

  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => {
      try {
        frame.contentWindow.location.reload();
      } catch (e) {
        frame.src = frame.src;
      }
    });
  }

  if (openFullBtn) {
    openFullBtn.addEventListener('click', () => {
      window.open('../../index.html', '_blank');
    });
  }
}

export default { htmlTemplate, init };
