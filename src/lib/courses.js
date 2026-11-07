// Helpers for courses and their weekly lecture times.
// Weekdays are numbers: 1 = Monday … 7 = Sunday (weeks start on Monday).
// Times are text in 24-hour format: "08:15", "13:45".

export const WEEKDAYS = [
  { value: 1, short: 'Mon', long: 'Monday' },
  { value: 2, short: 'Tue', long: 'Tuesday' },
  { value: 3, short: 'Wed', long: 'Wednesday' },
  { value: 4, short: 'Thu', long: 'Thursday' },
  { value: 5, short: 'Fri', long: 'Friday' },
  { value: 6, short: 'Sat', long: 'Saturday' },
  { value: 7, short: 'Sun', long: 'Sunday' },
]

export function weekdayShort(value) {
  return WEEKDAYS.find((d) => d.value === value)?.short ?? '?'
}

// Every 15 minutes of the day: "00:00", "00:15", … "23:45"
export const TIME_OPTIONS = Array.from({ length: 96 }, (_, i) => minutesToTime(i * 15))

export function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function minutesToTime(minutes) {
  const clamped = Math.max(0, Math.min(minutes, 23 * 60 + 59))
  const h = String(Math.floor(clamped / 60)).padStart(2, '0')
  const m = String(clamped % 60).padStart(2, '0')
  return `${h}:${m}`
}

export function addMinutesToTime(time, minutes) {
  return minutesToTime(timeToMinutes(time) + minutes)
}

// "10:15–11:45", or just "10:15" when there's no end time
export function formatTimeRange(start, end) {
  if (!start) return ''
  return end ? `${start}–${end}` : start
}

// Lectures in week order: Monday first, then by start time
export function sortLectures(lectures) {
  return [...lectures].sort(
    (a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start),
  )
}

// "Mon 10:15–11:45"
export function formatLecture(lecture) {
  return `${weekdayShort(lecture.weekday)} ${formatTimeRange(lecture.start, lecture.end)}`
}
