// ============================================================================
// WINDOW STATE MACHINE
// ============================================================================

/** @typedef {'normal'|'maximized'|'snapped-left'|'snapped-right'|'minimized'} WindowMode */

export const MODES = {
  NORMAL: 'normal',
  MAXIMIZED: 'maximized',
  SNAPPED_LEFT: 'snapped-left',
  SNAPPED_RIGHT: 'snapped-right',
  MINIMIZED: 'minimized'
};

/** Modes that occupy a computed rect rather than the user's own geometry. */
const FILLED_MODES = new Set([MODES.MAXIMIZED, MODES.SNAPPED_LEFT, MODES.SNAPPED_RIGHT]);

export function isFilledMode(mode) {
  return FILLED_MODES.has(mode);
}

/**
 * Tracks one window's mode and the rect to return to.
 *
 * The bug this replaces: the old code stored `previousSize` on every maximize
 * call and re-invoked handleMaximize() to restore, so
 *   - minimizing a maximized window then restoring it un-maximized it, and
 *   - maximizing an already-maximized window overwrote previousSize with the
 *     maximized rect, permanently losing the user's real geometry.
 *
 * Two invariants prevent both:
 *   1. `normalRect` is written ONLY when leaving 'normal'. Never otherwise.
 *   2. Minimize records where to return in `restoreMode`, separate from `mode`.
 */
export function createWindowState(initialRect) {
  let mode = MODES.NORMAL;
  let restoreMode = MODES.NORMAL;
  let normalRect = { ...initialRect };

  return {
    get mode() { return mode; },
    get restoreMode() { return restoreMode; },
    get normalRect() { return { ...normalRect }; },

    get isMinimized() { return mode === MODES.MINIMIZED; },
    /** True when maximized or snapped — i.e. occupying a computed rect. */
    get isFilled() { return isFilledMode(mode); },

    /**
     * Enter a filled mode (maximized/snapped).
     * @param {WindowMode} next
     * @param {{left:number,top:number,width:number,height:number}} currentRect
     *        the window's live rect, saved only if we are leaving 'normal'
     */
    fill(next, currentRect) {
      if (mode === MODES.NORMAL && currentRect) {
        normalRect = { ...currentRect };
      }
      mode = next;
      restoreMode = next;
      return mode;
    },

    /** Return to the user's own geometry. */
    unfill() {
      mode = MODES.NORMAL;
      restoreMode = MODES.NORMAL;
      return normalRect;
    },

    /** Hide, remembering whether to come back filled or normal. */
    minimize(currentRect) {
      if (mode === MODES.MINIMIZED) return;
      // Remember the geometry only if we are in normal mode; a filled window's
      // rect is recomputed on restore from the current work area.
      if (mode === MODES.NORMAL && currentRect) {
        normalRect = { ...currentRect };
      }
      restoreMode = mode === MODES.MINIMIZED ? restoreMode : mode;
      mode = MODES.MINIMIZED;
    },

    /** Un-hide, returning to whichever mode was active before minimizing. */
    restore() {
      if (mode !== MODES.MINIMIZED) return mode;
      mode = restoreMode === MODES.MINIMIZED ? MODES.NORMAL : restoreMode;
      return mode;
    },

    /** Track user-driven moves/resizes so normalRect stays current. */
    updateNormalRect(rect) {
      if (mode === MODES.NORMAL) normalRect = { ...rect };
    },

    /** Restore from a persisted snapshot (Phase 4). */
    hydrate({ mode: m, restoreMode: rm, normalRect: nr }) {
      if (nr) normalRect = { ...nr };
      if (m) mode = m;
      if (rm) restoreMode = rm;
    },

    serialize() {
      return { mode, restoreMode, normalRect: { ...normalRect } };
    }
  };
}
