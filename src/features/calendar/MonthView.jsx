import { format, parseISO } from 'date-fns'
import { WEEKDAYS } from '../../lib/courses'
import { colorClasses } from '../../lib/colors'
import CalendarChip from './CalendarChip'

const MAX_CHIPS = 3
const MAX_DOTS = 4

// A month as a grid of days (Monday first). Click a day to select it.
//   weeks:    from monthGrid()
//   month:    "YYYY-MM" of the shown month (other days are greyed out)
//   items:    { date: [item…] }
export default function MonthView({ weeks, month, items, today, selected, onSelect }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        {WEEKDAYS.map((d) => (
          <div key={d.value} className="py-2">
            <span className="sm:hidden">{d.short.slice(0, 2)}</span>
            <span className="hidden sm:inline">{d.short}</span>
          </div>
        ))}
      </div>

      {/* gap-px on a grey background draws the thin lines between days */}
      <div className="grid grid-cols-7 gap-px bg-neutral-200 dark:bg-neutral-800">
        {weeks.flat().map((date) => {
          const dayItems = items[date] ?? []
          const inMonth = date.startsWith(month)
          const isToday = date === today
          const isSelected = date === selected
          const hidden = dayItems.length - MAX_CHIPS
          const label = `${format(parseISO(date), 'EEEE d MMMM')}, ${dayItems.length} ${dayItems.length === 1 ? 'item' : 'items'}`

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={label}
              aria-pressed={isSelected}
              className={`flex min-h-16 min-w-0 flex-col items-stretch gap-0.5 p-1 text-left transition-colors sm:min-h-28 sm:p-1.5 ${
                isSelected
                  ? 'bg-indigo-50 ring-2 ring-indigo-500 ring-inset dark:bg-indigo-950'
                  : inMonth
                    ? 'bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900'
                    : 'bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800'
              }`}
            >
              <span
                className={`mb-0.5 flex h-6 w-6 items-center justify-center self-center rounded-full text-xs sm:self-start ${
                  isToday
                    ? 'bg-indigo-600 font-semibold text-white'
                    : inMonth
                      ? 'text-neutral-800 dark:text-neutral-200'
                      : 'text-neutral-400 dark:text-neutral-600'
                }`}
              >
                {Number(date.slice(8))}
              </span>

              {/* Phones: colored dots */}
              <span className="flex flex-wrap justify-center gap-0.5 sm:hidden">
                {dayItems.slice(0, MAX_DOTS).map((item) => (
                  <span
                    key={item.key}
                    className={`h-1.5 w-1.5 rounded-full ${colorClasses(item.color).dot} ${
                      item.done || item.past ? 'opacity-40' : ''
                    }`}
                  />
                ))}
              </span>

              {/* Larger screens: short item names */}
              <span className={`hidden min-w-0 flex-col gap-px sm:flex ${inMonth ? '' : 'opacity-60'}`}>
                {dayItems.slice(0, MAX_CHIPS).map((item) => (
                  <CalendarChip key={item.key} item={item} />
                ))}
                {hidden > 0 && (
                  <span className="px-1 text-[11px] font-medium text-neutral-500">+{hidden} more</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
