import { format, parseISO } from 'date-fns'
import CalendarChip from './CalendarChip'

// One week: 7 columns on wide screens, a list of days on smaller ones.
// Every item of a day is shown. Click a day to select it.
export default function WeekView({ days, items, today, selected, onSelect }) {
  return (
    <div className="grid gap-2 xl:grid-cols-7 xl:gap-0 xl:divide-x xl:overflow-hidden xl:rounded-lg xl:border xl:border-neutral-200 xl:divide-neutral-200 dark:xl:divide-neutral-800 dark:xl:border-neutral-800">
      {days.map((date) => {
        const dayItems = items[date] ?? []
        const isToday = date === today
        const isSelected = date === selected
        const parsed = parseISO(date)

        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            aria-pressed={isSelected}
            aria-label={`${format(parsed, 'EEEE d MMMM')}, ${dayItems.length} items`}
            className={`flex min-w-0 flex-col items-stretch gap-1 rounded-lg border p-2 text-left transition-colors xl:min-h-72 xl:rounded-none xl:border-0 ${
              isSelected
                ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500 xl:ring-2 xl:ring-inset dark:bg-indigo-500/10'
                : 'border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900'
            }`}
          >
            <span className="mb-1 flex items-center gap-2 xl:flex-col xl:items-start xl:gap-0">
              <span className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                {format(parsed, 'EEE')}
              </span>
              <span
                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-semibold ${
                  isToday ? 'bg-indigo-600 text-white' : ''
                }`}
              >
                {format(parsed, 'd')}
              </span>
            </span>
            {dayItems.length === 0 ? (
              <span className="px-1 text-[11px] text-neutral-400 xl:hidden">Nothing planned</span>
            ) : (
              dayItems.map((item) => <CalendarChip key={item.key} item={item} wrap />)
            )}
          </button>
        )
      })}
    </div>
  )
}
