import { getWorkArea, snappedRect, maximizedRect } from './geometry.js';
import { MODES } from './window-state.js';

// ============================================================================
// SNAP ZONES
// ============================================================================

const SNAP_THRESHOLD = 20; // px from a screen edge

/** Which snap mode, if any, a pointer position implies. */
export function detectSnapZone(clientX, clientY) {
  const { width } = getWorkArea();

  if (clientY <= SNAP_THRESHOLD) return MODES.MAXIMIZED;
  if (clientX <= SNAP_THRESHOLD) return MODES.SNAPPED_LEFT;
  if (clientX >= width - SNAP_THRESHOLD) return MODES.SNAPPED_RIGHT;
  return null;
}

/** The rect a given snap mode resolves to. */
export function rectForZone(zone) {
  return zone === MODES.MAXIMIZED ? maximizedRect() : snappedRect(zone);
}

/**
 * The translucent overlay shown while dragging near an edge.
 * Appearance lives in .snap-preview; only geometry is set here.
 */
export function createSnapPreview() {
  let el = null;

  const ensure = () => {
    if (!el) {
      el = document.createElement('div');
      el.id = 'snapPreview';
      el.className = 'snap-preview';
      // Sibling of #desktopRoot: that element has `contain: strict` and would
      // clip the overlay.
      document.body.appendChild(el);
    }
    return el;
  };

  return {
    show(zone) {
      const preview = ensure();
      const rect = rectForZone(zone);
      preview.style.left = `${rect.left}px`;
      preview.style.top = `${rect.top}px`;
      preview.style.width = `${rect.width}px`;
      preview.style.height = `${rect.height}px`;
      preview.classList.add('visible');
    },
    hide() {
      el?.classList.remove('visible');
    },
    destroy() {
      el?.remove();
      el = null;
    }
  };
}
