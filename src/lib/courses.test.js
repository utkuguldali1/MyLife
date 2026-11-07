import { describe, expect, it } from 'vitest'
import { addMinutesToTime, formatLecture, sortLectures, TIME_OPTIONS } from './courses'

describe('course helpers', () => {
  it('offers every quarter hour in 24h format', () => {
    expect(TIME_OPTIONS).toHaveLength(96)
    expect(TIME_OPTIONS[0]).toBe('00:00')
    expect(TIME_OPTIONS[33]).toBe('08:15')
    expect(TIME_OPTIONS.at(-1)).toBe('23:45')
  })
  it('adds minutes to a time without passing midnight', () => {
    expect(addMinutesToTime('10:15', 90)).toBe('11:45')
    expect(addMinutesToTime('23:30', 90)).toBe('23:59')
  })
  it('sorts lectures Monday first, then by time', () => {
    const sorted = sortLectures([
      { weekday: 4, start: '12:00' },
      { weekday: 1, start: '14:00' },
      { weekday: 1, start: '08:15' },
    ])
    expect(sorted.map((l) => `${l.weekday} ${l.start}`)).toEqual(['1 08:15', '1 14:00', '4 12:00'])
  })
  it('formats a lecture', () => {
    expect(formatLecture({ weekday: 3, start: '10:15', end: '11:45' })).toBe('Wed 10:15–11:45')
  })
})
