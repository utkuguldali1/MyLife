import { describe, expect, it } from 'vitest'
import {
  describeSchedule,
  firstOccurrenceOnOrAfter,
  getRoutineStatus,
  nextDueAfter,
  ordinal,
  splitRoutines,
} from './routines'

// 2026-11-07 is a Saturday
const today = '2026-11-07'
const monThu = { type: 'weekly', weekdays: [1, 4] }
const every3Days = { type: 'interval', every: 3, unit: 'day' }
const every2Weeks = { type: 'interval', every: 2, unit: 'week' }
const monthly31 = { type: 'monthly', day: 31 }

describe('firstOccurrenceOnOrAfter', () => {
  it('finds the next chosen weekday', () => {
    expect(firstOccurrenceOnOrAfter(monThu, today)).toBe('2026-11-09') // Monday
    expect(firstOccurrenceOnOrAfter(monThu, '2026-11-12')).toBe('2026-11-12') // Thursday itself
  })
  it('uses the last day of shorter months', () => {
    expect(firstOccurrenceOnOrAfter(monthly31, today)).toBe('2026-11-30')
    expect(firstOccurrenceOnOrAfter(monthly31, '2027-02-01')).toBe('2027-02-28')
  })
  it('moves to next month when this month’s day has passed', () => {
    expect(firstOccurrenceOnOrAfter({ type: 'monthly', day: 1 }, today)).toBe('2026-12-01')
  })
  it('starts interval routines on the given date', () => {
    expect(firstOccurrenceOnOrAfter(every3Days, today)).toBe(today)
  })
})

describe('nextDueAfter', () => {
  it('weekly, done on time → next chosen weekday', () => {
    const r = { schedule: monThu, nextDue: '2026-11-05' } // Thursday, done late on Saturday
    expect(nextDueAfter(r, 'done', today)).toBe('2026-11-09')
  })
  it('weekly, done early → counts for the upcoming one', () => {
    const r = { schedule: monThu, nextDue: '2026-11-09' } // due Monday, done Saturday
    expect(nextDueAfter(r, 'done', today)).toBe('2026-11-12')
  })
  it('interval, done → counts from today', () => {
    expect(nextDueAfter({ schedule: every3Days, nextDue: '2026-11-04' }, 'done', today)).toBe(
      '2026-11-10',
    )
    expect(nextDueAfter({ schedule: every2Weeks, nextDue: today }, 'done', today)).toBe(
      '2026-11-21',
    )
  })
  it('interval, skipped while upcoming → counts from when it was due', () => {
    expect(nextDueAfter({ schedule: every3Days, nextDue: '2026-11-09' }, 'skipped', today)).toBe(
      '2026-11-12',
    )
  })
  it('monthly, done → next month', () => {
    const r = { schedule: { type: 'monthly', day: 1 }, nextDue: '2026-11-01' }
    expect(nextDueAfter(r, 'done', today)).toBe('2026-12-01')
  })
  it('snooze → tomorrow', () => {
    expect(nextDueAfter({ schedule: monThu, nextDue: '2026-11-05' }, 'snoozed', today)).toBe(
      '2026-11-08',
    )
  })
})

describe('getRoutineStatus', () => {
  it('knows if a routine is due, late or coming up', () => {
    expect(getRoutineStatus({ nextDue: today }, today)).toEqual({ due: true, daysLate: 0 })
    expect(getRoutineStatus({ nextDue: '2026-11-05' }, today)).toEqual({ due: true, daysLate: 2 })
    expect(getRoutineStatus({ nextDue: '2026-11-10' }, today)).toEqual({
      due: false,
      daysUntil: 3,
    })
  })
})

describe('describeSchedule', () => {
  it('describes schedules in plain words', () => {
    expect(describeSchedule(monThu)).toBe('Every Mon, Thu')
    expect(describeSchedule({ type: 'weekly', weekdays: [5, 1, 2, 3, 4] })).toBe('Weekdays')
    expect(describeSchedule({ type: 'weekly', weekdays: [1, 2, 3, 4, 5, 6, 7] })).toBe('Every day')
    expect(describeSchedule(every3Days)).toBe('Every 3 days')
    expect(describeSchedule({ type: 'interval', every: 1, unit: 'week' })).toBe('Every week')
    expect(describeSchedule({ type: 'monthly', day: 22 })).toBe('Monthly on the 22nd')
  })
  it('writes ordinals correctly', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 31].map(ordinal)).toEqual([
      '1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '31st',
    ])
  })
})

describe('splitRoutines', () => {
  it('puts due routines first, then ones done today, and the rest as upcoming', () => {
    const routines = [
      { id: 'later', title: 'later', nextDue: '2026-11-12' },
      { id: 'done', title: 'done', nextDue: '2026-11-10' },
      { id: 'late', title: 'late', nextDue: '2026-11-05' },
      { id: 'now', title: 'now', nextDue: today },
    ]
    const last = { done: { routineId: 'done', date: today, action: 'done' } }
    const { today: todayList, upcoming } = splitRoutines(routines, last, today)
    expect(todayList.map((r) => r.id)).toEqual(['late', 'now', 'done'])
    expect(upcoming.map((r) => r.id)).toEqual(['later'])
  })
})
