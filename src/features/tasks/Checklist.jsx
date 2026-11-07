import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import TaskCheckbox from './TaskCheckbox'

// A list of small items inside a task (e.g. a grocery list).
// You can tick items, edit their text directly, delete them, and add new ones
// by typing and pressing Enter.
//
// It doesn't save anything itself — it reports changes through these callbacks:
//   onToggle(itemId), onAdd(text), onUpdate(itemId, text), onDelete(itemId)
export default function Checklist({ items, onToggle, onAdd, onUpdate, onDelete, autoFocusAdd }) {
  const [newText, setNewText] = useState('')

  function handleAdd() {
    if (!newText.trim()) return
    onAdd(newText)
    setNewText('') // clear the field, ready for the next item
  }

  return (
    <div className="space-y-0.5">
      {items.map((item) => (
        <div key={item.id} className="group/item flex items-center gap-2 rounded-md px-1 py-0.5">
          <TaskCheckbox
            checked={item.done}
            onChange={() => onToggle(item.id)}
            label={`Tick ${item.text}`}
            shape="square"
            size="sm"
          />
          <input
            value={item.text}
            onChange={(e) => onUpdate(item.id, e.target.value)}
            onBlur={(e) => !e.target.value.trim() && onDelete(item.id)} // empty → remove
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), e.currentTarget.blur())}
            aria-label="Checklist item"
            className={`min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-sm outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800 ${
              item.done ? 'text-neutral-400 line-through dark:text-neutral-500' : ''
            }`}
          />
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Remove ${item.text}`}
            className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus:opacity-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 px-1 py-0.5">
        <Plus size={16} className="shrink-0 text-neutral-400" />
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault() // don't submit the surrounding form
              handleAdd()
            }
          }}
          onBlur={handleAdd}
          data-autofocus={autoFocusAdd || undefined}
          autoFocus={autoFocusAdd}
          placeholder="Add item…"
          aria-label="Add checklist item"
          className="min-w-0 flex-1 rounded bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-neutral-400 focus:bg-neutral-100 dark:focus:bg-neutral-800"
        />
      </div>
    </div>
  )
}
