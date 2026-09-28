import { Icon, Stack, Text } from '../atoms'
import './data-display.css'

export type PasswordRequirement = { id: string; label: string; met: boolean }
export type PasswordStrengthProps = { label: string; requirements: readonly PasswordRequirement[] }

export function PasswordStrength({ label, requirements }: PasswordStrengthProps) {
  return <Stack gap={2} className="c-password-strength" role="group" aria-label={label}>
    <ul className="c-password-strength__list">
      {requirements.map(requirement => <li key={requirement.id} className="c-password-strength__item" data-met={requirement.met || undefined}>
        <Icon name={requirement.met ? 'CircleCheck' : 'Circle'} size="small" />
        <Text as="span" variant="small" tone="inherit"><span className="c-password-strength__state">{requirement.met ? 'Met' : 'Not met'}: </span>{requirement.label}</Text>
      </li>)}
    </ul>
  </Stack>
}
