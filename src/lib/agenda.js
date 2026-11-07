import { getISODay, parseISO } from 'date-fns'
import { addDaysISO, toISODate } from './dates'
import { PRIORITY_RANK } from './priorities'
import { splitRoutines } from './routines'
import { groupEvents } from './events'

// ─────────────────────────────────────────────────────────────
// "What's happening when?" — collects tasks, routines, exams and
// lectures from all modules. Used by the Dashboard (and the Calendar).
// ─────────────────────────────────────────────────────────────

// Lectures that take place on a date (from courses that aren't archived),
// earliest first: [{ course, lecture }]
export function lecturesOnDate(courses, isoDate) {
  const weekday = getISODay(parseISO(isoDate))
  const result = []
  for (const course of courses) {
    if (course.archived) continue
    for (const lecture of course.lectures) {
      if (lecture.weekday === weekday) result.push({ course, lecture })
    }
  }
  return result.sort((a, b) => a.lecture.start.localeCompare(b.lecture.start))
}

// The local calendar date on which a task was ticked off
export function completedOnDate(task) {
  return task.completedAt ? toISODate(new Date(task.completedAt)) : null
}

const byPriority = (a, b) =>
  PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
  (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
const byDateThenPriority = (a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b)

// Everything the Dashboard shows.
//   overdue:  tasks and routines that should have been done on an earlier day
//   today:    tasks and routines due today
//   done:     tasks and routines ticked off today
//   upcoming: tasks due in the next 7 days (after today)
//   events:   exams/presentations from today up to 14 days ahead
//   lectures: today's lectures
export function buildDashboard({ tasks, routines, lastEntries, events, courses, today }) {
  const weekAhead = addDaysISO(today, 7)
  const twoWeeksAhead = addDaysISO(today, 14)

  const open = tasks.filter((t) => t.status !== 'done' && t.dueDate)
  const routineGroups = splitRoutines(routines, lastEntries, today)

  return {
    overdue: {
      tasks: open.filter((t) => t.dueDate < today).sort(byDateThenPriority),
      routines: routineGroups.due.filter((r) => r.nextDue < today),
    },
    today: {
      tasks: open.filter((t) => t.dueDate === today).sort(byPriority),
      routines: routineGroups.due.filter((r) => r.nextDue === today),
    },
    done: {
      tasks: tasks.filter((t) => t.status === 'done' && completedOnDate(t) === today),
      routines: routineGroups.doneToday,
    },
    upcoming: open
      .filter((t) => t.dueDate > today && t.dueDate <= weekAhead)
      .sort(byDateThenPriority),
    events: groupEvents(events, today).upcoming.filter((e) => e.date <= twoWeeksAhead),
    lectures: lecturesOnDate(courses, today),
  }
}
