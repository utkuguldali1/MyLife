import { useState } from 'react'
import { Link } from 'react-router'
import { format, parseISO } from 'date-fns'
import { CalendarClock, ChevronRight, ClipboardList, Clock, Plus, Repeat } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatDateLabel } from '../../lib/dates'
import { colorClasses } from '../../lib/colors'
import { formatTimeRange } from '../../lib/courses'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import TaskCheckbox from '../tasks/TaskCheckbox'
import { itemTextClass } from './itemStyles'

const KIND_LABELS = { task: 'Task', event: 'Event', routine: 'Routine', lecture: 'Lecture' }

// One item in the day list, with a tick box where that makes sense
function DayItem({ item, today, onOpen }) {
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone)
  const completeRoutine = useAppStore((s) => s.completeRoutine)
  const colors = colorClasses(item.color)

  let control = null
  if (item.kind === 'task') {
    control = (
      <TaskCheckbox
        checked={item.done}
        onChange={() => toggleTaskDone(item.task.id)}
        label={item.done ? `Mark "${item.title}" as not done` : `Complete "${item.title}"`}
        size="sm"
      />
    )
  } else if (item.kind === 'routine' && (item.actionable || item.done)) {
    control = (
      <TaskCheckbox
        checked={item.done}
        // Done routines are undone from the Routines page (keeps history simple)
        onChange={() => !item.done && completeRoutine(item.routine.id, today)}
        label={item.done ? `"${item.title}" is done` : `Complete "${item.title}"`}
        size="sm"
      />
    )
  } else {
    const Icon = item.kind === 'routine' ? Repeat : item.kind === 'event' ? CalendarClock : Clock
    control = <Icon size={15} className="text-neutral-400" />
  }

  const meta = [
    item.typeName ?? KIND_LABELS[item.kind],
    item.time && formatTimeRange(item.time, item.endTime),
    item.kind === 'event' && !item.time && 'All day',
    item.kind === 'event' && item.event.location,
    item.kind === 'routine' && !item.actionable && !item.done && 'Planned',
    item.overdue && 'Overdue',
  ].filter(Boolean)

  return (
    <li className="flex items-start gap-2.5 py-2">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{control}</span>
      <span className={`mt-0.5 h-4 w-1 shrink-0 rounded-full ${colors.dot}`} />
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left hover:opacity-80"
      >
        <span className={`block text-sm font-medium break-words ${itemTextClass(item)}`}>
          {item.title}
        </span>
        <span
          className={`block text-xs ${item.overdue ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-neutral-400'}`}
        >
          {meta.join(' · ')}
        </span>
      </button>
      {item.kind === 'lecture' && <ChevronRight size={15} className="mt-1 text-neutral-400" />}
    </li>
  )
}

// The details of the selected day + a quick way to add things to it.
//   onOpen(item):      open an item (edit pop-up, or course page for lectures)
//   onAdd(kind, date): open a "new" pop-up with this date filled in
export default function DayPanel({ date, items, today, onOpen, onAdd }) {
  const addTask = useAppStore((s) => s.addTask)
  const [title, setTitle] = useState('')
  const dayLabel = formatDateLabel(date, today)
  const isPast = date < today

  function quickAdd(e) {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title, dueDate: date, categoryId: null })
    setTitle('')
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-base font-semibold">{format(parseISO(date), 'EEEE, d MMMM')}</h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {['Today', 'Tomorrow', 'Yesterday'].includes(dayLabel) ? `${dayLabel} · ` : ''}
        {items.length === 0 ? 'Nothing planned' : `${items.length} ${items.length === 1 ? 'item' : 'items'}`}
      </p>

      {items.length > 0 && (
        <ul className="mt-2 divide-y divide-neutral-100 dark:divide-neutral-800">
          {items.map((item) => (
            <DayItem key={item.key} item={item} today={today} onOpen={() => onOpen(item)} />
          ))}
        </ul>
      )}

      {/* Quick add: type and press Enter for an everyday task on this day */}
      <form onSubmit={quickAdd} className="mt-4 flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Add a task for ${dayLabel === 'Today' || dayLabel === 'Tomorrow' ? dayLabel.toLowerCase() : format(parseISO(date), 'd MMM')}…`}
          aria-label="Quick add task"
          className="flex-1"
        />
        <Button type="submit" size="icon" className="h-9 w-9" aria-label="Add task" disabled={!title.trim()}>
          <Plus size={16} />
        </Button>
      </form>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <button
          type="button"
          onClick={() => onAdd('task', date)}
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Task with details…
        </button>
        <button
          type="button"
          onClick={() => onAdd('academic', date)}
          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <ClipboardList size={12} /> Assignment
        </button>
        {!isPast && (
          <button
            type="button"
            onClick={() => onAdd('event', date)}
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <CalendarClock size={12} /> Exam or presentation
          </button>
        )}
      </div>
      <p className="mt-3 text-[11px] text-neutral-400">
        Routines and lectures are set up on the{' '}
        <Link to="/routines" className="underline">Routines</Link> and{' '}
        <Link to="/academic?tab=courses" className="underline">Courses</Link> pages.
      </p>
    </section>
  )
}
