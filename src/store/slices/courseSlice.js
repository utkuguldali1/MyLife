import { createId } from '../../lib/ids'

// Course shape:
// { id, name, code, instructor, notes, color, archived,
//   lectures: [{ id, weekday (1=Mon…7=Sun), start "10:15", end "11:45", label }],
//   links:    [{ id, label "Moodle", url }],
//   createdAt, updatedAt }

function updateCourseIn(courses, id, change) {
  return courses.map((c) =>
    c.id === id ? { ...c, ...change(c), updatedAt: new Date().toISOString() } : c,
  )
}

export function createCourseSlice(set) {
  return {
    addCourse(input) {
      const now = new Date().toISOString()
      const course = {
        id: createId(),
        name: input.name.trim(),
        code: input.code?.trim() ?? '',
        instructor: input.instructor?.trim() ?? '',
        notes: input.notes ?? '',
        color: input.color ?? 'blue',
        archived: false,
        lectures: input.lectures ?? [],
        links: input.links ?? [],
        createdAt: now,
        updatedAt: now,
      }
      set((state) => ({ courses: [...state.courses, course] }))
      return course
    },

    updateCourse(id, changes) {
      set((state) => ({ courses: updateCourseIn(state.courses, id, () => changes) }))
    },

    setCourseArchived(id, archived) {
      set((state) => ({ courses: updateCourseIn(state.courses, id, () => ({ archived })) }))
    },

    // Deleting a course also deletes its tasks, exams and presentations.
    deleteCourse(id) {
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        tasks: state.tasks.filter((t) => t.courseId !== id),
        events: state.events.filter((e) => e.courseId !== id),
      }))
    },

    // ── Links ("Moodle ›") ──
    addCourseLink(courseId, { label, url }) {
      const link = { id: createId(), label: label.trim(), url }
      set((state) => ({
        courses: updateCourseIn(state.courses, courseId, (c) => ({ links: [...c.links, link] })),
      }))
    },

    updateCourseLink(courseId, linkId, changes) {
      set((state) => ({
        courses: updateCourseIn(state.courses, courseId, (c) => ({
          links: c.links.map((l) => (l.id === linkId ? { ...l, ...changes } : l)),
        })),
      }))
    },

    deleteCourseLink(courseId, linkId) {
      set((state) => ({
        courses: updateCourseIn(state.courses, courseId, (c) => ({
          links: c.links.filter((l) => l.id !== linkId),
        })),
      }))
    },
  }
}
