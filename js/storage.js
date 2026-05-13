/**
 * storage.js
 * LocalStorage read/write with try/catch and in-memory fallback.
 * All values are validated before use.
 */

import { isValidTimezone } from './timezones.js';

const KEY_TIMEZONES = 'wtb_timezones';
const KEY_PREFS     = 'wtb_prefs';

/** In-memory fallback when LocalStorage is unavailable */
const _mem = {
  timezones: null,
  prefs: null,
};

/**
 * Read saved timezone list from LocalStorage.
 * Returns an array of valid IANA tz strings, or null if nothing saved.
 * @returns {string[] | null}
 */
function loadTimezones() {
  try {
    const raw = localStorage.getItem(KEY_TIMEZONES);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Validate each entry against known-good list
    return parsed.filter(tz => typeof tz === 'string' && isValidTimezone(tz));
  } catch {
    return _mem.timezones;
  }
}

/**
 * Save timezone list to LocalStorage.
 * @param {string[]} timezones
 */
function saveTimezones(timezones) {
  _mem.timezones = timezones;
  try {
    localStorage.setItem(KEY_TIMEZONES, JSON.stringify(timezones));
  } catch (err) {
    console.error('[storage] Failed to save timezones:', err);
  }
}

/**
 * @typedef {Object} Prefs
 * @property {'dark'|'light'} theme
 * @property {12|24} hourFormat
 */

/** @returns {Prefs} */
function defaultPrefs() {
  return { theme: 'dark', hourFormat: 24 };
}

/**
 * Load user preferences from LocalStorage.
 * @returns {Prefs}
 */
function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY_PREFS);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return defaultPrefs();
    return {
      theme:      parsed.theme === 'light' ? 'light' : 'dark',
      hourFormat: parsed.hourFormat === 12 ? 12 : 24,
    };
  } catch {
    return _mem.prefs ?? defaultPrefs();
  }
}

/**
 * Save user preferences to LocalStorage.
 * @param {Prefs} prefs
 */
function savePrefs(prefs) {
  _mem.prefs = prefs;
  try {
    localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
  } catch (err) {
    console.error('[storage] Failed to save prefs:', err);
  }
}

export { loadTimezones, saveTimezones, loadPrefs, savePrefs };
