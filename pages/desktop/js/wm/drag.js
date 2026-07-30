import { on, createDisposer } from '../core/dom.js';

// ============================================================================
// WINDOW DRAG
// ============================================================================

/** Controls inside the title bar that must not start a drag. */
const NON_DRAG = '.control-btn, .tab-close, .new-tab-button, .nav-btn, .address-input, .menu-btn';

/**
 * Title-bar dragging via pointer events: one code path for mouse and touch,
 * replacing the parallel mouse and touch handler pairs.
 *
 * Move/up listeners live on the document only between pointerdown and
 * pointerup, and everything is registered with a disposer so closing a window
 * detaches all of it.
 *
 * @returns {() => void} destroy
 */
export function enableDrag(windowEl, titleBar, {
  onStart, onMove, onEnd, getBounds
} = {}) {
  const disposer = createDisposer();
  let active = null;
  let frame = 0;
  let pending = null;

  const flush = () => {
    frame = 0;
    if (!pending || !active) return;
    windowEl.style.left = `${pending.left}px`;
    windowEl.style.top = `${pending.top}px`;
    onMove?.(pending, active.pointer);
    pending = null;
  };

  const handleMove = (event) => {
    if (!active || event.pointerId !== active.pointerId) return;

    const bounds = getBounds?.() ?? { width: Infinity, height: Infinity };
    const left = Math.max(0, Math.min(
      active.startLeft + (event.clientX - active.startX),
      Math.max(0, bounds.width - 40)
    ));
    const top = Math.max(0, Math.min(
      active.startTop + (event.clientY - active.startY),
      Math.max(0, bounds.height - 20)
    ));

    active.pointer = { x: event.clientX, y: event.clientY };
    pending = { left, top };
    // Coalesce: many pointermove events can arrive between two paints.
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const stop = (event) => {
    if (!active || (event && event.pointerId !== active.pointerId)) return;

    if (frame) { cancelAnimationFrame(frame); frame = 0; flush(); }

    const pointer = active.pointer;
    active.release();
    active = null;
    windowEl.classList.remove('is-interacting');
    onEnd?.(pointer);
  };

  disposer.add(on(titleBar, 'pointerdown', (event) => {
    if (event.button !== 0) return;
    if (event.target.closest(NON_DRAG)) return;
    if (active) return;

    const startLeft = windowEl.offsetLeft;
    const startTop = windowEl.offsetTop;

    // Gesture-scoped listeners: attached here, removed in stop().
    const offMove = on(document, 'pointermove', handleMove);
    const offUp = on(document, 'pointerup', stop);
    const offCancel = on(document, 'pointercancel', stop);

    active = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft,
      startTop,
      pointer: { x: event.clientX, y: event.clientY },
      release: () => { offMove(); offUp(); offCancel(); }
    };

    windowEl.classList.add('is-interacting');
    onStart?.({ left: startLeft, top: startTop });
    event.preventDefault();
  }));

  disposer.add(() => {
    if (frame) cancelAnimationFrame(frame);
    active?.release();
    active = null;
  });

  return () => disposer.dispose();
}
