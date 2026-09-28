import type { ReactNode } from 'react'
import { Alert, Button, Form, Panel, TextAction, TextField, type SubmissionState } from '../components'
import { Text } from '../atoms'
import './account-panels.css'

export type RecoveryPanelProps = {
  title: string
  /** Optional line under the title; keep it neutral about whether an account exists. */
  description?: ReactNode
  email: string
  onEmailChange: (email: string) => void
  onSubmit: (email: string) => void
  state?: SubmissionState
  emailError?: string
  signInHref?: string
  retryHref?: string
  onRetry?: () => void
}

export function RecoveryPanel({ title, description, email, onEmailChange, onSubmit, state = { status: 'idle' }, emailError, signInHref, retryHref, onRetry }: RecoveryPanelProps) {
  const pending = state.status === 'pending'
  const submitted = state.status === 'success'
  const footer = signInHref && <p className="b-account-panel__footer"><Text as="span" tone="secondary">Remembered it?</Text><TextAction href={signInHref}>Return to sign in</TextAction></p>
  return <Panel title={title} description={description} headingLevel={2} className="b-account-panel b-recovery-panel">
    {submitted
      ? <div className="b-account-panel__result">
        <Alert title={state.message} tone="success" announcement="polite" />
        {retryHref ? <TextAction href={retryHref} onClick={onRetry}>Request another link</TextAction> : onRetry && <Button onClick={onRetry}>Request another link</Button>}
      </div>
      : <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!pending) onSubmit(email) }}>
        <TextField label="Email" type="email" name="email" autoComplete="email" required disabled={pending} value={email} onChange={event => onEmailChange(event.target.value)} error={emailError} />
        {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
        <Button type="submit" variant="primary" busy={pending}>Send recovery link</Button>
      </Form>}
    {footer}
  </Panel>
}
