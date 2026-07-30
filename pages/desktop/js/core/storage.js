// ============================================================================
// PERSISTENT STORAGE
// ============================================================================

const KEY = 'momo-os:state';
const CURRENT_VERSION = 1;
const MAX_BYTES = 64 * 1024;
const SAVE_DEBOUNCE_MS = 400;

/**
 * Migrations from version N to N+1. Adding a field to `apps` or `prefs` needs
 * no migration — unknown keys are preserved on write — so this stays empty
 * until the shape itself changes.
 * @type {Record<number, (state: object) => object>}
 */
const MIGRATIONS = {};

function defaults() {
  return {
    v: CURRENT_VERSION,
    savedAt: 0,
    session: { focusedWindow: null, windows: [] },
    desktop: { selectedIcon: null, firstRunCompleted: false },
    apps: {},
    prefs: { theme: 'dark', reducedMotion: null }
  };
}

/** localStorage can throw outright in Safari private mode. */
function safeRead() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function safeWrite(value) {
  try {
    localStorage.setItem(KEY, value);
    return true;
  } catch {
    // Quota exceeded or storage disabled — degrade to in-memory only.
    return false;
  }
}

/**
 * Reads and migrates persisted state.
 *
 * Never throws and never returns a partially-migrated object: malformed JSON, a
 * version from the future, or a migration that fails all fall back to defaults.
 * A corrupt blob must not leave the user staring at a blank desktop.
 */
export function load() {
  const raw = safeRead();
  if (!raw) return defaults();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn('Stored desktop state was not valid JSON; starting fresh.');
    return defaults();
  }

  if (!parsed || typeof parsed !== 'object' || typeof parsed.v !== 'number') {
    return defaults();
  }

  if (parsed.v > CURRENT_VERSION) {
    console.warn(`Stored state is v${parsed.v}, newer than v${CURRENT_VERSION}; starting fresh.`);
    return defaults();
  }

  let state = parsed;
  try {
    for (let v = state.v; v < CURRENT_VERSION; v++) {
      const migrate = MIGRATIONS[v];
      if (!migrate) throw new Error(`no migration from v${v}`);
      state = migrate(state);
      state.v = v + 1;
    }
  } catch (error) {
    console.warn('Migrating stored desktop state failed; starting fresh.', error);
    return defaults();
  }

  // Merge over defaults so a missing section can never crash a reader.
  const base = defaults();
  return {
    ...base,
    ...state,
    session: { ...base.session, ...state.session },
    desktop: { ...base.desktop, ...state.desktop },
    apps: { ...base.apps, ...state.apps },
    prefs: { ...base.prefs, ...state.prefs }
  };
}

let saveTimer = null;
let queued = null;

function writeNow(state) {
  const payload = JSON.stringify({ ...state, v: CURRENT_VERSION, savedAt: Date.now() });
  if (payload.length > MAX_BYTES) {
    console.warn(`Desktop state is ${payload.length}B, over the ${MAX_BYTES}B cap; not saving.`);
    return false;
  }
  return safeWrite(payload);
}

/**
 * Debounced save. Dragging a window emits a move event per frame, so writing
 * synchronously would hammer localStorage.
 */
export function save(state) {
  queued = state;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    if (queued) writeNow(queued);
    queued = null;
  }, SAVE_DEBOUNCE_MS);
}

/** Writes any pending save immediately (used on pagehide). */
export function flush() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (queued) {
    writeNow(queued);
    queued = null;
  }
}

/** Read-modify-write helper. */
export function patch(mutator) {
  const state = load();
  const next = mutator(state) ?? state;
  save(next);
  return next;
}

export function reset() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  queued = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing we can do */
  }
}

export const STORAGE_KEY = KEY;
