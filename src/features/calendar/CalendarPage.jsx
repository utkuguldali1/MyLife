import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { format, isValid, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'
import { useToday } from '../../hooks/useToday'
import { addDaysISO } from '../../lib/dates'
import { monthGrid, shiftMonth, weekDays } from '../../lib/calendar'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import FilterChip from '../../components/ui/FilterChip'
import TaskForm from '../tasks/TaskForm'
import EventForm from '../academic/EventForm'
import RoutineForm from '../routines/RoutineForm'
import DayPanel from './DayPanel'
import MonthView from './MonthView'
import WeekView from './WeekView'
import { useCalendarItems } from './useCalendarItems'

const KIND_FILTERS = [
  { value: 'task', label: 'Tasks' },
  { value: 'event', label: 'Exams & presentations' },
  { value: 'routine', label: 'Routines' },
  { value: 'lecture', label: 'Lectures' },
]

// Month / Week toggle
function ViewSwitch({ value, onChange }) {
  return (
    <div className="inline-flex rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800">
      {[
        ['month', 'Month'],
        ['week', 'Week'],
      ].map(([v, label]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          aria-pressed={value === v}
          className={`rounded px-3 py-1 text-sm transition-colors ${
            value === v
              ? 'bg-white font-medium text-neutral-900 shadow-sm dark:bg-neutral-950 dark:text-neutral-100'
              : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function CalendarPage() {
  const today = useToday()
  const navigate = useNavigate()
  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const routines = useAppStore((s) => s.routines)

  // View and selected day live in the address (?view=week&date=2026-11-09),
  // so a reload or "Back" keeps your place
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'week' ? 'week' : 'month'
  const dateParam = params.get('date')
  const selected = dateParam && isValid(parseISO(dateParam)) ? dateParam : today
  const update = (changes) => {
    const next = { view, date: selected, ...changes }
    setParams(
      {
        ...(next.view === 'week' ? { view: 'week' } : {}),
        ...(next.date !== today ? { date: next.date } : {}),
      },
      { replace: true },
    )
  }

  const [hiddenKinds, setHiddenKinds] = useState(() => new Set())
  const toggleKind = (kind) =>
    setHiddenKinds((set) => {
      const next = new Set(set)
      if (next.has(kind)) next.delete(kind)
      else next.add(kind)
      return next
    })

  const [form, setForm] = useState(null) // null = closed, or { kind, item, date }
  const closeForm = () => setForm(null)

  // Which days are visible
  const weeks = monthGrid(selected)
  const days = weekDays(selected)
  const fromISO = view === 'month' ? weeks[0][0] : days[0]
  const toISO = view === 'month' ? weeks.at(-1)[6] : days[6]
  const items = useCalendarItems(fromISO, toISO, today, hiddenKinds)

  function go(direction) {
    if (view === 'week') return update({ date: addDaysISO(selected, 7 * direction) })
    const first = shiftMonth(selected, direction)
    // Jumping into the current month selects today, otherwise the 1st
    update({ date: first.slice(0, 7) === today.slice(0, 7) ? today : first })
  }

  const title =
    view === 'month'
      ? format(parseISO(selected), 'MMMM yyyy')
      : `${format(parseISO(days[0]), 'd MMM')} – ${format(parseISO(days[6]), 'd MMM yyyy')}`

  function openItem(item) {
    if (item.kind === 'lecture') return navigate(`/academic/courses/${item.course.id}`)
    if (item.kind === 'event') return setForm({ kind: 'event', item: item.event })
    if (item.kind === 'routine') return setForm({ kind: 'routine', item: item.routine })
    const academic = item.task.categoryId === ACADEMIC_CATEGORY_ID
    setForm({ kind: academic ? 'academic' : 'task', item: item.task })
  }

  const isEmpty = tasks.length === 0 && events.length === 0 && routines.length === 0

  return (
    <>
      <PageHeader title="Calendar" description="Deadlines, exams, routines and lectures in one place." />

      {/* Toolbar: ‹ Today › · title · Month/Week */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" onClick={() => go(-1)} aria-label={`Previous ${view}`}>
            <ChevronLeft size={18} />
          </Button>
          <Button size="sm" onClick={() => update({ date: today })} disabled={selected === today}>
            Today
          </Button>
          <Button size="icon" variant="ghost" onClick={() => go(1)} aria-label={`Next ${view}`}>
            <ChevronRight size={18} />
          </Button>
          <h2 className="ml-1 text-lg font-semibold whitespace-nowrap">{title}</h2>
        </div>
        <ViewSwitch value={view} onChange={(v) => update({ view: v })} />
      </div>

      {/* Show / hide kinds of items */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
        {KIND_FILTERS.map((k) => (
          <FilterChip
            key={k.value}
            active={!hiddenKinds.has(k.value)}
            onClick={() => toggleKind(k.value)}
          >
            {k.label}
          </FilterChip>
        ))}
      </div>

      {isEmpty && (
        <p className="mb-4 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
          Your calendar is empty. Click a day to add a task, or add courses, exams and routines on
          their pages — they'll all show up here.
        </p>
      )}

      {/* Month: day details beside the grid on wide screens. Week: always below, so the 7 columns get the full width */}
      <div className={`grid gap-6 ${view === 'month' ? 'xl:grid-cols-[1fr_20rem]' : ''}`}>
        <div className="min-w-0">
          {view === 'month' ? (
            <MonthView
              weeks={weeks}
              month={selected.slice(0, 7)}
              items={items}
              today={today}
              selected={selected}
              onSelect={(date) => update({ date })}
            />
          ) : (
            <WeekView
              days={days}
              items={items}
              today={today}
              selected={selected}
              onSelect={(date) => update({ date })}
            />
          )}
        </div>
        <div className={view === 'month' ? 'xl:sticky xl:top-6 xl:self-start' : ''}>
          <DayPanel
            date={selected}
            items={items[selected] ?? []}
            today={today}
            onOpen={openItem}
            onAdd={(kind, date) => setForm({ kind, item: null, date })}
          />
        </div>
      </div>

      {(form?.kind === 'task' || form?.kind === 'academic') && (
        <TaskForm
          open
          task={form.item}
          academic={form.kind === 'academic'}
          defaultDate={form.date}
          today={today}
          onClose={closeForm}
        />
      )}
      {form?.kind === 'event' && (
        <EventForm open event={form.item} defaultDate={form.date} today={today} onClose={closeForm} />
      )}
      {form?.kind === 'routine' && (
        <RoutineForm open routine={form.item} today={today} onClose={closeForm} />
      )}
    </>
  )
}
