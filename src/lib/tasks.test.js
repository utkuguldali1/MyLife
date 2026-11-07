import { describe, expect, it } from 'vitest'
import { getTaskTiming, groupTasks } from './tasks'

const today = '2026-11-07'

function task(overrides) {
  return {
    id: overrides.title,
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    createdAt: '2026-11-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('getTaskTiming', () => {
  it('puts undated tasks in "No date"', () => {
    expect(getTaskTiming(task({ title: 'a' }), today)).toEqual({ group: 'noDate' })
  })
  it('puts tasks due today in "Today"', () => {
    expect(getTaskTiming(task({ title: 'a', dueDate: today }), today)).toEqual({ group: 'today' })
  })
  it('carries overdue tasks over to today with a warning', () => {
    expect(getTaskTiming(task({ title: 'a', dueDate: '2026-11-05' }), today)).toEqual({
      group: 'today',
      carriedOverFrom: '2026-11-05',
      daysLate: 2,
    })
  })
  it('puts future tasks in "Upcoming"', () => {
    expect(getTaskTiming(task({ title: 'a', dueDate: '2026-11-08' }), today)).toEqual({
      group: 'upcoming',
    })
  })
})

describe('groupTasks', () => {
  const tasks = [
    task({ title: 'future-low', dueDate: '2026-11-10', priority: 'low' }),
    task({ title: 'future-soon', dueDate: '2026-11-08' }),
    task({ title: 'today-low', dueDate: today, priority: 'low' }),
    task({ title: 'today-high', dueDate: today, priority: 'high' }),
    task({ title: 'late-2', dueDate: '2026-11-05' }),
    task({ title: 'late-1', dueDate: '2026-11-06' }),
    task({ title: 'nodate' }),
    task({ title: 'done-old', status: 'done', completedAt: '2026-11-05T09:00:00Z' }),
    task({ title: 'done-new', status: 'done', completedAt: '2026-11-06T09:00:00Z' }),
  ]
  const groups = groupTasks(tasks, today)
  const titles = (list) => list.map((t) => t.title)

  it('sorts today: carried over first (oldest first), then by priority', () => {
    expect(titles(groups.today)).toEqual(['late-2', 'late-1', 'today-high', 'today-low'])
  })
  it('sorts upcoming by date', () => {
    expect(titles(groups.upcoming)).toEqual(['future-soon', 'future-low'])
  })
  it('keeps undated tasks separate', () => {
    expect(titles(groups.noDate)).toEqual(['nodate'])
  })
  it('shows most recently completed first', () => {
    expect(titles(groups.completed)).toEqual(['done-new', 'done-old'])
  })
})
