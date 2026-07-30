import { WINDOW_TYPES, SVG_ICONS } from './constants.js';

// ============================================================================
// APP REGISTRY
// ============================================================================

/**
 * One description per app. `implemented` replaces the two hand-maintained
 * implementedTypes arrays that used to live in the desktop-icon and start-menu
 * managers; `defaultRect` holds the first-run layout that init() used to apply
 * with hardcoded vw/vh values.
 *
 * defaultRect values are viewport fractions (0..1), resolved by
 * rectFromViewportFraction() at layout time.
 */
export const APPS = {
  [WINDOW_TYPES.BROWSER]: {
    name: 'Jakub Adamczyk',
    tooltip: 'Browser',
    icon: SVG_ICONS.browser,
    implemented: true,
    defaultRect: { left: 0.01, top: 0.02, width: 0.38, height: 0.76 }
  },
  [WINDOW_TYPES.TERMINAL]: {
    name: 'MoMo Terminal',
    tooltip: 'MoMo Terminal',
    icon: SVG_ICONS.cmd,
    implemented: true,
    defaultRect: { left: 0.41, top: 0.10, width: 0.36, height: 0.52 }
  },
  [WINDOW_TYPES.EMAIL]: {
    name: 'Mail',
    tooltip: 'Mail',
    icon: SVG_ICONS.email,
    implemented: true,
    defaultRect: { left: 0.77, top: 0.08, width: 0.22, height: 0.70 }
  },
  [WINDOW_TYPES.EXPLORER]: {
    name: 'Explorer',
    tooltip: 'Explorer',
    icon: SVG_ICONS.explorer,
    implemented: true
  },
  [WINDOW_TYPES.SETTINGS]: { name: 'Settings', icon: '⚙️', implemented: false },
  [WINDOW_TYPES.CALCULATOR]: { name: 'Calculator', icon: '🔢', implemented: false },
  [WINDOW_TYPES.NOTES]: { name: 'Notes', icon: '📝', implemented: false },
  [WINDOW_TYPES.PHOTOS]: { name: 'Photos', icon: '🖼️', implemented: false }
};

export function getApp(type) {
  return APPS[type] || null;
}

export function isImplemented(type) {
  return Boolean(APPS[type]?.implemented);
}

/** Resolves a fractional defaultRect against the usable desktop area. */
export function rectFromViewportFraction(fraction, workArea) {
  return {
    left: Math.round(fraction.left * workArea.width),
    top: Math.round(fraction.top * workArea.height),
    width: Math.round(fraction.width * workArea.width),
    height: Math.round(fraction.height * workArea.height)
  };
}
