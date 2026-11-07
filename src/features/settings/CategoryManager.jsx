import { useState } from 'react'
import { Lock, Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { COLOR_NAMES, colorClasses } from '../../lib/colors'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'
import Menu from '../../components/ui/Menu'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

// A round color button that opens a palette to pick a new color
function ColorPicker({ value, onChange }) {
  return (
    <Menu
      align="left"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label="Change color"
          title="Change color"
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <span className={`h-4 w-4 rounded-full ${colorClasses(value).dot}`} />
        </button>
      )}
    >
      {(close) => (
        <div className="grid grid-cols-6 gap-1 p-1">
          {COLOR_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              title={colorClasses(name).label}
              aria-label={colorClasses(name).label}
              onClick={() => {
                onChange(name)
                close()
              }}
              className={`flex h-7 w-7 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                name === value ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <span className={`h-4 w-4 rounded-full ${colorClasses(name).dot}`} />
            </button>
          ))}
        </div>
      )}
    </Menu>
  )
}

// One category line: color, editable name, delete button
function CategoryRow({ category, taskCount, onDelete }) {
  const updateCategory = useAppStore((s) => s.updateCategory)
  const [name, setName] = useState(category.name)

  function saveName() {
    const trimmed = name.trim()
    if (trimmed && trimmed !== category.name) updateCategory(category.id, { name: trimmed })
    else setName(category.name) // empty name → go back to the old one
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <ColorPicker value={category.color} onChange={(color) => updateCategory(category.id, { color })} />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={saveName}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label="Category name"
        className="flex-1"
      />
      <span className="hidden w-16 text-right text-xs text-neutral-500 sm:block">
        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
      </span>
      {category.locked ? (
        <span
          className="flex h-8 w-8 items-center justify-center text-neutral-400"
          title="Used by the Academic planner — can be renamed, but not deleted"
        >
          <Lock size={15} />
        </span>
      ) : (
        <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={onDelete}>
          <Trash2 size={15} />
        </Button>
      )}
    </li>
  )
}

export default function CategoryManager() {
  const categories = useAppStore((s) => s.categories)
  const tasks = useAppStore((s) => s.tasks)
  const addCategory = useAppStore((s) => s.addCategory)
  const deleteCategory = useAppStore((s) => s.deleteCategory)

  const [newName, setNewName] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  // Suggest a color that isn't used yet
  const unusedColor =
    COLOR_NAMES.find((c) => !categories.some((cat) => cat.color === c)) ?? COLOR_NAMES[0]
  const [newColor, setNewColor] = useState(null)
  const colorForNew = newColor ?? unusedColor

  function handleAdd(e) {
    e.preventDefault() // stop the browser from reloading the page on form submit
    if (!newName.trim()) return
    addCategory({ name: newName, color: colorForNew })
    setNewName('')
    setNewColor(null)
  }

  const countFor = (id) => tasks.filter((t) => t.categoryId === id).length

  return (
    <section>
      <h2 className="text-sm font-semibold">Categories</h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        Every task gets a category, shown in its color across the app.
      </p>

      <ul className="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800">
        {categories.map((category) => (
          <CategoryRow
            // Including the name in the key resets the row if the name changes elsewhere
            // (e.g. after importing a backup)
            key={`${category.id}-${category.name}`}
            category={category}
            taskCount={countFor(category.id)}
            onDelete={() => setPendingDelete(category)}
          />
        ))}
      </ul>

      <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
        <ColorPicker value={colorForNew} onChange={setNewColor} />
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category, e.g. Cooking"
          aria-label="New category name"
          className="flex-1"
        />
        <Button type="submit" disabled={!newName.trim()}>
          <Plus size={15} /> Add
        </Button>
      </form>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        message={
          pendingDelete && countFor(pendingDelete.id) > 0
            ? `Its ${countFor(pendingDelete.id)} task(s) will be kept, but will have no category.`
            : 'This category has no tasks.'
        }
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteCategory(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}
