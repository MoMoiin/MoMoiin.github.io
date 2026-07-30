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

// Windows 11 / Fluent-style icons.
// Light source is top-left; gradient and filter ids are all prefixed `mo-` and
// unique, because these strings are injected repeatedly (desktop, taskbar, tabs,
// switcher) and SVG ids live in one global document namespace.
export const SVG_ICONS = {
  browser: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-br-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f36b60"/><stop offset="1" stop-color="#d93025"/></linearGradient><linearGradient id="mo-br-yellow" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd964"/><stop offset="1" stop-color="#f0a500"/></linearGradient><linearGradient id="mo-br-green" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0f9d58"/><stop offset="1" stop-color="#39c17d"/></linearGradient><radialGradient id="mo-br-blue" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8ab8f7"/><stop offset=".5" stop-color="#4285f4"/><stop offset="1" stop-color="#1a63d4"/></radialGradient></defs><circle cx="24" cy="24" r="20" fill="#e9eef5"/><path d="M24 4a20 20 0 0 1 17.3 10H24a10 10 0 0 0-9.2 6.1L6.7 14A20 20 0 0 1 24 4z" fill="url(#mo-br-red)"/><path d="M41.3 14A20 20 0 0 1 24 44l8.4-14.6A10 10 0 0 0 33 14z" fill="url(#mo-br-yellow)"/><path d="M24 44A20 20 0 0 1 6.7 14l8.1 6.1a10 10 0 0 0 8.3 15z" fill="url(#mo-br-green)"/><circle cx="24" cy="24" r="10.4" fill="#fff"/><circle cx="24" cy="24" r="8.2" fill="url(#mo-br-blue)"/><path d="M24 15.8a8.2 8.2 0 0 1 6.6 3.3A8.2 8.2 0 0 0 24 32.2z" fill="#fff" fill-opacity=".22"/></svg>',
  cmd: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-cmd-frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b4a63"/><stop offset="1" stop-color="#161d2b"/></linearGradient><linearGradient id="mo-cmd-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#132033"/><stop offset=".6" stop-color="#0a1220"/><stop offset="1" stop-color="#060b14"/></linearGradient><linearGradient id="mo-cmd-title" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8fdd"/><stop offset="1" stop-color="#1b6bb0"/></linearGradient><linearGradient id="mo-cmd-gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="4" y="8" width="40" height="32" rx="3.6" fill="url(#mo-cmd-frame)"/><path d="M7.6 8h32.8a3.6 3.6 0 0 1 3.6 3.6v2.6H4v-2.6A3.6 3.6 0 0 1 7.6 8z" fill="url(#mo-cmd-title)"/><g fill="#fff" fill-opacity=".78"><circle cx="9" cy="11.1" r="1.1"/><circle cx="12.8" cy="11.1" r="1.1"/><circle cx="16.6" cy="11.1" r="1.1"/></g><rect x="6.6" y="16.6" width="34.8" height="20.8" rx="2" fill="url(#mo-cmd-screen)"/><path d="M11.4 22.6 15.9 26l-4.5 3.4" fill="none" stroke="#3ff07a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><rect x="18.6" y="28" width="11.4" height="2.2" rx="1.1" fill="#3ff07a" fill-opacity=".92"/><path d="M6.6 16.6h34.8v6L6.6 30z" fill="url(#mo-cmd-gloss)"/><rect x="4" y="8" width="40" height="32" rx="3.6" fill="none" stroke="#5d6d88" stroke-opacity=".5"/></svg>',
  email: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-mail-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4aa3ea"/><stop offset=".55" stop-color="#1f7fd0"/><stop offset="1" stop-color="#12599b"/></linearGradient><linearGradient id="mo-mail-flap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7d4f7"/><stop offset="1" stop-color="#6fb2e8"/></linearGradient><linearGradient id="mo-mail-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e4ecf5"/></linearGradient></defs><rect x="4" y="11" width="40" height="26" rx="3.2" fill="url(#mo-mail-body)"/><path d="M10.5 14h27v12.5h-27z" fill="url(#mo-mail-sheet)"/><g fill="#c3d3e5"><rect x="13.5" y="17" width="21" height="1.6" rx=".8"/><rect x="13.5" y="20.2" width="21" height="1.6" rx=".8"/><rect x="13.5" y="23.4" width="13.5" height="1.6" rx=".8"/></g><path d="M4 14.2 24 28.4 44 14.2v-0.1a3.1 3.1 0 0 0-3.1-3.1H7.1A3.1 3.1 0 0 0 4 14.1z" fill="url(#mo-mail-flap)"/><path d="M4 14.2 24 28.4 44 14.2v2.9L24 31.3 4 17.1z" fill="#0b4677" fill-opacity=".32"/><path d="M4.4 36.2 18.6 25.4l5.4 3.9 5.4-3.9L43.6 36.2a3.1 3.1 0 0 1-2.7 1.6H7.1a3.1 3.1 0 0 1-2.7-1.6z" fill="url(#mo-mail-body)"/><path d="M4.4 36.2 18.6 25.4l1.3.9L5.1 37.1z" fill="#fff" fill-opacity=".2"/></svg>',
  explorer: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-fold-back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd977"/><stop offset="1" stop-color="#f0ab27"/></linearGradient><linearGradient id="mo-fold-front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffcf5c"/><stop offset=".55" stop-color="#fcbb35"/><stop offset="1" stop-color="#e3941a"/></linearGradient><linearGradient id="mo-fold-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#dfe7f0"/></linearGradient></defs><path d="M6 10.5h12.4l3.4 4.4H42a2.8 2.8 0 0 1 2.8 2.8v3.1H3.2v-7.5A2.8 2.8 0 0 1 6 10.5z" fill="url(#mo-fold-back)"/><rect x="12" y="16.4" width="24" height="7.5" rx="1.4" fill="url(#mo-fold-sheet)"/><path d="M3.2 20.2h41.6v14.6a2.9 2.9 0 0 1-2.9 2.9H6.1a2.9 2.9 0 0 1-2.9-2.9z" fill="url(#mo-fold-front)"/><path d="M3.2 20.2h41.6v2.2H3.2z" fill="#fff" fill-opacity=".35"/></svg>',
  thispc: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-pc-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5eb8f5"/><stop offset=".5" stop-color="#2f8fdd"/><stop offset="1" stop-color="#1667a8"/></linearGradient><linearGradient id="mo-pc-bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5568"/><stop offset="1" stop-color="#232c3b"/></linearGradient><linearGradient id="mo-pc-stand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4658"/><stop offset="1" stop-color="#1c2331"/></linearGradient><linearGradient id="mo-pc-gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect x="15" y="36" width="18" height="5" rx="1.4" fill="url(#mo-pc-stand)"/><rect x="11" y="40" width="26" height="3.4" rx="1.7" fill="#2b3446"/><rect x="4" y="7" width="40" height="29" rx="3.4" fill="url(#mo-pc-bezel)"/><rect x="6.4" y="9.4" width="35.2" height="21.6" rx="1.8" fill="url(#mo-pc-screen)"/><path d="M6.4 9.4h35.2v10.5L6.4 27z" fill="url(#mo-pc-gloss)"/><rect x="6.4" y="9.4" width="35.2" height="21.6" rx="1.8" fill="none" stroke="#0d1420" stroke-opacity=".45"/><rect x="4" y="7" width="40" height="29" rx="3.4" fill="none" stroke="#6b7689" stroke-opacity=".55"/><circle cx="24" cy="33.6" r="0.9" fill="#8fa2bd"/></svg>',
  recyclebin: '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="mo-bin-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb2c6"/><stop offset=".45" stop-color="#7590aa"/><stop offset="1" stop-color="#4d647c"/></linearGradient><linearGradient id="mo-bin-lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9bccf"/><stop offset="1" stop-color="#65809b"/></linearGradient><linearGradient id="mo-bin-gloss" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".35" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="M12.6 14.6h22.8l-2 25A3.3 3.3 0 0 1 30.1 42.6H17.9a3.3 3.3 0 0 1-3.3-3z" fill="url(#mo-bin-body)"/><path d="M12.6 14.6h23l-.2 2.6H12.8z" fill="#3f5568" fill-opacity=".5"/><path d="M12.6 14.6h6.6l-1.2 28h-.1a3.3 3.3 0 0 1-3.3-3z" fill="url(#mo-bin-gloss)"/><g fill="#eef3f9" fill-opacity=".85"><rect x="18.5" y="20.4" width="2.2" height="16.4" rx="1.1"/><rect x="22.9" y="20.4" width="2.2" height="16.4" rx="1.1"/><rect x="27.3" y="20.4" width="2.2" height="16.4" rx="1.1"/></g><rect x="9.2" y="9.8" width="29.6" height="5" rx="2.5" fill="url(#mo-bin-lid)"/><path d="M19.6 6.6h8.8a2 2 0 0 1 2 2v1.2h-12.8V8.6a2 2 0 0 1 2-2z" fill="#5d768f"/><rect x="9.2" y="9.8" width="29.6" height="1.9" rx=".95" fill="#fff" fill-opacity=".34"/></svg>'
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
  { icon: '♻️', label: 'Reset desktop', action: 'reset-desktop' },
  { type: 'separator' },
  { icon: '🖼️', label: 'Personalize', action: 'personalize' },
  { icon: '⚙️', label: 'Display settings', action: 'display-settings' }
];
