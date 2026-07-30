import { toast } from './dialogs.js';

class SystemTrayManager {
  constructor() {
    this.trayIcons = document.querySelectorAll('.tray-icon');
    this.datetime = document.querySelector('.datetime');
    this.initialize();
  }

  initialize() {
    this.initializeTrayIcons();
    this.initializeDatetime();
  }

  initializeTrayIcons() {
    this.trayIcons.forEach(icon => {
      // Anchors (Portfolio Home) must keep their native navigation.
      if (icon.tagName === 'A') return;
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const tooltip = icon.getAttribute('data-tooltip');
        this.handleTrayIconClick(tooltip);
      });
    });
  }

  handleTrayIconClick(tooltip) {
    const actions = {
      'Volume': () => toast('Volume control is not implemented yet'),
      'Network': () => toast('Network settings is not implemented yet'),
      'Battery': () => toast('Battery: 85% (plugged in)', { variant: 'success' })
    };

    if (actions[tooltip]) {
      actions[tooltip]();
    }
  }

  initializeDatetime() {
    if (this.datetime) {
      this.datetime.style.cursor = 'pointer';
      this.datetime.addEventListener('click', () => {
        toast('Calendar is not implemented yet');
      });
    }
  }
}

export { SystemTrayManager };
