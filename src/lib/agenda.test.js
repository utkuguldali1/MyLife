import { describe, expect, it } from 'vitest'
import { buildDashboard, lecturesOnDate } from './agenda'

// 2026-11-07 is a Saturday
const today = '2026-11-07'

const course = (name, lectures, archived = false) => ({ id: name, name, lectures, archived })
const lecture = (weekday, start) => ({ id: `${weekday}-${start}`, weekday, start, end: '23:00' })

describe('lecturesOnDate', () => {
  it('returns the day’s lectures, earliest first, skipping archived courses', () => {
    const courses = [
      course('Algebra', [lecture(6, '14:00'), lecture(1, '10:00')]),
      course('Physics', [lecture(6, '08:15')]),
      course('Old', [lecture(6, '09:00')], true),
    ]
    const result = lecturesOnDate(courses, today)
    expect(result.map((r) => `${r.course.name} ${r.lecture.start}`)).toEqual([
      'Physics 08:15',
      'Algebra 14:00',
    ])
  })
})

describe('buildDashboard', () => {
  const task = (title, dueDate, extra = {}) => ({
    id: title,
    title,
    dueDate,
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-11-01T00:00:00Z',
    ...extra,
  })
  const tasks = [
    task('late', '2026-11-05'),
    task('today-low', today, { priority: 'low' }),
    task('today-high', today, { priority: 'high' }),
    task('in-3-days', '2026-11-10'),
    task('in-7-days', '2026-11-14'),
    task('in-8-days', '2026-11-15'),
    task('no-date', null),
    task('done-today', today, { status: 'done', completedAt: new Date().toISOString() }),
    task('done-earlier', today, { status: 'done', completedAt: '2026-01-01T12:00:00Z' }),
  ]
  const routines = [
    { id: 'r-late', title: 'r-late', nextDue: '2026-11-06' },
    { id: 'r-today', title: 'r-today', nextDue: today },
    { id: 'r-later', title: 'r-later', nextDue: '2026-11-09' },
  ]
  const events = [
    { id: 'exam-soon', date: '2026-11-16' },
    { id: 'exam-far', date: '2026-11-30' },
    { id: 'exam-past', date: '2026-11-01' },
  ]
  // Use the real today for "done today" (completedAt is now)
  const realToday = new Date().toISOString().slice(0, 10) === today
  const d = buildDashboard({ tasks, routines, lastEntries: {}, events, courses: [], today })
  const ids = (list) => list.map((x) => x.id)

  it('collects overdue tasks and routines', () => {
    expect(ids(d.overdue.tasks)).toEqual(['late'])
    expect(ids(d.overdue.routines)).toEqual(['r-late'])
  })
  it('lists today’s tasks by priority, plus routines due today', () => {
    expect(ids(d.today.tasks)).toEqual(['today-high', 'today-low'])
    expect(ids(d.today.routines)).toEqual(['r-today'])
  })
  it('shows tasks due within the next 7 days', () => {
    expect(ids(d.upcoming)).toEqual(['in-3-days', 'in-7-days'])
  })
  it('shows exams within 14 days', () => {
    expect(ids(d.events)).toEqual(['exam-soon'])
  })
  it('never lists tasks done on another day as done today', () => {
    expect(ids(d.done.tasks)).not.toContain('done-earlier')
    if (realToday) expect(ids(d.done.tasks)).toContain('done-today')
  })
})
