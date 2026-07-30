import { CONTEXT_MENU_ITEMS } from '../constants.js';
import { toast, confirmDialog } from './dialogs.js';

class ContextMenuManager {
  constructor(desktopIconsManager, { onReset } = {}) {
    this.desktopIconsManager = desktopIconsManager;
    this.onReset = onReset;
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
      'reset-desktop': async () => {
        const ok = await confirmDialog({
          title: 'Reset desktop?',
          message: 'This clears saved window positions, terminal history and '
            + 'preferences, then reloads the default layout.',
          confirmText: 'Reset',
          variant: 'danger'
        });
        if (ok) this.onReset?.();
      },
      'new-folder': () => toast('New Folder is not implemented yet'),
      'new-document': () => toast('New Text Document is not implemented yet'),
      'personalize': () => toast('Personalize is not implemented yet'),
      'display-settings': () => toast('Display settings is not implemented yet')
    };

    if (actions[action]) {
      actions[action]();
    }
  }

  close() {
    this.menu.classList.remove('open');
  }
}

export { ContextMenuManager };
