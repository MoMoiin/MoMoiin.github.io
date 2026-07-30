import { animate } from 'animejs';
import { WINDOW_TYPES, SVG_ICONS } from '../constants.js';
import { scopeSvgIds } from '../core/dom.js';

// Moved verbatim from js/index.js in the Phase 2 module split.

class TaskbarManager {
  constructor(windowManager, launcher) {
    this.windowManager = windowManager;
    this.launcher = launcher;
    this.taskbarCenter = document.getElementById('taskbarCenter');
  }

  createLauncher(config) {
    const { type, name, icon, tooltip } = config;
    const button = document.createElement('button');
    button.className = 'taskbar-app';
    button.setAttribute('data-tooltip', tooltip);
    button.setAttribute('data-launcher-type', type);
    button.innerHTML = `<span>${scopeSvgIds(icon)}</span>`;

    button.addEventListener('click', async () => {
      this.animateLauncherClick(button);
      await this.handleLauncherClick(type, name, icon);
    });

    this.taskbarCenter.appendChild(button);
    return button;
  }

  animateLauncherClick(button) {
    const span = button.querySelector('span');
    if (span) {
      animate(span, {
        scale: [0.7, 1.15, 1],
        duration: 600,
        ease: 'out(5)'
      });
    }
  }

  async handleLauncherClick(type, name, icon) {
    // A pinned launcher also serves as the taskbar button for its window
    // (WindowManager.addTaskbarButton reuses it), so it must toggle.
    await this.launcher.launch(type, { name, icon, toggleIfFocused: true });
  }

  initializeDefaultLaunchers() {
    this.createLauncher({
      type: WINDOW_TYPES.BROWSER,
      name: 'Jakub Adamczyk',
      icon: SVG_ICONS.browser,
      tooltip: 'Browser'
    });

    this.createLauncher({
      type: WINDOW_TYPES.TERMINAL,
      name: 'MoMo Terminal',
      icon: SVG_ICONS.cmd,
      tooltip: 'MoMo Terminal'
    });

    this.createLauncher({
      type: WINDOW_TYPES.EMAIL,
      name: 'Mail',
      icon: SVG_ICONS.email,
      tooltip: 'Mail'
    });
  }
}

export { TaskbarManager };
