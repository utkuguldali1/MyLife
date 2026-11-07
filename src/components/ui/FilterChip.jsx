import { colorClasses } from '../../lib/colors'

// A filter button at the top ("All", "Cleaning", "Laundry"…)
export default function FilterChip({ active, onClick, color, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors ${
        active
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
      }`}
    >
      {color && <span className={`h-2 w-2 rounded-full ${colorClasses(color).dot}`} />}
      {children}
    </button>
  )
}
