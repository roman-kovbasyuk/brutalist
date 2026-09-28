import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Popover as P } from 'radix-ui'
import { AtomsRoot, Stack, Text } from '../atoms'
import { Button } from './Button'
import { FieldSupport, hasContent, supportIds } from './FieldSupport'
import type { TextFieldProps } from './TextField'
import './date-picker.css'
import './time-field.css'
import './forms.css'
import './overlays.css'

export type TimeFieldProps = Omit<TextFieldProps, 'type'>

const toMinutes = (time: string) => { const [hours, minutes] = time.split(':').map(Number); return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN }
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

/** Typed entry stays native; the clock button opens the permitted slots at the field's step. */
export function TimeField({ label, instructions, error, id, className = '', min, max, step, value, defaultValue, onChange, disabled, readOnly, required, name, hideLabel = false, trailing: _trailing, width: _width, 'aria-describedby': external, ...props }: TimeFieldProps) {
  const generated = useId(), fieldId = id ?? generated
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState(String(defaultValue ?? ''))
  const [open, setOpen] = useState(false)
  const current = value !== undefined ? String(value) : internal
  const labelText = typeof label === 'string' ? label : 'Time'
  const locked = disabled || readOnly
  const slots = useMemo(() => {
    const first = toMinutes(String(min ?? '00:00')), last = toMinutes(String(max ?? '23:59'))
    const interval = Math.max(5, Math.round((Number(step) > 0 ? Number(step) : 1800) / 60))
    const start = Number.isFinite(first) ? first : 0, end = Number.isFinite(last) ? last : 24 * 60 - 1
    return Array.from({ length: Math.max(0, Math.floor((end - start) / interval) + 1) }, (_, index) => toTime(start + index * interval))
  }, [min, max, step])
  // A slot choice goes through the native input so forms and onChange see a real change event.
  const commit = (time: string) => {
    setOpen(false)
    if (!input.current || time === current) return
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input.current, time)
    input.current.dispatchEvent(new Event('change', { bubbles: true }))
  }
  const focusSlot = (index: number) => {
    const buttons = list.current?.querySelectorAll<HTMLButtonElement>('button')
    const target = buttons?.[Math.max(0, Math.min(buttons.length - 1, index))]
    target?.focus()
    target?.scrollIntoView({ block: 'nearest' })
  }
  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'ArrowDown' ? index + 1 : event.key === 'ArrowUp' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : undefined
    if (next === undefined) return
    event.preventDefault()
    focusSlot(next)
  }
  return <Stack gap={2} className={`c-time-field c-field ${className}`.trim()}>
    <label htmlFor={fieldId} className={hideLabel ? 'c-field-label-hidden' : undefined}><Text as="span" variant="h7">{label}</Text></label>
    <P.Root open={open} onOpenChange={setOpen}>
      <P.Anchor asChild><div className="c-date-field" data-invalid={hasContent(error) || undefined} data-disabled={disabled || undefined}>
        <input {...props} ref={input} id={fieldId} name={name} type="time" min={min} max={max} step={step} className="c-date-field__input" value={current} onChange={event => { setInternal(event.currentTarget.value); onChange?.(event) }} disabled={disabled} readOnly={readOnly} required={required} aria-describedby={supportIds(fieldId, instructions, error, external)} aria-invalid={hasContent(error) || undefined} />
        <span className="c-date-field__actions">
          <P.Trigger asChild><Button iconOnly size="xsmall" variant="quiet" icon="clock" className="c-date-field__trigger" aria-label={`Choose ${labelText}`} disabled={locked || !slots.length} /></P.Trigger>
        </span>
      </div></P.Anchor>
      <P.Portal><AtomsRoot className="c-overlay-root"><P.Content className="c-popup c-time-popup" align="end" sideOffset={8} collisionPadding={16} aria-label={`${labelText} options`} onOpenAutoFocus={event => {
        event.preventDefault()
        const selected = slots.indexOf(current.slice(0, 5))
        requestAnimationFrame(() => focusSlot(selected >= 0 ? selected : 0))
      }}>
        <div ref={list} className="c-time-popup__slots" role="group" aria-label={`${labelText} options`} onKeyDown={moveFocus}>
          {slots.map(slot => {
            const selected = current.slice(0, 5) === slot
            return <Button key={slot} size="xsmall" variant={selected ? 'primary' : 'quiet'} aria-pressed={selected} className="c-time-popup__slot" tabIndex={-1} onClick={() => commit(slot)}>{slot}</Button>
          })}
        </div>
      </P.Content></AtomsRoot></P.Portal>
    </P.Root>
    <FieldSupport id={fieldId} instructions={instructions} error={error} />
  </Stack>
}
