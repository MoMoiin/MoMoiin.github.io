// CMD Component JavaScript

export const htmlTemplate = `<!-- CMD Window Component -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">💻</span>
        <span class="tab-title">Command Prompt</span>
        <button class="tab-close" title="Close tab">×</button>
      </div>
    </div>
    <button class="new-tab-button" title="New tab">+</button>
  </div>
  <div class="window-controls">
    <button class="control-btn minimize-btn" title="Minimize">−</button>
    <button class="control-btn maximize-btn" title="Maximize">□</button>
    <button class="control-btn close-btn" title="Close">×</button>
  </div>
</div>

<!-- Window Content -->
<div class="window-content cmd-content">
  <div class="cmd-header">Microsoft Windows [Version 10.0.19041.1348]</div>
  <div class="cmd-header">(c) Microsoft Corporation. All rights reserved.</div>

  <div class="cmd-output" aria-live="polite"></div>

  <!-- Hidden input proxy to capture keystrokes (moved off-screen so it can receive focus) -->
  <input type="text" class="cmd-input-proxy" autocomplete="off" spellcheck="false" tabindex="-1" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;" />

  <!-- Display line -->
  <div class="cmd-line-display">
    <span class="cmd-prompt">C:\\Users\\root&gt;</span>
    <span class="cmd-display"></span>
  </div>
</div>

<!-- Resize Handles -->
<div class="resize-handle resize-top"></div>
<div class="resize-handle resize-right"></div>
<div class="resize-handle resize-bottom"></div>
<div class="resize-handle resize-left"></div>
<div class="resize-handle resize-corner-tl"></div>
<div class="resize-handle resize-corner-tr"></div>
<div class="resize-handle resize-corner-bl"></div>
<div class="resize-handle resize-corner-br"></div>`;

export function init(windowElement) {
  // Simple terminal using invisible input proxy to capture all keystrokes
  const proxy = windowElement.querySelector('.cmd-input-proxy');
  const output = windowElement.querySelector('.cmd-output');
  const display = windowElement.querySelector('.cmd-display');
  const content = windowElement.querySelector('.window-content');

  const COMMANDS = {
    help: ['Available: clear, echo <text>, date, time, whoami, ls, pwd, version, about, open <app>, mail, exit'],
    whoami: ['Jakub Adamczyk'],
    ls: ['Documents', 'Downloads', 'Pictures', 'Projects', 'README.md'],
    pwd: ['/home/jakub'],
    version: ['MoMoiin Desktop v1.0.0'],
    about: ['This is a demo desktop environment built with HTML/CSS/JS.']
  };

  function appendLine(text, cls = 'cmd-line') {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = text;
    output.appendChild(el);
    const content = windowElement.querySelector('.window-content');
    content.scrollTop = content.scrollHeight;
  }

  function runCommand(raw) {
    const cmd = String(raw || '').trim();
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (name === 'clear') {
      output.innerHTML = '';
      return;
    }
    if (name === 'echo') {
      appendLine(args.join(' '));
      return;
    }
    if (name === 'date') {
      appendLine(new Date().toLocaleDateString());
      return;
    }
    if (name === 'time') {
      appendLine(new Date().toLocaleTimeString());
      return;
    }
    if (name === 'open') {
      if (args[0] && window.windowManager) {
        const type = args[0].toLowerCase();
        const existing = Array.from(window.windowManager.windows.entries()).find(([, v]) => v.type === type);
        if (existing) {
          window.windowManager.handleRestore(existing[0]);
        } else {
          window.windowManager.createWindow(type, type.charAt(0).toUpperCase() + type.slice(1), type === 'browser' ? '🌐' : type === 'cmd' ? '💻' : '✉️');
        }
      } else {
        appendLine('Usage: open <browser|cmd|email>');
      }
      return;
    }
    if (name === 'mail') {
      if (window.windowManager) {
        const existing = Array.from(window.windowManager.windows.entries()).find(([, v]) => v.type === 'email');
        if (existing) window.windowManager.handleRestore(existing[0]);
        else window.windowManager.createWindow('email', 'Mail', '✉️');
      }
      return;
    }
    if (name === 'exit') {
      const closeBtn = windowElement.querySelector('.close-btn');
      if (closeBtn) closeBtn.click();
      return;
    }
    if (COMMANDS[name]) {
      COMMANDS[name].forEach(l => appendLine(l));
      return;
    }
    appendLine(`${name}: command not found`);
  }

  // Focus the proxy when window is clicked (use capture phase for reliability)
  windowElement.addEventListener('mousedown', (e) => {
    const control = e.target.closest('.control-btn, .tab-close, .new-tab-button');
    if (control) return;
    // Always focus proxy on any click in the window
    e.preventDefault();
    proxy.focus();
  }, true);

  if (proxy) {
    // Sync proxy input to display
    proxy.addEventListener('input', () => {
      display.textContent = proxy.value;
      content.scrollTop = content.scrollHeight;
    });

    // Handle Enter key
    proxy.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const text = proxy.value;
        appendLine(`C:\\Users\\root> ${text}`);
        runCommand(text);
        proxy.value = '';
        display.textContent = '';
        content.scrollTop = content.scrollHeight;
      }
    });

    // Focus on init
    setTimeout(() => proxy.focus(), 50);
  }
}

export default { htmlTemplate, init };
