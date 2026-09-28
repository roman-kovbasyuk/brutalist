import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Inline, Stack, Text } from '../atoms'
import { Button } from './Button'
import { addCalendarDays, isCalendarDate, shiftCalendarMonth, startOfCalendarMonth } from './calendarDate'
import './calendar.css'

export type DateRangeValue = { start: string; end: string }
type CalendarCommon = {
  label: string; min?: string; max?: string; locale?: string; weekStartsOn?: 0 | 1
  month?: string; onMonthChange?: (month: string) => void; today?: string
  isDateDisabled?: (date: string) => boolean; disabled?: boolean
}
export type CalendarProps = CalendarCommon & (
  | { mode?: 'single'; value?: string; onValueChange: (value: string) => void }
  | { mode: 'range'; value: DateRangeValue; onValueChange: (value: DateRangeValue) => void }
)

function utcDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number), date = new Date(0)
  date.setUTCHours(12, 0, 0, 0); date.setUTCFullYear(year, month - 1, day)
  return date
}
function isoDate(date: Date): string { return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}` }
function dateLimit(month: string, delta: number): string { return shiftCalendarMonth(month, delta) }
function adjacentMonth(month: string, delta: number): string | null {
  try { return dateLimit(month, delta) } catch { return null }
}
function fullDate(value: string, locale: string): string { return utcDate(value).toLocaleDateString(locale, { dateStyle: 'full', timeZone: 'UTC' }) }

export function Calendar(props: CalendarProps) {
  const { label, min, max, locale = 'en', weekStartsOn = 1, month: suppliedMonth, onMonthChange, today, disabled = false, isDateDisabled } = props
  const rangeMode = props.mode === 'range'
  const selected = rangeMode ? '' : props.value ?? ''
  const valueRange = rangeMode ? props.value as DateRangeValue : undefined
  const rangeCallback = rangeMode ? props.onValueChange as (value: DateRangeValue) => void : undefined
  const singleCallback = !rangeMode ? props.onValueChange as (value: string) => void : undefined
  const generated = useId(), gridId = `${generated}-calendar`
  const systemToday = isoDate(new Date())
  const baseDate = isCalendarDate(selected) ? selected : isCalendarDate(valueRange?.start ?? '') ? valueRange!.start : isCalendarDate(today ?? '') ? today! : (min && isCalendarDate(min) ? min : systemToday)
  const initialMonth = startOfCalendarMonth(baseDate)
  const [internalMonth, setInternalMonth] = useState(isCalendarDate(suppliedMonth ?? '') ? startOfCalendarMonth(suppliedMonth!) : initialMonth)
  const currentMonth = onMonthChange && isCalendarDate(suppliedMonth ?? '') ? startOfCalendarMonth(suppliedMonth!) : internalMonth
  const [focusDate, setFocusDate] = useState(baseDate)
  const [rangeStart, setRangeStart] = useState(valueRange?.end || !isCalendarDate(valueRange?.start ?? '') ? '' : valueRange!.start)
  const [rangeError, setRangeError] = useState('')
  const [rangeAnnouncement, setRangeAnnouncement] = useState('')
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const yearDate = utcDate(currentMonth), year = yearDate.getUTCFullYear()
  const displayMonth = yearDate.toLocaleDateString(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const monthStart = startOfCalendarMonth(currentMonth)
  const firstDay = utcDate(monthStart).getUTCDay()
  const offset = (firstDay - weekStartsOn + 7) % 7
  const monthEnd = new Date(0)
  monthEnd.setUTCHours(12, 0, 0, 0)
  monthEnd.setUTCFullYear(year, yearDate.getUTCMonth() + 1, 0)
  const monthLength = monthEnd.getUTCDate()
  const weekdays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.UTC(2024, 0, 7 + ((weekStartsOn + i) % 7), 12))
    return day.toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })
  }), [locale, weekStartsOn])
  const withinBounds = (date: string) => (!min || date >= min) && (!max || date <= max)
  const unavailable = (date: string) => !withinBounds(date) || !!isDateDisabled?.(date)
  const canFocus = (date: string) => isCalendarDate(date) && !unavailable(date)
  const seek = (from: string, direction: number) => {
    let candidate = direction > 0 && min && from < min ? min : direction < 0 && max && from > max ? max : from
    const fullBoundedSpan = min && max ? Math.ceil(Math.abs((utcDate(max).getTime() - utcDate(min).getTime()) / 86400000)) + 1 : 3652059
    const limit = isDateDisabled ? fullBoundedSpan : 2
    for (let i = 0; i < limit; i++) {
      if (canFocus(candidate)) return candidate
      try { candidate = addCalendarDays(candidate, direction) } catch { return '' }
      if ((direction < 0 && min && candidate < min) || (direction > 0 && max && candidate > max)) return ''
    }
    return ''
  }
  const firstPermitted = () => seek(baseDate, 1)
  const focusTarget = canFocus(focusDate) ? focusDate : canFocus(selected) ? selected : canFocus(today ?? '') ? today! : firstPermitted()

  useLayoutEffect(() => { if (focusTarget) setFocusDate(focusTarget) }, [focusTarget])
  useLayoutEffect(() => {
    if (!focusTarget || focusTarget.startsWith(currentMonth.slice(0, 7))) return
    const nextMonth = startOfCalendarMonth(focusTarget)
    if (!onMonthChange) setInternalMonth(nextMonth)
    onMonthChange?.(nextMonth)
  }, [currentMonth, focusTarget, onMonthChange])
  useLayoutEffect(() => { if (focusTarget.startsWith(currentMonth.slice(0, 7))) buttonRefs.current.get(focusTarget)?.focus() }, [currentMonth, focusTarget])

  const canMoveMonth = (delta: number) => {
    const next = adjacentMonth(currentMonth, delta)
    return !!next && (!min || next >= startOfCalendarMonth(min)) && (!max || next <= startOfCalendarMonth(max))
  }
  const moveMonth = (delta: number) => {
    const next = adjacentMonth(currentMonth, delta)
    if (!next || !canMoveMonth(delta)) return
    if (!onMonthChange) setInternalMonth(next)
    onMonthChange?.(next)
    const candidate = focusDate.startsWith(next.slice(0, 7)) ? focusDate : `${next.slice(0, 8)}${focusDate.slice(8, 10)}`
    const boundedCandidate = isCalendarDate(candidate) ? candidate : next
    if (canFocus(boundedCandidate)) setFocusDate(boundedCandidate)
    else {
      let date = boundedCandidate
      for (let i = 0; i < 31 && date.startsWith(next.slice(0, 7)); i++) {
        if (canFocus(date)) { setFocusDate(date); break }
        try { date = addCalendarDays(date, 1) } catch { break }
      }
    }
  }
  const select = (date: string) => {
    if (disabled || unavailable(date)) return
    if (!rangeMode) { singleCallback?.(date); return }
    setRangeError('')
    if (!rangeStart) {
      setRangeStart(date)
      setRangeAnnouncement(`Start date ${fullDate(date, locale)} selected. Choose an end date.`)
      rangeCallback?.({ start: date, end: '' })
      return
    }
    const start = date < rangeStart ? date : rangeStart, end = date < rangeStart ? rangeStart : date
    for (let cursor = start; ; ) {
      if (unavailable(cursor)) { setRangeError(`The period includes an unavailable date: ${cursor}. Choose another end date.`); return }
      if (cursor === end) break
      cursor = addCalendarDays(cursor, 1)
    }
    rangeCallback?.({ start, end })
    setRangeStart('')
    setRangeAnnouncement(`Selected period from ${fullDate(start, locale)} to ${fullDate(end, locale)}.`)
  }
  const dayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, date: string) => {
    let delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' ? 7 : event.key === 'ArrowUp' ? -7 : 0
    if (event.key === 'Home') delta = -((utcDate(date).getUTCDay() - weekStartsOn + 7) % 7)
    if (event.key === 'End') delta = 6 - ((utcDate(date).getUTCDay() - weekStartsOn + 7) % 7)
    if (event.key === 'PageDown' || event.key === 'PageUp') { event.preventDefault(); moveMonth((event.key === 'PageDown' ? 1 : -1) * (event.shiftKey ? 12 : 1)); return }
    if (!delta && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    let adjacent: string
    try { adjacent = addCalendarDays(date, delta || 0) } catch { return }
    const next = seek(adjacent, Math.sign(delta || 1))
    if (!next) return
    setFocusDate(next)
    if (!next.startsWith(currentMonth.slice(0, 7))) {
      const nextMonth = startOfCalendarMonth(next)
      if (!onMonthChange) setInternalMonth(nextMonth)
      onMonthChange?.(nextMonth)
    } else buttonRefs.current.get(next)?.focus()
  }
  const rowCount = Math.ceil((offset + monthLength) / 7)
  const cells = Array.from({ length: rowCount * 7 }, (_, cellIndex) => {
    const dayNumber = cellIndex - offset + 1
    if (dayNumber < 1 || dayNumber > monthLength) return <div role="gridcell" aria-disabled="true" key={`blank-${cellIndex}`} />
    const date = `${monthStart.slice(0, 8)}${String(dayNumber).padStart(2, '0')}`
    const isSelected = !rangeMode && selected === date
    const inRange = !!valueRange?.start && !!valueRange?.end && date >= valueRange.start && date <= valueRange.end
    const isRangeStart = rangeMode && (date === (rangeStart || valueRange?.start))
    const isRangeEnd = rangeMode && date === valueRange?.end
    return <div role="gridcell" aria-label={date} aria-selected={isSelected || inRange || isRangeStart || isRangeEnd || undefined} aria-disabled={unavailable(date) || undefined} key={date}>
      <Button ref={element => { if (element) buttonRefs.current.set(date, element); else buttonRefs.current.delete(date) }} className="c-calendar__day" size="compact" variant={isSelected || isRangeStart || isRangeEnd ? 'primary' : 'quiet'} aria-label={date} aria-description={fullDate(date, locale)} aria-pressed={isSelected || isRangeStart || isRangeEnd} tabIndex={date === focusTarget ? 0 : -1} disabled={disabled || unavailable(date)} data-today={date === today || undefined} data-in-range={inRange || undefined} onFocus={() => setFocusDate(date)} onKeyDown={event => dayKeyDown(event, date)} onClick={() => select(date)}>{dayNumber}</Button>
    </div>
  })

  return <Stack gap={2} className="c-calendar" aria-label={label}>
    <Inline className="c-calendar__heading"><Button iconOnly size="compact" variant="quiet" icon="arrowLeft" aria-label="Previous month" disabled={disabled || !canMoveMonth(-1)} onClick={() => moveMonth(-1)} /><Text variant="h6" role="status" aria-live="polite">{displayMonth}</Text><Button iconOnly size="compact" variant="quiet" icon="arrowRight" aria-label="Next month" disabled={disabled || !canMoveMonth(1)} onClick={() => moveMonth(1)} /></Inline>
    <div id={gridId} className="c-calendar__grid" role="grid" aria-label={label} aria-readonly={disabled || undefined}>
      <div role="row" className="c-calendar__weekdays">{weekdays.map(day => <div role="columnheader" key={day}><Text as="span" variant="small">{day}</Text></div>)}</div>
      {Array.from({ length: rowCount }, (_, row) => <div role="row" key={row}>{cells.slice(row * 7, row * 7 + 7)}</div>)}
    </div>
    {rangeError && <Text role="alert" variant="small" tone="inherit" className="c-field-error">{rangeError}</Text>}
    {rangeMode && <Text role="status" aria-live="polite" className="c-calendar__announcement">{rangeAnnouncement}</Text>}
  </Stack>
}
