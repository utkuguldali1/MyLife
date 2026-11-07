// Task priorities. The color appears as a thin stripe on the left of each task.
export const PRIORITIES = [
  { value: 'high', label: 'High', stripe: 'bg-red-500', dot: 'bg-red-500' },
  { value: 'medium', label: 'Medium', stripe: 'bg-amber-400', dot: 'bg-amber-400' },
  { value: 'low', label: 'Low', stripe: 'bg-emerald-500', dot: 'bg-emerald-500' },
]

// Used for sorting: high comes first
export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }

export function getPriority(value) {
  return PRIORITIES.find((p) => p.value === value) ?? PRIORITIES[1]
}
