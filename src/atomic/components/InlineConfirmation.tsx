import { useEffect, useId, useRef, useState } from 'react'
import { Icon, Text, type IconName } from '../atoms'
import { Button } from './Button'
import './inline-confirmation.css'

export type InlineConfirmationProps = {
  label: string
  question: string
  onConfirm: () => void | Promise<void>
  disabled?: boolean
  description?: string
  /** Names the action on the confirming button. Defaults to `label`, so the decision reads as the same action. */
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` for destructive actions; `neutral` for consequential but reversible ones. */
  tone?: 'danger' | 'neutral'
  /** Optional icon for the trigger, such as `delete`. */
  icon?: IconName
}

/** The trigger turns into the question in place; Cancel takes focus so the safe choice is the default. */
export function InlineConfirmation({ label, question, onConfirm, disabled, description, confirmLabel = label, cancelLabel = 'Cancel', tone = 'danger', icon }: InlineConfirmationProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const trigger = useRef<HTMLButtonElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const restore = useRef(false)
  useEffect(() => {
    if (open) cancel.current?.focus()
    else if (restore.current) { trigger.current?.focus(); restore.current = false }
  }, [open])
  const close = () => { restore.current = true; setOpen(false); setError('') }
  const confirm = async () => {
    setBusy(true)
    setError('')
    try { await onConfirm(); close() } catch (reason) { setError(reason instanceof Error ? reason.message : 'That didn’t work. Try again.') } finally { setBusy(false) }
  }

  if (!open) return <div className="c-inline-confirmation">
    <Button ref={trigger} icon={icon} disabled={disabled} onClick={() => setOpen(true)}>{label}</Button>
  </div>

  return <div className="c-inline-confirmation" data-open="">
    <div
      className="c-inline-confirmation__panel"
      role="group"
      aria-labelledby={`${id}-question`}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-busy={busy || undefined}
      data-tone={tone}
      onKeyDown={event => { if (event.key === 'Escape' && !busy) { event.preventDefault(); close() } }}
    >
      <Icon name={tone === 'danger' ? 'alert' : 'info'} size="small" className="c-inline-confirmation__icon" />
      <span className="c-inline-confirmation__copy">
        <Text id={`${id}-question`} as="span" variant="h7">{question}</Text>
        {description && <Text id={`${id}-description`} as="span" variant="small" tone="secondary">{description}</Text>}
      </span>
      <span className="c-inline-confirmation__actions">
        <Button ref={cancel} size="xsmall" disabled={busy} onClick={close}>{cancelLabel}</Button>
        <Button size="xsmall" variant={tone === 'danger' ? 'danger' : 'primary'} busy={busy} onClick={confirm}>{confirmLabel}</Button>
      </span>
    </div>
    {error && <div role="alert" className="c-inline-confirmation__error"><Icon name="close" size="small" /><Text as="span" variant="small" tone="inherit">{error}</Text></div>}
  </div>
}
