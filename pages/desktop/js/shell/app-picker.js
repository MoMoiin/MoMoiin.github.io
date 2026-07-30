import { APPS } from '../registry.js';
import { scopeSvgIds } from '../core/dom.js';

// ============================================================================
// APP PICKER
// ============================================================================

/**
 * Small popover listing the implemented apps, shown by the window's + button.
 *
 * Beats hardcoding "new tab = another terminal": the user picks what the tab
 * should be. Resolves to an app type, or null if dismissed.
 *
 * @returns {Promise<string|null>}
 */
export function pickApp(anchorEl) {
  return new Promise((resolve) => {
    const entries = Object.entries(APPS).filter(([, app]) => app.implemented);

    const layer = document.createElement('div');
    layer.className = 'app-picker-layer';

    const menu = document.createElement('div');
    menu.className = 'app-picker';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Open a new tab');
    menu.innerHTML = `
      <div class="app-picker-title">New tab</div>
      <div class="app-picker-grid">
        ${entries.map(([type, app]) => `
          <button class="app-picker-item" role="menuitem" data-type="${type}">
            <span class="app-picker-icon">${scopeSvgIds(app.icon ?? '')}</span>
            <span class="app-picker-name"></span>
          </button>
        `).join('')}
      </div>
    `;
    // Names via textContent so registry data is never treated as markup.
    menu.querySelectorAll('.app-picker-item').forEach((el, i) => {
      el.querySelector('.app-picker-name').textContent = entries[i][1].name;
    });

    const close = (value) => {
      document.removeEventListener('keydown', onKey, true);
      layer.remove();
      resolve(value);
    };

    const onKey = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); close(null); }
    };

    menu.addEventListener('click', (event) => {
      const item = event.target.closest('.app-picker-item');
      if (item) close(item.dataset.type);
    });
    layer.addEventListener('pointerdown', (event) => {
      if (!menu.contains(event.target)) close(null);
    });
    document.addEventListener('keydown', onKey, true);

    layer.appendChild(menu);
    document.body.appendChild(layer);

    // Anchor under the + button, nudged back on-screen if it would overflow.
    const rect = anchorEl.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - menuRect.width - 8);
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${rect.bottom + 6}px`;

    menu.querySelector('.app-picker-item')?.focus();
  });
}
