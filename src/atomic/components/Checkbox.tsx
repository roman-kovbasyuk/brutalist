import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { Icon, Stack, Text } from '../atoms'
import { FieldSupport, hasContent, supportIds } from './FieldSupport'
import './forms.css'
import './choice-cards.css'

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode
  description?: ReactNode
  instructions?: ReactNode
  error?: ReactNode
  indeterminate?: boolean
  variant?: 'default' | 'card'
  /** Keeps the label for assistive technology when the surrounding row already names the item. */
  hideLabel?: boolean
}

export function Checkbox({ label, description, instructions, error, indeterminate = false, variant = 'default', hideLabel = false, id, checked, defaultChecked, className = '', readOnly, onChange, onClick, 'aria-describedby': external, 'aria-invalid': invalid, ...props }: CheckboxProps) {
  const generated = useId()
  const fieldId = id ?? generated
  const inputRef = useRef<HTMLInputElement>(null)
  const card = variant === 'card'
  const describedBy = [supportIds(fieldId, instructions, error, external), card && hasContent(description) && `${fieldId}-description`].filter(Boolean).join(' ') || undefined
  useEffect(() => { if (inputRef.current) inputRef.current.indeterminate = indeterminate }, [indeterminate])

  const input = <span className="c-check-control"><input {...props} {...(checked === undefined ? { defaultChecked } : { checked })} ref={inputRef} id={fieldId} type="checkbox" className={`c-checkbox ${className}`.trim()} aria-describedby={describedBy} aria-labelledby={card ? `${fieldId}-label` : undefined} aria-invalid={hasContent(error) || invalid || undefined} onClick={event => { if (readOnly) { event.preventDefault(); return } onClick?.(event) }} onChange={event => { if (!readOnly) onChange?.(event) }} /><span className="c-choice-mark" aria-hidden="true"><Icon name="check" size="small" /></span></span>

  return <Stack gap={1} className={card ? undefined : 'c-checkbox-field'}>
    {card ? <div className="c-choice-card">
      <label className="c-choice-row c-choice-row--card" htmlFor={fieldId}>{input}<Text id={`${fieldId}-label`} as="span">{label}</Text></label>
      {hasContent(description) && <div id={`${fieldId}-description`} className="c-choice-card__description"><Text as="span" variant="small" tone="inherit">{description}</Text></div>}
    </div> : <label className={`c-choice-row${hideLabel ? ' c-choice-row--label-hidden' : ''}`} htmlFor={fieldId}>{input}<Text as="span" className={hideLabel ? 'c-field-label-hidden' : undefined}>{label}</Text></label>}
    <FieldSupport id={fieldId} instructions={instructions} error={error} />
  </Stack>
}
