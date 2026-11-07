import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { createId } from '../../lib/ids'
import { COLOR_NAMES } from '../../lib/colors'
import { sortLectures } from '../../lib/courses'
import Button from '../../components/ui/Button'
import ColorPicker from '../../components/ui/ColorPicker'
import Modal from '../../components/ui/Modal'
import { Field, Input, Textarea } from '../../components/ui/Field'
import LectureEditor from './LectureEditor'
import LinkList from './LinkList'

function SectionLabel({ children, hint }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
      {children} {hint && <span className="font-normal text-neutral-500">{hint}</span>}
    </span>
  )
}

// The pop-up for creating or editing a course.
//   course:  the course being edited, or null for a new one
//   onSaved: called with the saved course (e.g. to open its page)
export default function CourseForm({ open, course, onClose, onSaved }) {
  const courses = useAppStore((s) => s.courses)
  const addCourse = useAppStore((s) => s.addCourse)
  const updateCourse = useAppStore((s) => s.updateCourse)

  const isEditing = Boolean(course)
  const unusedColor =
    COLOR_NAMES.find((c) => !courses.some((other) => other.color === c)) ?? COLOR_NAMES[0]

  const [name, setName] = useState(course?.name ?? '')
  const [code, setCode] = useState(course?.code ?? '')
  const [instructor, setInstructor] = useState(course?.instructor ?? '')
  const [color, setColor] = useState(course?.color ?? unusedColor)
  const [lectures, setLectures] = useState(course?.lectures ?? [])
  const [links, setLinks] = useState(course?.links ?? [])
  const [notes, setNotes] = useState(course?.notes ?? '')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const values = {
      name: name.trim(),
      code: code.trim(),
      instructor: instructor.trim(),
      color,
      lectures: sortLectures(lectures).map((l) => ({ ...l, label: l.label.trim() })),
      links,
      notes,
    }
    if (isEditing) {
      updateCourse(course.id, values)
      onSaved?.(course)
    } else {
      onSaved?.(addCourse(values))
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit course' : 'New course'}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="course-form" variant="primary" disabled={!name.trim()}>
            {isEditing ? 'Save' : 'Create course'}
          </Button>
        </>
      }
    >
      <form id="course-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <SectionLabel>Name</SectionLabel>
          <div className="flex items-center gap-2">
            <ColorPicker value={color} onChange={setColor} />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Linear Algebra"
              aria-label="Course name"
              data-autofocus
              className="flex-1"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course code">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MA 1101 (optional)"
            />
          </Field>
          <Field label="Instructor">
            <Input
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Prof. Weber (optional)"
            />
          </Field>
        </div>

        <div>
          <SectionLabel hint="(shown on your calendar)">Weekly lecture times</SectionLabel>
          <LectureEditor lectures={lectures} onChange={setLectures} />
        </div>

        <div>
          <SectionLabel hint="(Moodle, exercise sheets, recordings…)">Links</SectionLabel>
          <LinkList
            links={links}
            onAdd={(link) => setLinks((list) => [...list, { id: createId(), ...link }])}
            onUpdate={(id, changes) =>
              setLinks((list) => list.map((l) => (l.id === id ? { ...l, ...changes } : l)))
            }
            onDelete={(id) => setLinks((list) => list.filter((l) => l.id !== id))}
          />
        </div>

        <Field label="Notes">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Office hours, grading rules, anything else…"
          />
        </Field>
      </form>
    </Modal>
  )
}
