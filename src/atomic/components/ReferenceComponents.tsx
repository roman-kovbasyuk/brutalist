import { useState, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from 'react'
import { Icon, Inline, Stack, Text, type IconName } from '../atoms'
import { Button, type ButtonProps } from './Button'
import { Avatar, type AvatarProps } from './Avatar'
import type { AnnouncementPolicy } from './Alert'
import './reference-components.css'

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode; attached?: boolean }
export function ButtonGroup({ children, attached = true, className = '', ...props }: ButtonGroupProps) {
  return <div {...props} className={`c-button-group${attached ? ' c-button-group--attached' : ''} ${className}`.trim()} role="group">{children}</div>
}

export type CompactButtonProps = ButtonProps
/** @deprecated Use `<Button size="compact">`. Kept for compatibility; removal needs a minor release. */
export function CompactButton(props: CompactButtonProps) { return <Button {...props as any} size="compact" /> }

export type FancyButtonProps = ButtonProps & { subtitle?: string }
export function FancyButton({ children, subtitle, className = '', ...props }: FancyButtonProps) {
  return <Button {...props as any} className={`c-fancy-button ${className}`.trim()}><span className="c-fancy-button__copy"><Text as="span" variant="h6" tone="inherit">{children}</Text>{subtitle && <Text as="span" variant="small" tone="inherit">{subtitle}</Text>}</span></Button>
}

export type AvatarGroupProps = { label: string; items: readonly Pick<AvatarProps, 'name' | 'src' | 'status' | 'tone'>[]; max?: number; size?: AvatarProps['size']
  /** Applies to members without their own tone; `auto` gives each person a stable color. */
  tone?: AvatarProps['tone'] }
/** Earlier avatars stack above later ones, so each presence dot stays visible. */
export function AvatarGroup({ label, items, max = 5, size = 'medium', tone }: AvatarGroupProps) {
  const visible = items.slice(0, max), remaining = items.length - visible.length
  return <div className="c-avatar-group" data-size={size} role="group" aria-label={label}>
    {visible.map((item, index) => <Avatar key={item.name} {...item} tone={item.tone ?? tone} size={size} style={{ zIndex: visible.length - index + 1 }} />)}
    {remaining > 0 && <span className="c-avatar c-avatar--more" data-size={size} role="img" aria-label={`${remaining} more`}>+{remaining}</span>}
  </div>
}
/** @deprecated Use `<AvatarGroup size="small">`. Kept for compatibility; removal needs a minor release. */
export function AvatarGroupCompact(props: AvatarGroupProps) { return <AvatarGroup {...props} size="small" /> }

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode; tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'warning'; icon?: IconName; /** small: a 20px count for navigation rows and tabs. */ size?: 'default' | 'small' }
export function Badge({ children, tone = 'neutral', icon, size = 'default', className = '', ...props }: BadgeProps) { return <span {...props} className={`c-badge ${className}`.trim()} data-tone={tone} data-size={size === 'small' ? 'small' : undefined}>{icon && <Icon name={icon} size="small" />}<Text as="span" variant="h7" tone="inherit">{children}</Text></span> }

export type BannerProps = HTMLAttributes<HTMLElement> & { title: string; description?: string; tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'warning'; action?: ReactNode; onDismiss?: () => void; announcement?: AnnouncementPolicy; dismissLabel?: string }
export function Banner({ title, description, tone = 'neutral', action, onDismiss, announcement = 'polite', dismissLabel = 'Dismiss', className = '', ...props }: BannerProps) {
  const role = announcement === 'off' ? undefined : announcement === 'assertive' ? 'alert' : 'status'
  return <aside {...props} role={role} aria-live={announcement === 'off' ? undefined : announcement} className={`c-banner ${className}`.trim()} data-tone={tone}><Icon name={tone === 'danger' || tone === 'warning' ? 'alert' : tone === 'success' ? 'check' : 'info'} /><Stack gap={1} className="c-banner__copy"><Text as="span" variant="h6" tone="inherit">{title}</Text>{description && <Text variant="small" tone="inherit">{description}</Text>}</Stack>{action}{onDismiss && <button type="button" className="c-banner__dismiss" aria-label={dismissLabel} onClick={onDismiss}><Icon name="close" size="small" /></button>}</aside>
}

export type KbdProps = HTMLAttributes<HTMLElement> & { children: ReactNode }
export function Kbd({ children, className = '', ...props }: KbdProps) { return <kbd {...props} className={`c-kbd ${className}`.trim()}>{children}</kbd> }

export type NotificationProps = BannerProps & { actions?: ReactNode }
/** @deprecated Use `Banner` with its `action` slot. Kept for compatibility; removal needs a minor release. */
export function Notification({ actions, action, className = '', ...props }: NotificationProps) { return <Banner {...props} className={`c-notification ${className}`.trim()} action={actions ?? action} /> }

export type HintProps = HTMLAttributes<HTMLParagraphElement> & { children: ReactNode; tone?: 'secondary' | 'danger' }
export function Hint({ children, tone = 'secondary', className = '', ...props }: HintProps) { return <Text {...props} variant="small" tone={tone === 'danger' ? 'ink' : 'secondary'} className={`c-hint${tone === 'danger' ? ' c-hint--error' : ''} ${className}`.trim()}>{children}</Text> }
export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode; required?: boolean; hint?: ReactNode }
export function Label({ children, required, hint, className = '', ...props }: LabelProps) { return <label {...props} className={`c-label ${className}`.trim()}><Text as="span" variant="small" tone="inherit">{children}{required && <span aria-hidden="true"> *</span>}</Text>{hint && <Text as="span" variant="small" tone="secondary">{hint}</Text>}</label> }

export type TabMenuVerticalItem = { id: string; label: string; content: ReactNode }
export type TabMenuVerticalProps = { label: string; items: readonly TabMenuVerticalItem[]; value?: string; onChange?: (value: string) => void }
/** @deprecated Use `<Tabs orientation="vertical">`, which has tab semantics. Kept for compatibility; removal needs a minor release. */
export function TabMenuVertical({ label, items, value, onChange }: TabMenuVerticalProps) { const [internal, setInternal] = useState(items[0]?.id ?? ''); const selected = value ?? internal; return <div className="c-tab-menu-vertical"><nav aria-label={label}>{items.map(item => <button type="button" key={item.id} aria-current={selected === item.id ? 'page' : undefined} onClick={() => { setInternal(item.id); onChange?.(item.id) }}>{item.label}</button>)}</nav><div className="c-tab-menu-vertical__content">{items.find(item => item.id === selected)?.content}</div></div> }

export type DotStepperProps = { label: string; steps: readonly string[]; current?: number; onChange?: (index: number) => void; disabled?: boolean; readOnly?: boolean }
export function DotStepper({ label, steps, current = 0, onChange, disabled = false, readOnly = false }: DotStepperProps) {
  const interactive = !readOnly && Boolean(onChange)
  return <nav className="c-dot-stepper" aria-label={label}>{steps.map((step, index) => <span className="c-dot-stepper__item" key={`${step}-${index}`} data-complete={index < current || undefined}>{interactive ? <button type="button" aria-label={step} aria-current={index === current ? 'step' : undefined} data-complete={index < current || undefined} disabled={disabled} onClick={() => onChange?.(index)}><span /></button> : <span role="img" aria-label={step} aria-current={index === current ? 'step' : undefined}><span /></span>}</span>)}</nav>
}
export type VerticalStepperItem = { id: string; label: string; description?: string; complete?: boolean; disabled?: boolean }
export type VerticalStepperProps = { label: string; steps: readonly VerticalStepperItem[]; current?: string; onChange?: (id: string) => void; disabled?: boolean; readOnly?: boolean }
export function VerticalStepper({ label, steps, current, onChange, disabled = false, readOnly = false }: VerticalStepperProps) {
  const interactive = !readOnly && Boolean(onChange)
  return <nav className="c-vertical-stepper" aria-label={label}><ol>{steps.map((step, index) => {
    const content = <><span className="c-vertical-stepper__marker">{step.complete ? <Icon name="check" size="small" /> : index + 1}</span><Stack gap={1}><Text as="span" variant="h6">{step.label}</Text>{step.description && <Text as="span" variant="small" tone="secondary">{step.description}</Text>}</Stack></>
    return <li key={step.id} data-current={step.id === current || undefined} data-complete={step.complete || undefined} aria-current={step.id === current ? 'step' : undefined}>{interactive ? <button type="button" disabled={disabled || step.disabled} onClick={() => onChange?.(step.id)}>{content}</button> : <div className="c-vertical-stepper__item">{content}</div>}</li>
  })}</ol></nav>
}
