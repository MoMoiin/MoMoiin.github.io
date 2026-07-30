import { animate } from 'animejs';
import { CONFIG, Z } from '../config.js';
import { createDisposer, on, scopeSvgIds } from '../core/dom.js';
import { createBus } from '../core/events.js';
import { buildFrame } from './window-frame.js';
import { createTabHost } from './tabs.js';
import { createWindowState, MODES } from './window-state.js';
import { enableDrag } from './drag.js';
import { enableResize } from './resize.js';
import { createSnapPreview, detectSnapZone, rectForZone } from './snap.js';
import {
  getWorkArea, readRect, applyRect, maximizedRect, clampToWorkArea
} from './geometry.js';

// ============================================================================
// WINDOW MANAGER
// ============================================================================

let idCounter = 0;

export class WindowManager {
  constructor({ bus } = {}) {
    this.bus = bus || createBus();
    this.windows = new Map();
    this.container = document.getElementById('windowsContainer');
    this.taskbarCenter = document.getElementById('taskbarCenter');

    /** Window ids, most-recently-focused last. Drives z-order and Alt+` order. */
    this.focusOrder = [];
    this.snapPreview = createSnapPreview();
    this.pendingSnapZone = null;
  }

  get focusedId() {
    return this.focusOrder[this.focusOrder.length - 1] ?? null;
  }

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  /**
   * Creates a window hosting one tab. Extra tabs go through openTab().
   * `tabs` (from a restored session) seeds several at once.
   */
  async open(type, { title, icon, rect, mode, restoreMode, componentState, tabs, activeTab } = {}) {
    const windowId = `window-${type}-${++idCounter}`;

    const frame = buildFrame({ id: windowId, appType: type });
    this.container.appendChild(frame.root);

    const initialRect = rect
      ? clampToWorkArea(rect)
      : this.centeredRect(frame.root);
    applyRect(frame.root, initialRect);

    const disposer = createDisposer();
    const state = createWindowState(initialRect);

    const record = {
      id: windowId,
      // `type` tracks the ACTIVE tab, so taskbar grouping and getByType()
      // follow whatever the user is currently looking at.
      type,
      element: frame.root,
      frame,
      state,
      disposer,
      tabHost: null
    };

    record.tabHost = createTabHost(frame.tabStrip, frame.body, {
      onActivate: (tab) => {
        record.type = tab.type;
        this.syncTaskbarButton(record);
        this.bus.emit('window:tab-activated', { id: windowId, tabId: tab.id, type: tab.type });
      },
      onEmpty: () => this.close(windowId),
      onTabsChanged: () => this.bus.emit('window:state-changed', { id: windowId }),
      onNewTab: () => this.promptNewTab(windowId)
    });

    this.windows.set(windowId, record);

    this.wireControls(record);
    this.wireInteractions(record);
    disposer.add(on(frame.root, 'pointerdown', () => this.focus(windowId), true));
    disposer.add(() => record.tabHost.destroy());

    // Seed tabs: either a restored set, or the single requested app.
    const seed = tabs?.length
      ? tabs
      : [{ type, title, icon, state: componentState ?? null }];

    for (const entry of seed) {
      await this.mountTab(record, {
        type: entry.type,
        title: entry.title ?? title,
        icon: entry.icon ?? icon,
        componentState: entry.state ?? null,
        // Carried so `activeTab` from a restored session can be matched below.
        persistedId: entry.id ?? null
      });
    }

    if (activeTab) {
      const match = record.tabHost.tabs.find((t) => t.persistedId === activeTab);
      if (match) record.tabHost.activate(match.id);
    }

    // Added after the tabs exist, so the button can show the active tab's icon.
    this.addTaskbarButton(record);

    // Re-apply a persisted maximized/snapped mode once the body has laid out.
    if (mode && mode !== MODES.NORMAL && mode !== MODES.MINIMIZED) {
      state.fill(mode, initialRect);
      this.setFilledStyles(frame.root, true);
      applyRect(frame.root, rectForZone(mode));
      frame.root.style.borderRadius = '0px';
    } else if (restoreMode && restoreMode !== MODES.NORMAL) {
      state.hydrate({ restoreMode });
    }

    this.focus(windowId);
    this.bus.emit('window:opened', { id: windowId, type });
    return windowId;
  }

  /**
   * Loads a component and mounts it into a new tab of an existing window.
   * Each tab gets its own component instance, disposer and state slot, so two
   * terminals never share history.
   */
  async mountTab(record, { type, title, icon, componentState = null, persistedId = null }) {
    // Component stylesheets are <link>ed eagerly in index.html, so there is
    // nothing to load here.
    const module = await import(`../../components/${type}/${type}.js`);
    const component = normalizeComponent(module);

    const tab = record.tabHost.addTab({
      type,
      title: title ?? component.title ?? type,
      icon: icon ?? component.icon ?? '',
      componentState
    });

    tab.persistedId = persistedId;
    tab.component = component;
    tab.pane.innerHTML = component.template;

    tab.context = this.createContext(record, tab);
    if (typeof component.init === 'function') {
      try {
        component.init(tab.context);
      } catch (error) {
        console.error(`Component "${type}" failed to initialise:`, error);
      }
    }
    return tab;
  }

  /** Adds a tab to an existing window (used by the + button). */
  async openTab(windowId, type) {
    const record = this.windows.get(windowId);
    if (!record) return null;
    try {
      const tab = await this.mountTab(record, { type });
      this.bus.emit('window:state-changed', { id: windowId });
      return tab.id;
    } catch (error) {
      console.error(`Could not open ${type} in a new tab:`, error);
      return null;
    }
  }

  /** Back-compat alias for the pre-Phase-3 call signature. */
  createWindow(type, title, icon) {
    return this.open(type, { title, icon });
  }

  close(windowId) {
    const record = this.windows.get(windowId);
    if (!record) return;

    // Remove from the map first so in-flight animation callbacks and the
    // pointerdown handler cannot resurrect a closing window.
    this.windows.delete(windowId);
    this.focusOrder = this.focusOrder.filter((id) => id !== windowId);

    const { element, disposer } = record;

    // Each tab's disposer runs via tabHost.destroy(), registered on the
    // window disposer in open().
    disposer.dispose();

    this.removeTaskbarButton(windowId);

    animate(element, {
      scale: [0.9],
      opacity: [0],
      duration: CONFIG.animation.duration.close,
      ease: CONFIG.animation.easing.in
    }).then(() => element.remove());

    this.applyStacking();
    this.bus.emit('window:closed', { id: windowId, type: record.type });
  }

  /** Legacy name kept so existing call sites keep working. */
  handleClose(windowId) { this.close(windowId); }

  // --------------------------------------------------------------------------
  // Focus & stacking
  // --------------------------------------------------------------------------

  /**
   * Raise and mark focused. Never toggles — that split is what fixes clicking a
   * taskbar *launcher* for a visible window minimizing it.
   */
  focus(windowId) {
    const record = this.windows.get(windowId);
    if (!record) return;

    if (record.state.isMinimized) this.restore(windowId);

    if (this.focusedId !== windowId) {
      this.focusOrder = this.focusOrder.filter((id) => id !== windowId);
      this.focusOrder.push(windowId);
      this.applyStacking();
      this.bus.emit('window:focused', { id: windowId, type: record.type });
    }
  }

  /**
   * Assigns z-indices from a bounded band by position in focusOrder, instead of
   * incrementing a counter forever. A window can never climb above the taskbar.
   */
  applyStacking() {
    const span = Z.WINDOW_MAX - Z.WINDOW_BASE;
    const count = Math.max(this.focusOrder.length, 1);
    const step = Math.max(1, Math.floor(span / count));

    this.focusOrder.forEach((id, index) => {
      const record = this.windows.get(id);
      if (!record) return;
      const z = Math.min(Z.WINDOW_BASE + index * step, Z.WINDOW_MAX);
      record.element.style.zIndex = String(z);
      record.element.classList.toggle('focused', id === this.focusedId);
    });

    this.syncTaskbarActive();
  }

  /** Alt+` cycling: step through windows in most-recently-used order. */
  cycleFocus(direction = 1) {
    const ids = this.focusOrder.filter((id) => this.windows.has(id));
    if (ids.length < 2) return;
    // focusOrder is MRU-last, so the previous window is second from the end.
    const ordered = [...ids].reverse();
    const next = ordered[(1 + ordered.length + (direction > 0 ? 0 : -2)) % ordered.length];
    this.focus(next);
  }

  // --------------------------------------------------------------------------
  // Minimize / maximize / snap
  // --------------------------------------------------------------------------

  minimize(windowId) {
    const record = this.windows.get(windowId);
    if (!record || record.state.isMinimized) return;

    const { element, state } = record;
    state.minimize(readRect(element));

    const button = this.findTaskbarButton(windowId);
    button?.classList.remove('active');

    const target = button?.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    const dx = target ? (target.left + target.width / 2) - (rect.left + rect.width / 2) : 0;
    const dy = target ? (target.top + target.height / 2) - (rect.top + rect.height / 2) : 0;

    animate(element, {
      scale: [0.3],
      translateX: [dx],
      translateY: [dy],
      opacity: [0],
      duration: CONFIG.animation.duration.minimize,
      ease: CONFIG.animation.easing.inOut
    }).then(() => {
      // Guard: the window may have been closed mid-animation.
      if (!this.windows.has(windowId)) return;
      element.style.display = 'none';
      element.style.opacity = '1';
    });

    this.focusOrder = this.focusOrder.filter((id) => id !== windowId);
    this.applyStacking();
    this.bus.emit('window:minimized', { id: windowId });
  }

  restore(windowId) {
    const record = this.windows.get(windowId);
    if (!record || !record.state.isMinimized) return;

    const { element, state } = record;
    const mode = state.restore();

    element.style.transform = 'none';
    element.style.display = 'flex';
    element.style.opacity = '0';

    // Re-derive filled geometry from the *current* work area rather than
    // replaying the maximize path, which is what used to clobber normalRect.
    applyRect(element, mode === MODES.NORMAL
      ? clampToWorkArea(state.normalRect)
      : rectForZone(mode));
    this.setFilledStyles(element, mode !== MODES.NORMAL);

    this.findTaskbarButton(windowId)?.classList.add('active');

    animate(element, {
      opacity: [1],
      duration: CONFIG.animation.duration.minimize,
      ease: CONFIG.animation.easing.default
    });

    this.focus(windowId);
    this.bus.emit('window:restored', { id: windowId, mode });
  }

  /** Taskbar button behaviour: hide if visible, show if hidden. */
  toggleMinimize(windowId) {
    const record = this.windows.get(windowId);
    if (!record) return;

    if (record.state.isMinimized) {
      this.restore(windowId);
    } else if (this.focusedId === windowId) {
      this.minimize(windowId);
    } else {
      this.focus(windowId);
    }
  }

  toggleMaximize(windowId) {
    const record = this.windows.get(windowId);
    if (!record) return;

    const { element, state } = record;

    if (state.isFilled) {
      const rect = clampToWorkArea(state.unfill());
      this.setFilledStyles(element, false);
      this.animateTo(element, rect, CONFIG.window.borderRadius, windowId);
    } else {
      state.fill(MODES.MAXIMIZED, readRect(element));
      this.setFilledStyles(element, true);
      this.animateTo(element, maximizedRect(), 0, windowId);
    }

    this.bus.emit('window:state-changed', { id: windowId, mode: state.mode });
  }

  applySnap(windowId, zone) {
    const record = this.windows.get(windowId);
    if (!record) return;

    const { element, state } = record;
    state.fill(zone, readRect(element));
    this.setFilledStyles(element, true);
    this.animateTo(element, rectForZone(zone), 0, windowId);
    this.bus.emit('window:state-changed', { id: windowId, mode: zone });
  }

  /**
   * `.window` carries width/height/max-* in CSS for its default size. Filled
   * windows must ignore those caps; normal ones must get them back — the old
   * code cleared them on un-maximize but never after a snap, so a snapped
   * window silently kept `max-width: 98vw`.
   */
  setFilledStyles(element, filled) {
    element.style.maxWidth = filled ? 'none' : '';
    element.style.maxHeight = filled ? 'none' : '';
  }

  animateTo(element, rect, borderRadius, windowId) {
    animate(element, {
      left: [`${rect.left}px`],
      top: [`${rect.top}px`],
      width: [`${rect.width}px`],
      height: [`${rect.height}px`],
      borderRadius: [`${borderRadius}px`],
      duration: CONFIG.animation.duration.maximize,
      ease: CONFIG.animation.easing.default
    }).then(() => {
      if (windowId && !this.windows.has(windowId)) return;
      this.bus.emit('window:resized', { id: windowId, rect });
    });
  }

  // --------------------------------------------------------------------------
  // Wiring
  // --------------------------------------------------------------------------

  wireControls(record) {
    const { id, frame, disposer } = record;
    const { minimize, maximize, close } = frame.controls;

    disposer.add(on(minimize, 'click', (e) => { e.stopPropagation(); this.minimize(id); }));
    disposer.add(on(maximize, 'click', (e) => { e.stopPropagation(); this.toggleMaximize(id); }));
    disposer.add(on(close, 'click', (e) => { e.stopPropagation(); this.close(id); }));
    // Tab close/activate/reorder is handled by the tab host.
    // Double-clicking the title bar toggles maximize, as on a real desktop.
    disposer.add(on(frame.titleBar, 'dblclick', (e) => {
      if (e.target.closest('.control-btn, .tab, .new-tab-button')) return;
      this.toggleMaximize(id);
    }));
  }

  wireInteractions(record) {
    const { id, element, frame, state, disposer } = record;

    disposer.add(enableDrag(element, frame.titleBar, {
      getBounds: () => getWorkArea(),
      onStart: () => {
        // Dragging a filled window releases it back to its own geometry.
        if (state.isFilled) {
          const rect = state.unfill();
          this.setFilledStyles(element, false);
          element.style.width = `${rect.width}px`;
          element.style.height = `${rect.height}px`;
          element.style.borderRadius = `${CONFIG.window.borderRadius}px`;
        }
      },
      onMove: (_rect, pointer) => {
        const zone = pointer ? detectSnapZone(pointer.x, pointer.y) : null;
        this.pendingSnapZone = zone;
        zone ? this.snapPreview.show(zone) : this.snapPreview.hide();
      },
      onEnd: () => {
        this.snapPreview.hide();
        const zone = this.pendingSnapZone;
        this.pendingSnapZone = null;
        if (zone) {
          this.applySnap(id, zone);
        } else {
          state.updateNormalRect(readRect(element));
          this.bus.emit('window:moved', { id, rect: readRect(element) });
        }
      }
    }));

    disposer.add(enableResize(element, frame.handles, {
      getBounds: () => getWorkArea(),
      onStart: () => {
        if (state.isFilled) {
          state.unfill();
          this.setFilledStyles(element, false);
        }
      },
      onEnd: () => {
        state.updateNormalRect(readRect(element));
        this.bus.emit('window:resized', { id, rect: readRect(element) });
      }
    }));
  }

  /**
   * The context handed to a component's init().
   * `root` is the tab's own pane, so a component's querySelector calls cannot
   * reach into a sibling tab.
   */
  createContext(record, tab) {
    const { id, frame } = record;
    return {
      windowId: id,
      tabId: tab.id,
      type: tab.type,
      root: tab.pane,
      body: tab.pane,
      // The window frame, for the rare component that needs it.
      windowEl: frame.root,
      wm: this,
      launcher: this.launcher,
      bus: this.bus,
      // Scoped to this tab: closing the tab detaches only its listeners.
      onDestroy: (fn) => tab.disposer.add(fn),
      setTitle: (title, icon) => record.tabHost.setTitle(tab.id, title, icon),
      /**
       * Per-TAB state slot, keyed by tab instance rather than app type, so two
       * terminals keep separate histories. Collected in serialize().
       */
      storage: {
        get: () => tab.componentState,
        set: (value) => {
          tab.componentState = value;
          this.bus.emit('window:state-changed', { id, type: tab.type });
        }
      }
    };
  }

  /** Opens the app picker for the + button. */
  async promptNewTab(windowId) {
    const type = await this.pickApp?.(windowId);
    if (type) await this.openTab(windowId, type);
  }

  // --------------------------------------------------------------------------
  // Taskbar
  // --------------------------------------------------------------------------

  /** Keeps a non-pinned taskbar button showing the active tab's icon. */
  syncTaskbarButton(record) {
    const button = this.findTaskbarButton(record.id);
    if (!button || button.hasAttribute('data-launcher-type')) return;
    const tab = record.tabHost.activeTab;
    if (!tab) return;
    button.setAttribute('data-tooltip', tab.title);
    const span = button.querySelector('span');
    if (span) span.innerHTML = scopeSvgIds(tab.icon ?? '');
  }

  addTaskbarButton(record) {
    const { id, type } = record;
    const icon = record.tabHost.activeTab?.icon ?? '';

    const launcher = this.taskbarCenter.querySelector(`[data-launcher-type="${type}"]`);
    if (launcher) {
      launcher.classList.add('active');
      launcher.setAttribute('data-window-id', id);
      return;
    }

    const button = document.createElement('button');
    button.className = 'taskbar-app active';
    button.setAttribute('data-tooltip', type.charAt(0).toUpperCase() + type.slice(1));
    button.setAttribute('data-window-id', id);
    button.innerHTML = `<span>${scopeSvgIds(icon)}</span>`;

    button.addEventListener('click', () => {
      this.toggleMinimize(id);
      const span = button.querySelector('span');
      if (span) animate(span, { scale: [0.7, 1.15, 1], duration: 600, ease: 'out(5)' });
    });

    this.taskbarCenter.appendChild(button);
  }

  findTaskbarButton(windowId) {
    return this.taskbarCenter.querySelector(`[data-window-id="${windowId}"]`);
  }

  removeTaskbarButton(windowId) {
    const button = this.findTaskbarButton(windowId);
    if (!button) return;
    button.classList.remove('active');
    if (button.hasAttribute('data-launcher-type')) {
      button.removeAttribute('data-window-id');
    } else {
      button.remove();
    }
  }

  syncTaskbarActive() {
    for (const button of this.taskbarCenter.querySelectorAll('[data-window-id]')) {
      const id = button.getAttribute('data-window-id');
      const record = this.windows.get(id);
      button.classList.toggle('active', Boolean(record) && !record.state.isMinimized);
    }
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  centeredRect(element) {
    const workArea = getWorkArea();
    const width = element.offsetWidth || Math.round(workArea.width * 0.6);
    const height = element.offsetHeight || Math.round(workArea.height * 0.6);
    return clampToWorkArea({
      left: Math.max(0, (workArea.width - width) / 2),
      top: Math.max(0, (workArea.height - height) / 2),
      width,
      height
    });
  }

  getByType(type) {
    for (const [id, record] of this.windows) {
      if (record.type === type) return id;
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // Serialization
  // --------------------------------------------------------------------------

  /**
   * Snapshot of every open window, in focus order (least-recent first) so that
   * restoring in array order reproduces the stacking and the Alt+` order.
   */
  serialize() {
    const workArea = getWorkArea();
    const viewport = { w: workArea.width, h: workArea.height };

    const ordered = [
      // Minimized windows are not in focusOrder; keep them, at the bottom.
      ...[...this.windows.keys()].filter((id) => !this.focusOrder.includes(id)),
      ...this.focusOrder
    ].filter((id) => this.windows.has(id));

    return {
      focusedWindow: this.focusedId,
      windows: ordered.map((id, index) => {
        const record = this.windows.get(id);
        const snapshot = record.state.serialize();
        const tabs = record.tabHost.tabs;
        return {
          id,
          type: record.type,
          mode: snapshot.mode,
          restoreMode: snapshot.restoreMode,
          // Persist the user's own geometry, not a maximized/snapped rect —
          // filled modes are recomputed from the work area on restore.
          rect: snapshot.normalRect,
          viewport,
          zOrder: index,
          // Array order is tab order, so a reorder survives reload.
          tabs: tabs.map((tab) => ({
            id: `${id}:${tab.id}`,
            type: tab.type,
            title: tab.title,
            state: this.readTabState(tab)
          })),
          activeTab: record.tabHost.activeId ? `${id}:${record.tabHost.activeId}` : null
        };
      })
    };
  }

  /**
   * Tab state is whatever the component last wrote via ctx.storage.set(); a
   * component may instead expose serialize() to compute it lazily.
   */
  readTabState(tab) {
    try {
      const live = tab.component?.serialize?.(tab.context);
      return live ?? tab.componentState ?? null;
    } catch (error) {
      console.error('Component serialize hook threw:', error);
      return tab.componentState ?? null;
    }
  }
}

/**
 * Accepts both the new contract ({ title, icon, template, init }) and the
 * pre-Phase-3 shape ({ htmlTemplate, init }, or explorer's class with a static
 * init). Removed once all components are migrated.
 */
function normalizeComponent(module) {
  const def = module.default ?? {};
  return {
    title: def.title,
    icon: def.icon,
    template: def.template ?? module.htmlTemplate ?? def.htmlTemplate ?? '',
    init: def.init ?? module.init ?? null,
    destroy: def.destroy ?? null
  };
}
