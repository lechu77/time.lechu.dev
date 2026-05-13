/**
 * app.js
 * Main application controller.
 * Clock loop, DOM rendering, event handling.
 */

import { searchTimezones, getUtcOffset, getEntryForTz, isValidTimezone, parseOffsetQuery } from './timezones.js';
import { loadTimezones, saveTimezones, loadPrefs, savePrefs } from './storage.js';

/* ── Default timezones shown on first visit ─────────────────── */
const DEFAULT_TIMEZONES = [
  'Europe/Madrid',
  'Europe/Lisbon',
  'America/Buenos_Aires',
  'Europe/Berlin',
  'UTC',
  'Europe/Paris',
];

/* ── State ──────────────────────────────────────────────────── */
/** @type {string[]} Active IANA tz IDs */
let activeTzList = [];
let prefs = { theme: 'dark', hourFormat: 24 };
let tickInterval = null;
let selectedSuggestionIndex = -1;

/* ── DOM refs ───────────────────────────────────────────────── */
const grid          = document.getElementById('tz-grid');
const gridEmpty     = document.getElementById('grid-empty');
const searchInput   = document.getElementById('tz-search');
const suggestions   = document.getElementById('tz-suggestions');
const addBtn        = document.getElementById('add-tz-btn');
const themeToggle   = document.getElementById('theme-toggle');
const formatToggle  = document.getElementById('format-toggle');
const hourBar       = document.getElementById('hour-bar');
const crosshairTip  = document.getElementById('crosshair-tooltip');

/* ── Init ───────────────────────────────────────────────────── */
function init() {
  prefs = loadPrefs();
  applyTheme(prefs.theme);
  applyFormatLabel(prefs.hourFormat);

  activeTzList = resolveInitialTimezones();
  renderGrid();
  renderHourBar();
  startClock();
  bindEvents();
  bindCrosshairEvents();
}

/**
 * Determine initial timezone list from URL hash → LocalStorage → defaults.
 * @returns {string[]}
 */
function resolveInitialTimezones() {
  const fromHash = parseHashTimezones();
  if (fromHash && fromHash.length > 0) return fromHash;

  const fromStorage = loadTimezones();
  if (fromStorage && fromStorage.length > 0) return fromStorage;

  // Deduplicate defaults
  const seen = new Set();
  const result = [];
  for (const tz of DEFAULT_TIMEZONES) {
    if (!seen.has(tz) && isValidTimezone(tz)) {
      seen.add(tz);
      result.push(tz);
    }
  }
  return result;
}

/* ── URL hash ───────────────────────────────────────────────── */
/**
 * Parse timezone list from URL hash.
 * @returns {string[]|null}
 */
function parseHashTimezones() {
  try {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const decoded = decodeURIComponent(hash);
    const parts = decoded.split(',');
    const valid = parts.filter(tz => typeof tz === 'string' && isValidTimezone(tz));
    return valid.length > 0 ? valid : null;
  } catch {
    return null;
  }
}

function updateUrlHash() {
  try {
    const hash = activeTzList.map(tz => encodeURIComponent(tz)).join(',');
    history.replaceState(null, '', '#' + hash);
  } catch {
    // Non-critical — ignore
  }
}

/* ── Theme ──────────────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  applyTheme(prefs.theme);
  savePrefs(prefs);
}

/* ── Hour format ────────────────────────────────────────────── */
function applyFormatLabel(fmt) {
  const label = formatToggle.querySelector('.format-label');
  if (label) label.textContent = fmt === 12 ? '12H' : '24H';
}

function toggleFormat() {
  prefs.hourFormat = prefs.hourFormat === 24 ? 12 : 24;
  applyFormatLabel(prefs.hourFormat);
  savePrefs(prefs);
  // Re-render all time displays immediately
  tickAll();
}

/* ── Clock loop ─────────────────────────────────────────────── */
function startClock() {
  if (tickInterval) clearInterval(tickInterval);
  tickAll();
  tickInterval = setInterval(tickAll, 1000);
}

function tickAll() {
  const now = new Date();
  const currentHour = now.getHours(); // local hour for hour-bar highlight

  for (const col of grid.querySelectorAll('.tz-col')) {
    const tz = col.dataset.tz;
    if (!tz) continue;
    updateColumnTime(col, tz, now);
  }

  updateHourBarHighlight(currentHour);
}

/* ── Grid rendering ─────────────────────────────────────────── */
function renderGrid() {
  while (grid.firstChild) grid.removeChild(grid.firstChild);

  for (const tz of activeTzList) {
    const col = buildColumn(tz);
    if (col) grid.appendChild(col);
  }

  gridEmpty.hidden = activeTzList.length > 0;
}

/**
 * Build a timezone column element.
 * @param {string} tz
 * @returns {HTMLElement|null}
 */
function buildColumn(tz) {
  if (!isValidTimezone(tz)) return null;

  const entry = getEntryForTz(tz);
  const now = new Date();

  const col = document.createElement('article');
  col.className = 'tz-col';
  col.dataset.tz = tz;
  col.setAttribute('role', 'listitem');
  col.setAttribute('aria-label', entry.city + ' timezone');

  // Header
  const header = document.createElement('div');
  header.className = 'tz-col__header';

  const cityWrap = document.createElement('div');
  cityWrap.style.overflow = 'hidden';
  cityWrap.style.flex = '1';

  const cityEl = document.createElement('div');
  cityEl.className = 'tz-col__city';
  cityEl.textContent = entry.city;

  const tzIdEl = document.createElement('div');
  tzIdEl.className = 'tz-col__tz-id';
  tzIdEl.textContent = getUtcOffset(tz);

  cityWrap.appendChild(cityEl);
  cityWrap.appendChild(tzIdEl);

  const removeBtn = document.createElement('button');
  removeBtn.className = 'tz-col__remove';
  removeBtn.setAttribute('aria-label', 'Remove ' + entry.city);
  removeBtn.setAttribute('title', 'Remove');
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => removeTimezone(tz));

  header.appendChild(cityWrap);
  header.appendChild(removeBtn);

  // Clock display
  const clockDiv = document.createElement('div');
  clockDiv.className = 'tz-col__clock';

  const timeEl = document.createElement('span');
  timeEl.className = 'tz-col__time';
  timeEl.setAttribute('aria-live', 'off');

  const dateEl = document.createElement('div');
  dateEl.className = 'tz-col__date';

  clockDiv.appendChild(timeEl);
  clockDiv.appendChild(dateEl);

  // Hour list
  const hoursList = document.createElement('div');
  hoursList.className = 'tz-col__hours';
  hoursList.setAttribute('aria-hidden', 'true');

  for (let h = 0; h < 24; h++) {
    const row = document.createElement('div');
    row.className = 'tz-col__hour-row';
    row.dataset.hour = String(h);

    const label = document.createElement('span');
    label.className = 'tz-col__hour-label';

    const bar = document.createElement('span');
    bar.className = 'tz-col__hour-bar-fill';

    row.appendChild(label);
    row.appendChild(bar);
    hoursList.appendChild(row);
  }

  col.appendChild(header);
  col.appendChild(clockDiv);
  col.appendChild(hoursList);

  // Initial render
  updateColumnTime(col, tz, now);

  return col;
}

/**
 * Update the time display and hour highlight for a single column.
 * Only touches text nodes — no full re-render.
 * @param {HTMLElement} col
 * @param {string} tz
 * @param {Date} now
 */
function updateColumnTime(col, tz, now) {
  try {
    const timeEl   = col.querySelector('.tz-col__time');
    const dateEl   = col.querySelector('.tz-col__date');

    if (!timeEl || !dateEl) return;

    // Format time
    const timeFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: prefs.hourFormat === 12,
    });

    const dateFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      weekday: 'short',
      year:    'numeric',
      month:   'short',
      day:     '2-digit',
    });

    const timeParts = timeFmt.formatToParts(now);
    let timeStr = '';
    let ampm = '';

    for (const p of timeParts) {
      if (p.type === 'dayPeriod') {
        ampm = p.value.toUpperCase();
      } else if (p.type !== 'literal' || timeStr.length > 0) {
        timeStr += p.value;
      }
    }

    // Build time display: HH:MM<small>:SS</small>
    // We use textContent only — split at seconds colon
    const colonIdx = timeStr.lastIndexOf(':');
    if (colonIdx !== -1) {
      const hhmm = timeStr.slice(0, colonIdx);
      const ss   = timeStr.slice(colonIdx); // includes the colon

      // Clear and rebuild
      while (timeEl.firstChild) timeEl.removeChild(timeEl.firstChild);

      timeEl.appendChild(document.createTextNode(hhmm));

      const secSpan = document.createElement('span');
      secSpan.className = 'tz-col__seconds';
      secSpan.textContent = ss;
      timeEl.appendChild(secSpan);

      if (ampm) {
        const ampmSpan = document.createElement('span');
        ampmSpan.className = 'tz-col__ampm';
        ampmSpan.textContent = ' ' + ampm;
        timeEl.appendChild(ampmSpan);
      }
    } else {
      timeEl.textContent = timeStr;
    }

    dateEl.textContent = dateFmt.format(now).toUpperCase();

    // Keep header subtitle (UTC offset) current across DST transitions
    const tzIdEl = col.querySelector('.tz-col__tz-id');
    if (tzIdEl) tzIdEl.textContent = getUtcOffset(tz);

    // Update hour highlight
    const hourFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      hour12: false,
    });
    const currentHourStr = hourFmt.format(now);
    const currentHour = parseInt(currentHourStr, 10);

    const hourRows = col.querySelectorAll('.tz-col__hour-row');
    for (const row of hourRows) {
      const h = parseInt(row.dataset.hour, 10);
      const isCurrent = h === currentHour;
      row.classList.toggle('tz-col__hour-row--current', isCurrent);

      // Update label
      const label = row.querySelector('.tz-col__hour-label');
      if (label) {
        if (prefs.hourFormat === 12) {
          const period = h < 12 ? 'am' : 'pm';
          const h12 = h % 12 === 0 ? 12 : h % 12;
          label.textContent = String(h12).padStart(2, '0') + period;
        } else {
          label.textContent = String(h).padStart(2, '0') + ':00';
        }
      }

      // Scroll current hour into view on first render
      if (isCurrent && row.dataset.scrolled !== '1') {
        row.dataset.scrolled = '1';
        row.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  } catch (err) {
    console.error('[app] Error updating column for tz:', tz, err);
  }
}

/* ── Hour bar (bottom reference) ────────────────────────────── */
function renderHourBar() {
  while (hourBar.firstChild) hourBar.removeChild(hourBar.firstChild);

  for (let h = 0; h < 24; h++) {
    const cell = document.createElement('div');
    cell.className = 'hour-bar__cell';
    cell.dataset.hour = String(h);
    cell.textContent = String(h).padStart(2, '0');
    hourBar.appendChild(cell);
  }
}

function updateHourBarHighlight(currentHour) {
  for (const cell of hourBar.querySelectorAll('.hour-bar__cell')) {
    const h = parseInt(cell.dataset.hour, 10);
    cell.classList.toggle('hour-bar__cell--current', h === currentHour);
  }
}

/* ── Add / Remove timezones ─────────────────────────────────── */
function addTimezone(tz) {
  if (!isValidTimezone(tz)) return;
  if (activeTzList.includes(tz)) {
    closeSuggestions();
    searchInput.value = '';
    return;
  }
  activeTzList.push(tz);
  saveTimezones(activeTzList);
  updateUrlHash();

  const col = buildColumn(tz);
  if (col) {
    grid.appendChild(col);
    gridEmpty.hidden = true;
  }

  closeSuggestions();
  searchInput.value = '';
  searchInput.setAttribute('aria-expanded', 'false');
}

function removeTimezone(tz) {
  activeTzList = activeTzList.filter(t => t !== tz);
  saveTimezones(activeTzList);
  updateUrlHash();

  const col = grid.querySelector(`.tz-col[data-tz="${CSS.escape(tz)}"]`);
  if (col) grid.removeChild(col);

  gridEmpty.hidden = activeTzList.length > 0;
}

/* ── Search / Autocomplete ──────────────────────────────────── */
function openSuggestions(results) {
  while (suggestions.firstChild) suggestions.removeChild(suggestions.firstChild);
  selectedSuggestionIndex = -1;

  if (results.length === 0) {
    closeSuggestions();
    return;
  }

  for (let i = 0; i < results.length; i++) {
    const entry = results[i];
    const li = document.createElement('li');
    li.className = 'suggestions__item';
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.dataset.tz = entry.tz;

    const citySpan = document.createElement('span');
    citySpan.className = 'suggestions__city';
    citySpan.textContent = entry.city;

    const tzSpan = document.createElement('span');
    tzSpan.className = 'suggestions__tz';
    tzSpan.textContent = entry.tz;

    const offsetSpan = document.createElement('span');
    offsetSpan.className = 'suggestions__offset';
    offsetSpan.textContent = getUtcOffset(entry.tz);

    li.appendChild(citySpan);
    li.appendChild(tzSpan);
    li.appendChild(offsetSpan);

    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      addTimezone(entry.tz);
    });

    suggestions.appendChild(li);
  }

  suggestions.hidden = false;
  searchInput.setAttribute('aria-expanded', 'true');
}

function closeSuggestions() {
  suggestions.hidden = true;
  searchInput.setAttribute('aria-expanded', 'false');
  selectedSuggestionIndex = -1;
  for (const item of suggestions.querySelectorAll('.suggestions__item')) {
    item.setAttribute('aria-selected', 'false');
  }
}

function moveSuggestionSelection(direction) {
  const items = suggestions.querySelectorAll('.suggestions__item');
  if (items.length === 0) return;

  if (selectedSuggestionIndex >= 0) {
    items[selectedSuggestionIndex].setAttribute('aria-selected', 'false');
  }

  selectedSuggestionIndex += direction;
  if (selectedSuggestionIndex < 0) selectedSuggestionIndex = items.length - 1;
  if (selectedSuggestionIndex >= items.length) selectedSuggestionIndex = 0;

  items[selectedSuggestionIndex].setAttribute('aria-selected', 'true');
  items[selectedSuggestionIndex].scrollIntoView({ block: 'nearest' });
}

function confirmSuggestionSelection() {
  const items = suggestions.querySelectorAll('.suggestions__item');
  if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
    const tz = items[selectedSuggestionIndex].dataset.tz;
    if (tz) addTimezone(tz);
  } else if (items.length === 1) {
    const tz = items[0].dataset.tz;
    if (tz) addTimezone(tz);
  }
}

/* ── Event binding ──────────────────────────────────────────── */
function bindEvents() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Format toggle
  formatToggle.addEventListener('click', toggleFormat);

  // Search input
  searchInput.addEventListener('input', () => {
    const q = searchInput.value;
    if (q.trim().length < 1) {
      closeSuggestions();
      return;
    }
    // Check if the query looks like an offset (UTC-3, GMT+5, +2, -11, etc.)
    const offsetEntry = parseOffsetQuery(q);
    const cityResults = searchTimezones(q, offsetEntry ? 6 : 8);

    // Merge: offset entry first (if matched), then city results
    const results = offsetEntry
      ? [offsetEntry, ...cityResults.filter(r => r.tz !== offsetEntry.tz)]
      : cityResults;

    openSuggestions(results);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (suggestions.hidden) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      moveSuggestionSelection(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveSuggestionSelection(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      confirmSuggestionSelection();
    } else if (e.key === 'Escape') {
      closeSuggestions();
    }
  });

  searchInput.addEventListener('blur', () => {
    // Delay to allow mousedown on suggestion to fire first
    setTimeout(closeSuggestions, 150);
  });

  // Add button
  addBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (!q) return;
    const items = suggestions.querySelectorAll('.suggestions__item');
    if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
      const tz = items[selectedSuggestionIndex].dataset.tz;
      if (tz) { addTimezone(tz); return; }
    }
    if (items.length === 1) {
      const tz = items[0].dataset.tz;
      if (tz) { addTimezone(tz); return; }
    }
    if (isValidTimezone(q)) {
      addTimezone(q);
      return;
    }
    const offsetEntry = parseOffsetQuery(q);
    if (offsetEntry) {
      addTimezone(offsetEntry.tz);
    }
  });

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper') && !e.target.closest('.suggestions')) {
      closeSuggestions();
    }
  });
}

/* ── Crosshair hover ────────────────────────────────────────── */

/**
 * Format a time string for a given tz at a specific wall-clock hour today.
 * We construct a Date set to that hour in UTC-equivalent by using the offset,
 * but the simplest correct approach is: take "now", zero the minutes/seconds,
 * then shift to the target hour in the *source* column's timezone.
 *
 * Strategy: the hour rows represent the 24 local hours of the SOURCE column
 * that the user is hovering. We convert that local hour to a UTC instant,
 * then display that UTC instant in every other column's timezone.
 *
 * @param {string} sourceTz  — timezone of the column being hovered
 * @param {number} localHour — 0-23 hour in sourceTz
 * @param {string} targetTz  — timezone to display the result in
 * @returns {{ time: string, date: string }}
 */
function formatCrosshairTime(sourceTz, localHour, targetTz) {
  try {
    // Build a Date that represents today at localHour:00:00 in sourceTz.
    // We do this by finding today's date string in sourceTz, then parsing
    // it back as a UTC midnight and adding the offset.
    const now = new Date();

    // Get today's date components in sourceTz
    const dateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: sourceTz,
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now);

    const year  = dateParts.find(p => p.type === 'year').value;
    const month = dateParts.find(p => p.type === 'month').value;
    const day   = dateParts.find(p => p.type === 'day').value;

    // Build ISO string for that date at localHour:00:00 in sourceTz
    // by using Intl to find the UTC offset at that moment.
    // We approximate: create a candidate UTC time, check what local hour
    // it produces in sourceTz, then adjust.
    const isoDate = `${year}-${month}-${day}`;
    // Start with a naive UTC guess: midnight UTC + localHour hours
    let candidate = new Date(`${isoDate}T${String(localHour).padStart(2,'0')}:00:00Z`);

    // Get what hour that UTC instant is in sourceTz
    const checkFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: sourceTz, hour: '2-digit', hour12: false,
    });
    const gotHour = parseInt(checkFmt.format(candidate), 10);
    // Shift by the difference (handles DST offsets)
    const diffMs = (localHour - gotHour) * 3600000;
    candidate = new Date(candidate.getTime() + diffMs);

    // Now format candidate in targetTz
    const timeFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: targetTz,
      hour: '2-digit', minute: '2-digit',
      hour12: prefs.hourFormat === 12,
    });
    const dateFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: targetTz,
      weekday: 'short', month: 'short', day: '2-digit',
    });

    return {
      time: timeFmt.format(candidate),
      date: dateFmt.format(candidate).toUpperCase(),
    };
  } catch {
    return { time: '--:--', date: '' };
  }
}

/** Currently highlighted crosshair hour (-1 = none) */
let crosshairHour = -1;
/** The source tz column being hovered */
let crosshairSourceTz = null;

/**
 * Activate crosshair: highlight the given hour row across all columns
 * and show the tooltip near the cursor.
 * @param {number} hour       — 0-23 in sourceTz
 * @param {string} sourceTz   — IANA tz of the hovered column
 * @param {MouseEvent} evt
 */
function showCrosshair(hour, sourceTz, evt) {
  crosshairHour = hour;
  crosshairSourceTz = sourceTz;
  grid.classList.add('tz-grid--crosshair');

  // Highlight matching row in every column
  for (const col of grid.querySelectorAll('.tz-col')) {
    const colTz = col.dataset.tz;
    if (!colTz) continue;

    // The hour rows in each column represent that column's local hours.
    // We need to find which local hour in colTz corresponds to the hovered
    // hour in sourceTz. Compute via the crosshair candidate date.
    const targetHour = getCrosshairHourInTz(sourceTz, hour, colTz);

    for (const row of col.querySelectorAll('.tz-col__hour-row')) {
      const h = parseInt(row.dataset.hour, 10);
      row.classList.toggle('tz-col__hour-row--hover', h === targetHour);
    }
  }

  positionTooltip(hour, sourceTz, evt);
}

/**
 * Given a local hour in sourceTz, return the corresponding local hour in targetTz.
 * @param {string} sourceTz
 * @param {number} localHour
 * @param {string} targetTz
 * @returns {number} 0-23
 */
function getCrosshairHourInTz(sourceTz, localHour, targetTz) {
  try {
    const { time } = formatCrosshairTime(sourceTz, localHour, targetTz);
    // time is "HH:MM" or "HH:MM AM/PM"
    const parts = time.split(':');
    let h = parseInt(parts[0], 10);
    // Handle 12h format: check for PM
    if (prefs.hourFormat === 12 && time.toLowerCase().includes('pm') && h !== 12) h += 12;
    if (prefs.hourFormat === 12 && time.toLowerCase().includes('am') && h === 12) h = 0;
    return h % 24;
  } catch {
    return localHour;
  }
}

/**
 * Build and position the crosshair tooltip.
 * @param {number} hour
 * @param {string} sourceTz
 * @param {MouseEvent} evt
 */
function positionTooltip(hour, sourceTz, evt) {
  // Build content
  while (crosshairTip.firstChild) crosshairTip.removeChild(crosshairTip.firstChild);

  const header = document.createElement('div');
  header.className = 'crosshair-tooltip__header';
  header.textContent = String(hour).padStart(2, '0') + ':00 — ALL ZONES';
  crosshairTip.appendChild(header);

  for (const col of grid.querySelectorAll('.tz-col')) {
    const colTz = col.dataset.tz;
    const colLabel = getEntryForTz(colTz).city;
    if (!colTz) continue;

    const { time, date } = formatCrosshairTime(sourceTz, hour, colTz);

    const row = document.createElement('div');
    row.className = 'crosshair-tooltip__row';

    const cityEl = document.createElement('span');
    cityEl.className = 'crosshair-tooltip__city';
    cityEl.textContent = colLabel.toUpperCase();

    const rightWrap = document.createElement('div');

    const timeEl = document.createElement('div');
    timeEl.className = 'crosshair-tooltip__time';
    timeEl.textContent = time;

    const dateEl = document.createElement('div');
    dateEl.className = 'crosshair-tooltip__date';
    dateEl.textContent = date;

    rightWrap.appendChild(timeEl);
    rightWrap.appendChild(dateEl);
    row.appendChild(cityEl);
    row.appendChild(rightWrap);
    crosshairTip.appendChild(row);
  }

  crosshairTip.hidden = false;
  moveTooltip(evt);
}

/**
 * Move the tooltip to follow the cursor, keeping it inside the viewport.
 * @param {MouseEvent} evt
 */
function moveTooltip(evt) {
  const pad = 16;
  const tw = crosshairTip.offsetWidth;
  const th = crosshairTip.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let x = evt.clientX + pad;
  let y = evt.clientY + pad;

  if (x + tw > vw - pad) x = evt.clientX - tw - pad;
  if (y + th > vh - pad) y = evt.clientY - th - pad;
  if (x < pad) x = pad;
  if (y < pad) y = pad;

  crosshairTip.style.left = x + 'px';
  crosshairTip.style.top  = y + 'px';
}

function hideCrosshair() {
  crosshairHour = -1;
  crosshairSourceTz = null;
  grid.classList.remove('tz-grid--crosshair');
  crosshairTip.hidden = true;

  for (const row of grid.querySelectorAll('.tz-col__hour-row--hover')) {
    row.classList.remove('tz-col__hour-row--hover');
  }
}

/**
 * Bind crosshair events on the grid (event delegation — works for
 * columns added after init).
 */
function bindCrosshairEvents() {
  grid.addEventListener('mousemove', (evt) => {
    const hoursEl = evt.target.closest('.tz-col__hours');
    if (!hoursEl) { hideCrosshair(); return; }

    const col = hoursEl.closest('.tz-col');
    if (!col) return;
    const sourceTz = col.dataset.tz;
    if (!sourceTz) return;

    const rowEl = evt.target.closest('.tz-col__hour-row');
    if (!rowEl) { hideCrosshair(); return; }

    const hour = parseInt(rowEl.dataset.hour, 10);
    if (isNaN(hour)) return;

    // Only re-render if hour or source changed
    if (hour !== crosshairHour || sourceTz !== crosshairSourceTz) {
      showCrosshair(hour, sourceTz, evt);
    } else {
      moveTooltip(evt);
    }
  });

  grid.addEventListener('mouseleave', hideCrosshair);

  // Also hide when cursor leaves an hours-list into the column header/clock
  grid.addEventListener('mouseover', (evt) => {
    if (!evt.target.closest('.tz-col__hours')) {
      hideCrosshair();
    }
  });
}

/* ── Bootstrap ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);
