import { toast } from './dialogs.js';
import { ICON_TYPES, WINDOW_TYPES } from '../constants.js';
import { scopeSvgIds } from '../core/dom.js';

class DesktopIconsManager {
  constructor(windowManager, launcher) {
    this.windowManager = windowManager;
    this.launcher = launcher;
    this.container = document.getElementById('desktopIcons');
    this.icons = [];
  }

  createIcon(name, icon, type) {
    const iconEl = document.createElement('div');
    iconEl.className = 'desktop-icon';
    iconEl.innerHTML = `
      <div class="desktop-icon-image">${scopeSvgIds(icon)}</div>
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
    // "This PC" opens the file explorer
    if (type === ICON_TYPES.THIS_PC) {
      type = WINDOW_TYPES.EXPLORER;
    }

    if (type === ICON_TYPES.RECYCLE_BIN) {
      toast('Recycle Bin is empty');
      return;
    }

    await this.launcher.launch(type, { name, icon });
  }

  clearSelection() {
    document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
      icon.classList.remove('selected');
    });
  }
}

export { DesktopIconsManager };
