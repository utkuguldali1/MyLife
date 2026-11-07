import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'
import { formatDateLabel } from '../../lib/dates'
import { WEEKDAYS } from '../../lib/courses'
import { PRIORITIES } from '../../lib/priorities'
import { describeSchedule, firstOccurrenceOnOrAfter, ordinal } from '../../lib/routines'
import Button from '../../components/ui/Button'
import ChoiceButton from '../../components/ui/ChoiceButton'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'

function Label({ children }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {children}
    </span>
  )
}

const SCHEDULE_TYPES = [
  { value: 'weekly', label: 'Days of the week' },
  { value: 'interval', label: 'Every few days' },
  { value: 'monthly', label: 'Monthly' },
]

// The pop-up for creating or editing a routine.
//   routine:           the routine being edited, or null for a new one
//   defaultCategoryId: preselected category for new routines
export default function RoutineForm({ open, routine, defaultCategoryId, today, onClose }) {
  const categories = useAppStore((s) => s.categories)
  const addRoutine = useAppStore((s) => s.addRoutine)
  const updateRoutine = useAppStore((s) => s.updateRoutine)

  const isEditing = Boolean(routine)
  const dailyCategories = categories.filter((c) => c.id !== ACADEMIC_CATEGORY_ID)
  const initial = routine?.schedule

  const [title, setTitle] = useState(routine?.title ?? '')
  const [categoryId, setCategoryId] = useState(
    routine ? (routine.categoryId ?? '') : (defaultCategoryId ?? dailyCategories[0]?.id ?? ''),
  )
  const [priority, setPriority] = useState(routine?.priority ?? 'medium')
  const [notes, setNotes] = useState(routine?.notes ?? '')
  // Each schedule type keeps its own values, so switching back and forth loses nothing
  const [type, setType] = useState(initial?.type ?? 'weekly')
  const [weekdays, setWeekdays] = useState(initial?.type === 'weekly' ? initial.weekdays : [1])
  const [every, setEvery] = useState(initial?.type === 'interval' ? initial.every : 3)
  const [unit, setUnit] = useState(initial?.type === 'interval' ? initial.unit : 'day')
  const [monthDay, setMonthDay] = useState(initial?.type === 'monthly' ? initial.day : 1)
  // New: first day it may happen. Editing: the next due date.
  const [startDate, setStartDate] = useState(routine?.nextDue ?? today)

  const schedule =
    type === 'weekly'
      ? { type, weekdays: [...weekdays].sort((a, b) => a - b) }
      : type === 'interval'
        ? { type, every: Math.max(1, Number(every) || 1), unit }
        : { type, day: monthDay }

  const scheduleValid = type !== 'weekly' || weekdays.length > 0
  const canSave = title.trim() && scheduleValid && startDate
  const firstDue = scheduleValid && startDate ? firstOccurrenceOnOrAfter(schedule, startDate) : null

  const toggleWeekday = (day) =>
    setWeekdays((days) => (days.includes(day) ? days.filter((d) => d !== day) : [...days, day]))

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return
    const values = {
      title: title.trim(),
      categoryId: categoryId || null,
      priority,
      notes,
      schedule,
      startDate,
    }
    if (isEditing) updateRoutine(routine.id, values)
    else addRoutine(values)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit routine' : 'New routine'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="routine-form" variant="primary" disabled={!canSave}>
            {isEditing ? 'Save' : 'Create routine'}
          </Button>
        </>
      }
    >
      <form id="routine-form" onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Take out the trash"
            data-autofocus
          />
        </Field>

        <Field label="Category">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {dailyCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="">No category</option>
          </Select>
        </Field>

        <div>
          <Label>Repeats</Label>
          <div className="flex flex-wrap gap-2">
            {SCHEDULE_TYPES.map((t) => (
              <ChoiceButton key={t.value} selected={type === t.value} onClick={() => setType(t.value)}>
                {t.label}
              </ChoiceButton>
            ))}
          </div>

          <div className="mt-3 rounded-md bg-neutral-50 p-3 dark:bg-neutral-800/50">
            {type === 'weekly' && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAYS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleWeekday(d.value)}
                      aria-pressed={weekdays.includes(d.value)}
                      aria-label={d.long}
                      className={`h-9 w-11 rounded-md text-sm font-medium transition-colors ${
                        weekdays.includes(d.value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-neutral-600 ring-1 ring-neutral-300 ring-inset hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-3 text-xs">
                  {[
                    ['Every day', [1, 2, 3, 4, 5, 6, 7]],
                    ['Weekdays', [1, 2, 3, 4, 5]],
                    ['Weekends', [6, 7]],
                  ].map(([label, days]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setWeekdays(days)}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {!scheduleValid && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">Pick at least one day.</p>
                )}
              </>
            )}

            {type === 'interval' && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                Every
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={every}
                  onChange={(e) => setEvery(e.target.value)}
                  aria-label="Number"
                  className="w-20"
                />
                <Select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  aria-label="Days or weeks"
                  className="w-auto"
                >
                  <option value="day">days</option>
                  <option value="week">weeks</option>
                </Select>
                <p className="w-full text-xs text-neutral-500">
                  Counted from the day you last did it.
                </p>
              </div>
            )}

            {type === 'monthly' && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                On the
                <Select
                  value={monthDay}
                  onChange={(e) => setMonthDay(Number(e.target.value))}
                  aria-label="Day of the month"
                  className="w-auto"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {ordinal(d)}
                    </option>
                  ))}
                </Select>
                of every month
                {monthDay > 28 && (
                  <p className="w-full text-xs text-neutral-500">
                    In shorter months, the last day of the month is used.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>{isEditing ? 'Next time' : 'Starting from'}</Label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label={isEditing ? 'Next time' : 'Starting from'}
              className="w-auto"
            />
            {firstDue && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {describeSchedule(schedule)} · {isEditing ? 'next due' : 'first due'}{' '}
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  {formatDateLabel(firstDue, today)}
                </span>
              </span>
            )}
          </div>
        </div>

        <div>
          <Label>Priority</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <ChoiceButton
                key={p.value}
                selected={priority === p.value}
                onClick={() => setPriority(p.value)}
              >
                <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                {p.label}
              </ChoiceButton>
            ))}
          </div>
        </div>

        <Field label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else to remember…"
          />
        </Field>
      </form>
    </Modal>
  )
}
