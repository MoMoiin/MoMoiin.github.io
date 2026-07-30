import { on, createDisposer } from '../core/dom.js';
import { CONFIG } from '../config.js';

// ============================================================================
// WINDOW RESIZE
// ============================================================================

/**
 * Eight-handle resizing.
 *
 * Fixes three defects in the original implementation:
 *   - it attached pointermove/up to `document` once per window and never
 *     removed them, so every open/close cycle leaked a pair of live listeners;
 *   - resize state lived on a manager-wide object while each window had its own
 *     listener, so concurrent windows only worked by accident;
 *   - it re-queried all eight handles on every mousemove to identify the
 *     direction. The direction now comes from data-dir, read once at
 *     pointerdown.
 *
 * @returns {() => void} destroy
 */
export function enableResize(windowEl, handlesRoot, {
  onStart, onResize, onEnd, getBounds, min
} = {}) {
  const disposer = createDisposer();
  const minWidth = min?.width ?? CONFIG.window.minWidth;
  const minHeight = min?.height ?? CONFIG.window.minHeight;

  let active = null;
  let frame = 0;
  let pending = null;

  const flush = () => {
    frame = 0;
    if (!pending || !active) return;
    const { left, top, width, height } = pending;
    windowEl.style.left = `${left}px`;
    windowEl.style.top = `${top}px`;
    windowEl.style.width = `${width}px`;
    windowEl.style.height = `${height}px`;
    onResize?.(pending);
    pending = null;
  };

  const handleMove = (event) => {
    if (!active || event.pointerId !== active.pointerId) return;

    const { dir, startX, startY, rect } = active;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const bounds = getBounds?.() ?? { width: Infinity, height: Infinity };

    let { left, top, width, height } = rect;

    if (dir.includes('e')) {
      width = Math.max(minWidth, Math.min(rect.width + dx, bounds.width - rect.left));
    }
    if (dir.includes('w')) {
      // Clamp the delta so the left edge cannot push width below the minimum.
      const delta = Math.min(dx, rect.width - minWidth);
      width = rect.width - delta;
      left = Math.max(0, rect.left + delta);
    }
    if (dir.includes('s')) {
      height = Math.max(minHeight, Math.min(rect.height + dy, bounds.height - rect.top));
    }
    if (dir.includes('n')) {
      const delta = Math.min(dy, rect.height - minHeight);
      height = rect.height - delta;
      top = Math.max(0, rect.top + delta);
    }

    pending = { left, top, width, height };
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const stop = (event) => {
    if (!active || (event && event.pointerId !== active.pointerId)) return;

    if (frame) { cancelAnimationFrame(frame); frame = 0; flush(); }

    active.release();
    active = null;
    windowEl.classList.remove('is-interacting');
    onEnd?.();
  };

  // One delegated listener for all eight handles.
  disposer.add(on(handlesRoot, 'pointerdown', (event) => {
    const handle = event.target.closest('.resize-handle');
    if (!handle || event.button !== 0 || active) return;

    const dir = handle.dataset.dir;
    if (!dir) return;

    const offMove = on(document, 'pointermove', handleMove);
    const offUp = on(document, 'pointerup', stop);
    const offCancel = on(document, 'pointercancel', stop);

    active = {
      pointerId: event.pointerId,
      dir,
      startX: event.clientX,
      startY: event.clientY,
      rect: {
        left: windowEl.offsetLeft,
        top: windowEl.offsetTop,
        width: windowEl.offsetWidth,
        height: windowEl.offsetHeight
      },
      release: () => { offMove(); offUp(); offCancel(); }
    };

    windowEl.classList.add('is-interacting');
    onStart?.(active.rect);
    event.preventDefault();
    event.stopPropagation();
  }));

  disposer.add(() => {
    if (frame) cancelAnimationFrame(frame);
    active?.release();
    active = null;
  });

  return () => disposer.dispose();
}
