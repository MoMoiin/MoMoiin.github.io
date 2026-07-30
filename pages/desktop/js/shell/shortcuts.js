import { on, createDisposer } from '../core/dom.js';

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * The bindings, in one place so the Start-menu reference and the router cannot
 * drift apart.
 *
 * Deliberately NOT bound: Alt+Tab and Ctrl+W. A web page cannot reliably
 * intercept either — the OS takes Alt+Tab, and Chrome treats Ctrl+W as a
 * reserved tab-close it will not surrender. Binding them "best effort" would
 * close the visitor's browser tab and lose the desktop, so the familiar-looking
 * combos are left alone and discoverable alternatives are provided instead.
 */
export const SHORTCUTS = [
  { keys: ['Ctrl', 'Esc'], label: 'Open or close the Start menu' },
  { keys: ['Esc'], label: 'Dismiss the topmost menu or dialog' },
  { keys: ['Alt', '`'], label: 'Cycle windows (most recent first)' },
  { keys: ['Alt', 'Shift', '`'], label: 'Cycle windows backwards' },
  { keys: ['Alt', 'W'], label: 'Close the focused window' },
  { keys: ['Alt', 'M'], label: 'Minimize the focused window' },
  { keys: ['Alt', 'Enter'], label: 'Maximize or restore the focused window' },
  { keys: ['Alt', 'T'], label: 'New tab in the focused window' }
];

/**
 * True when keystrokes are going into a text field.
 *
 * Only consulted for bare-key shortcuts. Modifier combos ignore it on purpose:
 * the terminal parks focus in a hidden input, so an unqualified guard would
 * silently disable Alt+W and friends whenever a terminal is open.
 */
export function isTextEntry(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
    || target.isContentEditable;
}

/**
 * One capture-phase keydown listener for the whole desktop.
 *
 * @returns {() => void} uninstall
 */
export function installShortcuts({ wm, startMenu, contextMenu, switcher }) {
  const disposer = createDisposer();

  const dismissTopmost = () => {
    // Order matters: innermost surface first.
    if (document.querySelector('.dialog-backdrop')) return false; // dialogs self-handle Escape
    if (document.querySelector('.app-picker')) return false;      // picker self-handles Escape
    if (document.querySelector('#contextMenu.open')) {
      contextMenu?.close();
      return true;
    }
    if (startMenu?.isOpen) {
      startMenu.close();
      return true;
    }
    return false;
  };

  disposer.add(on(window, 'keydown', (event) => {
    // --- Escape: always available, even while typing ---
    if (event.key === 'Escape' && !event.ctrlKey) {
      if (dismissTopmost()) event.preventDefault();
      return;
    }

    // --- Ctrl+Escape: Start menu (Meta/Win keyup is unreliable in browsers) ---
    if (event.ctrlKey && event.key === 'Escape') {
      event.preventDefault();
      startMenu?.toggle();
      return;
    }

    if (!event.altKey || event.ctrlKey) return;

    // --- Alt+` : MRU window cycling ---
    if (event.key === '`' || event.code === 'Backquote') {
      event.preventDefault();
      switcher?.step(event.shiftKey ? -1 : 1);
      return;
    }

    // NOTE: no text-entry guard past this point. Alt+<letter> never produces
    // text, and the terminal keeps a hidden input focused at all times — gating
    // on isTextEntry() would disable these shortcuts whenever a terminal is
    // open, which is the common case. The guard applies only to bare keys.
    const key = event.key.toLowerCase();

    if (key === 'w') {
      event.preventDefault();
      const id = wm.focusedId;
      if (id) wm.close(id);
      return;
    }
    if (key === 'm') {
      event.preventDefault();
      const id = wm.focusedId;
      if (id) wm.minimize(id);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const id = wm.focusedId;
      if (id) wm.toggleMaximize(id);
      return;
    }
    if (key === 't') {
      event.preventDefault();
      const id = wm.focusedId;
      if (id) wm.promptNewTab(id);
    }
  }, true));

  // Releasing Alt commits the switcher selection.
  disposer.add(on(window, 'keyup', (event) => {
    if (event.key === 'Alt') switcher?.commit();
  }));
  disposer.add(on(window, 'blur', () => switcher?.commit()));

  return () => disposer.dispose();
}
