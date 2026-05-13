const TIMEZONE_LIST = [
  { city: "UTC",           tz: "UTC" },
  { city: "Honolulu",      tz: "Pacific/Honolulu" },
  { city: "Anchorage",     tz: "America/Anchorage" },
  { city: "Los Angeles",   tz: "America/Los_Angeles" },
  { city: "Vancouver",     tz: "America/Vancouver" },
  { city: "Phoenix",       tz: "America/Phoenix" },
  { city: "Denver",        tz: "America/Denver" },
  { city: "Mexico City",   tz: "America/Mexico_City" },
  { city: "Chicago",       tz: "America/Chicago" },
  { city: "New York",      tz: "America/New_York" },
  { city: "Toronto",       tz: "America/Toronto" },
  { city: "Bogotá",        tz: "America/Bogota" },
  { city: "Lima",          tz: "America/Lima" },
  { city: "Caracas",       tz: "America/Caracas" },
  { city: "Halifax",       tz: "America/Halifax" },
  { city: "Santiago",      tz: "America/Santiago" },
  { city: "São Paulo",     tz: "America/Sao_Paulo" },
  { city: "Buenos Aires",  tz: "America/Buenos_Aires" },
  { city: "Montevideo",    tz: "America/Montevideo" },
  { city: "Reykjavik",     tz: "Atlantic/Reykjavik" },
  { city: "London",        tz: "Europe/London" },
  { city: "Dublin",        tz: "Europe/Dublin" },
  { city: "Lisbon",        tz: "Europe/Lisbon" },
  { city: "Madrid",        tz: "Europe/Madrid" },
  { city: "Paris",         tz: "Europe/Paris" },
  { city: "Amsterdam",     tz: "Europe/Amsterdam" },
  { city: "Brussels",      tz: "Europe/Brussels" },
  { city: "Berlin",        tz: "Europe/Berlin" },
  { city: "Munich",        tz: "Europe/Berlin" },
  { city: "Rome",          tz: "Europe/Rome" },
  { city: "Vienna",        tz: "Europe/Vienna" },
  { city: "Zurich",        tz: "Europe/Zurich" },
  { city: "Prague",        tz: "Europe/Prague" },
  { city: "Warsaw",        tz: "Europe/Warsaw" },
  { city: "Budapest",      tz: "Europe/Budapest" },
  { city: "Stockholm",     tz: "Europe/Stockholm" },
  { city: "Oslo",          tz: "Europe/Oslo" },
  { city: "Copenhagen",    tz: "Europe/Copenhagen" },
  { city: "Helsinki",      tz: "Europe/Helsinki" },
  { city: "Bucharest",     tz: "Europe/Bucharest" },
  { city: "Athens",        tz: "Europe/Athens" },
  { city: "Moscow",        tz: "Europe/Moscow" },
  { city: "Istanbul",      tz: "Europe/Istanbul" },
  { city: "Casablanca",    tz: "Africa/Casablanca" },
  { city: "Lagos",         tz: "Africa/Lagos" },
  { city: "Cairo",         tz: "Africa/Cairo" },
  { city: "Nairobi",       tz: "Africa/Nairobi" },
  { city: "Johannesburg",  tz: "Africa/Johannesburg" },
  { city: "Riyadh",        tz: "Asia/Riyadh" },
  { city: "Dubai",         tz: "Asia/Dubai" },
  { city: "Tehran",        tz: "Asia/Tehran" },
  { city: "Karachi",       tz: "Asia/Karachi" },
  { city: "Calcutta",      tz: "Asia/Calcutta" },
  { city: "Kathmandu",     tz: "Asia/Kathmandu" },
  { city: "Dhaka",         tz: "Asia/Dhaka" },
  { city: "Bangkok",       tz: "Asia/Bangkok" },
  { city: "Singapore",     tz: "Asia/Singapore" },
  { city: "Hong Kong",     tz: "Asia/Hong_Kong" },
  { city: "Shanghai",      tz: "Asia/Shanghai" },
  { city: "Tokyo",         tz: "Asia/Tokyo" },
  { city: "Seoul",         tz: "Asia/Seoul" },
  { city: "Sydney",        tz: "Australia/Sydney" },
  { city: "Melbourne",     tz: "Australia/Melbourne" },
  { city: "Auckland",      tz: "Pacific/Auckland" },
];

function resolveZone(input) {
  const q = input.trim().toLowerCase();

  // Try direct IANA match first (e.g. "Europe/Madrid")
  const direct = TIMEZONE_LIST.find(e => e.tz.toLowerCase() === q);
  if (direct) return direct;

  // Try city name match (case-insensitive)
  const byCity = TIMEZONE_LIST.find(e => e.city.toLowerCase() === q);
  if (byCity) return byCity;

  // Try offset notation: UTC+2, GMT-3, +5, -11
  const offsetMatch = input.trim().toUpperCase().match(/^(?:UTC|GMT)?([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (offsetMatch) {
    const sign = offsetMatch[1];
    const hours = parseInt(offsetMatch[2], 10);
    const minutes = offsetMatch[3] ? parseInt(offsetMatch[3], 10) : 0;
    if (hours <= 14 && minutes === 0) {
      const etcSign = sign === '+' ? '-' : '+';
      const tz = hours === 0 ? 'Etc/GMT' : `Etc/GMT${etcSign}${hours}`;
      return { city: `UTC${sign}${hours}`, tz };
    }
  }

  // Validate as raw IANA string
  try {
    Intl.DateTimeFormat(undefined, { timeZone: input });
    const city = input.split('/').pop().replace(/_/g, ' ');
    return { city, tz: input };
  } catch {
    return null;
  }
}

function getOffsetMinutes(tz, date) {
  // Extract UTC offset by comparing UTC time parts to local time parts
  const utcParts = new Intl.DateTimeFormat('en', {
    timeZone: 'UTC',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);

  const localParts = new Intl.DateTimeFormat('en', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(date);

  const get = (parts, type) => parseInt(parts.find(p => p.type === type).value, 10);

  const utcH = get(utcParts, 'hour'), utcM = get(utcParts, 'minute');
  const locH = get(localParts, 'hour'), locM = get(localParts, 'minute');

  return (locH - utcH) * 60 + (locM - utcM);
}

function formatOffset(minutes) {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}

function formatTime(tz, date) {
  return new Intl.DateTimeFormat('en', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatDateTime(tz, date) {
  return new Intl.DateTimeFormat('en', {
    timeZone: tz,
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(date);
}

export async function onRequest({ request, params }) {
  const segments = (params.route || []);
  const ua = (request.headers.get('User-Agent') || '').toLowerCase();
  const isCurl = ua.includes('curl') || ua.includes('wget') || ua.includes('httpie');
  const now = new Date();

  // Detect caller's timezone from CF data
  const cf = request.cf || {};
  const callerTz = cf.timezone || 'UTC';
  const callerCity = callerTz.split('/').pop().replace(/_/g, ' ');

  if (segments.length === 0) {
    const msg = `Usage:
  /tz/{zone}          — compare your timezone vs zone
  /tz/{zone1}/{zone2} — compare two zones

Examples:
  /tz/Madrid
  /tz/Madrid/Munich
  /tz/New_York/Tokyo
  /tz/UTC+2/Berlin
`;
    return new Response(msg, { headers: { 'content-type': 'text/plain;charset=UTF-8' } });
  }

  let zoneA, zoneB;

  if (segments.length === 1) {
    zoneA = { city: callerCity, tz: callerTz };
    zoneB = resolveZone(decodeURIComponent(segments[0]));
    if (!zoneB) {
      return new Response(`Unknown timezone: ${segments[0]}\n`, { status: 400, headers: { 'content-type': 'text/plain;charset=UTF-8' } });
    }
  } else {
    zoneA = resolveZone(decodeURIComponent(segments[0]));
    zoneB = resolveZone(decodeURIComponent(segments[1]));
    if (!zoneA) return new Response(`Unknown timezone: ${segments[0]}\n`, { status: 400, headers: { 'content-type': 'text/plain;charset=UTF-8' } });
    if (!zoneB) return new Response(`Unknown timezone: ${segments[1]}\n`, { status: 400, headers: { 'content-type': 'text/plain;charset=UTF-8' } });
  }

  const offsetA = getOffsetMinutes(zoneA.tz, now);
  const offsetB = getOffsetMinutes(zoneB.tz, now);
  const diffMinutes = offsetB - offsetA;
  const diffSign = diffMinutes >= 0 ? '+' : '-';
  const diffAbs = Math.abs(diffMinutes);
  const diffH = Math.floor(diffAbs / 60);
  const diffM = diffAbs % 60;
  const diffStr = diffM === 0 ? `${diffSign}${diffH}h` : `${diffSign}${diffH}h${diffM}m`;

  // Build 4 example times (now, +6h, +12h, +18h)
  const examples = [0, 6, 12, 18].map(h => {
    const d = new Date(now.getTime() + h * 3600 * 1000);
    return `  ${formatTime(zoneA.tz, d)}  →  ${formatTime(zoneB.tz, d)}`;
  });

  if (isCurl) {
    const text = `${zoneA.city} vs ${zoneB.city}
${'─'.repeat(40)}
${zoneA.city.padEnd(16)} ${formatOffset(offsetA).padEnd(10)} ${formatDateTime(zoneA.tz, now)}
${zoneB.city.padEnd(16)} ${formatOffset(offsetB).padEnd(10)} ${formatDateTime(zoneB.tz, now)}

Difference: ${diffStr} (${zoneB.city} is ${diffMinutes === 0 ? 'the same' : `${diffStr} ${diffMinutes > 0 ? 'ahead of' : 'behind'}`} ${zoneA.city})

Examples (${zoneA.city} → ${zoneB.city}):
${examples.join('\n')}
`;
    return new Response(text, {
      headers: {
        'content-type': 'text/plain;charset=UTF-8',
        'cache-control': 'no-store',
      },
    });
  }

  const data = {
    a: { city: zoneA.city, tz: zoneA.tz, offset: formatOffset(offsetA), time: formatDateTime(zoneA.tz, now) },
    b: { city: zoneB.city, tz: zoneB.tz, offset: formatOffset(offsetB), time: formatDateTime(zoneB.tz, now) },
    diff: diffStr,
    examples: [0, 6, 12, 18].map(h => {
      const d = new Date(now.getTime() + h * 3600 * 1000);
      return { a: formatTime(zoneA.tz, d), b: formatTime(zoneB.tz, d) };
    }),
  };

  return new Response(JSON.stringify(data, null, 2) + '\n', {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'cache-control': 'no-store',
    },
  });
}
