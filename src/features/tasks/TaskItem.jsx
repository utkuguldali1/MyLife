import { useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ListChecks,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { addDaysISO, formatDateLabel } from '../../lib/dates'
import { getPriority } from '../../lib/priorities'
import CategoryBadge from '../../components/ui/CategoryBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Menu, { MenuDivider, MenuItem, MenuLabel } from '../../components/ui/Menu'
import Checklist from './Checklist'
import PostponeDialog from './PostponeDialog'
import TaskCheckbox from './TaskCheckbox'

// "yesterday" in lower case inside a sentence; other dates stay as they are ("Thu 5 Nov")
function dueLabelInSentence(isoDate, today) {
  const label = formatDateLabel(isoDate, today)
  return label === 'Yesterday' ? 'yesterday' : label
}

// One task in a list.
//   task:     the task
//   category: its category (for the colored label)
//   timing:   from getTaskTiming() — tells us if it was carried over
//   today:    today's date
//   onEdit:   opens the edit pop-up
//   badge:    replaces the category label (academic tasks show their course instead)
//   extra:    more small info next to the badge (e.g. "Assignment")
export default function TaskItem({ task, category, timing, today, onEdit, badge, extra }) {
  const toggleTaskDone = useAppStore((s) => s.toggleTaskDone)
  const postponeTask = useAppStore((s) => s.postponeTask)
  const deleteTask = useAppStore((s) => s.deleteTask)
  const addChecklistItem = useAppStore((s) => s.addChecklistItem)
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem)
  const updateChecklistItem = useAppStore((s) => s.updateChecklistItem)
  const deleteChecklistItem = useAppStore((s) => s.deleteChecklistItem)

  const [checklistOpen, setChecklistOpen] = useState(false)
  const [focusNewItem, setFocusNewItem] = useState(false)
  const [pickingDate, setPickingDate] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isDone = task.status === 'done'
  const priority = getPriority(task.priority)
  const doneCount = task.checklist.filter((i) => i.done).length
  const hasChecklist = task.checklist.length > 0

  function postpone(days) {
    postponeTask(task.id, addDaysISO(today, days))
  }

  return (
    <li
      className={`relative rounded-lg border border-neutral-200 bg-white py-2.5 pr-2 pl-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900 ${
        isDone ? 'opacity-60' : 'hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Priority stripe on the left: red = high, yellow = medium, green = low */}
      <span
        className={`absolute top-2.5 bottom-2.5 left-1.5 w-1 rounded-full ${priority.stripe}`}
        title={`${priority.label} priority`}
      />

      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <TaskCheckbox
            checked={isDone}
            onChange={() => toggleTaskDone(task.id)}
            label={isDone ? `Mark "${task.title}" as not done` : `Complete "${task.title}"`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onEdit}
            className={`block max-w-full text-left text-sm font-medium break-words hover:text-indigo-600 dark:hover:text-indigo-400 ${
              isDone ? 'text-neutral-500 line-through' : ''
            }`}
          >
            {task.title}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            {extra}
            {badge ?? <CategoryBadge category={category} />}

            {timing?.carriedOverFrom && !isDone && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle size={13} />
                Carried over · was due {dueLabelInSentence(timing.carriedOverFrom, today)}
              </span>
            )}

            {timing?.overdueSince && !isDone && (
              <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                <AlertCircle size={13} />
                Overdue · was due {dueLabelInSentence(timing.overdueSince, today)}
              </span>
            )}

            {task.dueDate && !timing?.carriedOverFrom && !timing?.overdueSince && task.dueDate !== today && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={13} />
                {formatDateLabel(task.dueDate, today)}
              </span>
            )}

            {hasChecklist && (
              <button
                type="button"
                onClick={() => setChecklistOpen((o) => !o)}
                aria-expanded={checklistOpen}
                className="inline-flex items-center gap-1 rounded px-1 py-0.5 -mx-1 font-medium hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <ListChecks size={13} />
                {doneCount}/{task.checklist.length}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${checklistOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}

            {task.notes && (
              <span className="inline-flex items-center gap-1" title={task.notes}>
                <StickyNote size={13} />
                Note
              </span>
            )}
          </div>

          {checklistOpen && (
            <div className="mt-2 -ml-1 border-l-2 border-neutral-200 pl-2 dark:border-neutral-800">
              <Checklist
                items={task.checklist}
                autoFocusAdd={focusNewItem}
                onAdd={(text) => addChecklistItem(task.id, text)}
                onToggle={(itemId) => toggleChecklistItem(task.id, itemId)}
                onUpdate={(itemId, text) => updateChecklistItem(task.id, itemId, text)}
                onDelete={(itemId) => deleteChecklistItem(task.id, itemId)}
              />
            </div>
          )}
        </div>

        <Menu
          trigger={({ toggle, open }) => (
            <button
              type="button"
              onClick={toggle}
              aria-label={`Options for "${task.title}"`}
              aria-expanded={open}
              className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <MoreHorizontal size={16} />
            </button>
          )}
        >
          {(close) => {
            const run = (action) => () => {
              action()
              close()
            }
            return (
              <>
                {!isDone && (
                  <>
                    <MenuLabel>Postpone</MenuLabel>
                    <MenuItem icon={CalendarClock} onClick={run(() => postpone(1))}>
                      Tomorrow
                    </MenuItem>
                    <MenuItem icon={CalendarClock} onClick={run(() => postpone(3))}>
                      In 3 days
                    </MenuItem>
                    <MenuItem icon={CalendarClock} onClick={run(() => postpone(7))}>
                      Next week
                    </MenuItem>
                    <MenuItem icon={CalendarDays} onClick={run(() => setPickingDate(true))}>
                      Pick a date…
                    </MenuItem>
                    <MenuDivider />
                  </>
                )}
                {isDone && (
                  <MenuItem icon={RotateCcw} onClick={run(() => toggleTaskDone(task.id))}>
                    Mark as not done
                  </MenuItem>
                )}
                <MenuItem icon={Pencil} onClick={run(onEdit)}>
                  Edit
                </MenuItem>
                {!hasChecklist && (
                  <MenuItem
                    icon={ListChecks}
                    onClick={run(() => {
                      setFocusNewItem(true)
                      setChecklistOpen(true)
                    })}
                  >
                    Add checklist
                  </MenuItem>
                )}
                <MenuItem icon={Trash2} danger onClick={run(() => setConfirmingDelete(true))}>
                  Delete
                </MenuItem>
              </>
            )
          }}
        </Menu>
      </div>

      {pickingDate && (
        <PostponeDialog
          open
          initialDate={task.dueDate && task.dueDate > today ? task.dueDate : addDaysISO(today, 1)}
          minDate={today}
          onSave={(date) => postponeTask(task.id, date)}
          onClose={() => setPickingDate(false)}
        />
      )}
      <ConfirmDialog
        open={confirmingDelete}
        title="Delete task?"
        message={`"${task.title}" will be deleted. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTask(task.id)}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  )
}
