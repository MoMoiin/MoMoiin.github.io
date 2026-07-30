// ============================================================================
// DOM HELPERS
// ============================================================================

/**
 * addEventListener that hands back its own removal function.
 *
 * Returning the unsubscribe is what makes listener cleanup systematic rather
 * than something each call site has to remember: pair it with createDisposer()
 * and a window can tear down everything it registered in one call.
 *
 * @returns {() => void} call to detach the listener
 */
export function on(target, type, handler, options) {
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

let svgScope = 0;

/**
 * Rewrites the internal ids of an inline SVG so several copies can coexist.
 *
 * SVG ids share one document-wide namespace, and `url(#id)` resolves to the
 * first match. Our icons carry gradient definitions and are injected in several
 * places at once (desktop, taskbar, tabs, switcher), so without this every copy
 * would silently reference the first one's gradients — and lose its fill the
 * moment that copy is removed from the DOM.
 */
export function scopeSvgIds(markup) {
  if (!markup || !markup.includes('id="mo-')) return markup;
  const suffix = `-s${++svgScope}`;
  return markup
    .replace(/id="(mo-[\w-]+)"/g, (_, id) => `id="${id}${suffix}"`)
    .replace(/url\(#(mo-[\w-]+)\)/g, (_, id) => `url(#${id}${suffix})`);
}

/**
 * Collects teardown functions so a whole feature can be disposed at once.
 * dispose() is idempotent and never lets one failing teardown skip the rest.
 */
export function createDisposer() {
  let fns = [];
  let disposed = false;

  return {
    /** Register a teardown function. Runs immediately if already disposed. */
    add(fn) {
      if (typeof fn !== 'function') return;
      if (disposed) {
        fn();
        return;
      }
      fns.push(fn);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      const pending = fns;
      fns = [];
      for (const fn of pending) {
        try {
          fn();
        } catch (error) {
          console.error('Disposer threw during teardown:', error);
        }
      }
    },
    get isDisposed() {
      return disposed;
    }
  };
}
