import { useId, useState, type ReactNode } from 'react'
import { Stack, Text } from '../atoms'
import { FieldSupport, hasContent, supportIds } from './FieldSupport'
import './forms.css'
import './choice-cards.css'
import { TextField } from './TextField'

export type RadioOption = { value: string; label: ReactNode; disabled?: boolean; description?: ReactNode }
export type RadioGroupProps = {
  id?: string; name?: string; label: ReactNode; instructions?: ReactNode; error?: ReactNode
  options: readonly RadioOption[]; value?: string; defaultValue?: string; onChange?: (value: string) => void
  customOption?: { value: string; label: string; text: string; onTextChange: (text: string) => void; placeholder?: string }
  disabled?: boolean; readOnly?: boolean; required?: boolean; className?: string
  /** `tags` draws the options as wrapping, tag-shaped choices; they stay native radios. */
  variant?: 'default' | 'tags' | 'cards'
  /** tags only: `scroll` keeps the choices on one row that scrolls sideways, for narrow screens. */
  layout?: 'wrap' | 'scroll'
  /** Keep the legend for assistive technology but hide it visually, when the choices explain themselves. */
  hideLabel?: boolean
}
export function RadioGroup({ id, name, label, instructions, error, options, value, defaultValue, onChange, disabled = false, readOnly = false, required, className = '', customOption, variant = 'default', layout = 'wrap', hideLabel = false }: RadioGroupProps) {
  const generated = useId(), groupId = id ?? generated, groupName = name ?? generated
  const [internal, setInternal] = useState(defaultValue)
  const selected = value ?? internal, choices: readonly RadioOption[] = customOption ? [...options, customOption] : options
  const tags = variant === 'tags', cards = variant === 'cards'
  const rows = choices.map((option, index) => {
    const optionId = `${groupId}-${index}`, labelId = `${optionId}-label`
    const description = 'description' in option ? option.description : undefined
    const descriptionId = cards && hasContent(description) ? `${optionId}-description` : undefined
    const describedBy = [supportIds(groupId, instructions, error), descriptionId].filter(Boolean).join(' ') || undefined
    return cards ? <div className="c-choice-card c-radio-choice-card" key={option.value}>
      <label className="c-choice-row c-choice-row--card" htmlFor={optionId}>
        <input type="radio" id={optionId} name={groupName} value={option.value} className="c-radio" checked={selected === option.value} disabled={option.disabled} required={required} aria-describedby={describedBy} aria-labelledby={labelId} aria-invalid={hasContent(error) || undefined} onChange={() => { if (!readOnly) { setInternal(option.value); onChange?.(option.value) } }} />
        <Text id={labelId} as="span">{option.label}</Text>
      </label>
      {hasContent(description) && <div id={descriptionId} className="c-choice-card__description"><Text as="span" variant="small" tone="inherit">{description}</Text></div>}
    </div> : <label className="c-choice-row" key={option.value} htmlFor={optionId}>
      <input type="radio" id={optionId} name={groupName} value={option.value} className="c-radio" checked={selected === option.value} disabled={option.disabled} required={required} aria-describedby={supportIds(groupId, instructions, error)} aria-invalid={hasContent(error) || undefined} onChange={() => { if (!readOnly) { setInternal(option.value); onChange?.(option.value) } }} />
      <Text as="span">{option.label}</Text>
    </label>
  })
  return <fieldset id={groupId} disabled={disabled} className={`c-radio-group${tags ? ' c-radio-group--tags' : ''}${cards ? ' c-radio-group--cards' : ''} ${className}`.trim()} aria-describedby={supportIds(groupId, instructions, error)} aria-invalid={hasContent(error) || undefined}>
    <legend className={hideLabel ? 'c-field-label-hidden' : undefined}><Text as="span" variant="h7">{label}</Text></legend>
    <Stack gap={2}>
      <FieldSupport id={groupId} instructions={instructions} />
      {tags ? <div className="c-radio-tags" data-layout={layout === 'scroll' ? 'scroll' : undefined}>{rows}</div> : <Stack gap={0}>{rows}</Stack>}
      {customOption && (!tags || selected === customOption.value) && <TextField label={`${customOption.label} answer`} name={name ? `${name}Custom` : undefined} value={customOption.text} onChange={e => customOption.onTextChange(e.target.value)} placeholder={customOption.placeholder} disabled={disabled || selected !== customOption.value} required={required && selected === customOption.value} />}
      <FieldSupport id={groupId} error={error} />
    </Stack>
  </fieldset>
}
