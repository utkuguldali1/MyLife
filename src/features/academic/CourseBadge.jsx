import { colorClasses } from '../../lib/colors'

// A small colored label with a course's name, e.g. "● Linear Algebra"
export default function CourseBadge({ course }) {
  const colors = colorClasses(course?.color)
  return (
    <span
      className={`inline-flex max-w-56 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${colors.pill}`}
      title={course ? [course.code, course.name].filter(Boolean).join(' · ') : undefined}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
      <span className="truncate">{course?.name ?? 'No course'}</span>
    </span>
  )
}
