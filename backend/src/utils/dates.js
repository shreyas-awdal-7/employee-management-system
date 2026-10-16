// All "day" values are stored as UTC midnight dates or YYYY-MM-DD keys (India time),
// so weekday maths never shifts because of timezones.

export const toDateKey = (date = new Date()) =>
  date.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

export const parseDateKey = (key) => new Date(`${key}T00:00:00.000Z`)

export const dateKeyOf = (utcDate) => utcDate.toISOString().slice(0, 10)

export const isWeekend = (utcDate) => [0, 6].includes(utcDate.getUTCDay())

/** Mon-Fri days between two UTC dates, both inclusive. */
export const countWorkingDays = (start, end) => {
  let count = 0
  const d = new Date(start)
  while (d <= end) {
    if (!isWeekend(d)) count++
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return count
}

/** First and last day (UTC) of a month. month is 1-12. */
export const monthRange = (month, year) => ({
  start: new Date(Date.UTC(year, month - 1, 1)),
  end: new Date(Date.UTC(year, month, 0)),
})

export const currentMonthYear = () => {
  const [year, month] = toDateKey().split('-').map(Number)
  return { month, year }
}
