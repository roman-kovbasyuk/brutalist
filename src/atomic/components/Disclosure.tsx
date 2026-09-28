import { useId, useState, type ReactNode } from 'react'
import { Button } from './Button'
import './disclosure.css'

export type DisclosureProps = {
  label: string
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
  /** `quiet` draws a borderless, full-width row with a chevron, for grouped lists and navigation. */
  variant?: 'default' | 'quiet'
}

export function Disclosure({ label, children, open, defaultOpen = false, onOpenChange, disabled = false, className = '', variant = 'default' }: DisclosureProps) {
  const regionId = useId()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const expanded = open ?? internalOpen
  function toggle() {
    if (disabled) return
    const next = !expanded
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }
  const quiet = variant === 'quiet'
  return <div className={`c-disclosure${quiet ? ' c-disclosure--quiet' : ''} ${className}`.trim()}>
    <Button aria-controls={regionId} aria-expanded={expanded} disabled={disabled} onClick={toggle} variant={quiet ? 'quiet' : 'secondary'} icon={quiet ? 'chevronDown' : undefined} iconPosition="end">{label}</Button>
    <div id={regionId} role="region" aria-label={label} hidden={!expanded} className="c-disclosure__content">{children}</div>
  </div>
}
