// ============================================================================
// IN-WORLD DIALOGS & TOASTS
// ============================================================================

/**
 * Replaces the native alert() calls scattered through the shell. A blocking
 * browser alert breaks the illusion of a desktop; these render inside it.
 *
 * The layer is a sibling of #desktopRoot because that element sets
 * `contain: strict`, which would clip anything overlaying the taskbar.
 */
function ensureLayer(id, className) {
  let layer = document.getElementById(id);
  if (!layer) {
    layer = document.createElement('div');
    layer.id = id;
    layer.className = className;
    document.body.appendChild(layer);
  }
  return layer;
}

/** Transient, non-blocking message. */
export function toast(message, { variant = 'info', duration = 2600 } = {}) {
  const layer = ensureLayer('toastLayer', 'toast-layer');

  const el = document.createElement('div');
  el.className = `toast toast-${variant}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  layer.appendChild(el);

  requestAnimationFrame(() => el.classList.add('visible'));

  const remove = () => {
    el.classList.remove('visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    // Fallback if the transition never fires (e.g. reduced motion).
    setTimeout(() => el.remove(), 400);
  };

  const timer = setTimeout(remove, duration);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });

  return remove;
}

/**
 * Modal dialog. Returns a promise resolving to true (confirm) or false
 * (cancel/dismiss).
 */
function openDialog({ title, message, confirmText = 'OK', cancelText = null, variant = 'info' }) {
  const layer = ensureLayer('dialogLayer', 'dialog-layer');

  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = `dialog dialog-${variant}`;
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', title);

    dialog.innerHTML = `
      <div class="dialog-title"></div>
      <div class="dialog-message"></div>
      <div class="dialog-actions">
        ${cancelText ? '<button class="dialog-btn dialog-cancel"></button>' : ''}
        <button class="dialog-btn dialog-confirm"></button>
      </div>
    `;
    // textContent, not innerHTML: message may contain an error string.
    dialog.querySelector('.dialog-title').textContent = title;
    dialog.querySelector('.dialog-message').textContent = message;
    dialog.querySelector('.dialog-confirm').textContent = confirmText;
    if (cancelText) dialog.querySelector('.dialog-cancel').textContent = cancelText;

    const close = (result) => {
      document.removeEventListener('keydown', onKey, true);
      backdrop.remove();
      resolve(result);
    };

    const onKey = (event) => {
      if (event.key === 'Escape') { event.stopPropagation(); close(false); }
      if (event.key === 'Enter') { event.stopPropagation(); close(true); }
    };

    dialog.querySelector('.dialog-confirm').addEventListener('click', () => close(true));
    dialog.querySelector('.dialog-cancel')?.addEventListener('click', () => close(false));
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(false); });
    document.addEventListener('keydown', onKey, true);

    backdrop.appendChild(dialog);
    layer.appendChild(backdrop);
    requestAnimationFrame(() => {
      backdrop.classList.add('visible');
      dialog.querySelector('.dialog-confirm').focus();
    });
  });
}

export function alertDialog({ title, message, confirmText = 'OK', variant = 'info' }) {
  return openDialog({ title, message, confirmText, variant });
}

export function confirmDialog({ title, message, confirmText = 'OK', cancelText = 'Cancel', variant = 'info' }) {
  return openDialog({ title, message, confirmText, cancelText, variant });
}
