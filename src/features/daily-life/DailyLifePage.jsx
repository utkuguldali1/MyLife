import { useMemo, useState } from 'react'
import { AlertTriangle, House, Plus } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'
import { useToday } from '../../hooks/useToday'
import { getTaskTiming, groupTasks } from '../../lib/tasks'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FilterChip from '../../components/ui/FilterChip'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import TaskForm from '../tasks/TaskForm'
import TaskItem from '../tasks/TaskItem'
import TaskSection from '../tasks/TaskSection'

export default function DailyLifePage() {
  const today = useToday()
  const tasks = useAppStore((s) => s.tasks)
  const categories = useAppStore((s) => s.categories)
  const deleteCompletedTasks = useAppStore((s) => s.deleteCompletedTasks)

  const [filter, setFilter] = useState('all') // "all" or a category id
  const [form, setForm] = useState(null) // null = closed, { task } = open
  const [showCompleted, setShowCompleted] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const dailyCategories = categories.filter((c) => c.id !== ACADEMIC_CATEGORY_ID)
  const categoryById = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  )

  // Daily Life shows every task that isn't academic
  const dailyTasks = useMemo(
    () => tasks.filter((t) => t.categoryId !== ACADEMIC_CATEGORY_ID),
    [tasks],
  )
  const visibleTasks =
    filter === 'all' ? dailyTasks : dailyTasks.filter((t) => t.categoryId === filter)
  const groups = useMemo(() => groupTasks(visibleTasks, today), [visibleTasks, today])
  const carriedOverCount = groups.today.filter((t) => t.dueDate < today).length

  const openNew = () => setForm({ task: null })

  const renderTask = (task) => (
    <TaskItem
      key={task.id}
      task={task}
      category={categoryById[task.categoryId]}
      timing={getTaskTiming(task, today)}
      today={today}
      onEdit={() => setForm({ task })}
    />
  )

  return (
    <>
      <PageHeader title="Daily Life" description="Chores, errands and everyday responsibilities.">
        <Button variant="primary" onClick={openNew}>
          <Plus size={16} /> New task
        </Button>
      </PageHeader>

      {dailyTasks.length === 0 ? (
        <EmptyState
          icon={House}
          title="No tasks yet"
          description='Add your first task with "New task" — or load example tasks in Settings.'
        />
      ) : (
        <>
          {/* Category filters — scroll sideways on small screens */}
          <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
            <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
              All
            </FilterChip>
            {dailyCategories.map((c) => (
              <FilterChip
                key={c.id}
                active={filter === c.id}
                onClick={() => setFilter(c.id)}
                color={c.color}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>

          <div className="space-y-8">
            <TaskSection
              title="Today"
              count={groups.today.length}
              note={
                carriedOverCount > 0 && (
                  <p className="mb-2 flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    <AlertTriangle size={15} className="shrink-0" />
                    {carriedOverCount === 1
                      ? '1 unfinished task was carried over from a previous day.'
                      : `${carriedOverCount} unfinished tasks were carried over from previous days.`}
                  </p>
                )
              }
            >
              {groups.today.length === 0 ? (
                <li className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                  Nothing due today 🎉
                </li>
              ) : (
                groups.today.map(renderTask)
              )}
            </TaskSection>

            {groups.upcoming.length > 0 && (
              <TaskSection title="Upcoming" count={groups.upcoming.length}>
                {groups.upcoming.map(renderTask)}
              </TaskSection>
            )}

            {groups.noDate.length > 0 && (
              <TaskSection title="No date" count={groups.noDate.length}>
                {groups.noDate.map(renderTask)}
              </TaskSection>
            )}

            {groups.completed.length > 0 && (
              <TaskSection
                title="Completed"
                count={groups.completed.length}
                collapsible
                open={showCompleted}
                onToggle={() => setShowCompleted((o) => !o)}
                action={
                  showCompleted && (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmClear(true)}>
                      Delete all
                    </Button>
                  )
                }
              >
                {groups.completed.map(renderTask)}
              </TaskSection>
            )}
          </div>
        </>
      )}

      {form && (
        <TaskForm
          open
          task={form.task}
          defaultCategoryId={filter === 'all' ? undefined : filter}
          today={today}
          onClose={() => setForm(null)}
        />
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Delete completed tasks?"
        message={`${groups.completed.length} completed task(s) will be deleted. This can't be undone.`}
        confirmLabel="Delete all"
        danger
        onConfirm={() => deleteCompletedTasks(groups.completed.map((t) => t.id))}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  )
}
