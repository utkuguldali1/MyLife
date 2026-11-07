import { createId } from '../../lib/ids'

// Event shape (exams, presentations…):
// { id, title, typeId, courseId, date "2026-11-20", startTime "10:00" | null,
//   endTime "12:00" | null, location, notes, createdAt, updatedAt }
export function createEventSlice(set) {
  return {
    addEvent(input) {
      const now = new Date().toISOString()
      const event = {
        id: createId(),
        title: input.title.trim(),
        typeId: input.typeId ?? null,
        courseId: input.courseId ?? null,
        date: input.date,
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        location: input.location?.trim() ?? '',
        notes: input.notes ?? '',
        createdAt: now,
        updatedAt: now,
      }
      set((state) => ({ events: [...state.events, event] }))
      return event
    },

    updateEvent(id, changes) {
      set((state) => ({
        events: state.events.map((e) =>
          e.id === id ? { ...e, ...changes, updatedAt: new Date().toISOString() } : e,
        ),
      }))
    },

    deleteEvent(id) {
      set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
    },
  }
}
