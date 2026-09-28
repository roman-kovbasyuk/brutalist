import { useId } from 'react'
import { Text } from '../atoms'
import { Alert, Button, Form, SectionHeading, TextAction, TextField, type SubmissionState } from '../components'
import './subscription-section.css'

export type SubscriptionSectionProps = {
  title: string
  description?: string
  headingLevel?: 1 | 2 | 3
  /** compact: the field and button share one row. context: the introduction sits beside the form on wide screens. */
  layout?: 'compact' | 'context'
  /** Controlled email value. It is kept as typed after an error. */
  email: string
  onEmailChange: (value: string) => void
  /** Expresses the intent to subscribe. The application sends the request and reports back through `state`. */
  onSubmit: (email: string) => void
  /** pending blocks a second submission; error and success show the supplied message. */
  state?: SubmissionState
  /** Field-level error for the email address, such as a rejected format. */
  error?: string
  /** What the person agrees to by subscribing. Shown beside the privacy link and read with the submit button. */
  consentText: string
  privacy: { label: string; href: string }
  labels?: { email?: string; submit?: string }
}

/** An email sign-up section. It never sends requests: the application owns delivery, confirmation and consent records. */
export function SubscriptionSection({ title, description, headingLevel = 2, layout = 'compact', email, onEmailChange, onSubmit, state = { status: 'idle' }, error, consentText, privacy, labels }: SubscriptionSectionProps) {
  const baseId = useId()
  const titleId = `${baseId}-title`
  const consentId = `${baseId}-consent`
  const pending = state.status === 'pending'
  return <section className="b-subscription" data-layout={layout} aria-labelledby={titleId}><div className="b-subscription__body">
    <div className="b-subscription__intro">
      <SectionHeading id={titleId} level={headingLevel} variant={layout === 'context' ? 'h2' : 'h3'} title={title} description={description} />
    </div>
    <Form label={title} className="b-subscription__form" aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!pending) onSubmit(email) }}>
      <div className="b-subscription__row">
        <TextField label={labels?.email ?? 'Email'} type="email" name="email" autoComplete="email" inputMode="email" required disabled={pending} value={email} onChange={event => onEmailChange(event.target.value)} error={error} />
        <Button type="submit" variant="primary" busy={pending} aria-describedby={consentId} className="b-subscription__submit">{labels?.submit ?? 'Subscribe'}</Button>
      </div>
      <Text id={consentId} variant="small" tone="secondary" className="b-subscription__consent">{consentText}{' '}<TextAction href={privacy.href}>{privacy.label}</TextAction></Text>
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
    </Form>
  </div></section>
}
