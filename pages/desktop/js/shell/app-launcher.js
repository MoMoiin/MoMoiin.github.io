import { toast } from './dialogs.js';
import { getApp, isImplemented } from '../registry.js';

// ============================================================================
// APP LAUNCHER
// ============================================================================

/**
 * The single entry point for "open app of type X".
 *
 * Replaces four copies of the same open-or-restore block that previously lived
 * in DesktopIconsManager.openIcon, StartMenuManager.populateApps,
 * TaskbarManager.handleLauncherClick and cmd.js's `open` command — each with
 * its own inline `Array.from(windows.entries()).find(...)` and, in two cases,
 * its own hardcoded implementedTypes array.
 */
export function createLauncher(windowManager, { onUnimplemented, onError } = {}) {
  const notifyUnimplemented =
    onUnimplemented || ((name) => toast(`${name} is not implemented yet`));
  const notifyError =
    onError || ((type, error) => console.error(`Failed to create ${type} window:`, error));

  /** @returns {string|null} id of an existing window of this type */
  function findWindowByType(type) {
    for (const [id, data] of windowManager.windows.entries()) {
      if (data.type === type) return id;
    }
    return null;
  }

  return {
    findWindowByType,
    isImplemented,

    /**
     * Focus the existing window for this type, or create one.
     * @param {string} type
     * @param {{ name?: string, icon?: string, toggleIfFocused?: boolean }} [options]
     *        toggleIfFocused: minimize instead of focus when the window is
     *        already focused. Set by pinned taskbar launchers, which double as
     *        their window's taskbar button.
     */
    async launch(type, options = {}) {
      const app = getApp(type);
      const name = options.name ?? app?.name ?? type;
      const icon = options.icon ?? app?.icon ?? '';

      if (!isImplemented(type)) {
        notifyUnimplemented(name, type);
        return null;
      }

      const existingId = findWindowByType(type);
      if (existingId) {
        // focus() never toggles: launching an app that is already open raises
        // it. Hiding is the taskbar *button*'s job (toggleMinimize).
        //
        // The exception is a pinned launcher that is also acting as this
        // window's taskbar button (addTaskbarButton reuses it rather than
        // adding a second one). There the button IS the window button, so it
        // must toggle — otherwise the window can be shown but never hidden.
        if (options.toggleIfFocused && windowManager.focusedId === existingId) {
          windowManager.toggleMinimize(existingId);
        } else {
          windowManager.focus(existingId);
        }
        return existingId;
      }

      try {
        return await windowManager.createWindow(type, name, icon);
      } catch (error) {
        notifyError(type, error);
        return null;
      }
    }
  };
}
