import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { CalendarClock, ChevronRight, ClipboardList, GraduationCap, Plus } from 'lucide-react'
import { useToday } from '../../hooks/useToday'
import { groupEvents } from '../../lib/events'
import PageHeader from '../../components/layout/PageHeader'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FilterChip from '../../components/ui/FilterChip'
import Tabs from '../../components/ui/Tabs'
import AcademicTaskList from './AcademicTaskList'
import AddMenu from './AddMenu'
import CourseCard from './CourseCard'
import EventList from './EventList'
import { useAcademicData } from './useAcademicData'
import { useAcademicForms } from './useAcademicForms'

const TAB_VALUES = ['tasks', 'events', 'courses']

export default function AcademicPage() {
  const today = useToday()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    courses,
    activeCourses,
    archivedCourses,
    academicTasks,
    events,
    courseById,
    typeById,
  } = useAcademicData()

  // The selected tab is kept in the address (?tab=courses), so "Back" returns to it
  const tab = TAB_VALUES.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'tasks'
  const setTab = (value) => setSearchParams(value === 'tasks' ? {} : { tab: value }, { replace: true })

  const [courseFilter, setCourseFilter] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  // If the filtered course gets archived or deleted, fall back to "All"
  const activeFilter = activeCourses.some((c) => c.id === courseFilter) ? courseFilter : 'all'

  const { openForm, formElement } = useAcademicForms({
    today,
    defaultCourseId: activeFilter === 'all' ? undefined : activeFilter,
    onCourseCreated: (course) => navigate(`/academic/courses/${course.id}`),
  })

  const visibleTasks = useMemo(
    () =>
      activeFilter === 'all'
        ? academicTasks
        : academicTasks.filter((t) => t.courseId === activeFilter),
    [academicTasks, activeFilter],
  )
  const visibleEvents = useMemo(
    () => (activeFilter === 'all' ? events : events.filter((e) => e.courseId === activeFilter)),
    [events, activeFilter],
  )

  // Numbers on the tabs
  const openTaskCount = academicTasks.filter((t) => t.status !== 'done').length
  const upcomingEvents = useMemo(() => groupEvents(events, today).upcoming, [events, today])

  const openTasksByCourse = (courseId) =>
    academicTasks.filter((t) => t.courseId === courseId && t.status !== 'done').length
  const nextEventOf = (courseId) => upcomingEvents.find((e) => e.courseId === courseId)

  const isEmpty = courses.length === 0 && academicTasks.length === 0 && events.length === 0

  return (
    <>
      <PageHeader title="Academic" description="Courses, assignments, exams and presentations.">
        <AddMenu onAdd={(kind) => openForm(kind)} />
      </PageHeader>

      {isEmpty ? (
        <EmptyState
          icon={GraduationCap}
          title="Start by adding your courses"
          description="Add each course with its lecture times and links (like Moodle). Then add assignments, exams and presentations to them."
        >
          <Button variant="primary" onClick={() => openForm('course')}>
            <Plus size={16} /> Add your first course
          </Button>
        </EmptyState>
      ) : (
        <>
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'tasks', label: 'Tasks', count: openTaskCount },
              { value: 'events', label: 'Exams & presentations', count: upcomingEvents.length },
              { value: 'courses', label: 'Courses', count: activeCourses.length },
            ]}
          />

          {tab !== 'courses' && activeCourses.length > 0 && (
            <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
              <FilterChip active={activeFilter === 'all'} onClick={() => setCourseFilter('all')}>
                All courses
              </FilterChip>
              {activeCourses.map((c) => (
                <FilterChip
                  key={c.id}
                  active={activeFilter === c.id}
                  onClick={() => setCourseFilter(c.id)}
                  color={c.color}
                >
                  {c.name}
                </FilterChip>
              ))}
            </div>
          )}

          {tab === 'tasks' &&
            (visibleTasks.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                description="Add homework, assignments and projects — they'll show here sorted by deadline."
              >
                <Button onClick={() => openForm('task')}>
                  <Plus size={16} /> Add assignment
                </Button>
              </EmptyState>
            ) : (
              <AcademicTaskList
                tasks={visibleTasks}
                courseById={courseById}
                typeById={typeById}
                today={today}
                onEdit={(task) => openForm('task', task)}
                showCourse={activeFilter === 'all'}
              />
            ))}

          {tab === 'events' &&
            (visibleEvents.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No exams or presentations"
                description="Add them here to get a countdown and see them on your dashboard and calendar."
              >
                <Button onClick={() => openForm('event')}>
                  <Plus size={16} /> Add exam or presentation
                </Button>
              </EmptyState>
            ) : (
              <EventList
                events={visibleEvents}
                courseById={courseById}
                typeById={typeById}
                today={today}
                onEdit={(event) => openForm('event', event)}
                showCourse={activeFilter === 'all'}
              />
            ))}

          {tab === 'courses' && (
            <div className="space-y-8">
              <ul className="grid gap-3 sm:grid-cols-2">
                {activeCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    openTaskCount={openTasksByCourse(course.id)}
                    nextEvent={nextEventOf(course.id)}
                    today={today}
                  />
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => openForm('course')}
                    className="flex h-full min-h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    <Plus size={18} />
                    New course
                  </button>
                </li>
              </ul>

              {archivedCourses.length > 0 && (
                <section>
                  <button
                    type="button"
                    onClick={() => setShowArchived((o) => !o)}
                    aria-expanded={showArchived}
                    className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
                  >
                    <ChevronRight
                      size={15}
                      className={`transition-transform ${showArchived ? 'rotate-90' : ''}`}
                    />
                    Archived
                    <span className="font-normal text-neutral-400">{archivedCourses.length}</span>
                  </button>
                  {showArchived && (
                    <ul className="grid gap-3 opacity-70 sm:grid-cols-2">
                      {archivedCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          openTaskCount={openTasksByCourse(course.id)}
                          today={today}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </div>
          )}
        </>
      )}

      {formElement}
    </>
  )
}
