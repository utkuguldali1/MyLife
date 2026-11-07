import { useMemo, useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import { useToday } from '../../hooks/useToday'
import { splitRoutines } from '../../lib/routines'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import TaskSection from '../tasks/TaskSection'
import RoutineForm from './RoutineForm'
import RoutineItem from './RoutineItem'
import { useRoutineData } from './useRoutineData'

export default function RoutinesPage() {
  const today = useToday()
  const { routines, lastEntries, categoryById } = useRoutineData()
  const [form, setForm] = useState(null) // null = closed, { routine } = open

  const groups = useMemo(
    () => splitRoutines(routines, lastEntries, today),
    [routines, lastEntries, today],
  )

  const renderRoutine = (routine) => (
    <RoutineItem
      key={routine.id}
      routine={routine}
      category={categoryById[routine.categoryId]}
      lastEntry={lastEntries[routine.id]}
      today={today}
      onEdit={() => setForm({ routine })}
    />
  )

  return (
    <>
      <PageHeader title="Routines" description="Recurring tasks that reschedule themselves.">
        <Button variant="primary" onClick={() => setForm({ routine: null })}>
          <Plus size={16} /> New routine
        </Button>
      </PageHeader>

      {routines.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="No routines yet"
          description="Set up things like taking out the trash every Monday, changing the sheets every 2 weeks or paying rent on the 1st."
        >
          <Button onClick={() => setForm({ routine: null })}>
            <Plus size={16} /> Add your first routine
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          <TaskSection title="Today" count={groups.due.length}>
            {groups.today.length === 0 ? (
              <li className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                No routines due today 🎉
              </li>
            ) : (
              groups.today.map(renderRoutine)
            )}
          </TaskSection>

          {groups.upcoming.length > 0 && (
            <TaskSection title="Coming up" count={groups.upcoming.length}>
              {groups.upcoming.map(renderRoutine)}
            </TaskSection>
          )}

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Tip: ticking a routine before it's due counts for its next time. Due routines also
            appear in Daily Life with a <Repeat size={11} className="inline text-indigo-500" />{' '}
            icon.
          </p>
        </div>
      )}

      {form && (
        <RoutineForm open routine={form.routine} today={today} onClose={() => setForm(null)} />
      )}
    </>
  )
}
