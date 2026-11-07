import { daysBetween } from './dates'

// Sorting key: date first, then start time (events without a time come first)
function eventKey(event) {
  return `${event.date} ${event.startTime ?? ''}`
}

// Splits exams/presentations into "upcoming" (today or later, soonest first)
// and "past" (most recent first).
export function groupEvents(events, today) {
  const upcoming = []
  const past = []
  for (const event of events) {
    ;(event.date >= today ? upcoming : past).push(event)
  }
  upcoming.sort((a, b) => eventKey(a).localeCompare(eventKey(b)))
  past.sort((a, b) => eventKey(b).localeCompare(eventKey(a)))
  return { upcoming, past }
}

// "Today", "Tomorrow", "in 5 days", "3 days ago"
export function countdownLabel(isoDate, today) {
  const diff = daysBetween(today, isoDate)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return diff > 0 ? `in ${diff} days` : `${-diff} days ago`
}
