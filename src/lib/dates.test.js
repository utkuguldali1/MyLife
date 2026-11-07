// Automated tests: each test runs a function and checks the answer.
// Run them with: npm test
import { describe, expect, it } from 'vitest'
import { addDaysISO, daysBetween, formatDateLabel } from './dates'

describe('addDaysISO', () => {
  it('adds days', () => {
    expect(addDaysISO('2026-11-07', 3)).toBe('2026-11-10')
  })
  it('crosses month and year boundaries', () => {
    expect(addDaysISO('2026-12-30', 3)).toBe('2027-01-02')
  })
  it('handles leap years', () => {
    expect(addDaysISO('2028-02-28', 1)).toBe('2028-02-29')
  })
  it('subtracts with negative numbers', () => {
    expect(addDaysISO('2026-11-01', -1)).toBe('2026-10-31')
  })
})

describe('daysBetween', () => {
  it('counts calendar days', () => {
    expect(daysBetween('2026-11-07', '2026-11-14')).toBe(7)
    expect(daysBetween('2026-11-07', '2026-11-05')).toBe(-2)
  })
})

describe('formatDateLabel', () => {
  const today = '2026-11-07'
  it('uses words for nearby days', () => {
    expect(formatDateLabel('2026-11-07', today)).toBe('Today')
    expect(formatDateLabel('2026-11-08', today)).toBe('Tomorrow')
    expect(formatDateLabel('2026-11-06', today)).toBe('Yesterday')
  })
  it('shows weekday, day and month for other dates', () => {
    expect(formatDateLabel('2026-11-11', today)).toBe('Wed 11 Nov')
  })
  it('adds the year for other years', () => {
    expect(formatDateLabel('2027-01-15', today)).toBe('15 Jan 2027')
  })
})
