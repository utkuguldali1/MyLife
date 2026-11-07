import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

// One type line: editable name + delete button
function TypeRow({ type, usedCount, onDelete }) {
  const renameAcademicType = useAppStore((s) => s.renameAcademicType)
  const [name, setName] = useState(type.name)

  function saveName() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== type.name) renameAcademicType(type.id, trimmed)
    else setName(type.name) // empty name → go back to the old one
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={saveName}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label="Type name"
        className="flex-1"
      />
      <span className="hidden w-16 text-right text-xs text-neutral-500 sm:block">
        {usedCount} used
      </span>
      <Button variant="ghost" size="icon" aria-label={`Delete ${type.name}`} onClick={onDelete}>
        <Trash2 size={15} />
      </Button>
    </li>
  )
}

// A list of types of one kind ("task" or "event") with an "add" field
function TypeGroup({ kind, title, description, placeholder, usedCount, onDelete }) {
  const academicTypes = useAppStore((s) => s.academicTypes)
  const addAcademicType = useAppStore((s) => s.addAcademicType)
  const [newName, setNewName] = useState('')
  const types = academicTypes.filter((t) => t.kind === kind)

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    addAcademicType({ name: newName, kind })
    setNewName('')
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{title}</h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
      <ul className="mt-1 divide-y divide-neutral-200 dark:divide-neutral-800">
        {types.map((type) => (
          <TypeRow
            key={`${type.id}-${type.name}`}
            type={type}
            usedCount={usedCount(type.id)}
            onDelete={() => onDelete(type)}
          />
        ))}
      </ul>
      <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={placeholder}
          aria-label={`New ${kind} type`}
          className="flex-1"
        />
        <Button type="submit" disabled={!newName.trim()}>
          <Plus size={15} /> Add
        </Button>
      </form>
    </div>
  )
}

// Settings section: the kinds of academic items (Assignment, Exam, …)
export default function AcademicTypeManager() {
  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const deleteAcademicType = useAppStore((s) => s.deleteAcademicType)
  const [pendingDelete, setPendingDelete] = useState(null)

  const usedCount = (typeId) =>
    tasks.filter((t) => t.typeId === typeId).length +
    events.filter((e) => e.typeId === typeId).length

  return (
    <section>
      <h2 className="text-sm font-semibold">Academic types</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        The kinds of university items you can create. Click a name to rename it.
      </p>

      <div className="mt-4 grid gap-8 sm:grid-cols-2">
        <TypeGroup
          kind="task"
          title="Tasks"
          description="Things you complete before a deadline."
          placeholder="e.g. Lab report"
          usedCount={usedCount}
          onDelete={setPendingDelete}
        />
        <TypeGroup
          kind="event"
          title="Exams & events"
          description="Things that happen on a date."
          placeholder="e.g. Oral exam"
          usedCount={usedCount}
          onDelete={setPendingDelete}
        />
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        message={
          pendingDelete && usedCount(pendingDelete.id) > 0
            ? `Its ${usedCount(pendingDelete.id)} item(s) will be kept, but will have no type.`
            : 'No items use this type.'
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteAcademicType(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
