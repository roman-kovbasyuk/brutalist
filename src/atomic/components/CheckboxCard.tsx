import type { CheckboxProps } from './Checkbox'
import { Checkbox } from './Checkbox'
import './choice-cards.css'

export type CheckboxCardProps = CheckboxProps & { description?: CheckboxProps['description'] }

export function CheckboxCard({ className = '', ...props }: CheckboxCardProps) {
  return <Checkbox {...props} variant="card" className={`c-checkbox-card ${className}`.trim()} />
}
