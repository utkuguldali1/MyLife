import { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { buildCalendarItems } from '../../lib/calendar'

// All calendar items between two dates, grouped by date.
//   hiddenKinds: a Set of kinds to leave out ("task", "event", "routine", "lecture")
export function useCalendarItems(fromISO, toISO, today, hiddenKinds) {
  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const routines = useAppStore((s) => s.routines)
  const completionLog = useAppStore((s) => s.completionLog)
  const courses = useAppStore((s) => s.courses)
  const categories = useAppStore((s) => s.categories)
  const academicTypes = useAppStore((s) => s.academicTypes)

  return useMemo(() => {
    const all = buildCalendarItems({
      tasks,
      events,
      routines,
      completionLog,
      courses,
      categoryById: Object.fromEntries(categories.map((c) => [c.id, c])),
      courseById: Object.fromEntries(courses.map((c) => [c.id, c])),
      typeById: Object.fromEntries(academicTypes.map((t) => [t.id, t])),
      fromISO,
      toISO,
      today,
    })
    if (hiddenKinds.size === 0) return all
    return Object.fromEntries(
      Object.entries(all).map(([date, items]) => [
        date,
        items.filter((i) => !hiddenKinds.has(i.kind)),
      ]),
    )
  }, [tasks, events, routines, completionLog, courses, categories, academicTypes, fromISO, toISO, today, hiddenKinds])
}
