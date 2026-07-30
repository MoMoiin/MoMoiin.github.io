import { confirmDialog } from './dialogs.js';
import { SHORTCUTS } from './shortcuts.js';

// ============================================================================
// POWER & SHORTCUT REFERENCE
// ============================================================================

/**
 * Shutdown sequence for the Start menu's power button, which previously had no
 * handler at all. Fades to black and offers a restart, rather than doing
 * something destructive to the real browser tab.
 */
export async function shutDown({ onBeforeShutdown } = {}) {
  const ok = await confirmDialog({
    title: 'Shut down?',
    message: 'This ends the desktop session. Your window layout is saved and '
      + 'will be restored when you start it again.',
    confirmText: 'Shut down',
    variant: 'danger'
  });
  if (!ok) return false;

  onBeforeShutdown?.();

  const screen = document.createElement('div');
  screen.className = 'shutdown-screen';
  screen.innerHTML = `
    <div class="shutdown-content">
      <div class="shutdown-message">It is now safe to close this tab.</div>
      <button class="shutdown-restart">Restart</button>
      <a class="shutdown-link" href="../../index.html">Back to the portfolio</a>
    </div>
  `;
  document.body.appendChild(screen);
  requestAnimationFrame(() => screen.classList.add('visible'));

  screen.querySelector('.shutdown-restart').addEventListener('click', () => {
    location.reload();
  });

  return true;
}

/** Reference panel listing the real bindings, opened from the Start menu. */
export function showShortcuts() {
  const existing = document.querySelector('.shortcuts-sheet');
  if (existing) { existing.remove(); return; }

  const sheet = document.createElement('div');
  sheet.className = 'shortcuts-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-label', 'Keyboard shortcuts');
  sheet.innerHTML = `
    <div class="shortcuts-panel">
      <div class="shortcuts-head">
        <span>Keyboard shortcuts</span>
        <button class="shortcuts-close" aria-label="Close">✕</button>
      </div>
      <dl class="shortcuts-list">
        ${SHORTCUTS.map((s) => `
          <div class="shortcuts-row">
            <dt>${s.keys.map((k) => `<kbd>${k}</kbd>`).join('<span class="kbd-plus">+</span>')}</dt>
            <dd></dd>
          </div>
        `).join('')}
      </dl>
      <p class="shortcuts-note">
        Alt+Tab and Ctrl+W belong to your browser and operating system, so the
        desktop uses Alt+\` and Alt+W instead.
      </p>
    </div>
  `;
  sheet.querySelectorAll('.shortcuts-row dd').forEach((el, i) => {
    el.textContent = SHORTCUTS[i].label;
  });

  const close = () => {
    document.removeEventListener('keydown', onKey, true);
    sheet.remove();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
  };

  sheet.querySelector('.shortcuts-close').addEventListener('click', close);
  sheet.addEventListener('pointerdown', (event) => {
    if (event.target === sheet) close();
  });
  document.addEventListener('keydown', onKey, true);

  document.body.appendChild(sheet);
  requestAnimationFrame(() => sheet.classList.add('visible'));
}
