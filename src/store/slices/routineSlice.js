import { createId } from '../../lib/ids'
import { firstOccurrenceOnOrAfter, nextDueAfter } from '../../lib/routines'

// Routine shape:
// { id, title, categoryId, priority, notes,
//   schedule: { type: 'weekly', weekdays } | { type: 'interval', every, unit } | { type: 'monthly', day },
//   nextDue: "2026-11-09", createdAt, updatedAt }
//
// Every complete / skip / snooze is written to `completionLog`:
// { id, routineId, action: 'done' | 'skipped' | 'snoozed', date (when), dueDate (which occurrence), at }
// That history makes "Undo" possible and will feed statistics later.

function updateRoutineIn(routines, id, changes) {
  return routines.map((r) =>
    r.id === id ? { ...r, ...changes, updatedAt: new Date().toISOString() } : r,
  )
}

export function createRoutineSlice(set) {
  // Complete, skip or snooze: move nextDue forward and remember what happened
  function act(id, action, today) {
    set((state) => {
      const routine = state.routines.find((r) => r.id === id)
      if (!routine) return {}
      const entry = {
        id: createId(),
        routineId: id,
        action,
        date: today,
        dueDate: routine.nextDue,
        at: new Date().toISOString(),
      }
      return {
        routines: updateRoutineIn(state.routines, id, {
          nextDue: nextDueAfter(routine, action, today),
        }),
        completionLog: [...state.completionLog, entry],
      }
    })
  }

  return {
    // `startDate`: the first day it may be due (the schedule picks the exact day)
    addRoutine({ startDate, ...input }) {
      const now = new Date().toISOString()
      const routine = {
        id: createId(),
        title: input.title.trim(),
        categoryId: input.categoryId ?? null,
        priority: input.priority ?? 'medium',
        notes: input.notes ?? '',
        schedule: input.schedule,
        nextDue: firstOccurrenceOnOrAfter(input.schedule, startDate),
        createdAt: now,
        updatedAt: now,
      }
      set((state) => ({ routines: [...state.routines, routine] }))
      return routine
    },

    updateRoutine(id, { startDate, ...changes }) {
      const extra = startDate
        ? { nextDue: firstOccurrenceOnOrAfter(changes.schedule, startDate) }
        : {}
      set((state) => ({ routines: updateRoutineIn(state.routines, id, { ...changes, ...extra }) }))
    },

    deleteRoutine(id) {
      set((state) => ({
        routines: state.routines.filter((r) => r.id !== id),
        completionLog: state.completionLog.filter((e) => e.routineId !== id),
      }))
    },

    completeRoutine: (id, today) => act(id, 'done', today),
    skipRoutine: (id, today) => act(id, 'skipped', today),
    snoozeRoutine: (id, today) => act(id, 'snoozed', today),

    // Take back the most recent complete/skip/snooze of a routine
    undoLastRoutineAction(id) {
      set((state) => {
        const last = state.completionLog.findLast((e) => e.routineId === id)
        if (!last) return {}
        return {
          routines: updateRoutineIn(state.routines, id, { nextDue: last.dueDate }),
          completionLog: state.completionLog.filter((e) => e.id !== last.id),
        }
      })
    },
  }
}
