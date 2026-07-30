// Moved verbatim from js/index.js in the Phase 2 module split.

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  const date = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
  
  const timeEl = document.querySelector('.time');
  const dateEl = document.querySelector('.date');
  
  if (timeEl) timeEl.textContent = time;
  if (dateEl) dateEl.textContent = date;
}

export { updateClock };
