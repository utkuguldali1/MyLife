import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { useToday } from '../../hooks/useToday'
import { colorClasses } from '../../lib/colors'
import { formatLecture, sortLectures } from '../../lib/courses'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState from '../../components/ui/EmptyState'
import Menu, { MenuItem } from '../../components/ui/Menu'
import AcademicTaskList from './AcademicTaskList'
import AddMenu from './AddMenu'
import EventList from './EventList'
import LinkList from './LinkList'
import { useAcademicData } from './useAcademicData'
import { useAcademicForms } from './useAcademicForms'

// A white box with a small heading, used for the side panels
function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 flex min-h-8 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// One course's own page: lecture times, links, tasks, exams and notes.
export default function CourseDetailPage() {
  const { courseId } = useParams()
  const today = useToday()
  const navigate = useNavigate()
  const { courseById, typeById, academicTasks, events } = useAcademicData()
  const setCourseArchived = useAppStore((s) => s.setCourseArchived)
  const deleteCourse = useAppStore((s) => s.deleteCourse)
  const addCourseLink = useAppStore((s) => s.addCourseLink)
  const updateCourseLink = useAppStore((s) => s.updateCourseLink)
  const deleteCourseLink = useAppStore((s) => s.deleteCourseLink)

  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { openForm, formElement } = useAcademicForms({ today, defaultCourseId: courseId })

  const course = courseById[courseId]
  const tasks = useMemo(
    () => academicTasks.filter((t) => t.courseId === courseId),
    [academicTasks, courseId],
  )
  const courseEvents = useMemo(
    () => events.filter((e) => e.courseId === courseId),
    [events, courseId],
  )

  const backLink = (
    <Link
      to="/academic?tab=courses"
      className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      <ArrowLeft size={15} /> Courses
    </Link>
  )

  if (!course) {
    return (
      <>
        {backLink}
        <EmptyState title="Course not found" description="It may have been deleted." />
      </>
    )
  }

  const colors = colorClasses(course.color)
  const lectures = sortLectures(course.lectures)

  return (
    <>
      {backLink}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${colors.dot}`} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight break-words">{course.name}</h1>
            {(course.code || course.instructor) && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {[course.code, course.instructor].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden sm:block">
            <AddMenu onAdd={(kind) => openForm(kind)} withCourse={false} />
          </div>
          <Menu
            trigger={({ toggle, open }) => (
              <Button size="icon" onClick={toggle} aria-label="Course options" aria-expanded={open}>
                <MoreHorizontal size={16} />
              </Button>
            )}
          >
            {(close) => {
              const run = (action) => () => {
                action()
                close()
              }
              return (
                <>
                  <MenuItem icon={Pencil} onClick={run(() => openForm('course', course))}>
                    Edit course
                  </MenuItem>
                  {course.archived ? (
                    <MenuItem
                      icon={ArchiveRestore}
                      onClick={run(() => setCourseArchived(course.id, false))}
                    >
                      Restore from archive
                    </MenuItem>
                  ) : (
                    <MenuItem icon={Archive} onClick={run(() => setCourseArchived(course.id, true))}>
                      Archive course
                    </MenuItem>
                  )}
                  <MenuItem icon={Trash2} danger onClick={run(() => setConfirmingDelete(true))}>
                    Delete course
                  </MenuItem>
                </>
              )
            }}
          </Menu>
        </div>
      </div>

      {/* On phones the add button sits under the title */}
      <div className="mb-6 sm:hidden">
        <AddMenu onAdd={(kind) => openForm(kind)} withCourse={false} />
      </div>

      {course.archived && (
        <p className="mb-6 flex flex-wrap items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          <Archive size={15} />
          This course is archived. It's hidden from your course lists and calendar.
          <button
            type="button"
            onClick={() => setCourseArchived(course.id, false)}
            className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Restore
          </button>
        </p>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Side panels first on phones, so links are one tap away */}
        <div className="space-y-4 lg:order-2">
          <Panel title="Links">
            <LinkList
              links={course.links}
              onAdd={(link) => addCourseLink(course.id, link)}
              onUpdate={(linkId, changes) => updateCourseLink(course.id, linkId, changes)}
              onDelete={(linkId) => deleteCourseLink(course.id, linkId)}
            />
          </Panel>

          <Panel
            title="Weekly lectures"
            action={
              <Button variant="ghost" size="sm" onClick={() => openForm('course', course)}>
                Edit
              </Button>
            }
          >
            {lectures.length === 0 ? (
              <p className="text-sm text-neutral-500">No lecture times yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {lectures.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="shrink-0 text-neutral-400" />
                    <span className="tabular-nums">{formatLecture(l)}</span>
                    {l.label && <span className="text-neutral-500">· {l.label}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {course.notes && (
            <Panel title="Notes">
              <p className="text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {course.notes}
              </p>
            </Panel>
          )}
        </div>

        <div className="space-y-10 lg:order-1 lg:col-span-2">
          <div>
            <h2 className="mb-3 text-base font-semibold">Exams & presentations</h2>
            {courseEvents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                No exams or presentations yet.
              </p>
            ) : (
              <EventList
                events={courseEvents}
                courseById={courseById}
                typeById={typeById}
                today={today}
                onEdit={(event) => openForm('event', event)}
                showCourse={false}
              />
            )}
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold">Tasks</h2>
            {tasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
                No assignments or homework yet.
              </p>
            ) : (
              <AcademicTaskList
                tasks={tasks}
                courseById={courseById}
                typeById={typeById}
                today={today}
                onEdit={(task) => openForm('task', task)}
                showCourse={false}
              />
            )}
          </div>
        </div>
      </div>

      {formElement}

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${course.name}"?`}
        message={
          tasks.length + courseEvents.length > 0
            ? `This also deletes its ${tasks.length} task(s) and ${courseEvents.length} exam(s)/presentation(s). This can't be undone. Tip: "Archive course" hides it but keeps everything.`
            : "This can't be undone."
        }
        confirmLabel="Delete course"
        danger
        onConfirm={() => {
          navigate('/academic?tab=courses', { replace: true })
          deleteCourse(course.id)
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  )
}
