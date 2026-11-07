import { addDays, addMonths, getDaysInMonth, getISODay, parseISO } from 'date-fns'
import { addDaysISO, daysBetween, toISODate } from './dates'
import { weekdayShort } from './courses'

// ─────────────────────────────────────────────────────────────
// Routines are tasks that repeat. Each routine remembers ONE date:
// `nextDue`, the next time it should be done. When you complete,
// skip or snooze it, `nextDue` moves forward.
//
// Three kinds of schedule:
//   { type: 'weekly',   weekdays: [1, 4] }        → every Mon and Thu (1 = Mon … 7 = Sun)
//   { type: 'interval', every: 3, unit: 'day' }   → every 3 days after you last did it
//                                                    (unit can also be 'week')
//   { type: 'monthly',  day: 1 }                  → every month on the 1st
//                                                    (day 31 → last day in shorter months)
// ─────────────────────────────────────────────────────────────

const laterOf = (a, b) => (a > b ? a : b)

// The given day of a month, or the month's last day if it's shorter
function dayInMonth(date, day) {
  const d = Math.min(day, getDaysInMonth(date))
  return toISODate(new Date(date.getFullYear(), date.getMonth(), d))
}

// How far an interval routine jumps ahead: 3 days, 2 weeks…
function addInterval(isoDate, schedule) {
  const days = schedule.unit === 'week' ? schedule.every * 7 : schedule.every
  return addDaysISO(isoDate, Math.max(1, days))
}

// The first date on or after `fromISO` that fits the schedule.
// (For interval routines, that's simply `fromISO` itself.)
export function firstOccurrenceOnOrAfter(schedule, fromISO) {
  if (schedule.type === 'weekly') {
    const from = parseISO(fromISO)
    for (let i = 0; i < 7; i++) {
      const date = addDays(from, i)
      if (schedule.weekdays.includes(getISODay(date))) return toISODate(date)
    }
    return fromISO // no weekdays chosen — shouldn't happen, the form prevents it
  }
  if (schedule.type === 'monthly') {
    const from = parseISO(fromISO)
    const thisMonth = dayInMonth(from, schedule.day)
    return thisMonth >= fromISO ? thisMonth : dayInMonth(addMonths(from, 1), schedule.day)
  }
  return fromISO
}

// Where `nextDue` moves after an action.
//   done:    weekly/monthly → the next fitting date after the one you just did
//            (doing it early counts for the upcoming occurrence)
//            interval       → N days/weeks after today (after you actually did it)
//   skipped: like done, but an interval routine counts from when it was due
//   snoozed: one day later
export function nextDueAfter(routine, action, today) {
  const current = laterOf(today, routine.nextDue) // the occurrence being handled
  if (action === 'snoozed') return addDaysISO(current, 1)
  if (routine.schedule.type === 'interval') {
    return addInterval(action === 'done' ? today : current, routine.schedule)
  }
  return firstOccurrenceOnOrAfter(routine.schedule, addDaysISO(current, 1))
}

// Is a routine due now?
//   { due: true,  daysLate: 0 }  → due today
//   { due: true,  daysLate: 2 }  → was due 2 days ago and still not done
//   { due: false, daysUntil: 3 } → comes up in 3 days
export function getRoutineStatus(routine, today) {
  const diff = daysBetween(today, routine.nextDue)
  return diff <= 0 ? { due: true, daysLate: Math.abs(diff) } : { due: false, daysUntil: diff }
}

// 1 → "1st", 2 → "2nd", 23 → "23rd", 11 → "11th"
export function ordinal(n) {
  const lastTwo = n % 100
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'}`
}

// A short human description: "Every Mon, Thu", "Every 3 days", "Monthly on the 1st"
export function describeSchedule(schedule) {
  if (schedule.type === 'weekly') {
    const days = [...schedule.weekdays].sort((a, b) => a - b)
    if (days.length === 7) return 'Every day'
    if (days.join() === '1,2,3,4,5') return 'Weekdays'
    if (days.join() === '6,7') return 'Weekends'
    return `Every ${days.map(weekdayShort).join(', ')}`
  }
  if (schedule.type === 'interval') {
    const { every, unit } = schedule
    if (every === 1) return unit === 'week' ? 'Every week' : 'Every day'
    return `Every ${every} ${unit === 'week' ? 'weeks' : 'days'}`
  }
  return `Monthly on the ${ordinal(schedule.day)}`
}

// Sorting: most overdue first, then soonest
export function sortRoutines(routines) {
  return [...routines].sort(
    (a, b) => a.nextDue.localeCompare(b.nextDue) || a.title.localeCompare(b.title),
  )
}

// The newest history entry of each routine: { routineId: entry }
export function lastEntryByRoutine(completionLog) {
  const last = {}
  for (const entry of completionLog) last[entry.routineId] = entry
  return last
}

// Splits routines for display:
//   today:    due now (most overdue first), then the ones already done today
//   upcoming: everything else, soonest first
export function splitRoutines(routines, lastEntries, today) {
  const due = []
  const doneToday = []
  const upcoming = []
  for (const routine of sortRoutines(routines)) {
    const last = lastEntries[routine.id]
    if (routine.nextDue <= today) due.push(routine)
    else if (last?.date === today && last.action === 'done') doneToday.push(routine)
    else upcoming.push(routine)
  }
  return { today: [...due, ...doneToday], due, doneToday, upcoming }
}
