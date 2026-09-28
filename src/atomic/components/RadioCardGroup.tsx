import type { ReactNode } from 'react'
import type { RadioGroupProps, RadioOption } from './RadioGroup'
import { RadioGroup } from './RadioGroup'
import './choice-cards.css'

export type RadioCardOption = RadioOption & { description?: ReactNode }
export type RadioCardGroupProps = Omit<RadioGroupProps, 'options' | 'variant'> & {
  options: readonly RadioCardOption[]
}

export function RadioCardGroup({ className = '', options, ...props }: RadioCardGroupProps) {
  return <RadioGroup {...props} options={options} variant="cards" className={`c-radio-card-group ${className}`.trim()} />
}
