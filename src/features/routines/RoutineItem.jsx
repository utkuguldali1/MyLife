import { useState } from 'react'
import {
  AlarmClock,
  AlertTriangle,
  CalendarDays,
  MoreHorizontal,
  Pencil,
  Repeat,
  SkipForward,
  StickyNote,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { formatDateLabel } from '../../lib/dates'
import { getPriority } from '../../lib/priorities'
import { describeSchedule, getRoutineStatus } from '../../lib/routines'
import CategoryBadge from '../../components/ui/CategoryBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Menu, { MenuDivider, MenuItem } from '../../components/ui/Menu'
import TaskCheckbox from '../tasks/TaskCheckbox'

const ACTION_LABELS = { done: 'completion', skipped: 'skip', snoozed: 'snooze' }

// One routine in a list. Looks like a task, plus a 🔁 repeat label.
//   lastEntry: the routine's most recent history entry (done/skipped/snoozed), if any
//   onEdit:    opens the edit pop-up (leave out to hide "Edit")
export default function RoutineItem({ routine, category, lastEntry, today, onEdit }) {
  const completeRoutine = useAppStore((s) => s.completeRoutine)
  const skipRoutine = useAppStore((s) => s.skipRoutine)
  const snoozeRoutine = useAppStore((s) => s.snoozeRoutine)
  const undoLastRoutineAction = useAppStore((s) => s.undoLastRoutineAction)
  const deleteRoutine = useAppStore((s) => s.deleteRoutine)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const status = getRoutineStatus(routine, today)
  const actedToday = lastEntry?.date === today
  // Done today and not due again yet → shown ticked (tick again to undo)
  const doneToday = actedToday && lastEntry.action === 'done' && !status.due
  const priority = getPriority(routine.priority)

  function toggle() {
    if (doneToday) undoLastRoutineAction(routine.id)
    else completeRoutine(routine.id, today)
  }

  return (
    <li
      className={`relative rounded-lg border border-neutral-200 bg-white py-2.5 pr-2 pl-4 transition-colors dark:border-neutral-800 dark:bg-neutral-900 ${
        doneToday ? 'opacity-60' : 'hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <span
        className={`absolute top-2.5 bottom-2.5 left-1.5 w-1 rounded-full ${priority.stripe}`}
        title={`${priority.label} priority`}
      />

      <div className="flex items-start gap-3">
        <div className="pt-0.5">
          <TaskCheckbox
            checked={doneToday}
            onChange={toggle}
            label={doneToday ? `Undo "${routine.title}"` : `Complete "${routine.title}"`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onEdit}
            disabled={!onEdit}
            className={`block max-w-full text-left text-sm font-medium break-words enabled:hover:text-indigo-600 dark:enabled:hover:text-indigo-400 ${
              doneToday ? 'text-neutral-500 line-through' : ''
            }`}
          >
            {routine.title}
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <CategoryBadge category={category} />

            <span className="inline-flex items-center gap-1" title="Routine">
              <Repeat size={13} className="text-indigo-500" />
              {describeSchedule(routine.schedule)}
            </span>

            {status.due && status.daysLate > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle size={13} />
                Due since {formatDateLabel(routine.nextDue, today).replace('Yesterday', 'yesterday')}
              </span>
            )}

            {!status.due && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={13} />
                {doneToday ? 'Next: ' : ''}
                {formatDateLabel(routine.nextDue, today)}
              </span>
            )}

            {routine.notes && (
              <span className="inline-flex items-center gap-1" title={routine.notes}>
                <StickyNote size={13} />
                Note
              </span>
            )}
          </div>
        </div>

        <Menu
          trigger={({ toggle: toggleMenu, open }) => (
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={`Options for "${routine.title}"`}
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
                {!doneToday && (
                  <MenuItem icon={SkipForward} onClick={run(() => skipRoutine(routine.id, today))}>
                    Skip this time
                  </MenuItem>
                )}
                {status.due && (
                  <MenuItem icon={AlarmClock} onClick={run(() => snoozeRoutine(routine.id, today))}>
                    Snooze 1 day
                  </MenuItem>
                )}
                {actedToday && (
                  <MenuItem icon={Undo2} onClick={run(() => undoLastRoutineAction(routine.id))}>
                    Undo {ACTION_LABELS[lastEntry.action]}
                  </MenuItem>
                )}
                <MenuDivider />
                {onEdit && (
                  <MenuItem icon={Pencil} onClick={run(onEdit)}>
                    Edit
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

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete routine?"
        message={`"${routine.title}" and its history will be deleted. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteRoutine(routine.id)}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  )
}
