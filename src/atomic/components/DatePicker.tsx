import { useId, useRef, useState, type ChangeEvent } from 'react'
import { Popover as P } from 'radix-ui'
import { AtomsRoot, Stack, Text } from '../atoms'
import { Button } from './Button'
import { Calendar } from './Calendar'
import { FieldSupport, hasContent, supportIds } from './FieldSupport'
import type { TextFieldProps } from './TextField'
import './date-picker.css'
import './forms.css'
import './overlays.css'

export type DatePickerProps = Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'onChange'> & {
  value?: string; defaultValue?: string; min?: string; max?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void; onValueChange?: (value: string) => void
  today?: string; locale?: string
  /** Shows a clear button in the field while it has a value. */
  clearable?: boolean
}

/** Typed entry stays native for form participation; the design-system calendar is the only picker. */
export function DatePicker({ label, value, defaultValue = '', min, max, onChange, onValueChange, disabled, readOnly, required, name, id, instructions, error, className = '', today, locale, clearable = false }: DatePickerProps) {
  const generated = useId(), fieldId = id ?? generated, input = useRef<HTMLInputElement>(null)
  const [internal, setInternal] = useState(defaultValue), [open, setOpen] = useState(false)
  const selected = value ?? internal
  const fallbackToday = today ?? new Date().toISOString().slice(0, 10)
  const [month, setMonth] = useState((selected || min || fallbackToday).slice(0, 7) + '-01')
  const labelText = typeof label === 'string' ? label : 'Date'
  const todayAllowed = (!min || fallbackToday >= min) && (!max || fallbackToday <= max)
  const locked = disabled || readOnly
  // Calendar and clear choices go through the native input so forms and onChange see a real change event.
  const commit = (date: string) => {
    setOpen(false)
    if (!input.current || date === selected) return
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input.current, date)
    input.current.dispatchEvent(new Event('change', { bubbles: true }))
  }
  return <Stack gap={2} className={`c-date-picker c-field ${className}`.trim()}>
    <label htmlFor={fieldId}><Text as="span" variant="h7">{label}</Text></label>
    <P.Root open={open} onOpenChange={next => { if (next) setMonth((selected || min || fallbackToday).slice(0, 7) + '-01'); setOpen(next) }}>
      <P.Anchor asChild><div className="c-date-field" data-invalid={hasContent(error) || undefined} data-disabled={disabled || undefined}>
        <input ref={input} id={fieldId} name={name} type="date" min={min} max={max} className="c-date-field__input" value={selected} onChange={event => { setInternal(event.currentTarget.value); onChange?.(event); onValueChange?.(event.currentTarget.value) }} disabled={disabled} readOnly={readOnly} required={required} aria-describedby={supportIds(fieldId, instructions, error)} aria-invalid={hasContent(error) || undefined} />
        <span className="c-date-field__actions">
          {clearable && selected && !locked && <Button iconOnly size="xsmall" variant="quiet" icon="close" aria-label={`Clear ${labelText}`} onClick={() => commit('')} />}
          <P.Trigger asChild><Button iconOnly size="xsmall" variant="quiet" icon="calendar" className="c-date-field__trigger" aria-label={`Open ${labelText} calendar`} disabled={locked} /></P.Trigger>
        </span>
      </div></P.Anchor>
      <P.Portal><AtomsRoot className="c-overlay-root"><P.Content className="c-popup c-calendar-popup" align="start" sideOffset={8} collisionPadding={16} aria-label={`${labelText} calendar`} onOpenAutoFocus={event => event.preventDefault()}>
        <Stack gap={3}>
          <Calendar label={labelText} value={selected} min={min} max={max} today={fallbackToday} locale={locale} month={month} onMonthChange={setMonth} disabled={disabled} onValueChange={commit} />
          <div className="c-calendar-popup__footer">
            <Button size="xsmall" disabled={!todayAllowed} onClick={() => commit(fallbackToday)}>Today</Button>
          </div>
        </Stack>
      </P.Content></AtomsRoot></P.Portal>
    </P.Root>
    <FieldSupport id={fieldId} instructions={instructions} error={error} />
  </Stack>
}
