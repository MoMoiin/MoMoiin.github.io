// Email Component JavaScript

const EMAIL_ICON = '<svg viewBox="0 0 24 24" style="width:16px;height:16px;"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0078D4"/><path d="M2 6l10 7 10-7" stroke="#ffffff" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>';

export const htmlTemplate = `<!-- Email Window Component (Outlook Style) -->
<div class="chrome-tabs">
  <div class="tab-container">
    <div class="tab active">
      <div class="tab-content">
        <span class="tab-icon">${EMAIL_ICON}</span>
        <span class="tab-title">MoMo Mail</span>
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
<div class="window-content email-outlook">
 

  <div class="outlook-main">
    <div class="compose-form">
      <h2>Contact Me!</h2>
      <p class="compose-subtitle">I'd love to hear from you! Whether you have a question or just want to chat about any kind of development, feel free to reach out.</p>
      
      <div class="form-group">
        <label for="visitor-name">Name *</label>
        <input type="text" id="visitor-name" class="form-input" placeholder="Your name" required>
      </div>

      <div class="form-group">
        <label for="visitor-email">Email *</label>
        <input type="email" id="visitor-email" class="form-input" placeholder="your.email@example.com" required>
      </div>

      <div class="form-group">
        <label for="visitor-subject">Subject</label>
        <input type="text" id="visitor-subject" class="form-input" placeholder="What is this about?">
      </div>

      <div class="form-group">
        <label for="visitor-message">Message *</label>
        <textarea id="visitor-message" class="form-input form-textarea" placeholder="Your message here..." rows="8" required></textarea>
      </div>

      <button class="outlook-send-btn">Send Email</button>

      <div class="contact-info">
        <h3>Other Ways to Connect</h3>
        <ul>
          <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/jakub-adamczyk-software" target="_blank">linkedin.com/in/jakub-adamczyk-software</a></li>
          <li><strong>GitHub:</strong> <a href="https://github.com/MoMoiin" target="_blank">github.com/MoMoiin</a></li>
          <li><strong>Email:</strong> <a href="mailto:kubaadamczyk2002@gmail.com">kubaadamczyk2002@gmail.com</a></li>
        </ul>
      </div>
    </div>
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
  // Outlook-style email initialization
  const composeBtn = windowElement.querySelector('.outlook-compose-btn');
  const sendBtn = windowElement.querySelector('.outlook-send-btn');
  const folderItems = windowElement.querySelectorAll('.folder-item');
  const nameInput = windowElement.querySelector('#visitor-name');
  const emailInput = windowElement.querySelector('#visitor-email');
  const subjectInput = windowElement.querySelector('#visitor-subject');
  const messageInput = windowElement.querySelector('#visitor-message');
  
  // Folder selection
  folderItems.forEach(folder => {
    folder.addEventListener('click', () => {
      folderItems.forEach(f => f.classList.remove('active'));
      folder.classList.add('active');
    });
  });

  // New email button
  if (composeBtn) {
    composeBtn.addEventListener('click', () => {
      nameInput.value = '';
      emailInput.value = '';
      subjectInput.value = '';
      messageInput.value = '';
      nameInput.focus();
    });
  }

  // Send email
  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();
      
      if (!name || !email || !message) {
        alert('Please fill in all required fields (Name, Email, Message)');
        return;
      }

      // Create mailto link
      const mailtoLink = `mailto:kubaadamczyk2002@gmail.com?subject=${encodeURIComponent(subject || 'Contact Form Submission')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailtoLink;
      
      // Reset form
      nameInput.value = '';
      emailInput.value = '';
      subjectInput.value = '';
      messageInput.value = '';
      nameInput.focus();
    });
  }
}


export default { htmlTemplate, init };
