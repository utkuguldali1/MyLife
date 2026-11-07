import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'
import { createId } from '../../lib/ids'
import { addDaysISO } from '../../lib/dates'
import { PRIORITIES } from '../../lib/priorities'
import Button from '../../components/ui/Button'
import ChoiceButton from '../../components/ui/ChoiceButton'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import Checklist from './Checklist'

// The pop-up for creating a new task or editing an existing one.
//   task:              the task being edited, or null for a new one
//   academic:          true for university tasks (course + type instead of category)
//   defaultCategoryId: preselected category for new everyday tasks
//   defaultCourseId:   preselected course for new academic tasks
//   defaultDate:       preselected due date for new tasks
export default function TaskForm({
  open,
  task,
  academic = task?.categoryId === ACADEMIC_CATEGORY_ID,
  defaultCategoryId,
  defaultCourseId,
  defaultDate,
  today,
  onClose,
}) {
  const categories = useAppStore((s) => s.categories)
  const courses = useAppStore((s) => s.courses)
  const academicTypes = useAppStore((s) => s.academicTypes)
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)

  const isEditing = Boolean(task)
  const dailyCategories = categories.filter((c) => c.id !== ACADEMIC_CATEGORY_ID)
  const taskTypes = academicTypes.filter((t) => t.kind === 'task')
  // Archived courses are hidden — unless this task already belongs to one
  const courseOptions = courses.filter((c) => !c.archived || c.id === task?.courseId)

  // The form keeps its own copy of the values until you press Save
  const [title, setTitle] = useState(task?.title ?? '')
  const [categoryId, setCategoryId] = useState(
    task ? (task.categoryId ?? '') : (defaultCategoryId ?? dailyCategories[0]?.id ?? ''),
  )
  const [courseId, setCourseId] = useState(
    task ? (task.courseId ?? '') : (defaultCourseId ?? courseOptions[0]?.id ?? ''),
  )
  const [typeId, setTypeId] = useState(task ? (task.typeId ?? '') : (taskTypes[0]?.id ?? ''))
  // Everyday tasks start as "today"; university tasks start without a date,
  // so you pick the real deadline
  const [dueDate, setDueDate] = useState(
    task ? (task.dueDate ?? '') : (defaultDate ?? (academic ? '' : today)),
  )
  const [priority, setPriority] = useState(task?.priority ?? 'medium')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [checklist, setChecklist] = useState(task?.checklist ?? [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const values = {
      title: title.trim(),
      ...(academic
        ? { categoryId: ACADEMIC_CATEGORY_ID, courseId: courseId || null, typeId: typeId || null }
        : { categoryId: categoryId || null }),
      dueDate: dueDate || null,
      priority,
      notes,
      checklist: checklist.filter((i) => i.text.trim()),
    }
    if (isEditing) updateTask(task.id, values)
    else addTask(values)
    onClose()
  }

  const tomorrow = addDaysISO(today, 1)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isEditing ? 'Edit task' : academic ? 'New assignment or homework' : 'New task'
      }
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-form" variant="primary" disabled={!title.trim()}>
            {isEditing ? 'Save' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
        <Field label="Title">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={academic ? 'e.g. Exercise sheet 5' : 'e.g. Do the laundry'}
            data-autofocus
          />
        </Field>

        {academic ? (
          <div className="grid gap-4 sm:grid-cols-2">
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
            <Field label="Type">
              <Select value={typeId} onChange={(e) => setTypeId(e.target.value)}>
                {taskTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="">No type</option>
              </Select>
            </Field>
          </div>
        ) : (
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
        )}

        <div>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Due date
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <ChoiceButton selected={dueDate === today} onClick={() => setDueDate(today)}>
              Today
            </ChoiceButton>
            <ChoiceButton selected={dueDate === tomorrow} onClick={() => setDueDate(tomorrow)}>
              Tomorrow
            </ChoiceButton>
            <ChoiceButton selected={dueDate === ''} onClick={() => setDueDate('')}>
              No date
            </ChoiceButton>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              aria-label="Pick a due date"
              className="w-auto"
            />
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Priority
          </span>
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

        <div>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Checklist <span className="font-normal text-neutral-500">(optional)</span>
          </span>
          <div className="rounded-md p-1.5 ring-1 ring-neutral-300 ring-inset dark:ring-neutral-700">
            <Checklist
              items={checklist}
              onAdd={(text) =>
                setChecklist((list) => [...list, { id: createId(), text: text.trim(), done: false }])
              }
              onToggle={(id) =>
                setChecklist((list) => list.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
              }
              onUpdate={(id, text) =>
                setChecklist((list) => list.map((i) => (i.id === id ? { ...i, text } : i)))
              }
              onDelete={(id) => setChecklist((list) => list.filter((i) => i.id !== id))}
            />
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
