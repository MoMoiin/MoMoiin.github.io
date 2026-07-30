import { on, createDisposer, scopeSvgIds } from '../core/dom.js';

// ============================================================================
// TAB HOST
// ============================================================================

let tabCounter = 0;

/**
 * Manages the tabs inside one window.
 *
 * Panes are hidden, never unmounted. Re-mounting would reload the browser
 * component's iframe and wipe the terminal's scrollback, so switching tabs only
 * toggles a class.
 *
 * @param {HTMLElement} tabStrip  the .tab-container element
 * @param {HTMLElement} body      the .window-body element panes live in
 */
export function createTabHost(tabStrip, body, {
  onActivate, onEmpty, onTabsChanged, onNewTab
} = {}) {
  const disposer = createDisposer();
  /** @type {Array<{id,type,title,icon,pane,tabEl,disposer,componentState}>} */
  const tabs = [];
  let activeId = null;

  const find = (id) => tabs.find((t) => t.id === id);
  const indexOf = (id) => tabs.findIndex((t) => t.id === id);

  function buildTabEl(tab) {
    const el = document.createElement('div');
    el.className = 'tab';
    el.dataset.tabId = tab.id;
    el.draggable = false;
    el.innerHTML = `
      <div class="tab-content">
        <span class="tab-icon">${scopeSvgIds(tab.icon) || ''}</span>
        <span class="tab-title"></span>
        <button class="tab-close" title="Close tab" aria-label="Close tab">✕</button>
      </div>
    `;
    el.querySelector('.tab-title').textContent = tab.title;
    return el;
  }

  /** Reflect the tabs array into the DOM in order, keeping the + button last. */
  function syncStrip() {
    for (const tab of tabs) tabStrip.appendChild(tab.tabEl);
    const newTabBtn = tabStrip.querySelector('.new-tab-button');
    if (newTabBtn) tabStrip.appendChild(newTabBtn);
    // A lone tab has nothing to switch to, so hide its close affordance.
    tabStrip.classList.toggle('single-tab', tabs.length === 1);
    onTabsChanged?.(tabs.length);
  }

  function activate(id) {
    const tab = find(id);
    if (!tab) return;
    activeId = id;
    for (const t of tabs) {
      const isActive = t.id === id;
      t.tabEl.classList.toggle('active', isActive);
      t.pane.classList.toggle('active', isActive);
    }
    onActivate?.(tab);
  }

  function addTab({ type, title, icon, componentState = null }) {
    const id = `tab-${++tabCounter}`;

    const pane = document.createElement('div');
    pane.className = 'tab-pane';
    pane.dataset.tabId = id;
    body.appendChild(pane);

    const tab = {
      id, type, title, icon, pane,
      componentState,
      disposer: createDisposer(),
      tabEl: null
    };
    tab.tabEl = buildTabEl(tab);
    tabs.push(tab);

    syncStrip();
    activate(id);
    return tab;
  }

  function closeTab(id) {
    const index = indexOf(id);
    if (index === -1) return;

    const [tab] = tabs.splice(index, 1);
    tab.disposer.dispose();
    tab.tabEl.remove();
    tab.pane.remove();

    if (!tabs.length) {
      activeId = null;
      onEmpty?.();
      return;
    }

    syncStrip();
    if (activeId === id) {
      // Prefer the tab that took its place, else the one before it.
      activate(tabs[Math.min(index, tabs.length - 1)].id);
    }
  }

  function moveTab(id, toIndex) {
    const from = indexOf(id);
    if (from === -1) return;
    const clamped = Math.max(0, Math.min(toIndex, tabs.length - 1));
    if (from === clamped) return;
    const [tab] = tabs.splice(from, 1);
    tabs.splice(clamped, 0, tab);
    syncStrip();
  }

  function setTitle(id, title, icon) {
    const tab = find(id);
    if (!tab) return;
    tab.title = title;
    tab.tabEl.querySelector('.tab-title').textContent = title;
    if (icon != null) {
      tab.icon = icon;
      tab.tabEl.querySelector('.tab-icon').innerHTML = scopeSvgIds(icon);
    }
    if (tab.id === activeId) onActivate?.(tab);
  }

  // --- interaction: activate, close, reorder -------------------------------

  disposer.add(on(tabStrip, 'pointerdown', (event) => {
    const newTabBtn = event.target.closest('.new-tab-button');
    if (newTabBtn) return;

    const tabEl = event.target.closest('.tab');
    if (!tabEl) return;

    // Claim the gesture so the window-drag handler ignores it.
    event.stopPropagation();

    if (event.target.closest('.tab-close')) return;

    const id = tabEl.dataset.tabId;
    activate(id);
    startReorder(event, tabEl, id);
  }));

  disposer.add(on(tabStrip, 'click', (event) => {
    const closeBtn = event.target.closest('.tab-close');
    if (closeBtn) {
      event.stopPropagation();
      closeTab(closeBtn.closest('.tab').dataset.tabId);
      return;
    }
    if (event.target.closest('.new-tab-button')) {
      event.stopPropagation();
      onNewTab?.();
    }
  }));

  /** Pointer-based reorder: swap when the pointer crosses a neighbour's midpoint. */
  function startReorder(startEvent, tabEl, id) {
    let dragging = false;
    const startX = startEvent.clientX;

    const move = (event) => {
      if (!dragging && Math.abs(event.clientX - startX) < 6) return;
      if (!dragging) {
        dragging = true;
        tabEl.classList.add('dragging');
      }

      const current = indexOf(id);
      const siblings = tabs.map((t) => t.tabEl.getBoundingClientRect());

      for (let i = 0; i < siblings.length; i++) {
        if (i === current) continue;
        const mid = siblings[i].left + siblings[i].width / 2;
        const movingRight = i > current && event.clientX > mid;
        const movingLeft = i < current && event.clientX < mid;
        if (movingRight || movingLeft) {
          moveTab(id, i);
          break;
        }
      }
    };

    const up = () => {
      offMove(); offUp(); offCancel();
      if (dragging) {
        tabEl.classList.remove('dragging');
        onTabsChanged?.(tabs.length);
      }
    };

    const offMove = on(document, 'pointermove', move);
    const offUp = on(document, 'pointerup', up);
    const offCancel = on(document, 'pointercancel', up);
  }

  return {
    addTab,
    closeTab,
    activate,
    moveTab,
    setTitle,
    get tabs() { return tabs; },
    get activeId() { return activeId; },
    get activeTab() { return find(activeId); },
    getTab: find,
    destroy() {
      for (const tab of tabs) tab.disposer.dispose();
      tabs.length = 0;
      disposer.dispose();
    }
  };
}
