import { useMemo } from 'react'
import { useAppStore } from '../../store/useAppStore'
import { ACADEMIC_CATEGORY_ID } from '../../store/defaultData'

// Everything the academic pages need, read from the store once:
// the courses, academic tasks and events, plus quick "find by id" lookups.
export function useAcademicData() {
  const courses = useAppStore((s) => s.courses)
  const tasks = useAppStore((s) => s.tasks)
  const events = useAppStore((s) => s.events)
  const academicTypes = useAppStore((s) => s.academicTypes)

  return useMemo(() => {
    const academicTasks = tasks.filter((t) => t.categoryId === ACADEMIC_CATEGORY_ID)
    return {
      courses,
      activeCourses: courses.filter((c) => !c.archived),
      archivedCourses: courses.filter((c) => c.archived),
      academicTasks,
      events,
      courseById: Object.fromEntries(courses.map((c) => [c.id, c])),
      typeById: Object.fromEntries(academicTypes.map((t) => [t.id, t])),
    }
  }, [courses, tasks, events, academicTypes])
}
