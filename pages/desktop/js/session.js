import * as storage from './core/storage.js';
import { getWorkArea } from './config.js';
import { APPS, rectFromViewportFraction } from './registry.js';
import { WINDOW_TYPES } from './constants.js';
import { rescaleRect } from './wm/geometry.js';
import { MODES } from './wm/window-state.js';

// ============================================================================
// SESSION
// ============================================================================

/**
 * Autosave is suspended while a session is being restored. See the note in
 * installAutosave(): without this, the first restored window's window:opened
 * event overwrites the saved list mid-read and the rest are lost.
 */
let suspended = false;

export function suspendAutosave() { suspended = true; }
export function resumeAutosave() { suspended = false; }

/** Apps opened on a first visit, in stacking order. */
const DEFAULT_LAYOUT = [
  WINDOW_TYPES.BROWSER,
  WINDOW_TYPES.TERMINAL,
  WINDOW_TYPES.EMAIL
];

export function captureSession(windowManager) {
  return windowManager.serialize();
}

/**
 * Reopens the windows from a saved session.
 *
 * Geometry is rescaled from the viewport it was captured at and then clamped,
 * so a layout saved on a 2560px monitor cannot restore off-screen at 1280px.
 *
 * @returns {Promise<number>} how many windows were restored
 */
export async function restoreSession(windowManager, session) {
  const entries = [...(session?.windows ?? [])].sort(
    (a, b) => (a.zOrder ?? 0) - (b.zOrder ?? 0)
  );
  if (!entries.length) return 0;

  const workArea = getWorkArea();
  let restored = 0;

  for (const entry of entries) {
    const app = APPS[entry.type];
    if (!app?.implemented) continue;

    try {
      const rect = entry.rect
        ? rescaleRect(entry.rect, entry.viewport, workArea)
        : undefined;

      // Drop tabs whose app no longer exists, so a removed component cannot
      // block the whole window from restoring.
      const savedTabs = (entry.tabs ?? []).filter((t) => APPS[t.type]?.implemented);

      const id = await windowManager.open(entry.type, {
        rect,
        mode: entry.mode,
        restoreMode: entry.restoreMode,
        tabs: savedTabs.length ? savedTabs : undefined,
        activeTab: entry.activeTab,
        componentState: entry.tabs?.[0]?.state ?? null
      });

      // A window saved while minimized comes back minimized.
      if (entry.mode === MODES.MINIMIZED) {
        windowManager.minimize(id);
      }
      restored++;
    } catch (error) {
      console.error(`Could not restore ${entry.type}:`, error);
    }
  }

  // Re-focus whatever was focused, if it came back.
  const focusedType = entries.find((e) => e.id === session.focusedWindow)?.type;
  if (focusedType) {
    const id = windowManager.getByType(focusedType);
    if (id) windowManager.focus(id);
  }

  return restored;
}

/** The default arrangement, used on a first visit or after a reset. */
export async function applyFirstRunLayout(windowManager) {
  const workArea = getWorkArea();

  for (const type of DEFAULT_LAYOUT) {
    const app = APPS[type];
    if (!app?.defaultRect) continue;
    try {
      await windowManager.open(type, {
        rect: rectFromViewportFraction(app.defaultRect, workArea)
      });
    } catch (error) {
      console.error(`Could not open default window ${type}:`, error);
    }
  }
}

/**
 * Decides what the desktop shows on load and keeps it saved thereafter.
 *
 * An empty restored session falls back to the default layout: a returning
 * visitor who closed everything last time should not land on a blank desktop.
 */
export async function startSession(windowManager) {
  // Snapshot the saved state up front: it must not be re-read (or rewritten)
  // while windows are being reopened.
  const state = storage.load();
  let restored = 0;

  suspendAutosave();
  try {
    if (state.desktop.firstRunCompleted) {
      restored = await restoreSession(windowManager, state.session);
    }

    if (restored === 0) {
      await applyFirstRunLayout(windowManager);
    }
  } finally {
    resumeAutosave();
  }

  storage.save({
    ...state,
    desktop: { ...state.desktop, firstRunCompleted: true },
    session: captureSession(windowManager)
  });

  return { restored };
}

/**
 * Persists the session whenever a window changes. Writes are debounced inside
 * storage.save() and flushed on pagehide.
 */
export function installAutosave(windowManager, bus) {
  const EVENTS = [
    'window:opened', 'window:closed', 'window:focused', 'window:moved',
    'window:resized', 'window:minimized', 'window:restored', 'window:state-changed'
  ];

  const persist = () => {
    // Restoring a session opens windows one at a time, and each one emits
    // window:opened. Saving on those events would capture a half-restored
    // desktop and overwrite the very list still being read — silently dropping
    // every window after the first. Stay quiet until the restore finishes.
    if (suspended) return;
    const state = storage.load();
    storage.save({ ...state, session: captureSession(windowManager) });
  };

  for (const event of EVENTS) bus.on(event, persist);

  // pagehide is more reliable than beforeunload on mobile Safari.
  window.addEventListener('pagehide', () => {
    persist();
    storage.flush();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') storage.flush();
  });

  return persist;
}

/** Clears saved state and reloads to the default layout. */
export function resetDesktop() {
  storage.reset();
  location.reload();
}
