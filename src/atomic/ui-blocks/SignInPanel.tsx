import type { ReactNode } from 'react'
import { Alert, Button, Form, Panel, PasswordField, TextAction, TextField, type SubmissionState } from '../components'
import { Text } from '../atoms'
import './account-panels.css'

export type SignInValue = { email: string; password: string }
export type SignInPanelProps = {
  title: string
  /** Optional line under the title, such as which account to use. */
  description?: ReactNode
  mode?: 'password' | 'email-link'
  value: SignInValue
  onChange: (value: SignInValue) => void
  onSubmit: (value: SignInValue) => void
  state?: SubmissionState
  errors?: Partial<Record<keyof SignInValue, string>>
  providers?: readonly { id: string; label: string; onSelect: () => void; disabled?: boolean }[]
  recoveryHref?: string
  registerHref?: string
}

export function SignInPanel({ title, description, mode = 'password', value, onChange, onSubmit, state = { status: 'idle' }, errors, providers, recoveryHref, registerHref }: SignInPanelProps) {
  const pending = state.status === 'pending'
  const update = (key: keyof SignInValue, next: string) => onChange({ ...value, [key]: next })
  return <Panel title={title} description={description} headingLevel={2} className="b-account-panel b-sign-in-panel">
    <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!pending) onSubmit(mode === 'email-link' ? { email: value.email, password: '' } : value) }}>
      <TextField label="Email" type="email" name="email" autoComplete="email" required disabled={pending} value={value.email} onChange={event => update('email', event.target.value)} error={errors?.email} />
      {mode === 'password' && <div className="b-account-panel__password">
        <PasswordField label="Password" name="password" autoComplete="current-password" required disabled={pending} value={value.password} onChange={event => update('password', event.target.value)} error={errors?.password} />
        {recoveryHref && <TextAction href={recoveryHref} className="b-account-panel__recovery">Forgot password?</TextAction>}
      </div>}
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
      <Button type="submit" variant="primary" busy={pending}>{mode === 'email-link' ? 'Send sign-in link' : 'Sign in'}</Button>
      {!!providers?.length && <div className="b-account-panel__providers" role="group" aria-label="Other sign-in options">
        <Text variant="small" tone="secondary" className="b-account-panel__divider">or</Text>
        {providers.map(provider => <Button key={provider.id} disabled={provider.disabled || pending} onClick={provider.onSelect}>{provider.label}</Button>)}
      </div>}
    </Form>
    {registerHref && <p className="b-account-panel__footer"><Text as="span" tone="secondary">New here?</Text><TextAction href={registerHref}>Create an account</TextAction></p>}
  </Panel>
}
