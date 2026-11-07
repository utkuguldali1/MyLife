// Creates a unique ID for every new item (task, course, category…),
// so the app can tell items apart even if they have the same name.
export function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for very old browsers
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
