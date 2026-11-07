import { useState } from 'react'
import TaskForm from '../tasks/TaskForm'
import CourseForm from './CourseForm'
import EventForm from './EventForm'

// Opens and closes the academic pop-ups (task, exam/event, course).
// Usage:
//   const { openForm, formElement } = useAcademicForms({ today })
//   openForm('task')            → new assignment
//   openForm('event', event)    → edit an event
//   …and put {formElement} somewhere in the page.
export function useAcademicForms({ today, defaultCourseId, onCourseCreated }) {
  const [form, setForm] = useState(null) // null = closed, or { kind, item }

  const close = () => setForm(null)
  const openForm = (kind, item = null) => setForm({ kind, item })

  let formElement = null
  if (form?.kind === 'task') {
    formElement = (
      <TaskForm
        open
        academic
        task={form.item}
        defaultCourseId={defaultCourseId}
        today={today}
        onClose={close}
      />
    )
  } else if (form?.kind === 'event') {
    formElement = (
      <EventForm
        open
        event={form.item}
        defaultCourseId={defaultCourseId}
        today={today}
        onClose={close}
      />
    )
  } else if (form?.kind === 'course') {
    formElement = (
      <CourseForm
        open
        course={form.item}
        onClose={close}
        onSaved={(course) => !form.item && onCourseCreated?.(course)}
      />
    )
  }

  return { openForm, formElement }
}
