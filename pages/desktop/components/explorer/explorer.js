// File Explorer Component JavaScript

const FOLDER_ICON = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="folderGradSmall" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FFD54F;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFC107;stop-opacity:1" /></linearGradient></defs><path d="M8 8C5.8 8 4 9.8 4 12v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4H23l-3-4H8z" fill="url(#folderGradSmall)"/><path d="M8 16h32v20H8z" fill="#FFE082" opacity="0.5"/></svg>';

export const htmlTemplate = `<!-- Explorer Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">${FOLDER_ICON}</span>
        <span class="tab-title">This PC</span>
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

<!-- Explorer Address Bar -->
<div class="address-bar">
  <div class="nav-buttons">
    <button class="nav-btn" title="Back" disabled>←</button>
    <button class="nav-btn" title="Forward" disabled>→</button>
    <button class="nav-btn" title="Up">↑</button>
    <button class="nav-btn" title="Refresh">↻</button>
  </div>
  <div class="address-input">
    <span class="lock-icon">📁</span>
    <span class="url">This PC</span>
  </div>
  <button class="menu-btn" title="Menu">⋮</button>
</div>

<!-- Window Content -->
<div class="window-content explorer-content">
  <div class="explorer-sidebar">
    <div class="sidebar-section">
      <div class="sidebar-item active">
        <span class="sidebar-icon">💻</span>
        <span>This PC</span>
      </div>
      <div class="sidebar-item">
        <span class="sidebar-icon">📁</span>
        <span>Documents</span>
      </div>
      <div class="sidebar-item">
        <span class="sidebar-icon">⬇️</span>
        <span>Downloads</span>
      </div>
      <div class="sidebar-item">
        <span class="sidebar-icon">🖼️</span>
        <span>Pictures</span>
      </div>
      <div class="sidebar-item">
        <span class="sidebar-icon">🎵</span>
        <span>Music</span>
      </div>
      <div class="sidebar-item">
        <span class="sidebar-icon">🎬</span>
        <span>Videos</span>
      </div>
    </div>
  </div>
  
  <div class="explorer-main">
    <div class="explorer-toolbar">
      <button class="toolbar-btn">New Folder</button>
      <button class="toolbar-btn">View</button>
    </div>
    
    <div class="explorer-items" id="explorerItems">
      <!-- Items will be added here -->
    </div>
  </div>
</div>`;

class ExplorerComponent {
  static init(windowEl) {
    const itemsContainer = windowEl.querySelector('#explorerItems');
    
    // Add some demo files and folders
    const items = [
      { name: 'Documents', type: 'folder', icon: '📁' },
      { name: 'Pictures', type: 'folder', icon: '🖼️' },
      { name: 'Downloads', type: 'folder', icon: '📥' },
      { name: 'Desktop', type: 'folder', icon: '🖥️' },
      { name: 'Projects', type: 'folder', icon: '📂' },
      { name: 'README.txt', type: 'file', icon: '📄' },
      { name: 'portfolio.pdf', type: 'file', icon: '📄' },
      { name: 'image.png', type: 'file', icon: '🖼️' }
    ];
    
    items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'explorer-item';
      itemEl.innerHTML = `
        <div class="explorer-item-icon">${item.icon}</div>
        <div class="explorer-item-name">${item.name}</div>
      `;
      
      itemEl.addEventListener('dblclick', () => {
        if (item.type === 'folder') {
          alert(`Opening ${item.name} folder (not implemented)`);
        } else {
          alert(`Opening ${item.name} file (not implemented)`);
        }
      });
      
      itemsContainer.appendChild(itemEl);
    });
    
    // Sidebar navigation
    const sidebarItems = windowEl.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const name = item.textContent.trim();
        const urlSpan = windowEl.querySelector('.url');
        if (urlSpan) {
          urlSpan.textContent = name;
        }
      });
    });
  }
}

export default ExplorerComponent;
