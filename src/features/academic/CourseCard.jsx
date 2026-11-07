import { Link } from 'react-router'
import { ChevronRight, Clock } from 'lucide-react'
import { colorClasses } from '../../lib/colors'
import { formatLecture, sortLectures } from '../../lib/courses'
import { countdownLabel } from '../../lib/events'

// A course tile on the "Courses" tab. The name opens the course page;
// the links underneath ("Moodle ›") open directly in a new tab.
//   openTaskCount: unfinished tasks of this course
//   nextEvent:     its next exam/presentation (or undefined)
export default function CourseCard({ course, openTaskCount, nextEvent, today }) {
  const colors = colorClasses(course.color)
  const lectures = sortLectures(course.lectures)

  return (
    <li className="relative flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white p-4 pl-5 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
      <span className={`absolute inset-y-0 left-0 w-1.5 ${colors.dot}`} />

      <Link
        to={`/academic/courses/${course.id}`}
        className="group flex items-start justify-between gap-2"
      >
        <div className="min-w-0">
          <h3 className="font-semibold break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            {course.name}
          </h3>
          {(course.code || course.instructor) && (
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {[course.code, course.instructor].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <ChevronRight size={16} className="mt-1 shrink-0 text-neutral-400 group-hover:text-indigo-500" />
      </Link>

      {lectures.length > 0 && (
        <ul className="mt-3 space-y-0.5 text-xs text-neutral-600 dark:text-neutral-400">
          {lectures.map((l) => (
            <li key={l.id} className="flex items-center gap-1.5">
              <Clock size={12} className="shrink-0 text-neutral-400" />
              <span className="tabular-nums">{formatLecture(l)}</span>
              {l.label && <span className="text-neutral-400">· {l.label}</span>}
            </li>
          ))}
        </ul>
      )}

      {course.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {course.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:hover:bg-indigo-500/25"
            >
              {link.label}
              <ChevronRight size={12} />
            </a>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          {openTaskCount === 0
            ? 'No open tasks'
            : `${openTaskCount} open ${openTaskCount === 1 ? 'task' : 'tasks'}`}
        </span>
        {nextEvent && (
          <span className="truncate">
            Next: {nextEvent.title} · {countdownLabel(nextEvent.date, today)}
          </span>
        )}
      </div>
    </li>
  )
}
