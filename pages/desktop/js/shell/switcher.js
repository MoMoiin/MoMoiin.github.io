import { scopeSvgIds } from '../core/dom.js';

// ============================================================================
// WINDOW SWITCHER (Alt+`)
// ============================================================================

/**
 * The visible overlay for Alt+` cycling.
 *
 * Alt+` is not a binding anyone expects, so cycling blind would be
 * undiscoverable. Showing the candidate list makes it obvious what the key is
 * doing, the same way Alt+Tab does on a real desktop.
 *
 * Focus is applied only on commit (Alt released), so stepping through several
 * windows does not raise each one in turn.
 */
export function createSwitcher(wm) {
  let overlay = null;
  let order = [];
  let index = 0;
  let active = false;

  function build() {
    const el = document.createElement('div');
    el.className = 'switcher';
    el.setAttribute('role', 'listbox');
    el.setAttribute('aria-label', 'Open windows');
    document.body.appendChild(el);
    return el;
  }

  function render() {
    overlay.innerHTML = order.map((entry, i) => `
      <div class="switcher-item${i === index ? ' selected' : ''}" role="option"
           aria-selected="${i === index}">
        <span class="switcher-icon">${scopeSvgIds(entry.icon) || ''}</span>
        <span class="switcher-title"></span>
      </div>
    `).join('');
    overlay.querySelectorAll('.switcher-item').forEach((el, i) => {
      el.querySelector('.switcher-title').textContent = order[i].title;
    });
  }

  function open() {
    // Most-recently-used first, matching focusOrder reversed.
    order = [...wm.focusOrder].reverse()
      .map((id) => {
        const record = wm.windows.get(id);
        if (!record) return null;
        const tab = record.tabHost.activeTab;
        return { id, title: tab?.title ?? record.type, icon: tab?.icon ?? '' };
      })
      .filter(Boolean);

    if (order.length < 2) return false;

    overlay = overlay ?? build();
    active = true;
    // Start on the *next* window: one press should switch, not re-select.
    index = 1;
    render();
    overlay.classList.add('visible');
    return true;
  }

  return {
    get isOpen() { return active; },

    step(direction = 1) {
      if (!active && !open()) return;
      index = (index + direction + order.length) % order.length;
      render();
    },

    /** Alt released: focus the highlighted window and hide the overlay. */
    commit() {
      if (!active) return;
      active = false;
      overlay?.classList.remove('visible');
      const target = order[index];
      if (target && wm.windows.has(target.id)) wm.focus(target.id);
    },

    cancel() {
      active = false;
      overlay?.classList.remove('visible');
    },

    destroy() {
      overlay?.remove();
      overlay = null;
    }
  };
}
