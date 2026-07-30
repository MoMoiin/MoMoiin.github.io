import { animate } from 'animejs';
import { APP_DEFINITIONS } from '../constants.js';
import { shutDown, showShortcuts } from './power.js';
import { scopeSvgIds } from '../core/dom.js';

class StartMenuManager {
  constructor(windowManager, launcher, { onBeforeShutdown } = {}) {
    this.windowManager = windowManager;
    this.launcher = launcher;
    this.onBeforeShutdown = onBeforeShutdown;
    this.menu = document.getElementById('startMenu');
    this.startButton = document.querySelector('.start-button');
    this.isOpen = false;

    this.initializeStartButton();
    this.populateApps();
    this.initializeFooter();
  }

  /** Wires the footer: the power button previously had no handler at all. */
  initializeFooter() {
    const power = this.menu.querySelector('.power-button');
    power?.addEventListener('click', async (e) => {
      e.stopPropagation();
      this.close();
      await shutDown({ onBeforeShutdown: this.onBeforeShutdown });
    });

    const footer = this.menu.querySelector('.start-menu-footer');
    if (footer && !footer.querySelector('.shortcuts-button')) {
      const button = document.createElement('button');
      button.className = 'shortcuts-button';
      button.type = 'button';
      button.setAttribute('data-tooltip', 'Keyboard shortcuts');
      button.textContent = '⌨ Shortcuts';
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
        showShortcuts();
      });
      // Before the power button, which sits at the end.
      footer.insertBefore(button, footer.firstChild);
    }
  }

  initializeStartButton() {
    this.startButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
      
      const svg = this.startButton.querySelector('svg');
      if (svg) {
        animate(svg, {
          scale: [0.7, 1.15, 1],
          duration: 600,
          ease: 'out(5)'
        });
      }
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.menu.contains(e.target) && !this.startButton.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('open');
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('open');
  }

  populateApps() {
    const appGrid = document.getElementById('pinnedApps');
    
    APP_DEFINITIONS.forEach(app => {
      const appEl = document.createElement('button');
      appEl.className = 'start-menu-app';
      appEl.innerHTML = `
        <div class="start-menu-app-icon">${scopeSvgIds(app.icon)}</div>
        <div class="start-menu-app-name">${app.name}</div>
      `;
      
      appEl.addEventListener('click', async () => {
        this.close();
        await this.launcher.launch(app.type, { name: app.name, icon: app.icon });
      });
      
      appGrid.appendChild(appEl);
    });
  }
}

export { StartMenuManager };
