// Email Component JavaScript

const EMAIL_ICON = '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="40" height="32" rx="3" fill="#0078D4"/><path d="M4 12 L24 26 L44 12" stroke="#ffffff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M4 12 L24 26 L44 12" fill="none" stroke="#003d7a" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.3"/></svg>';

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
  <div class="email-header">
    <div class="email-header-content">
      <div class="header-icon">
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
          <rect x="4" y="8" width="40" height="32" rx="3" fill="#0078D4"/>
          <path d="M4 12 L24 26 L44 12" stroke="#ffffff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="header-text">
        <h2>Get in Touch</h2>
        <p>I'd love to hear from you! Let's connect and discuss your ideas.</p>
      </div>
    </div>
  </div>

  <div class="outlook-main">
    <div class="compose-form">
      <div class="form-row">
        <div class="form-group">
          <label for="visitor-name">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Name *
          </label>
          <input type="text" id="visitor-name" class="form-input" placeholder="John Doe" required>
        </div>

        <div class="form-group">
          <label for="visitor-email">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Email *
          </label>
          <input type="email" id="visitor-email" class="form-input" placeholder="john.doe@example.com" required>
        </div>
      </div>

      <div class="form-group">
        <label for="visitor-subject">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          Subject
        </label>
        <input type="text" id="visitor-subject" class="form-input" placeholder="What would you like to discuss?">
      </div>

      <div class="form-group">
        <label for="visitor-message">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
          Message *
        </label>
        <textarea id="visitor-message" class="form-input form-textarea" placeholder="Share your thoughts, questions, or project ideas..." rows="6" required></textarea>
      </div>

      <button class="outlook-send-btn">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        Send Message
      </button>

      <div class="contact-info">
        <h3>Connect With Me</h3>
        <div class="contact-links">
          <a href="https://linkedin.com/in/jakub-adamczyk-software" target="_blank" class="contact-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            <span>LinkedIn</span>
          </a>
          <a href="https://github.com/MoMoiin" target="_blank" class="contact-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            <span>GitHub</span>
          </a>
          <a href="mailto:kubaadamczyk2002@gmail.com" class="contact-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>kubaadamczyk2002@gmail.com</span>
          </a>
        </div>
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
  // Email form initialization
  const sendBtn = windowElement.querySelector('.outlook-send-btn');
  const nameInput = windowElement.querySelector('#visitor-name');
  const emailInput = windowElement.querySelector('#visitor-email');
  const subjectInput = windowElement.querySelector('#visitor-subject');
  const messageInput = windowElement.querySelector('#visitor-message');

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

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Create mailto link
      const mailtoLink = `mailto:kubaadamczyk2002@gmail.com?subject=${encodeURIComponent(subject || 'Contact Form Submission')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      
      // Show success message
      const originalText = sendBtn.innerHTML;
      sendBtn.innerHTML = '<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"currentColor\"><path d=\"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z\"/></svg> Message Sent!';
      sendBtn.style.pointerEvents = 'none';
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Reset form after short delay
      setTimeout(() => {
        nameInput.value = '';
        emailInput.value = '';
        subjectInput.value = '';
        messageInput.value = '';
        sendBtn.innerHTML = originalText;
        sendBtn.style.pointerEvents = '';
        nameInput.focus();
      }, 2000);
    });
  }
  
  // Focus on name field when window opens
  if (nameInput) {
    setTimeout(() => nameInput.focus(), 100);
  }
}


export default { htmlTemplate, init };
