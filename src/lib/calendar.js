import { addMonths, endOfMonth, endOfWeek, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { addDaysISO, toISODate } from './dates'
import { ACADEMIC_CATEGORY_ID } from '../store/defaultData'
import { addInterval, firstOccurrenceOnOrAfter, laterOf } from './routines'
import { lecturesOnDate } from './agenda'

const MONDAY = { weekStartsOn: 1 }

// ── Grids ────────────────────────────────────────────────────

// All days shown in a month view: full weeks (Mon–Sun) covering the month.
// Returns a list of weeks, each a list of 7 "YYYY-MM-DD" dates.
export function monthGrid(anchorISO) {
  const anchor = parseISO(anchorISO)
  let day = toISODate(startOfWeek(startOfMonth(anchor), MONDAY))
  const last = toISODate(endOfWeek(endOfMonth(anchor), MONDAY))
  const weeks = []
  while (day <= last) {
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDaysISO(day, 1)
    }
    weeks.push(week)
  }
  return weeks
}

// The 7 days (Mon–Sun) of the week containing `anchorISO`
export function weekDays(anchorISO) {
  const monday = toISODate(startOfWeek(parseISO(anchorISO), MONDAY))
  return Array.from({ length: 7 }, (_, i) => addDaysISO(monday, i))
}

// The first day of the next (+1) or previous (-1) month
export function shiftMonth(anchorISO, amount) {
  return toISODate(startOfMonth(addMonths(parseISO(anchorISO), amount)))
}

// ── Routine dates in the future ──────────────────────────────

// The dates a routine is expected on between `fromISO` and `toISO`.
// Starts at its next due date (which may be overdue). After that it
// assumes you do it on time — e.g. an overdue routine's next date is
// counted from today, just like when you tick it off.
export function routineOccurrences(routine, fromISO, toISO, today) {
  const dates = []
  let date = routine.nextDue
  for (let i = 0; i < 400 && date <= toISO; i++) {
    if (date >= fromISO) dates.push(date)
    const base = laterOf(date, today)
    date =
      routine.schedule.type === 'interval'
        ? addInterval(base, routine.schedule)
        : firstOccurrenceOnOrAfter(routine.schedule, addDaysISO(base, 1))
  }
  return dates
}

// ── Everything on the calendar ───────────────────────────────

// Order inside a day: exams first (most important), then deadlines,
// routines and lectures; items with a time in time order.
const KIND_RANK = { event: 0, task: 1, routine: 2, lecture: 3 }

function sortItems(a, b) {
  return (
    KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
    (a.time ?? '99').localeCompare(b.time ?? '99') ||
    a.title.localeCompare(b.title)
  )
}

// Collects every calendar item between two dates, grouped by date:
//   { "2026-11-09": [item, item…], … }
// Each item: { key, kind, date, title, color, time?, endTime?, done, overdue,
//              plus the original task / event / routine / course + lecture }
export function buildCalendarItems({
  tasks,
  events,
  routines,
  completionLog,
  courses,
  categoryById,
  courseById,
  typeById,
  fromISO,
  toISO,
  today,
}) {
  const byDate = {}
  const add = (item) => {
    if (item.date < fromISO || item.date > toISO) return
    ;(byDate[item.date] ??= []).push(item)
  }
  const routineById = Object.fromEntries(routines.map((r) => [r.id, r]))

  for (const task of tasks) {
    if (!task.dueDate) continue
    const academic = task.categoryId === ACADEMIC_CATEGORY_ID
    const done = task.status === 'done'
    add({
      key: `task-${task.id}`,
      kind: 'task',
      date: task.dueDate,
      title: task.title,
      color: academic ? courseById[task.courseId]?.color : categoryById[task.categoryId]?.color,
      typeName: academic ? typeById[task.typeId]?.name : null,
      done,
      overdue: !done && task.dueDate < today,
      task,
    })
  }

  for (const event of events) {
    add({
      key: `event-${event.id}`,
      kind: 'event',
      date: event.date,
      title: event.title,
      color: courseById[event.courseId]?.color,
      typeName: typeById[event.typeId]?.name,
      time: event.startTime ?? undefined,
      endTime: event.endTime ?? undefined,
      done: false,
      past: event.date < today,
      overdue: false,
      event,
    })
  }

  for (const routine of routines) {
    for (const date of routineOccurrences(routine, fromISO, toISO, today)) {
      add({
        key: `routine-${routine.id}-${date}`,
        kind: 'routine',
        date,
        title: routine.title,
        color: categoryById[routine.categoryId]?.color,
        done: false,
        overdue: date < today,
        // Only the next due one can be ticked off; later ones are a preview
        actionable: date === routine.nextDue,
        routine,
      })
    }
  }

  // Routines already done: shown (crossed out) on the day you did them
  for (const entry of completionLog) {
    const routine = routineById[entry.routineId]
    if (entry.action !== 'done' || !routine) continue
    add({
      key: `routine-done-${entry.id}`,
      kind: 'routine',
      date: entry.date,
      title: routine.title,
      color: categoryById[routine.categoryId]?.color,
      done: true,
      overdue: false,
      routine,
    })
  }

  // Weekly lectures, repeated on every matching weekday —
  // starting from the day the course was added (not into the past)
  const courseStart = (course) => (course.createdAt ? toISODate(new Date(course.createdAt)) : '')
  for (let date = fromISO; date <= toISO; date = addDaysISO(date, 1)) {
    for (const { course, lecture } of lecturesOnDate(courses, date)) {
      if (date < courseStart(course)) continue
      add({
        key: `lecture-${course.id}-${lecture.id}-${date}`,
        kind: 'lecture',
        date,
        title: lecture.label ? `${course.name} · ${lecture.label}` : course.name,
        color: course.color,
        time: lecture.start,
        endTime: lecture.end,
        done: false,
        overdue: false,
        course,
        lecture,
      })
    }
  }

  for (const items of Object.values(byDate)) items.sort(sortItems)
  return byDate
}
