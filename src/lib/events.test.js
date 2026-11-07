import { describe, expect, it } from 'vitest'
import { countdownLabel, groupEvents } from './events'

const today = '2026-11-07'

describe('groupEvents', () => {
  const events = [
    { title: 'later', date: '2026-11-20', startTime: '10:00' },
    { title: 'today-late', date: today, startTime: '14:00' },
    { title: 'today-early', date: today, startTime: '09:00' },
    { title: 'old', date: '2026-10-01' },
    { title: 'recent', date: '2026-11-05' },
  ]
  const { upcoming, past } = groupEvents(events, today)
  it('lists upcoming events soonest first, including today', () => {
    expect(upcoming.map((e) => e.title)).toEqual(['today-early', 'today-late', 'later'])
  })
  it('lists past events most recent first', () => {
    expect(past.map((e) => e.title)).toEqual(['recent', 'old'])
  })
})

describe('countdownLabel', () => {
  it('describes how far away a date is', () => {
    expect(countdownLabel(today, today)).toBe('Today')
    expect(countdownLabel('2026-11-08', today)).toBe('Tomorrow')
    expect(countdownLabel('2026-11-12', today)).toBe('in 5 days')
    expect(countdownLabel('2026-11-04', today)).toBe('3 days ago')
  })
})
