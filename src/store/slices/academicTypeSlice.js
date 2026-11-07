import { createId } from '../../lib/ids'

// Academic types: "Assignment", "Exam"…
//   kind "task":  something you complete (shows up as a task)
//   kind "event": something that happens on a date (shows up as an event)
export function createAcademicTypeSlice(set) {
  return {
    addAcademicType({ name, kind }) {
      const type = { id: createId(), name: name.trim(), kind }
      set((state) => ({ academicTypes: [...state.academicTypes, type] }))
      return type
    },

    renameAcademicType(id, name) {
      set((state) => ({
        academicTypes: state.academicTypes.map((t) => (t.id === id ? { ...t, name } : t)),
      }))
    },

    // Items of a deleted type are kept, they just lose their type label.
    deleteAcademicType(id) {
      set((state) => ({
        academicTypes: state.academicTypes.filter((t) => t.id !== id),
        tasks: state.tasks.map((t) => (t.typeId === id ? { ...t, typeId: null } : t)),
        events: state.events.map((e) => (e.typeId === id ? { ...e, typeId: null } : e)),
      }))
    },
  }
}
