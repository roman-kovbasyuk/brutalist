import { useId } from 'react'
import { Icon, Text } from '../atoms'
import './value-controls.css'

type RatingBaseProps = { label: string; value: number; max?: number; name?: string; disabled?: boolean; className?: string }
export type RatingProps = RatingBaseProps & (
  /** compact: small inline stars announced as one image, for a score beside other copy. */
  | { readOnly: true; onChange?: never; compact?: boolean }
  | { readOnly?: false; onChange: (value: number) => void }
)
export function Rating(props: RatingProps) {
  const { label, value, onChange, max = 5, name, disabled, readOnly = false, className = '' } = props
  const compact = props.readOnly === true && props.compact === true
  const generated = useId(), groupName = name ?? generated, count = Number.isFinite(max) ? Math.max(1, Math.min(10, Math.floor(max))) : 5
  const boundedValue = Number.isFinite(value) ? Math.max(0, Math.min(count, value)) : 0
  const normalizedValue = readOnly ? boundedValue : Math.round(boundedValue)
  if (compact) return <span className={`c-rating c-rating--display ${className}`.trim()} role="img" aria-label={`${label}: ${normalizedValue} out of ${count}`}>
    {Array.from({ length: count }, (_, i) => <span key={i} className="c-rating__star" data-filled={i + 1 <= Math.round(normalizedValue) || undefined}><Icon name="star" size="small" /></span>)}
  </span>
  if (readOnly) return <div className={`c-rating c-rating--readonly ${className}`.trim()} role="group" aria-label={label}>
    <Text as="span" variant="h7">{label}</Text>
    <span className="c-rating__summary">{normalizedValue} of {count}</span>
    <span className="c-rating__options" aria-hidden="true">{Array.from({ length: count }, (_, i) => {
      const fill = normalizedValue >= i + 1 ? 'full' : normalizedValue > i ? 'partial' : 'empty'
      return <span key={i} className="c-rating__display-star" data-fill={fill}><Icon name="star" size="large" /></span>
    })}</span>
  </div>
  return <fieldset className={`c-rating ${className}`.trim()} disabled={disabled}>
    <legend><Text as="span" variant="h7">{label}</Text></legend>
    <div className="c-rating__options">{Array.from({ length: count }, (_, i) => i + 1).map(number => <label key={number} className="c-rating__choice" data-filled={number <= normalizedValue || undefined}>
      <input type="radio" name={groupName} value={number} checked={number === normalizedValue} onChange={() => onChange?.(number)} aria-label={`${number} of ${count}`} />
      <Icon name="star" size="large" />
    </label>)}</div>
  </fieldset>
}
