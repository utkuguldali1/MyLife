// How an item's text looks: crossed out when done, red when overdue,
// faded for past exams and (a little) for lectures.
export function itemTextClass(item) {
  if (item.done) return 'text-neutral-400 line-through dark:text-neutral-500'
  if (item.overdue) return 'text-red-600 dark:text-red-400'
  if (item.past) return 'text-neutral-400 dark:text-neutral-500'
  if (item.kind === 'lecture') return 'text-neutral-500 dark:text-neutral-400'
  return 'text-neutral-800 dark:text-neutral-200'
}
