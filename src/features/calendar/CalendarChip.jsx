import { colorClasses } from '../../lib/colors'
import { itemTextClass } from './itemStyles'

// A tiny one-line item inside a calendar day: "● 10:00 Midterm"
//   wrap: allow the title to wrap onto more lines (week view)
export default function CalendarChip({ item, wrap = false }) {
  const colors = colorClasses(item.color)
  const exam = item.kind === 'event'
  return (
    <span
      className={`flex items-start gap-1 rounded px-1 py-px text-left text-[11px] leading-4 ${
        exam && !item.past ? colors.pill : ''
      } ${item.done || item.past ? 'opacity-70' : ''}`}
    >
      <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
      <span className={`min-w-0 ${wrap ? 'break-words' : 'truncate'} ${exam ? 'font-semibold' : ''} ${itemTextClass(item)}`}>
        {item.time && (
          <span className={`mr-1 tabular-nums opacity-80 ${wrap ? 'xl:block' : ''}`}>{item.time}</span>
        )}
        {item.title}
      </span>
    </span>
  )
}
