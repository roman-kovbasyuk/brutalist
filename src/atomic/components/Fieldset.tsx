import { useId, type FieldsetHTMLAttributes, type ReactNode } from 'react'
import { Text } from '../atoms'
import { FieldSupport, hasContent, supportIds } from './FieldSupport'
import './choice-cards.css'

export type FieldsetProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  legend: ReactNode
  instructions?: ReactNode
  error?: ReactNode
}

export function Fieldset({ legend, instructions, error, id, className = '', children, 'aria-describedby': external, 'aria-invalid': invalid, ...props }: FieldsetProps) {
  const generated = useId()
  const fieldId = id ?? generated
  return <fieldset {...props} id={fieldId} className={`c-fieldset ${className}`.trim()} aria-describedby={supportIds(fieldId, instructions, error, external)} aria-invalid={hasContent(error) || invalid || undefined}>
    <legend><Text as="span" variant="h7">{legend}</Text></legend>
    {hasContent(instructions) && <FieldSupport id={fieldId} instructions={instructions} />}
    {children}
    {hasContent(error) && <FieldSupport id={fieldId} error={error} />}
  </fieldset>
}
