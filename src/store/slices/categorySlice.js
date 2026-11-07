import { createId } from '../../lib/ids'

// Actions for categories (Cleaning, Laundry, …).
// `set` changes the data; `get` reads the current data.
export function createCategorySlice(set) {
  return {
    addCategory({ name, color }) {
      const category = { id: createId(), name: name.trim(), color }
      set((state) => ({ categories: [...state.categories, category] }))
      return category
    },

    updateCategory(id, changes) {
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? { ...c, ...changes } : c)),
      }))
    },

    // Deleting a category keeps its tasks — they just become "No category".
    deleteCategory(id) {
      set((state) => {
        const category = state.categories.find((c) => c.id === id)
        if (!category || category.locked) return {}
        return {
          categories: state.categories.filter((c) => c.id !== id),
          tasks: state.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)),
          routines: state.routines.map((r) =>
            r.categoryId === id ? { ...r, categoryId: null } : r,
          ),
        }
      })
    },
  }
}
