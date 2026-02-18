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
  <div class="cmd-line"></div>
  <div class="cmd-line">C:\\Users\\Jakub> </div>
  <div class="cmd-input" contenteditable="true"></div>
  <div class="cmd-output">
    <p>Welcome to the Command Prompt Window!</p>
    <p>This is a demo terminal window.</p>
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
  // CMD-specific initialization
  const cmdInput = windowElement.querySelector('.cmd-input');
  
  if (cmdInput) {
    cmdInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = cmdInput.textContent;
        const output = windowElement.querySelector('.cmd-output');
        
        // Create new output line
        const newLine = document.createElement('div');
        newLine.className = 'cmd-line';
        newLine.textContent = `C:\\Users\\root> ${text}`;
        output.appendChild(newLine);
        
        // Clear input
        cmdInput.textContent = '';
        
        // Scroll to bottom
        windowElement.querySelector('.window-content').scrollTop = 
          windowElement.querySelector('.window-content').scrollHeight;
      }
    });
  }
}

export default { htmlTemplate, init };
