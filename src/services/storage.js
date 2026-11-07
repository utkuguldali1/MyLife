import { createJSONStorage } from 'zustand/middleware'
import { todayISO } from '../lib/dates'
import { DATA_KEYS, DATA_VERSION } from '../store/defaultData'

// ─────────────────────────────────────────────────────────────
// This is the ONLY file that knows where data is saved.
// Today: the browser's localStorage. Later (accounts, sync, Google
// Calendar) we can swap this for a real database without touching
// the rest of the app.
// ─────────────────────────────────────────────────────────────

export const STORAGE_KEY = 'slo-data'

// Tells the data store to save itself in localStorage as JSON text.
export const persistStorage = createJSONStorage(() => localStorage)

const BACKUP_APP_ID = 'student-life-organizer'

// Download all data as a .json file (the backup).
export function downloadBackup(data) {
  const backup = {
    app: BACKUP_APP_ID,
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `student-life-backup-${todayISO()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Read a backup file chosen by the user and check that it's valid.
// Returns the data, or throws an error with a readable message.
export async function readBackupFile(file) {
  let parsed
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('This file is not a valid backup (it could not be read as JSON).')
  }

  if (parsed?.app !== BACKUP_APP_ID || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new Error('This file is not a Student Life backup.')
  }
  if (parsed.version > DATA_VERSION) {
    throw new Error('This backup was made by a newer version of the app.')
  }
  for (const key of DATA_KEYS) {
    if (key in parsed.data && !Array.isArray(parsed.data[key])) {
      throw new Error(`The backup looks damaged ("${key}" is not a list).`)
    }
  }
  if (!Array.isArray(parsed.data.categories)) {
    throw new Error('The backup looks damaged (no categories found).')
  }

  return parsed.data
}
