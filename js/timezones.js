/**
 * timezones.js
 * Curated list of IANA timezone IDs with human-readable city/region labels.
 * City names reflect the canonical IANA zone — no custom aliases.
 * Used for search autocomplete and display names.
 */

/** @type {Array<{city: string, tz: string, region: string}>} */
const TIMEZONE_LIST = [
  // UTC
  { city: "UTC",              tz: "UTC",                   region: "Universal" },

  // Americas
  { city: "Honolulu",         tz: "Pacific/Honolulu",      region: "Americas" },
  { city: "Anchorage",        tz: "America/Anchorage",     region: "Americas" },
  { city: "Los Angeles",      tz: "America/Los_Angeles",   region: "Americas" },
  { city: "Vancouver",        tz: "America/Vancouver",     region: "Americas" },
  { city: "Phoenix",          tz: "America/Phoenix",       region: "Americas" },
  { city: "Denver",           tz: "America/Denver",        region: "Americas" },
  { city: "Mexico City",      tz: "America/Mexico_City",   region: "Americas" },
  { city: "Chicago",          tz: "America/Chicago",       region: "Americas" },
  { city: "Winnipeg",         tz: "America/Winnipeg",      region: "Americas" },
  { city: "New York",         tz: "America/New_York",      region: "Americas" },
  { city: "Toronto",          tz: "America/Toronto",       region: "Americas" },
  { city: "Bogotá",           tz: "America/Bogota",        region: "Americas" },
  { city: "Lima",             tz: "America/Lima",          region: "Americas" },
  { city: "Caracas",          tz: "America/Caracas",       region: "Americas" },
  { city: "Halifax",          tz: "America/Halifax",       region: "Americas" },
  { city: "Santiago",         tz: "America/Santiago",      region: "Americas" },
  { city: "São Paulo",        tz: "America/Sao_Paulo",     region: "Americas" },
  { city: "Buenos Aires",     tz: "America/Buenos_Aires",  region: "Americas" },
  { city: "Montevideo",       tz: "America/Montevideo",    region: "Americas" },
  { city: "St. John's",       tz: "America/St_Johns",      region: "Americas" },

  // Europe
  { city: "Reykjavik",        tz: "Atlantic/Reykjavik",    region: "Europe" },
  { city: "London",           tz: "Europe/London",         region: "Europe" },
  { city: "Dublin",           tz: "Europe/Dublin",         region: "Europe" },
  { city: "Lisbon",           tz: "Europe/Lisbon",         region: "Europe" },
  { city: "Madrid",           tz: "Europe/Madrid",         region: "Europe" },
  { city: "Paris",            tz: "Europe/Paris",          region: "Europe" },
  { city: "Amsterdam",        tz: "Europe/Amsterdam",      region: "Europe" },
  { city: "Brussels",         tz: "Europe/Brussels",       region: "Europe" },
  { city: "Berlin",           tz: "Europe/Berlin",         region: "Europe" },
  { city: "Rome",             tz: "Europe/Rome",           region: "Europe" },
  { city: "Vienna",           tz: "Europe/Vienna",         region: "Europe" },
  { city: "Zurich",           tz: "Europe/Zurich",         region: "Europe" },
  { city: "Prague",           tz: "Europe/Prague",         region: "Europe" },
  { city: "Warsaw",           tz: "Europe/Warsaw",         region: "Europe" },
  { city: "Budapest",         tz: "Europe/Budapest",       region: "Europe" },
  { city: "Stockholm",        tz: "Europe/Stockholm",      region: "Europe" },
  { city: "Oslo",             tz: "Europe/Oslo",           region: "Europe" },
  { city: "Copenhagen",       tz: "Europe/Copenhagen",     region: "Europe" },
  { city: "Helsinki",         tz: "Europe/Helsinki",       region: "Europe" },
  { city: "Tallinn",          tz: "Europe/Tallinn",        region: "Europe" },
  { city: "Riga",             tz: "Europe/Riga",           region: "Europe" },
  { city: "Vilnius",          tz: "Europe/Vilnius",        region: "Europe" },
  { city: "Bucharest",        tz: "Europe/Bucharest",      region: "Europe" },
  { city: "Sofia",            tz: "Europe/Sofia",          region: "Europe" },
  { city: "Athens",           tz: "Europe/Athens",         region: "Europe" },
  { city: "Kiev",             tz: "Europe/Kiev",           region: "Europe" },
  { city: "Minsk",            tz: "Europe/Minsk",          region: "Europe" },
  { city: "Moscow",           tz: "Europe/Moscow",         region: "Europe" },
  { city: "Istanbul",         tz: "Europe/Istanbul",       region: "Europe" },

  // Africa
  { city: "Casablanca",       tz: "Africa/Casablanca",     region: "Africa" },
  { city: "Accra",            tz: "Africa/Accra",          region: "Africa" },
  { city: "Lagos",            tz: "Africa/Lagos",          region: "Africa" },
  { city: "Cairo",            tz: "Africa/Cairo",          region: "Africa" },
  { city: "Nairobi",          tz: "Africa/Nairobi",        region: "Africa" },
  { city: "Johannesburg",     tz: "Africa/Johannesburg",   region: "Africa" },

  // Middle East
  { city: "Riyadh",           tz: "Asia/Riyadh",           region: "Middle East" },
  { city: "Dubai",            tz: "Asia/Dubai",            region: "Middle East" },
  { city: "Doha",             tz: "Asia/Qatar",            region: "Middle East" },
  { city: "Kuwait City",      tz: "Asia/Kuwait",           region: "Middle East" },
  { city: "Baghdad",          tz: "Asia/Baghdad",          region: "Middle East" },
  { city: "Tehran",           tz: "Asia/Tehran",           region: "Middle East" },
  { city: "Kabul",            tz: "Asia/Kabul",            region: "Middle East" },

  // Asia
  { city: "Karachi",          tz: "Asia/Karachi",          region: "Asia" },
  { city: "Tashkent",         tz: "Asia/Tashkent",         region: "Asia" },
  { city: "Yekaterinburg",    tz: "Asia/Yekaterinburg",    region: "Asia" },
  { city: "Calcutta",         tz: "Asia/Calcutta",         region: "Asia" },
  { city: "Kathmandu",        tz: "Asia/Kathmandu",        region: "Asia" },
  { city: "Dhaka",            tz: "Asia/Dhaka",            region: "Asia" },
  { city: "Colombo",          tz: "Asia/Colombo",          region: "Asia" },
  { city: "Almaty",           tz: "Asia/Almaty",           region: "Asia" },
  { city: "Rangoon",          tz: "Asia/Rangoon",          region: "Asia" },
  { city: "Bangkok",          tz: "Asia/Bangkok",          region: "Asia" },
  { city: "Saigon",           tz: "Asia/Saigon",           region: "Asia" },
  { city: "Jakarta",          tz: "Asia/Jakarta",          region: "Asia" },
  { city: "Krasnoyarsk",      tz: "Asia/Krasnoyarsk",      region: "Asia" },
  { city: "Kuala Lumpur",     tz: "Asia/Kuala_Lumpur",     region: "Asia" },
  { city: "Singapore",        tz: "Asia/Singapore",        region: "Asia" },
  { city: "Hong Kong",        tz: "Asia/Hong_Kong",        region: "Asia" },
  { city: "Shanghai",         tz: "Asia/Shanghai",         region: "Asia" },
  { city: "Taipei",           tz: "Asia/Taipei",           region: "Asia" },
  { city: "Manila",           tz: "Asia/Manila",           region: "Asia" },
  { city: "Irkutsk",          tz: "Asia/Irkutsk",          region: "Asia" },
  { city: "Perth",            tz: "Australia/Perth",       region: "Asia" },
  { city: "Seoul",            tz: "Asia/Seoul",            region: "Asia" },
  { city: "Tokyo",            tz: "Asia/Tokyo",            region: "Asia" },
  { city: "Yakutsk",          tz: "Asia/Yakutsk",          region: "Asia" },

  // Pacific / Oceania
  { city: "Darwin",           tz: "Australia/Darwin",      region: "Oceania" },
  { city: "Adelaide",         tz: "Australia/Adelaide",    region: "Oceania" },
  { city: "Brisbane",         tz: "Australia/Brisbane",    region: "Oceania" },
  { city: "Sydney",           tz: "Australia/Sydney",      region: "Oceania" },
  { city: "Melbourne",        tz: "Australia/Melbourne",   region: "Oceania" },
  { city: "Vladivostok",      tz: "Asia/Vladivostok",      region: "Oceania" },
  { city: "Magadan",          tz: "Asia/Magadan",          region: "Oceania" },
  { city: "Auckland",         tz: "Pacific/Auckland",      region: "Oceania" },
  { city: "Fiji",             tz: "Pacific/Fiji",          region: "Oceania" },
  { city: "Apia",             tz: "Pacific/Apia",          region: "Oceania" },
];

/**
 * Validate a timezone string against the browser's supported list.
 * @param {string} tz
 * @returns {boolean}
 */
function isValidTimezone(tz) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Search the curated list by city name or IANA tz ID.
 * Returns up to `limit` results.
 * @param {string} query
 * @param {number} [limit=8]
 * @returns {Array<{city: string, tz: string, region: string}>}
 */
function searchTimezones(query, limit = 8) {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];

  const results = [];
  const seen = new Set();

  for (const entry of TIMEZONE_LIST) {
    if (results.length >= limit) break;
    const key = entry.tz + '|' + entry.city;
    if (seen.has(key)) continue;
    if (
      entry.city.toLowerCase().includes(q) ||
      entry.tz.toLowerCase().includes(q) ||
      entry.region.toLowerCase().includes(q)
    ) {
      seen.add(key);
      results.push(entry);
    }
  }
  return results;
}

/**
 * Get the UTC offset string for a timezone at the current moment.
 * e.g. "UTC+2"
 * @param {string} tz
 * @returns {string}
 */
function getUtcOffset(tz) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart ? offsetPart.value : 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Find a curated entry by IANA tz ID.
 * Returns the first match, or a synthetic entry derived from the tz string.
 * @param {string} tz
 * @returns {{city: string, tz: string, region: string}}
 */
function getEntryForTz(tz) {
  const found = TIMEZONE_LIST.find(e => e.tz === tz);
  if (found) return found;
  // Synthetic fallback: derive city from the last segment of the tz ID
  const city = tz.split('/').pop().replace(/_/g, ' ');
  return { city, tz, region: 'Other' };
}

/**
 * Parse a user-typed offset string like "UTC-3", "GMT+5", "UTC+0", "+2", "-11"
 * into a valid IANA timezone ID using the Etc/GMT family.
 *
 * POSIX sign convention: Etc/GMT+3 = UTC-3 (signs are inverted).
 * Only whole-hour offsets -12..+14 are supported by Etc/GMT.
 * Half-hour offsets (e.g. +5:30) are not in Etc/GMT — we return null for those.
 *
 * @param {string} query
 * @returns {{tz: string, city: string, region: string}|null}
 */
function parseOffsetQuery(query) {
  const q = query.trim().toUpperCase();

  // Match: optional prefix (UTC/GMT), then sign, then hours, optional :minutes
  const match = q.match(/^(?:UTC|GMT)?\s*([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return null;

  const sign    = match[1];           // '+' or '-'
  const hours   = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;

  // Validate range
  if (hours > 14 || minutes >= 60) return null;
  if (hours === 14 && minutes > 0) return null;

  // Half-hour or quarter-hour offsets not in Etc/GMT
  if (minutes !== 0) return null;

  // Etc/GMT sign is inverted vs UTC offset
  // UTC+3 → Etc/GMT-3, UTC-3 → Etc/GMT+3
  const etcSign = sign === '+' ? '-' : '+';
  const tz = hours === 0 ? 'Etc/GMT' : `Etc/GMT${etcSign}${hours}`;

  // Display label uses the conventional UTC+N notation
  const displaySign = sign;
  const city = `UTC${displaySign}${hours}`;

  return { tz, city, region: 'Offset' };
}

export { TIMEZONE_LIST, isValidTimezone, searchTimezones, getUtcOffset, getEntryForTz, parseOffsetQuery };
