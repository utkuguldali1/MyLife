import { daysBetween } from './dates'
import { PRIORITY_RANK } from './priorities'
import { ACADEMIC_CATEGORY_ID } from '../store/defaultData'

// Works out where a not-yet-done task belongs today.
//   - no date            → "noDate"
//   - due today          → "today"
//   - due in the past    → everyday tasks: "today" too, marked as carried over
//                          (so you get a warning instead of a lost task)
//                        → academic tasks: "overdue" (a missed deadline
//                          is really missed, so it isn't quietly moved)
//   - due in the future  → "upcoming"
export function getTaskTiming(task, today) {
  if (!task.dueDate) return { group: 'noDate' }
  if (task.dueDate < today) {
    if (task.categoryId === ACADEMIC_CATEGORY_ID) {
      return {
        group: 'overdue',
        overdueSince: task.dueDate,
        daysLate: daysBetween(task.dueDate, today),
      }
    }
    return {
      group: 'today',
      carriedOverFrom: task.dueDate,
      daysLate: daysBetween(task.dueDate, today),
    }
  }
  if (task.dueDate === today) return { group: 'today' }
  return { group: 'upcoming' }
}

function byPriorityThenCreated(a, b) {
  const rank = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  if (rank !== 0) return rank
  return (a.createdAt ?? '').localeCompare(b.createdAt ?? '')
}

// Splits a list of tasks into sections (Overdue, Today, Upcoming, No date, Completed).
export function groupTasks(tasks, today) {
  const groups = { overdue: [], today: [], upcoming: [], noDate: [], completed: [] }

  for (const task of tasks) {
    if (task.status === 'done') {
      groups.completed.push(task)
    } else {
      groups[getTaskTiming(task, today).group].push(task)
    }
  }

  // Today: carried-over tasks first (oldest first), then by priority
  groups.today.sort((a, b) => {
    const aLate = a.dueDate < today
    const bLate = b.dueDate < today
    if (aLate !== bLate) return aLate ? -1 : 1
    if (aLate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    return byPriorityThenCreated(a, b)
  })
  // Overdue: oldest deadline first
  groups.overdue.sort(
    (a, b) => a.dueDate.localeCompare(b.dueDate) || byPriorityThenCreated(a, b),
  )
  // Upcoming: soonest first, then by priority
  groups.upcoming.sort(
    (a, b) => a.dueDate.localeCompare(b.dueDate) || byPriorityThenCreated(a, b),
  )
  groups.noDate.sort(byPriorityThenCreated)
  // Completed: most recently completed first
  groups.completed.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  return groups
}
