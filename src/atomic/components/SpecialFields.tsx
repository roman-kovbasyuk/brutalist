import { useState } from 'react'
import { Icon, Stack } from '../atoms'
import { TextField, type TextFieldProps } from './TextField'
import { Button } from './Button'
export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'label' | 'trailing'> & { label: string }
/** The visibility toggle keeps one accessible name and reports its state with aria-pressed. */
export function PasswordField({ label, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const toggleLabel = `Show ${label.charAt(0).toLowerCase()}${label.slice(1)}`
  return <Stack gap={2} className="c-password-field"><TextField {...props} label={label} type={visible ? 'text' : 'password'} trailing={<Button iconOnly size="compact" variant="quiet" icon={visible ? 'EyeOff' : 'eye'} aria-label={toggleLabel} aria-pressed={visible} disabled={props.disabled} onClick={() => setVisible(value => !value)} />} /></Stack>
}
export type SearchFieldProps = Omit<TextFieldProps, 'type' | 'label' | 'value' | 'onChange' | 'defaultValue'> & { label: string; value: string; onChange: (value: string) => void }
export function SearchField({ label, value, onChange, ...props }: SearchFieldProps) {
  const clear = Boolean(value) && !props.disabled
  return <Stack gap={2} className="c-search-field"><TextField {...props} type="search" label={label} value={value} onChange={event => onChange(event.target.value)} trailing={clear ? <Button iconOnly size="compact" variant="quiet" icon="close" aria-label={`Clear ${label}`} onClick={() => onChange('')} /> : <Icon name="search" size="small" />} /></Stack>
}
export { DatePicker, type DatePickerProps } from './DatePicker'
