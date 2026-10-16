import { countWorkingDays, monthRange, parseDateKey } from '../src/utils/dates.js'

describe('date utils', () => {
  test('counts only Monday to Friday', () => {
    // 2026-10-12 (Mon) to 2026-10-18 (Sun)
    expect(countWorkingDays(parseDateKey('2026-10-12'), parseDateKey('2026-10-18'))).toBe(5)
  })

  test('weekend-only range has zero working days', () => {
    expect(countWorkingDays(parseDateKey('2026-10-17'), parseDateKey('2026-10-18'))).toBe(0)
  })

  test('monthRange returns first and last day', () => {
    const { start, end } = monthRange(2, 2028) // leap year
    expect(start.toISOString().slice(0, 10)).toBe('2028-02-01')
    expect(end.toISOString().slice(0, 10)).toBe('2028-02-29')
  })

  test('October 2026 has 22 working days', () => {
    const { start, end } = monthRange(10, 2026)
    expect(countWorkingDays(start, end)).toBe(22)
  })
})
