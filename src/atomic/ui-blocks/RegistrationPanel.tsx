import type { ReactNode } from 'react'
import { Alert, Button, Checkbox, Form, Panel, PasswordField, PasswordStrength, TextAction, TextField, type PasswordRequirement, type SubmissionState } from '../components'
import { Icon, Text } from '../atoms'
import './account-panels.css'

export type RegistrationValue = { name: string; email: string; password: string; consent: boolean }
export type RegistrationPanelProps = {
  title: string
  /** Optional line under the title. */
  description?: ReactNode
  value: RegistrationValue
  onChange: (value: RegistrationValue) => void
  onSubmit: (value: RegistrationValue) => void
  state?: SubmissionState
  errors?: Partial<Record<keyof RegistrationValue, string>>
  consentLabel: string
  requirements?: readonly PasswordRequirement[]
  invitation?: { email: string; workspace: string }
  signInHref?: string
}

export function RegistrationPanel({ title, description, value, onChange, onSubmit, state = { status: 'idle' }, errors, consentLabel, requirements, invitation, signInHref }: RegistrationPanelProps) {
  const pending = state.status === 'pending'
  const unmetRequirements = requirements?.some(requirement => !requirement.met) ?? false
  const invitationMismatch = Boolean(invitation && value.email !== invitation.email)
  const update = <K extends keyof RegistrationValue>(key: K, next: RegistrationValue[K]) => onChange({ ...value, [key]: next })
  const emailError = invitationMismatch ? `Use the invited address ${invitation?.email}.` : errors?.email
  return <Panel title={title} description={description} headingLevel={2} className="b-account-panel b-registration-panel">
    <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!pending && !unmetRequirements && !invitationMismatch) onSubmit(value) }}>
      {invitation && <p className="b-account-panel__note"><Icon name="Mail" size="small" /><span>Invitation for <strong>{invitation.email}</strong> to <strong>{invitation.workspace}</strong>.</span></p>}
      <TextField label="Name" name="name" autoComplete="name" required disabled={pending} value={value.name} onChange={event => update('name', event.target.value)} error={errors?.name} />
      <TextField label="Email" type="email" name="email" autoComplete="email" required disabled={pending} readOnly={Boolean(invitation)} value={invitation?.email ?? value.email} onChange={event => update('email', event.target.value)} error={emailError} />
      <div className="b-account-panel__password">
        <PasswordField label="Password" name="password" autoComplete="new-password" required disabled={pending} value={value.password} onChange={event => update('password', event.target.value)} error={errors?.password} />
        {requirements && <PasswordStrength label="Password requirements" requirements={requirements} />}
      </div>
      <Checkbox name="consent" required disabled={pending} checked={value.consent} onChange={event => update('consent', event.target.checked)} label={consentLabel} error={errors?.consent} />
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
      <Button type="submit" variant="primary" busy={pending} disabled={unmetRequirements || invitationMismatch}>Create account</Button>
    </Form>
    {signInHref && <p className="b-account-panel__footer"><Text as="span" tone="secondary">Already have an account?</Text><TextAction href={signInHref}>Sign in</TextAction></p>}
  </Panel>
}
