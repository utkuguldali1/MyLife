// Helpers for the course "Links" section (e.g. "Moodle ›").

// Clean up a web address typed by the user.
//   "moodle.uni.de/course/5"  → "https://moodle.uni.de/course/5"
//   "javascript:…" or garbage → null (not allowed, for safety)
export function normalizeUrl(input) {
  const text = (input ?? '').trim()
  if (!text) return null
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null
    return url.href
  } catch {
    return null
  }
}

// The short site name of a link, e.g. "moodle.uni.de"
export function linkHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
