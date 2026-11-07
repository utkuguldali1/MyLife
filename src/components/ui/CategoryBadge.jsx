import { colorClasses } from '../../lib/colors'

// A small colored label showing an item's category, e.g. "● Laundry"
export default function CategoryBadge({ category }) {
  const name = category?.name ?? 'No category'
  const colors = colorClasses(category?.color)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${colors.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
      {name}
    </span>
  )
}
