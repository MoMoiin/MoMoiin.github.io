// ============================================================================
// WINDOW FRAME
// ============================================================================

/**
 * The eight resize directions, in the order the handles are emitted.
 * `dir` is written to data-dir so resize.js can resolve the direction once at
 * pointerdown instead of re-querying all eight handles on every pointermove.
 */
const RESIZE_HANDLES = [
  { dir: 'n', cls: 'resize-top' },
  { dir: 'e', cls: 'resize-right' },
  { dir: 's', cls: 'resize-bottom' },
  { dir: 'w', cls: 'resize-left' },
  { dir: 'nw', cls: 'resize-corner-tl' },
  { dir: 'ne', cls: 'resize-corner-tr' },
  { dir: 'sw', cls: 'resize-corner-bl' },
  { dir: 'se', cls: 'resize-corner-br' }
];

/**
 * Builds the window chrome that every component used to copy-paste into its own
 * template. Components now supply only their body markup.
 *
 * The body is a flex column slot: components that render an .address-bar above
 * their .window-content (browser, explorer) keep working unchanged, because
 * those selectors are unscoped and still match inside the slot.
 *
 * @returns {{root: HTMLElement, titleBar: HTMLElement, body: HTMLElement,
 *            tabStrip: HTMLElement, controls: object, handles: HTMLElement}}
 */
export function buildFrame({ id, title, icon, appType }) {
  const root = document.createElement('div');
  root.className = 'window';
  root.id = id;
  // data-app lets component stylesheets be scoped if they ever collide.
  root.dataset.app = appType;

  const titleBar = document.createElement('div');
  titleBar.className = 'chrome-tabs';
  // The tab strip starts empty: createTabHost() owns the tabs inside it.
  titleBar.innerHTML = `
    <div class="tab-container">
      <button class="new-tab-button" title="New tab" aria-label="New tab">+</button>
    </div>
    <div class="window-controls">
      <button class="control-btn minimize-btn" title="Minimize" aria-label="Minimize">−</button>
      <button class="control-btn maximize-btn" title="Maximize" aria-label="Maximize">□</button>
      <button class="control-btn close-btn" title="Close" aria-label="Close">✕</button>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'window-body';

  const handles = document.createElement('div');
  handles.className = 'resize-handles';
  handles.innerHTML = RESIZE_HANDLES
    .map(({ dir, cls }) => `<div class="resize-handle ${cls}" data-dir="${dir}"></div>`)
    .join('');

  root.append(titleBar, body, handles);

  return {
    root,
    titleBar,
    body,
    handles,
    tabStrip: titleBar.querySelector('.tab-container'),
    controls: {
      minimize: titleBar.querySelector('.minimize-btn'),
      maximize: titleBar.querySelector('.maximize-btn'),
      close: titleBar.querySelector('.close-btn'),
      newTab: titleBar.querySelector('.new-tab-button')
    }
  };
}
