import { describe, expect, it } from 'vitest'
import { buildCalendarItems, monthGrid, routineOccurrences, shiftMonth, weekDays } from './calendar'

// 2026-11-07 is a Saturday
const today = '2026-11-07'

describe('grids', () => {
  it('builds full Monday–Sunday weeks around a month', () => {
    const weeks = monthGrid('2026-11-15')
    expect(weeks).toHaveLength(6)
    expect(weeks[0][0]).toBe('2026-10-26') // Monday before 1 Nov (a Sunday)
    expect(weeks.at(-1)[6]).toBe('2026-12-06')
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })
  it('gives the 7 days of a week, starting Monday', () => {
    expect(weekDays(today)).toEqual([
      '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08',
    ])
  })
  it('moves between months', () => {
    expect(shiftMonth('2026-11-07', 1)).toBe('2026-12-01')
    expect(shiftMonth('2026-01-31', -1)).toBe('2025-12-01')
  })
})

describe('routineOccurrences', () => {
  it('repeats weekly routines on their weekdays', () => {
    const r = { schedule: { type: 'weekly', weekdays: [1, 4] }, nextDue: '2026-11-09' }
    expect(routineOccurrences(r, '2026-11-07', '2026-11-22', today)).toEqual([
      '2026-11-09', '2026-11-12', '2026-11-16', '2026-11-19',
    ])
  })
  it('repeats interval routines every N days', () => {
    const r = { schedule: { type: 'interval', every: 3, unit: 'day' }, nextDue: today }
    expect(routineOccurrences(r, today, '2026-11-16', today)).toEqual([
      '2026-11-07', '2026-11-10', '2026-11-13', '2026-11-16',
    ])
  })
  it('after an overdue date, continues from today', () => {
    const r = { schedule: { type: 'interval', every: 2, unit: 'week' }, nextDue: '2026-11-05' }
    expect(routineOccurrences(r, '2026-11-01', '2026-11-30', today)).toEqual([
      '2026-11-05', '2026-11-21',
    ])
  })
  it('repeats monthly routines', () => {
    const r = { schedule: { type: 'monthly', day: 1 }, nextDue: '2026-12-01' }
    expect(routineOccurrences(r, '2026-11-01', '2027-02-28', today)).toEqual([
      '2026-12-01', '2027-01-01', '2027-02-01',
    ])
  })
})

describe('buildCalendarItems', () => {
  const categoryById = { laundry: { id: 'laundry', color: 'violet' } }
  const course = {
    id: 'la',
    name: 'Algebra',
    color: 'indigo',
    archived: false,
    lectures: [{ id: 'l1', weekday: 1, start: '10:15', end: '11:45', label: '' }],
  }
  const items = buildCalendarItems({
    tasks: [
      { id: 't1', title: 'Laundry', dueDate: '2026-11-05', status: 'todo', categoryId: 'laundry' },
      { id: 't2', title: 'Done thing', dueDate: '2026-11-09', status: 'done', categoryId: 'laundry' },
      { id: 't3', title: 'Someday', dueDate: null, status: 'todo' },
      { id: 't4', title: 'Sheet', dueDate: '2026-11-09', status: 'todo', categoryId: 'academic', courseId: 'la', typeId: 'homework' },
    ],
    events: [{ id: 'e1', title: 'Midterm', date: '2026-11-09', startTime: '08:00', courseId: 'la', typeId: 'exam' }],
    routines: [{ id: 'r1', title: 'Trash', nextDue: '2026-11-09', categoryId: 'laundry', schedule: { type: 'weekly', weekdays: [1] } }],
    completionLog: [{ id: 'c1', routineId: 'r1', action: 'done', date: '2026-11-02' }],
    courses: [course],
    categoryById,
    courseById: { la: course },
    typeById: { exam: { name: 'Exam' }, homework: { name: 'Homework' } },
    fromISO: '2026-11-02',
    toISO: '2026-11-15',
    today,
  })

  it('puts an overdue task on its due date, marked overdue', () => {
    expect(items['2026-11-05']).toMatchObject([{ kind: 'task', overdue: true, color: 'violet' }])
  })
  it('sorts a busy day: exam, tasks, routine, lecture', () => {
    expect(items['2026-11-09'].map((i) => i.title)).toEqual([
      'Midterm', 'Done thing', 'Sheet', 'Trash', 'Algebra',
    ])
  })
  it('marks done tasks, uses course colors for academic items', () => {
    const day = items['2026-11-09']
    expect(day.find((i) => i.title === 'Done thing').done).toBe(true)
    expect(day.find((i) => i.title === 'Sheet')).toMatchObject({ color: 'indigo', typeName: 'Homework' })
  })
  it('shows completed routines on the day they were done', () => {
    expect(items['2026-11-02'].map((i) => [i.title, i.done])).toContainEqual(['Trash', true])
  })
  it('only lets the next due routine be ticked off', () => {
    const trash = (date) => items[date].find((i) => i.title === 'Trash' && !i.done)
    expect(trash('2026-11-09').actionable).toBe(true)
    expect(trash('2026-11-02')).toBeUndefined()
  })
  it('shows lectures only from the day the course was added', () => {
    const later = { ...course, createdAt: '2026-11-08T12:00:00' }
    const result = buildCalendarItems({
      tasks: [], events: [], routines: [], completionLog: [], courses: [later],
      categoryById: {}, courseById: {}, typeById: {},
      fromISO: '2026-11-02', toISO: '2026-11-15', today,
    })
    expect(Object.keys(result)).toEqual(['2026-11-09'])
  })
  it('skips tasks without a date', () => {
    expect(Object.values(items).flat().some((i) => i.title === 'Someday')).toBe(false)
  })
})
