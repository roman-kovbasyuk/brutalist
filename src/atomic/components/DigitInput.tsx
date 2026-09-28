import { useId, useRef, type ClipboardEvent, type CSSProperties, type KeyboardEvent, type ChangeEvent } from 'react'
import { Text } from '../atoms'
import './digit-input.css'

export type DigitInputProps = {
  label: string
  length?: number
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  error?: string
  name?: string
  required?: boolean
  readOnly?: boolean
  autoComplete?: string
}

export function DigitInput({ label, length = 4, value = '', onChange, disabled, error, name, required, readOnly, autoComplete = 'one-time-code' }: DigitInputProps) {
  const id = useId()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const size = Math.max(1, Math.floor(length))
  const digits = value.replace(/\D/g, '').slice(0, size)
  const digitValues = Array.from({ length: size }, (_, index) => digits[index] ?? '')

  const focus = (index: number) => inputRefs.current[Math.max(0, Math.min(size - 1, index))]?.focus()
  const commit = (next: string) => {
    const normalized = next.replace(/\D/g, '').slice(0, size)
    if (normalized !== digits) onChange?.(normalized)
  }

  const insert = (index: number, raw: string) => {
    const targetIndex = Math.min(index, digits.length)
    const inserted = raw.replace(/\D/g, '').slice(0, size - targetIndex)
    if (!inserted) return
    const next = `${digits.slice(0, targetIndex)}${inserted}${digits.slice(targetIndex + inserted.length)}`.slice(0, size)
    commit(next)
    focus(Math.min(size - 1, targetIndex + inserted.length))
  }

  const remove = (index: number) => {
    if (!digits[index]) {
      if (index > 0) {
        const next = `${digits.slice(0, index - 1)}${digits.slice(index)}`
        commit(next)
        focus(index - 1)
      }
      return
    }
    commit(`${digits.slice(0, index)}${digits.slice(index + 1)}`)
    focus(index - 1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (readOnly) return
    if (event.key === 'ArrowLeft') { event.preventDefault(); focus(index - 1); return }
    if (event.key === 'ArrowRight') { event.preventDefault(); focus(index + 1); return }
    if (event.key === 'Backspace' || event.key === 'Delete') { event.preventDefault(); remove(index); return }
    if (/^\d$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault()
      insert(index, event.key)
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    if (readOnly) return
    const raw = event.currentTarget.value
    const filtered = raw.replace(/\D/g, '')
    if (!filtered) {
      if (raw === '') commit(`${digits.slice(0, index)}${digits.slice(index + 1)}`)
      return
    }
    insert(index, filtered)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    if (readOnly) return
    const pasted = event.clipboardData.getData('text')
    if (!pasted) return
    event.preventDefault()
    insert(index, pasted)
  }

  return <fieldset className="c-digit-input" disabled={disabled}>
    <legend><Text as="span" variant="h7">{label}</Text></legend>
    <div className="c-digit-input__control" data-length={size} style={{ '--c-digit-count': size } as CSSProperties}>
      {digitValues.map((digit, index) => <input
        key={index}
        ref={node => { inputRefs.current[index] = node }}
        aria-label={`${label} digit ${index + 1} of ${size}`}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={index === 0 ? autoComplete : 'off'}
        className="c-digit-input__native"
        disabled={disabled}
        inputMode="numeric"
        maxLength={index === 0 ? size : 1}
        onChange={event => handleChange(event, index)}
        onKeyDown={event => handleKeyDown(event, index)}
        onPaste={event => handlePaste(event, index)}
        readOnly={readOnly}
        required={required}
        type="text"
        value={digit}
      />)}
      {name && <input type="hidden" name={name} value={digits} disabled={disabled} />}
    </div>
    {error && <Text id={`${id}-error`} variant="small" className="c-field-support--error">{error}</Text>}
  </fieldset>
}
