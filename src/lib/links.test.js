import { describe, expect, it } from 'vitest'
import { linkHost, normalizeUrl } from './links'

describe('normalizeUrl', () => {
  it('adds https:// when missing', () => {
    expect(normalizeUrl(' moodle.uni.de/course/5 ')).toBe('https://moodle.uni.de/course/5')
  })
  it('keeps existing http(s) links', () => {
    expect(normalizeUrl('http://example.com/a?b=1')).toBe('http://example.com/a?b=1')
  })
  it('rejects unsafe or invalid links', () => {
    expect(normalizeUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeUrl('hello')).toBeNull()
    expect(normalizeUrl('')).toBeNull()
  })
})

describe('linkHost', () => {
  it('returns the site name without www', () => {
    expect(linkHost('https://www.moodle.uni.de/x')).toBe('moodle.uni.de')
  })
})
