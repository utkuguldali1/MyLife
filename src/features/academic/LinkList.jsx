import { useState } from 'react'
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { linkHost, normalizeUrl } from '../../lib/links'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Field'

// Two fields (name + web address) used for adding and editing a link.
// Not a <form>, because it can sit inside the course form.
function LinkFields({ initial, submitLabel, onSubmit, onCancel, autoFocus }) {
  const [label, setLabel] = useState(initial?.label ?? '')
  const [url, setUrl] = useState(initial?.url ?? '')
  const [error, setError] = useState('')

  function submit() {
    const cleanUrl = normalizeUrl(url)
    if (!cleanUrl) {
      setError('Please enter a valid web address, e.g. moodle.uni.de/course/123')
      return
    }
    onSubmit({ label: label.trim() || linkHost(cleanUrl), url: cleanUrl })
    if (!initial) {
      setLabel('')
      setUrl('')
    }
    setError('')
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault() // don't submit a surrounding form
      submit()
    }
    if (e.key === 'Escape' && onCancel) {
      e.preventDefault()
      e.stopPropagation() // close only this editor, not the pop-up
      onCancel()
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Name, e.g. Moodle"
          aria-label="Link name"
          className="sm:w-40"
          autoFocus={autoFocus}
        />
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError('')
          }}
          onKeyDown={onKeyDown}
          placeholder="Web address"
          aria-label="Web address"
          inputMode="url"
          className="flex-1"
        />
        <div className="flex gap-2">
          <Button onClick={submit} disabled={!url.trim()}>
            {!initial && <Plus size={15} />}
            {submitLabel}
          </Button>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

// The "Links" list of a course: each link opens in a new browser tab,
// e.g. "Moodle ›". Links can be added, edited and removed.
export default function LinkList({ links, onAdd, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null)

  return (
    <div className="space-y-2">
      {links.length > 0 && (
        <ul className="space-y-1">
          {links.map((link) =>
            link.id === editingId ? (
              <li key={link.id} className="py-1">
                <LinkFields
                  initial={link}
                  submitLabel="Save"
                  autoFocus
                  onSubmit={(values) => {
                    onUpdate(link.id, values)
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={link.id} className="flex items-center gap-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <span className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {link.label}
                  </span>
                  <ChevronRight size={15} className="-ml-1 shrink-0 text-indigo-500" />
                  <span className="truncate text-xs text-neutral-400">{linkHost(link.url)}</span>
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit link ${link.label}`}
                  onClick={() => setEditingId(link.id)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove link ${link.label}`}
                  onClick={() => onDelete(link.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </li>
            ),
          )}
        </ul>
      )}
      <LinkFields submitLabel="Add link" onSubmit={onAdd} />
    </div>
  )
}
