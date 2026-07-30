import { WINDOW_TYPES, ICON_TYPES, SVG_ICONS } from './constants.js';
import { WindowManager } from './wm/window-manager.js';
import { BackgroundAnimation } from './shell/background.js';
import { updateClock } from './shell/clock.js';
import { DesktopIconsManager } from './shell/desktop-icons.js';
import { StartMenuManager } from './shell/start-menu.js';
import { ContextMenuManager } from './shell/context-menu.js';
import { SystemTrayManager } from './shell/system-tray.js';
import { TaskbarManager } from './shell/taskbar.js';
import { createLauncher } from './shell/app-launcher.js';
import { toast, alertDialog } from './shell/dialogs.js';
import { startSession, installAutosave, resetDesktop } from './session.js';
import { pickApp } from './shell/app-picker.js';
import { installShortcuts } from './shell/shortcuts.js';
import { createSwitcher } from './shell/switcher.js';
import * as storage from './core/storage.js';

// ============================================================================
// INITIALIZATION
// ============================================================================

const DESKTOP_ICONS = [
  { label: 'This PC', icon: SVG_ICONS.thispc, type: ICON_TYPES.THIS_PC },
  { label: 'Recycle Bin', icon: SVG_ICONS.recyclebin, type: ICON_TYPES.RECYCLE_BIN },
  { label: 'Browser', icon: SVG_ICONS.browser, type: WINDOW_TYPES.BROWSER },
  { label: 'Terminal', icon: SVG_ICONS.cmd, type: WINDOW_TYPES.TERMINAL },
  { label: 'Projects', icon: SVG_ICONS.explorer, type: WINDOW_TYPES.EXPLORER },
  { label: 'Mail', icon: SVG_ICONS.email, type: WINDOW_TYPES.EMAIL }
];

async function init() {
  const windowManager = new WindowManager();
  const launcher = createLauncher(windowManager, {
    onUnimplemented: (name) => toast(`${name} is not implemented yet`),
    onError: (type, error) => {
      console.error(`Failed to create ${type} window:`, error);
      alertDialog({
        title: 'Could not open app',
        message: `"${type}" failed to load.\n\n${error?.message ?? error}`,
        variant: 'danger'
      });
    }
  });
  // Components receive the launcher through their init context.
  windowManager.launcher = launcher;
  // The + button asks which app the new tab should host.
  windowManager.pickApp = (windowId) => {
    const button = windowManager.windows.get(windowId)?.frame.controls.newTab;
    return button ? pickApp(button) : null;
  };

  const bg = new BackgroundAnimation(document.getElementById('bgCanvas'));
  bg.init();

  updateClock();
  setInterval(updateClock, 1000);

  const desktopIconsManager = new DesktopIconsManager(windowManager, launcher);
  for (const { label, icon, type } of DESKTOP_ICONS) {
    desktopIconsManager.createIcon(label, icon, type);
  }

  // Click on desktop background to clear selections
  document.getElementById('desktopRoot').addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-icon, .window, .taskbar, .start-menu, .context-menu')) {
      desktopIconsManager.clearSelection();
    }
  });

  const startMenu = new StartMenuManager(windowManager, launcher, {
    // Flush the session before the screen goes black, so a shutdown followed by
    // a restart comes back to the same layout.
    onBeforeShutdown: () => storage.flush()
  });
  const contextMenu = new ContextMenuManager(desktopIconsManager, { onReset: resetDesktop });
  new SystemTrayManager();

  const taskbarManager = new TaskbarManager(windowManager, launcher);
  taskbarManager.initializeDefaultLaunchers();

  const switcher = createSwitcher(windowManager);
  installShortcuts({ wm: windowManager, startMenu, contextMenu, switcher });

  // Start saving before the session opens, so the restored layout is recorded.
  installAutosave(windowManager, windowManager.bus);

  try {
    await startSession(windowManager);
  } catch (error) {
    console.error('Failed to start session:', error);
  }

  // Exposed for tests and console poking; components get these injected.
  window.windowManager = windowManager;
  window.appLauncher = launcher;
}

init();
