// ============================================================================
// CONSTANTS & ICONS
// ============================================================================

export const WINDOW_TYPES = {
  BROWSER: 'browser',
  TERMINAL: 'cmd',
  EMAIL: 'email',
  EXPLORER: 'explorer',
  SETTINGS: 'settings',
  CALCULATOR: 'calculator',
  NOTES: 'notes',
  PHOTOS: 'photos'
};

export const ICON_TYPES = {
  THIS_PC: 'thispc',
  RECYCLE_BIN: 'recycle-bin'
};

// SVG Icons - High Quality Versions
export const SVG_ICONS = {
  browser: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" fill="#F4B400"/><circle cx="24" cy="24" r="14" fill="#0F9D58"/><circle cx="26" cy="22" r="5" fill="#4285F4"/><path d="M24 4 A20 20 0 0 1 38 10" fill="none" stroke="#EA4335" stroke-width="5" stroke-linecap="round"/><path d="M38 10 A20 20 0 0 1 44 24" fill="none" stroke="#F4B400" stroke-width="5" stroke-linecap="round"/><path d="M44 24 A20 20 0 0 1 24 44" fill="none" stroke="#0F9D58" stroke-width="5" stroke-linecap="round"/></svg>',
  cmd: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="40" height="36" rx="3" fill="#0A1929" stroke="#0078D4" stroke-width="2"/><rect x="6" y="8" width="36" height="32" rx="2" fill="#000D26"/><path d="M12 20 L18 24 L12 28" stroke="#00DD00" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="22" y="26" width="12" height="2" fill="#00DD00" rx="1"/></svg>',
  email: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="8" width="40" height="32" rx="3" fill="#0078D4"/><path d="M4 12 L24 26 L44 12" stroke="#ffffff" stroke-width="3" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M4 12 L24 26 L44 12" fill="none" stroke="#003d7a" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.3"/></svg>',
  explorer: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FFD54F;stop-opacity:1" /><stop offset="100%" style="stop-color:#FFC107;stop-opacity:1" /></linearGradient></defs><path d="M10 4H4c-1.1 0-2 .9-2 2v24c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4H23l-3-4H8z" fill="url(#folderGrad)"/><path d="M8 16h32v20H8z" fill="#FFE082" opacity="0.5"/></svg>',
  thispc: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="8" width="32" height="24" rx="2" fill="#1e293b" stroke="#475569" stroke-width="2"/><rect x="10" y="10" width="28" height="18" fill="#0ea5e9"/><rect x="18" y="32" width="12" height="2" fill="#475569" rx="1"/><rect x="14" y="34" width="20" height="4" rx="2" fill="#334155"/></svg>',
  recyclebin: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M12 38c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V14H12v24z" fill="#607d8b"/><path d="M38 8h-8l-2-2H20l-2 2h-8v4h28V8z" fill="#455a64"/><rect x="18" y="18" width="2" height="18" fill="#eceff1" rx="1"/><rect x="24" y="18" width="2" height="18" fill="#eceff1" rx="1"/><rect x="30" y="18" width="2" height="18" fill="#eceff1" rx="1"/></svg>'
};

export const APP_DEFINITIONS = [
  { name: 'Browser', icon: SVG_ICONS.browser, type: WINDOW_TYPES.BROWSER },
  { name: 'Terminal', icon: SVG_ICONS.cmd, type: WINDOW_TYPES.TERMINAL },
  { name: 'Mail', icon: SVG_ICONS.email, type: WINDOW_TYPES.EMAIL },
  { name: 'Explorer', icon: SVG_ICONS.explorer, type: WINDOW_TYPES.EXPLORER },
  { name: 'Settings', icon: '⚙️', type: WINDOW_TYPES.SETTINGS },
  { name: 'Calculator', icon: '🔢', type: WINDOW_TYPES.CALCULATOR },
  { name: 'Notes', icon: '📝', type: WINDOW_TYPES.NOTES },
  { name: 'Photos', icon: '🖼️', type: WINDOW_TYPES.PHOTOS }
];

export const CONTEXT_MENU_ITEMS = [
  { icon: '📁', label: 'New Folder', action: 'new-folder' },
  { icon: '📄', label: 'New Text Document', action: 'new-document' },
  { type: 'separator' },
  { icon: '🔄', label: 'Refresh', action: 'refresh' },
  { type: 'separator' },
  { icon: '🖼️', label: 'Personalize', action: 'personalize' },
  { icon: '⚙️', label: 'Display settings', action: 'display-settings' }
];
