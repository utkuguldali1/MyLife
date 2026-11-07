import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { addMinutesToTime, timeToMinutes } from '../../lib/courses'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ChoiceButton from '../../components/ui/ChoiceButton'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import TimeSelect from '../../components/ui/TimeSelect'

// The pop-up for creating or editing an exam, presentation or other event.
//   event:           the event being edited, or null for a new one
//   defaultCourseId: preselected course for new events
//   defaultDate:     preselected date for new events
export default function EventForm({ open, event, defaultCourseId, defaultDate, today, onClose }) {
  const courses = useAppStore((s) => s.courses)
  const academicTypes = useAppStore((s) => s.academicTypes)
  const addEvent = useAppStore((s) => s.addEvent)
  const updateEvent = useAppStore((s) => s.updateEvent)

  const isEditing = Boolean(event)
  const eventTypes = academicTypes.filter((t) => t.kind === 'event')
  // Archived courses are hidden — unless this event already belongs to one
  const courseOptions = courses.filter((c) => !c.archived || c.id === event?.courseId)

  const [title, setTitle] = useState(event?.title ?? '')
  const [typeId, setTypeId] = useState(event ? (event.typeId ?? '') : (eventTypes[0]?.id ?? ''))
  const [courseId, setCourseId] = useState(
    event ? (event.courseId ?? '') : (defaultCourseId ?? courseOptions.find((c) => !c.archived)?.id ?? ''),
  )
  const [date, setDate] = useState(event?.date ?? defaultDate ?? '')
  const [hasTime, setHasTime] = useState(event ? Boolean(event.startTime) : true)
  const [startTime, setStartTime] = useState(event?.startTime ?? '10:00')
  const [endTime, setEndTime] = useState(event?.endTime ?? '12:00')
  const [location, setLocation] = useState(event?.location ?? '')
  const [notes, setNotes] = useState(event?.notes ?? '')

  const canSave = title.trim() && date

  function changeStart(start) {
    // Keep the same length when the start moves
    const length = endTime ? timeToMinutes(endTime) - timeToMinutes(startTime) : 0
    setStartTime(start)
    if (endTime) setEndTime(addMinutesToTime(start, length > 0 ? length : 60))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return
    const values = {
      title: title.trim(),
      typeId: typeId || null,
      courseId: courseId || null,
      date,
      startTime: hasTime ? startTime : null,
      endTime: hasTime && endTime ? endTime : null,
      location: location.trim(),
      notes,
    }
    if (isEditing) updateEvent(event.id, values)
    else addEvent(values)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit exam or event' : 'New exam or event'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="event-form" variant="primary" disabled={!canSave}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Linear Algebra midterm"
            data-autofocus
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              {eventTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
              <option value="">No type</option>
            </Select>
          </Field>
          <Field label="Course">
            <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value="">No course</option>
            </Select>
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Date and time
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={date}
              min={isEditing ? undefined : today}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Date"
              className="w-auto"
              required
            />
            <ChoiceButton selected={hasTime} onClick={() => setHasTime(true)}>
              At a time
            </ChoiceButton>
            <ChoiceButton selected={!hasTime} onClick={() => setHasTime(false)}>
              All day
            </ChoiceButton>
          </div>
          {hasTime && (
            <div className="mt-2 flex items-center gap-1.5">
              <TimeSelect
                value={startTime}
                onChange={changeStart}
                aria-label="Start time"
                className="w-auto"
              />
              <span className="text-neutral-400">–</span>
              <TimeSelect
                value={endTime}
                onChange={setEndTime}
                allowEmpty
                aria-label="End time"
                className="w-auto"
              />
            </div>
          )}
        </div>

        <Field label="Location">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Audimax (optional)"
          />
        </Field>

        <Field label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Topics, allowed materials…"
          />
        </Field>
      </form>
    </Modal>
  )
}
