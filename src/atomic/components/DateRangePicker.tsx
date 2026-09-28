import { useEffect, useId, useState, type ReactNode } from 'react'
import { Popover as P } from 'radix-ui'
import { AtomsRoot, Icon, Inline, Stack, Text } from '../atoms'
import { Button } from './Button'
import { Calendar, type DateRangeValue } from './Calendar'
import { FieldSupport, hasContent, supportIds } from './FieldSupport'
import { isCalendarDate, addCalendarDays, startOfCalendarMonth } from './calendarDate'
import './date-picker.css'
import './date-range-picker.css'
import './forms.css'
import './overlays.css'

export type DateRangePickerProps = {
  label: string; value: DateRangeValue; onValueChange: (value: DateRangeValue) => void
  min?: string; max?: string; locale?: string; weekStartsOn?: 0 | 1; today?: string
  isDateDisabled?: (date: string) => boolean; disabled?: boolean
  startName?: string; endName?: string; required?: boolean; readOnly?: boolean
  instructions?: ReactNode; error?: ReactNode; clearable?: boolean
  labels?: { apply?: string; cancel?: string; clear?: string }
}

function validateRange(range: DateRangeValue, isDateDisabled?: (date: string) => boolean): string {
  if (range.start && !isCalendarDate(range.start)) return 'Start date must be a valid calendar date.'
  if (range.end && !isCalendarDate(range.end)) return 'End date must be a valid calendar date.'
  if (!range.start || !range.end) return ''
  if (range.end < range.start) return 'End date must be on or after the start date.'
  for (let date = range.start; ; ) {
    if (isDateDisabled?.(date)) return `The period includes an unavailable date: ${date}. Choose another date.`
    if (date === range.end) break
    date = addCalendarDays(date, 1)
  }
  return ''
}

export function DateRangePicker({ label, value, onValueChange, min, max, locale, weekStartsOn, today, isDateDisabled, disabled = false, startName, endName, required = false, readOnly = false, instructions, error, clearable = false, labels = {} }: DateRangePickerProps) {
  const generated = useId(), startId = `${generated}-start`, endId = `${generated}-end`
  const [open, setOpen] = useState(false), [draft, setDraft] = useState<DateRangeValue>(value)
  const fallbackToday = today ?? new Date().toISOString().slice(0, 10)
  const initialSeed = isCalendarDate(value.start) ? value.start : isCalendarDate(value.end) ? value.end : fallbackToday
  const [month, setMonth] = useState(startOfCalendarMonth(initialSeed))
  const invalid = validateRange(value, isDateDisabled)
  const change = (key: 'start' | 'end', next: string) => onValueChange({ ...value, [key]: next })
  const apply = () => {
    if (draft.start && draft.end && !validateRange(draft, isDateDisabled) && (!min || draft.start >= min) && (!max || draft.end <= max)) {
      onValueChange(draft)
      setOpen(false)
    }
  }
  const clear = () => { onValueChange({ start: '', end: '' }); setDraft({ start: '', end: '' }); setOpen(false) }
  const rangeError = invalid || (value.start && min && value.start < min ? `Start date must be on or after ${min}.` : '') || (value.end && max && value.end > max ? `End date must be on or before ${max}.` : '')
  const endError = rangeError || error
  useEffect(() => {
    const input = document.getElementById(endId) as HTMLInputElement | null
    input?.setCustomValidity(typeof rangeError === 'string' ? rangeError : '')
  }, [endId, rangeError])
  const startInvalid = typeof rangeError === 'string' && rangeError.startsWith('Start')
  const locked = disabled || readOnly
  const describedBy = supportIds(generated, instructions, endError)
  return <Stack gap={2} className="c-date-range-picker c-field" role="group" aria-labelledby={`${generated}-label`}>
    <Text as="span" id={`${generated}-label`} variant="h7">{label}</Text>
    <P.Root open={open} onOpenChange={next => {
      setOpen(next)
      if (next) {
        const seed = isCalendarDate(value.start) ? value.start : isCalendarDate(value.end) ? value.end : fallbackToday
        setDraft({ ...value }); setMonth(startOfCalendarMonth(seed))
      }
    }}>
      <P.Anchor asChild><div className="c-date-field c-date-range-picker__field" data-invalid={hasContent(endError) || undefined} data-disabled={disabled || undefined}>
        <label htmlFor={startId} className="c-field-label-hidden">{`${label} start`}</label>
        <input id={startId} type="date" className="c-date-field__input" name={startName} value={value.start} min={min} max={max} required={required} readOnly={readOnly} disabled={disabled} aria-describedby={describedBy} aria-invalid={startInvalid || undefined} onChange={event => change('start', event.currentTarget.value)} />
        <Icon name="arrowRight" size="small" className="c-date-field__separator" />
        <label htmlFor={endId} className="c-field-label-hidden">{`${label} end`}</label>
        <input id={endId} type="date" className="c-date-field__input" name={endName} value={value.end} min={min} max={max} required={required} readOnly={readOnly} disabled={disabled} aria-describedby={describedBy} aria-invalid={(hasContent(endError) && !startInvalid) || undefined} onChange={event => change('end', event.currentTarget.value)} />
        <span className="c-date-field__actions">
          {clearable && (value.start || value.end) && !locked && <Button iconOnly size="xsmall" variant="quiet" icon="close" aria-label={`Clear ${label}`} onClick={clear} />}
          <P.Trigger asChild><Button iconOnly size="xsmall" variant="quiet" icon="calendar" className="c-date-field__trigger" aria-label={`Open ${label} calendar`} disabled={locked} /></P.Trigger>
        </span>
      </div></P.Anchor>
      <P.Portal><AtomsRoot className="c-overlay-root"><P.Content className="c-popup c-calendar-popup" align="start" sideOffset={8} collisionPadding={16} aria-label={`${label} calendar`} onOpenAutoFocus={event => event.preventDefault()}>
        <Stack gap={3}>
          <Calendar mode="range" label={label} value={draft} onValueChange={setDraft} min={min} max={max} locale={locale} weekStartsOn={weekStartsOn} today={fallbackToday} isDateDisabled={isDateDisabled} month={month} onMonthChange={setMonth} disabled={disabled} />
          <Inline className="c-date-range-picker__actions">
            <Button onClick={() => setOpen(false)}>{labels.cancel ?? 'Cancel'}</Button>
            {clearable && <Button onClick={clear}>{labels.clear ?? 'Clear'}</Button>}
            <Button variant="primary" disabled={disabled || !draft.start || !draft.end || !!validateRange(draft, isDateDisabled) || (!!min && draft.start < min) || (!!max && draft.end > max)} onClick={apply}>{labels.apply ?? 'Apply'}</Button>
          </Inline>
          {rangeError && <div className="c-field-error" role="alert">{rangeError}</div>}
        </Stack>
      </P.Content></AtomsRoot></P.Portal>
    </P.Root>
    <FieldSupport id={generated} instructions={instructions} error={endError} />
  </Stack>
}
