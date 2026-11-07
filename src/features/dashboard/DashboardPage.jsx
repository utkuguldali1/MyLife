import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  AlertCircle,
  BookOpen,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  House,
  LayoutDashboard,
  ListTodo,
  Plus,
  Repeat,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'
import { useToday } from '../../hooks/useToday'
import { daysBetween, formatDateLabel, formatLongDate } from '../../lib/dates'
import { buildDashboard } from '../../lib/agenda'
import { countdownLabel } from '../../lib/events'
import { colorClasses } from '../../lib/colors'
import { formatTimeRange } from '../../lib/courses'
import { getTaskTiming } from '../../lib/tasks'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Menu, { MenuItem } from '../../components/ui/Menu'
import TaskForm from '../tasks/TaskForm'
import TaskItem from '../tasks/TaskItem'
import TaskSection from '../tasks/TaskSection'
import RoutineForm from '../routines/RoutineForm'
import RoutineItem from '../routines/RoutineItem'
import { useRoutineData } from '../routines/useRoutineData'
import CourseBadge from '../academic/CourseBadge'
import EventForm from '../academic/EventForm'
import { useAcademicData } from '../academic/useAcademicData'

function greetingFor(hour) {
  if (hour < 5) return 'Good night'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// A small number tile at the top, e.g. "3 · Due today"
function StatTile({ label, value, tone = 'neutral', to }) {
  const tones = {
    neutral: 'text-neutral-900 dark:text-neutral-100',
    red: 'text-red-600 dark:text-red-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  }
  return (
    <Link
      to={to}
      className="rounded-lg border border-neutral-200 bg-white px-3 py-2.5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className={`truncate text-lg font-semibold ${tones[tone]}`}>{value}</div>
      <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
    </Link>
  )
}

// A white box with a heading, used in the right-hand column
function Panel({ title, icon: Icon, link, children }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          <Icon size={15} className="text-neutral-400" />
          {title}
        </h2>
        {link && (
          <Link
            to={link.to}
            className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {link.label}
            <ChevronRight size={13} />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

// A compact exam/presentation line for the side panel
function EventRow({ event, course, typeName, today, onClick }) {
  const daysLeft = daysBetween(today, event.date)
  const soon =
    daysLeft <= 2
      ? 'text-red-600 dark:text-red-400'
      : daysLeft <= 7
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-neutral-500 dark:text-neutral-400'
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
      >
        <span className={`h-8 w-1 shrink-0 rounded-full ${colorClasses(course?.color).dot}`} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{event.title}</div>
          <div className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {[typeName, formatDateLabel(event.date, today), event.startTime && formatTimeRange(event.startTime, event.endTime)]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        <span className={`shrink-0 text-xs font-medium ${soon}`}>
          {countdownLabel(event.date, today)}
        </span>
      </button>
    </li>
  )
}

export default function DashboardPage() {
  const today = useToday()
  const navigate = useNavigate()
  const [greeting] = useState(() => greetingFor(new Date().getHours()))
  const tasks = useAppStore((s) => s.tasks)
  const categories = useAppStore((s) => s.categories)
  const { routines, lastEntries, categoryById } = useRoutineData()
  const { courses, events, courseById, typeById } = useAcademicData()
  const [form, setForm] = useState(null) // null = closed, or { kind, item }

  const d = useMemo(
    () => buildDashboard({ tasks, routines, lastEntries, events, courses, today }),
    [tasks, routines, lastEntries, events, courses, today],
  )
  const [showDone, setShowDone] = useState(false)

  const openForm = (kind, item = null) => setForm({ kind, item })
  const closeForm = () => setForm(null)

  // Tasks look slightly different depending on where they come from:
  // academic ones show their course and type, everyday ones their category
  const renderTask = (task) => {
    const academic = task.categoryId === ACADEMIC_CATEGORY_ID
    const typeName = academic ? typeById[task.typeId]?.name : null
    return (
      <TaskItem
        key={task.id}
        task={task}
        category={categoryById[task.categoryId]}
        timing={getTaskTiming(task, today)}
        today={today}
        onEdit={() => openForm(academic ? 'academic' : 'task', task)}
        badge={academic ? <CourseBadge course={courseById[task.courseId]} /> : undefined}
        extra={
          typeName && (
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{typeName}</span>
          )
        }
      />
    )
  }
  const renderRoutine = (routine) => (
    <RoutineItem
      key={routine.id}
      routine={routine}
      category={categoryById[routine.categoryId]}
      lastEntry={lastEntries[routine.id]}
      today={today}
      onEdit={() => openForm('routine', routine)}
    />
  )

  const overdueCount = d.overdue.tasks.length + d.overdue.routines.length
  const todayCount = d.today.tasks.length + d.today.routines.length
  const doneCount = d.done.tasks.length + d.done.routines.length
  const nextExam = d.events[0]
  const nothingAtAll =
    tasks.length === 0 && routines.length === 0 && courses.length === 0 && events.length === 0
  const dailyCategoryCount = categories.filter((c) => c.id !== ACADEMIC_CATEGORY_ID).length

  return (
    <>
      <PageHeader title={greeting} description={formatLongDate(today)}>
        <Menu
          trigger={({ toggle, open }) => (
            <Button variant="primary" onClick={toggle} aria-expanded={open}>
              <Plus size={16} /> Add
            </Button>
          )}
        >
          {(close) => {
            const pick = (kind) => () => {
              openForm(kind)
              close()
            }
            return (
              <>
                <MenuItem icon={House} onClick={pick('task')}>
                  Everyday task
                </MenuItem>
                <MenuItem icon={ClipboardList} onClick={pick('academic')}>
                  Assignment or homework
                </MenuItem>
                <MenuItem icon={CalendarClock} onClick={pick('event')}>
                  Exam or presentation
                </MenuItem>
                <MenuItem icon={Repeat} onClick={pick('routine')}>
                  Routine
                </MenuItem>
              </>
            )
          }}
        </Menu>
      </PageHeader>

      {nothingAtAll ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Welcome to Student Life"
          description="Add your courses, chores and routines — this page will then show what's due today, what's overdue and your next exams. Want to look around first? Load example data in Settings."
        >
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => navigate('/academic')}>
              <BookOpen size={16} /> Add courses
            </Button>
            <Button variant="ghost" onClick={() => navigate('/settings')}>
              Load example data
            </Button>
          </div>
        </EmptyState>
      ) : (
        <>
          {/* Numbers at a glance */}
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatTile label="Due today" value={todayCount} to="/daily-life" />
            <StatTile
              label="Overdue"
              value={overdueCount}
              tone={overdueCount > 0 ? 'red' : 'neutral'}
              to="/daily-life"
            />
            <StatTile label="Lectures today" value={d.lectures.length} to="/academic?tab=courses" />
            <StatTile
              label={nextExam ? `Next: ${nextExam.title}` : 'No exams soon'}
              value={nextExam ? countdownLabel(nextExam.date, today) : '—'}
              tone={nextExam ? 'indigo' : 'neutral'}
              to="/academic?tab=events"
            />
          </div>

          <div className="grid gap-8 xl:grid-cols-3">
            <div className="space-y-8 xl:col-span-2">
              {overdueCount > 0 && (
                <TaskSection
                  title={
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <AlertCircle size={15} /> Overdue
                    </span>
                  }
                  count={overdueCount}
                >
                  {d.overdue.tasks.map(renderTask)}
                  {d.overdue.routines.map(renderRoutine)}
                </TaskSection>
              )}

              <TaskSection title="Today" count={todayCount}>
                {todayCount === 0 ? (
                  <li className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                    {overdueCount > 0
                      ? 'Nothing else due today — just the overdue items above.'
                      : "You're all caught up for today 🎉"}
                  </li>
                ) : (
                  <>
                    {d.today.tasks.map(renderTask)}
                    {d.today.routines.map(renderRoutine)}
                  </>
                )}
              </TaskSection>

              {doneCount > 0 && (
                <TaskSection
                  title="Done today"
                  count={doneCount}
                  collapsible
                  open={showDone}
                  onToggle={() => setShowDone((o) => !o)}
                >
                  {d.done.tasks.map(renderTask)}
                  {d.done.routines.map(renderRoutine)}
                </TaskSection>
              )}

              <TaskSection title="Next 7 days" count={d.upcoming.length}>
                {d.upcoming.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                    No deadlines this week.
                  </li>
                ) : (
                  d.upcoming.map(renderTask)
                )}
              </TaskSection>
            </div>

            {/* Side panels: next to the lists on wide screens, below them otherwise */}
            <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Panel
                title="Today's lectures"
                icon={BookOpen}
                link={{ to: '/academic?tab=courses', label: 'Courses' }}
              >
                {d.lectures.length === 0 ? (
                  <p className="text-sm text-neutral-500">No lectures today.</p>
                ) : (
                  <ul className="space-y-2">
                    {d.lectures.map(({ course, lecture }) => (
                      <li key={`${course.id}-${lecture.id}`}>
                        <Link
                          to={`/academic/courses/${course.id}`}
                          className="-mx-2 flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                          <span
                            className={`h-8 w-1 shrink-0 rounded-full ${colorClasses(course.color).dot}`}
                          />
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{course.name}</div>
                            <div className="text-xs text-neutral-500 tabular-nums dark:text-neutral-400">
                              {formatTimeRange(lecture.start, lecture.end)}
                              {lecture.label && ` · ${lecture.label}`}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>

              <Panel
                title="Exams & presentations"
                icon={CalendarClock}
                link={{ to: '/academic?tab=events', label: 'All' }}
              >
                {d.events.length === 0 ? (
                  <p className="text-sm text-neutral-500">Nothing in the next 2 weeks.</p>
                ) : (
                  <ul className="space-y-1">
                    {d.events.map((event) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        course={courseById[event.courseId]}
                        typeName={typeById[event.typeId]?.name}
                        today={today}
                        onClick={() => openForm('event', event)}
                      />
                    ))}
                  </ul>
                )}
              </Panel>

              {dailyCategoryCount > 0 && routines.length === 0 && (
                <Panel title="Tip" icon={ListTodo}>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Chores that repeat — like laundry every week — work best as{' '}
                    <Link to="/routines" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                      routines
                    </Link>
                    . They reschedule themselves.
                  </p>
                </Panel>
              )}
            </div>
          </div>
        </>
      )}

      {(form?.kind === 'task' || form?.kind === 'academic') && (
        <TaskForm
          open
          task={form.item}
          academic={form.kind === 'academic'}
          today={today}
          onClose={closeForm}
        />
      )}
      {form?.kind === 'event' && (
        <EventForm open event={form.item} today={today} onClose={closeForm} />
      )}
      {form?.kind === 'routine' && (
        <RoutineForm open routine={form.item} today={today} onClose={closeForm} />
      )}
    </>
  )
}
