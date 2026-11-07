import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistStorage, STORAGE_KEY } from '../services/storage'
import { createDefaultData, DATA_KEYS, DATA_VERSION } from './defaultData'
import { createSampleData } from './sampleData'
import { createCategorySlice } from './slices/categorySlice'
import { createTaskSlice } from './slices/taskSlice'

// Keep only the data lists (not the action functions) — used for saving and backups.
export function pickData(state) {
  return Object.fromEntries(DATA_KEYS.map((key) => [key, state[key]]))
}

// ─────────────────────────────────────────────────────────────
// The app's central memory ("store").
// Every page reads its data from here and changes it through the
// actions below. The `persist` wrapper automatically saves every
// change to the browser, and loads it again when the app starts.
//
// Usage in a component:
//   const tasks = useAppStore((state) => state.tasks)
//   const addTask = useAppStore((state) => state.addTask)
// ─────────────────────────────────────────────────────────────
export const useAppStore = create(
  persist(
    (set) => ({
      ...createDefaultData(),
      ...createCategorySlice(set),
      ...createTaskSlice(set),

      // ── Whole-data actions (Settings page) ──
      replaceAllData(data) {
        set({ ...createDefaultData(), ...data })
      },
      resetAllData() {
        set(createDefaultData())
      },
      loadSampleData() {
        set(createSampleData())
      },
    }),
    {
      name: STORAGE_KEY,
      storage: persistStorage,
      version: DATA_VERSION,
      partialize: pickData, // save only the data, not the functions
    },
  ),
)
