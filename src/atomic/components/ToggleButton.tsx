import { Toggle as R } from 'radix-ui'
import { Button, type ButtonProps } from './Button'
import './toggle-button.css'

export type ToggleButtonProps = ButtonProps & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
}

export function ToggleButton({ pressed, defaultPressed, onPressedChange, className = '', ...props }: ToggleButtonProps) {
  return <R.Root asChild pressed={pressed} defaultPressed={defaultPressed} onPressedChange={onPressedChange}>
    <Button {...props} className={`c-toggle-button ${className}`.trim()} />
  </R.Root>
}
