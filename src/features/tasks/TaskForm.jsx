import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'
import { createId } from '../../lib/ids'
import { addDaysISO } from '../../lib/dates'
import { PRIORITIES } from '../../lib/priorities'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import Checklist from './Checklist'

// A row of small toggle buttons where exactly one is selected
function ChoiceButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors ${
        selected
          ? 'bg-indigo-50 font-medium text-indigo-700 ring-1 ring-indigo-600/30 ring-inset dark:bg-indigo-500/15 dark:text-indigo-300 dark:ring-indigo-400/30'
          : 'text-neutral-600 ring-1 ring-neutral-300 ring-inset hover:bg-neutral-50 dark:text-neutral-400 dark:ring-neutral-700 dark:hover:bg-neutral-800'
      }`}
    >
      {children}
    </button>
  )
}

// The pop-up for creating a new task or editing an existing one.
//   task:              the task being edited, or null for a new one
//   defaultCategoryId: preselected category for new tasks
export default function TaskForm({ open, task, defaultCategoryId, today, onClose }) {
  const categories = useAppStore((s) => s.categories)
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)

  const isEditing = Boolean(task)
  const dailyCategories = categories.filter((c) => c.id !== ACADEMIC_CATEGORY_ID)

  // The form keeps its own copy of the values until you press Save
  const [title, setTitle] = useState(task?.title ?? '')
  const [categoryId, setCategoryId] = useState(
    task ? (task.categoryId ?? '') : (defaultCategoryId ?? dailyCategories[0]?.id ?? ''),
  )
  const [dueDate, setDueDate] = useState(task ? (task.dueDate ?? '') : today)
  const [priority, setPriority] = useState(task?.priority ?? 'medium')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [checklist, setChecklist] = useState(task?.checklist ?? [])

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const values = {
      title: title.trim(),
      categoryId: categoryId || null,
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
      title={isEditing ? 'Edit task' : 'New task'}
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
            placeholder="e.g. Do the laundry"
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
