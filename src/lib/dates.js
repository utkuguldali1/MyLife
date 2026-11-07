import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'

// All dates in the app are stored as plain text like "2026-11-07"
// (year-month-day). This avoids time-zone bugs where a task "moves"
// to the previous day. A nice side effect: these texts can be compared
// directly — "2026-11-06" < "2026-11-07" is true.

// Today's date as "YYYY-MM-DD"
export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

// Turn a JavaScript date into "YYYY-MM-DD"
export function toISODate(date) {
  return format(date, 'yyyy-MM-dd')
}

// Add (or subtract, with a negative number) days to a "YYYY-MM-DD" date
export function addDaysISO(isoDate, days) {
  return toISODate(addDays(parseISO(isoDate), days))
}

// How many days from `fromISO` to `toISO` (negative if toISO is earlier)
export function daysBetween(fromISO, toISO) {
  return differenceInCalendarDays(parseISO(toISO), parseISO(fromISO))
}

// A friendly label for a date, e.g. "Today", "Tomorrow", "Sat 7 Nov",
// or "7 Nov 2027" when it's in a different year.
export function formatDateLabel(isoDate, today = todayISO()) {
  const diff = daysBetween(today, isoDate)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  const sameYear = isoDate.slice(0, 4) === today.slice(0, 4)
  return format(parseISO(isoDate), sameYear ? 'EEE d MMM' : 'd MMM yyyy')
}

// Long form for page headers, e.g. "Saturday, 7 November"
export function formatLongDate(isoDate) {
  return format(parseISO(isoDate), 'EEEE, d MMMM')
}
