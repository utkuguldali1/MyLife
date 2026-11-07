import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Clock, MapPin, MoreHorizontal, Pencil, StickyNote, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { daysBetween } from '../../lib/dates'
import { formatTimeRange } from '../../lib/courses'
import { countdownLabel } from '../../lib/events'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Menu, { MenuItem } from '../../components/ui/Menu'
import CourseBadge from './CourseBadge'

// One exam / presentation in a list, with a little calendar block on the left.
//   event:      the event
//   course:     its course (for the colored label)
//   typeName:   e.g. "Exam"
//   showCourse: false on a course's own page (the course is obvious there)
export default function EventItem({ event, course, typeName, today, onEdit, showCourse = true }) {
  const deleteEvent = useAppStore((s) => s.deleteEvent)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const daysLeft = daysBetween(today, event.date)
  const isPast = daysLeft < 0
  const date = parseISO(event.date)

  // The closer it is, the more the countdown stands out
  const countdownColor = isPast
    ? 'text-neutral-400'
    : daysLeft <= 2
      ? 'font-medium text-red-600 dark:text-red-400'
      : daysLeft <= 7
        ? 'font-medium text-amber-600 dark:text-amber-400'
        : 'text-neutral-500 dark:text-neutral-400'

  return (
    <li
      className={`flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900 ${
        isPast ? 'opacity-60' : 'hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Mini calendar page: weekday, day, month */}
      <div className="flex w-12 shrink-0 flex-col items-center rounded-md bg-neutral-100 py-1 dark:bg-neutral-800">
        <span className="text-[10px] font-medium text-neutral-500 uppercase">{format(date, 'EEE')}</span>
        <span className="text-lg leading-tight font-semibold">{format(date, 'd')}</span>
        <span className="text-[10px] font-medium text-neutral-500 uppercase">{format(date, 'MMM')}</span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <button
          type="button"
          onClick={onEdit}
          className={`block max-w-full text-left text-sm font-medium break-words hover:text-indigo-600 dark:hover:text-indigo-400 ${
            isPast ? 'line-through' : ''
          }`}
        >
          {event.title}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
          {typeName && (
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{typeName}</span>
          )}
          {showCourse && <CourseBadge course={course} />}
          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            {event.startTime ? formatTimeRange(event.startTime, event.endTime) : 'All day'}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              {event.location}
            </span>
          )}
          {event.notes && (
            <span className="inline-flex items-center gap-1" title={event.notes}>
              <StickyNote size={13} />
              Note
            </span>
          )}
          <span className={countdownColor}>{countdownLabel(event.date, today)}</span>
        </div>
      </div>

      <Menu
        trigger={({ toggle, open }) => (
          <button
            type="button"
            onClick={toggle}
            aria-label={`Options for "${event.title}"`}
            aria-expanded={open}
            className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <MoreHorizontal size={16} />
          </button>
        )}
      >
        {(close) => (
          <>
            <MenuItem
              icon={Pencil}
              onClick={() => {
                onEdit()
                close()
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              icon={Trash2}
              danger
              onClick={() => {
                setConfirmingDelete(true)
                close()
              }}
            >
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete event?"
        message={`"${event.title}" will be deleted. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteEvent(event.id)}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  )
}
