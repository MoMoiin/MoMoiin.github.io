import { CONFIG, getWorkArea } from '../config.js';

// ============================================================================
// GEOMETRY
// ============================================================================

export { getWorkArea };

/** Reads a window's current rect from its layout box. */
export function readRect(el) {
  return {
    left: el.offsetLeft,
    top: el.offsetTop,
    width: el.offsetWidth,
    height: el.offsetHeight
  };
}

/** Writes a rect as explicit pixel styles. */
export function applyRect(el, rect) {
  el.style.left = `${Math.round(rect.left)}px`;
  el.style.top = `${Math.round(rect.top)}px`;
  el.style.width = `${Math.round(rect.width)}px`;
  el.style.height = `${Math.round(rect.height)}px`;
}

/** The rect a maximized window should occupy. */
export function maximizedRect(workArea = getWorkArea()) {
  return { left: 0, top: 0, width: workArea.width, height: workArea.height };
}

/** The rect for a left/right half snap. */
export function snappedRect(zone, workArea = getWorkArea()) {
  const half = Math.round(workArea.width / 2);
  if (zone === 'snapped-left') {
    return { left: 0, top: 0, width: half, height: workArea.height };
  }
  if (zone === 'snapped-right') {
    return { left: half, top: 0, width: workArea.width - half, height: workArea.height };
  }
  return maximizedRect(workArea);
}

/**
 * Keeps a rect usable on the current screen: clamps to the minimum size, then
 * nudges it back on-screen so at least part of the title bar stays grabbable.
 */
export function clampToWorkArea(rect, workArea = getWorkArea()) {
  const width = Math.min(Math.max(rect.width, CONFIG.window.minWidth), workArea.width);
  const height = Math.min(Math.max(rect.height, CONFIG.window.minHeight), workArea.height);

  // Leave at least this much of the title bar reachable on each axis.
  const MIN_VISIBLE_X = 80;
  const MIN_VISIBLE_Y = 0;

  const left = Math.min(
    Math.max(rect.left, MIN_VISIBLE_X - width),
    workArea.width - MIN_VISIBLE_X
  );
  const top = Math.min(
    Math.max(rect.top, MIN_VISIBLE_Y),
    Math.max(0, workArea.height - 40)
  );

  return { left, top, width, height };
}

/**
 * Rescales a rect captured at one viewport size for the current one, then
 * clamps it. Used when restoring a session saved on a different monitor.
 */
export function rescaleRect(rect, capturedViewport, workArea = getWorkArea()) {
  if (!capturedViewport?.w || !capturedViewport?.h) {
    return clampToWorkArea(rect, workArea);
  }

  const sameSize =
    Math.abs(capturedViewport.w - workArea.width) < 1 &&
    Math.abs(capturedViewport.h - workArea.height) < 1;
  if (sameSize) return clampToWorkArea(rect, workArea);

  const scaleX = workArea.width / capturedViewport.w;
  const scaleY = workArea.height / capturedViewport.h;

  return clampToWorkArea({
    left: rect.left * scaleX,
    top: rect.top * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY
  }, workArea);
}
