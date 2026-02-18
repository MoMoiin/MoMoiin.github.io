// Email Component JavaScript

export const htmlTemplate = `<!-- Email Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">✉️</span>
        <span class="tab-title">Mail</span>
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

<!-- Window Content -->
<div class="window-content email-content">
  <div class="email-header">
    <button class="email-btn compose-btn">✎ Compose</button>
    <div class="email-folders">
      <div class="folder">📧 Inbox (3)</div>
      <div class="folder">📤 Sent</div>
      <div class="folder">🗑️ Trash</div>
      <div class="folder">⭐ Starred</div>
    </div>
  </div>
  
  <div class="email-list">
    <div class="email-item unread">
      <div class="email-from">GitHub</div>
      <div class="email-subject">Repository update</div>
      <div class="email-preview">You have new activity on your repositories...</div>
      <div class="email-time">2h ago</div>
    </div>
    <div class="email-item">
      <div class="email-from">LinkedIn</div>
      <div class="email-subject">You have a new connection!</div>
      <div class="email-preview">Someone viewed your profile today</div>
      <div class="email-time">1d ago</div>
    </div>
    <div class="email-item">
      <div class="email-from">Newsletter</div>
      <div class="email-subject">Latest web development trends</div>
      <div class="email-preview">This month's must-read articles...</div>
      <div class="email-time">3d ago</div>
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
  // Email-specific initialization
  const composeBtn = windowElement.querySelector('.compose-btn');
  const emailItems = windowElement.querySelectorAll('.email-item');
  
  if (composeBtn) {
    composeBtn.addEventListener('click', () => {
      alert('Compose window would open here');
    });
  }
  
  emailItems.forEach(item => {
    item.addEventListener('click', () => {
      emailItems.forEach(e => e.classList.remove('selected'));
      item.classList.add('selected');
    });
  });
}

export default { htmlTemplate, init };
