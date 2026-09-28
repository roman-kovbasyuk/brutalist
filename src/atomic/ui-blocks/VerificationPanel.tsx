import { Alert, Button, DigitInput, Form, Panel, type SubmissionState } from '../components'
import { Text } from '../atoms'
import './account-panels.css'

export type VerificationPanelProps = {
  title: string
  destination: string
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  length?: number
  name?: string
  state?: SubmissionState
  error?: string
  onResend?: () => void
  resendDisabled?: boolean
  resendMessage?: string
}

export function VerificationPanel({ title, destination, value, onChange, onSubmit, length = 6, name, state = { status: 'idle' }, error, onResend, resendDisabled, resendMessage }: VerificationPanelProps) {
  const pending = state.status === 'pending'
  const size = Math.max(1, Math.floor(length))
  const complete = value.replace(/\D/g, '').length === size
  return <Panel title={title} description={<>Enter the code sent to <strong className="b-account-panel__destination">{destination}</strong>.</>} headingLevel={2} className="b-account-panel b-verification-panel">
    <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!pending && complete) onSubmit(value.replace(/\D/g, '').slice(0, size)) }}>
      <DigitInput label="Verification code" length={size} name={name} value={value} onChange={onChange} required disabled={pending} error={error} />
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
      <Button type="submit" variant="primary" busy={pending} disabled={!complete}>Verify code</Button>
    </Form>
    {(resendMessage || onResend) && <div className="b-account-panel__footer">
      {resendMessage ? <Text variant="small" tone="secondary" role="status">{resendMessage}</Text> : <Text as="span" tone="secondary">Didn’t get it?</Text>}
      {onResend && <Button size="compact" disabled={Boolean(resendDisabled) || pending} onClick={onResend}>Resend code</Button>}
    </div>}
  </Panel>
}
