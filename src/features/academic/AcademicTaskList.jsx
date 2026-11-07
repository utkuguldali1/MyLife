import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { getTaskTiming, groupTasks } from '../../lib/tasks'
import TaskItem from '../tasks/TaskItem'
import TaskSection from '../tasks/TaskSection'
import CourseBadge from './CourseBadge'

// University tasks split into Overdue / Today / Upcoming / No date / Completed.
//   showCourse: false on a course's own page (the course is obvious there)
export default function AcademicTaskList({
  tasks,
  courseById,
  typeById,
  today,
  onEdit,
  showCourse = true,
}) {
  const [showCompleted, setShowCompleted] = useState(false)
  const groups = useMemo(() => groupTasks(tasks, today), [tasks, today])

  const renderTask = (task) => {
    const typeName = typeById[task.typeId]?.name
    return (
      <TaskItem
        key={task.id}
        task={task}
        timing={getTaskTiming(task, today)}
        today={today}
        onEdit={() => onEdit(task)}
        // `false` = no label at all (null would fall back to the category label)
        badge={showCourse ? <CourseBadge course={courseById[task.courseId]} /> : false}
        extra={
          typeName && (
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{typeName}</span>
          )
        }
      />
    )
  }

  return (
    <div className="space-y-8">
      {groups.overdue.length > 0 && (
        <TaskSection
          title="Overdue"
          count={groups.overdue.length}
          note={
            <p className="mb-2 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-500/10 dark:text-red-300">
              <AlertCircle size={15} className="shrink-0" />
              {groups.overdue.length === 1
                ? '1 deadline has passed.'
                : `${groups.overdue.length} deadlines have passed.`}{' '}
              Finish, postpone or delete {groups.overdue.length === 1 ? 'it' : 'them'}.
            </p>
          }
        >
          {groups.overdue.map(renderTask)}
        </TaskSection>
      )}
      {groups.today.length > 0 && (
        <TaskSection title="Due today" count={groups.today.length}>
          {groups.today.map(renderTask)}
        </TaskSection>
      )}
      {groups.upcoming.length > 0 && (
        <TaskSection title="Upcoming" count={groups.upcoming.length}>
          {groups.upcoming.map(renderTask)}
        </TaskSection>
      )}
      {groups.noDate.length > 0 && (
        <TaskSection title="No deadline" count={groups.noDate.length}>
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
        >
          {groups.completed.map(renderTask)}
        </TaskSection>
      )}
    </div>
  )
}
