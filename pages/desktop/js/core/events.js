// ============================================================================
// EVENT BUS
// ============================================================================

/**
 * Minimal pub/sub. The window manager emits; the taskbar and (from Phase 4) the
 * session store subscribe. This is what lets those modules react to window
 * lifecycle without the manager holding references back to them.
 *
 * Events emitted by the window manager:
 *   window:opened, window:closed, window:focused, window:moved,
 *   window:resized, window:minimized, window:restored, window:state-changed
 */
export function createBus() {
  const listeners = new Map();

  return {
    /** @returns {() => void} unsubscribe */
    on(event, handler) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(handler);
      return () => listeners.get(event)?.delete(handler);
    },

    emit(event, payload) {
      const handlers = listeners.get(event);
      if (!handlers) return;
      // Copy first: a handler may unsubscribe itself while we iterate.
      for (const handler of [...handlers]) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Listener for "${event}" threw:`, error);
        }
      }
    }
  };
}
