// ============================================================================
// CONFIGURATION
// ============================================================================

export const CONFIG = {
  window: {
    minWidth: 400,
    minHeight: 300,
    borderRadius: 12
  },
  taskbar: {
    // Deprecated: read the live value via getTaskbarHeight() instead. Kept only
    // as the fallback when the CSS custom property cannot be resolved.
    height: 50
  },
  animation: {
    duration: {
      maximize: 200,
      minimize: 300,
      close: 150
    },
    easing: {
      default: 'out(3)',
      inOut: 'inOut(3)',
      in: 'in(3)'
    }
  },
  background: {
    animationSpeed: 0.002,
    colors: ['#1f2937', '#535964', '#af928e']
  }
};

/**
 * Stacking bands. Windows occupy a bounded range so that no amount of focus
 * churn can ever raise a window above the taskbar or the menus.
 */
export const Z = {
  WINDOW_BASE: 100,
  WINDOW_MAX: 899,
  SNAP_PREVIEW: 900,
  TASKBAR: 1000,
  START_MENU: 1100,
  CONTEXT_MENU: 1200,
  DIALOG: 1300,
  TOAST: 1400
};

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

/**
 * Reads the taskbar height from the --taskbar-h custom property, which is the
 * single source of truth shared by .taskbar, #desktopRoot and this module.
 * Falls back to CONFIG.taskbar.height if the property is missing or unparsable.
 */
export function getTaskbarHeight() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--taskbar-h');
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : CONFIG.taskbar.height;
}

/** Usable desktop area, i.e. the viewport minus the taskbar. */
export function getWorkArea() {
  return {
    width: window.innerWidth,
    height: window.innerHeight - getTaskbarHeight()
  };
}
