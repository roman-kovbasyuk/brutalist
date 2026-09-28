const DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function parts(value: string): [number, number, number] | null {
  const match = DATE.exec(value)
  if (!match) return null
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3])
  if (year < 1 || year > 9999) return null
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, day)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? [year, month, day] : null
}

function dateFrom(value: string): Date {
  const valueParts = parts(value)
  if (!valueParts) throw new RangeError(`Invalid calendar date: ${value}`)
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(valueParts[0], valueParts[1] - 1, valueParts[2])
  return date
}

function format(date: Date): string {
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

export function isCalendarDate(value: string): boolean { return parts(value) !== null }

export function addCalendarDays(value: string, delta: number): string {
  if (!Number.isInteger(delta)) throw new RangeError('Calendar day delta must be an integer')
  const date = dateFrom(value)
  date.setUTCDate(date.getUTCDate() + delta)
  if (Number.isNaN(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) throw new RangeError('Calendar date is outside the supported range')
  return format(date)
}

export function startOfCalendarMonth(value: string): string {
  const [year, month] = parts(value) ?? (() => { throw new RangeError(`Invalid calendar date: ${value}`) })()
  const date = new Date(0)
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCFullYear(year, month - 1, 1)
  return format(date)
}

export function shiftCalendarMonth(value: string, delta: number): string {
  if (!Number.isInteger(delta)) throw new RangeError('Calendar month delta must be an integer')
  const [year, month, day] = parts(value) ?? (() => { throw new RangeError(`Invalid calendar date: ${value}`) })()
  const monthIndex = year * 12 + month - 1 + delta
  if (!Number.isSafeInteger(monthIndex)) throw new RangeError('Calendar date is outside the supported range')
  const targetYear = Math.floor(monthIndex / 12)
  const targetMonth = ((monthIndex % 12) + 12) % 12
  if (targetYear < 1 || targetYear > 9999) throw new RangeError('Calendar date is outside the supported range')
  const first = new Date(0)
  first.setUTCHours(0, 0, 0, 0)
  first.setUTCFullYear(targetYear, targetMonth, 1)
  if (first.getUTCFullYear() < 1 || first.getUTCFullYear() > 9999) throw new RangeError('Calendar date is outside the supported range')
  const lastDay = new Date(0)
  lastDay.setUTCHours(0, 0, 0, 0)
  lastDay.setUTCFullYear(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)
  first.setUTCDate(Math.min(day, lastDay.getUTCDate()))
  return format(first)
}
