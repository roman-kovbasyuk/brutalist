import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Icon, Text, type IconName } from '../atoms'
import './button.css'

type Content = { iconOnly: true; icon: IconName; 'aria-label': string; children?: never } | { iconOnly?: false; icon?: IconName; children: ReactNode }
export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & Content & {
  ref?: Ref<HTMLButtonElement>
  variant?: 'primary' | 'secondary' | 'danger' | 'quiet'
  size?: 'default' | 'compact' | 'medium' | 'small' | 'xsmall' | 'xxsmall'
  iconPosition?: 'start' | 'end'
  busy?: boolean
  /** Stretch to the width of the container, e.g. the submit action of a narrow form. */
  fullWidth?: boolean
  /** circle: fully round at the same size; icon-only buttons become circles, text buttons become pills. */
  shape?: 'default' | 'circle'
  /** Goes somewhere instead of doing something: renders a link that looks like the button, for destinations such as a checkout or another page. */
  href?: string
  target?: string
  rel?: string
}

export function Button({ children, icon, iconOnly = false, iconPosition = 'start', variant = 'secondary', size = 'default', busy = false, fullWidth = false, shape = 'default', disabled = false, type = 'button', className = '', href, target, rel, ...props }: ButtonProps) {
  const glyph = busy ? <Icon name="loading" className="c-button__spinner" /> : icon ? <Icon name={icon} /> : null
  const data = { 'data-variant': variant, 'data-size': size, 'data-icon-only': iconOnly || undefined, 'data-full-width': fullWidth || undefined, 'data-shape': shape === 'circle' ? 'circle' : undefined }
  const content = <>
    {iconPosition === 'start' && glyph}
    {!iconOnly && <Text as="span" variant="h6" tone="inherit">{children}</Text>}
    {iconPosition === 'end' && glyph}
  </>
  if (href !== undefined) {
    // A disabled link keeps its place and name but goes nowhere.
    const { ref: _ref, form: _form, formAction: _formAction, formEncType: _formEncType, formMethod: _formMethod, formNoValidate: _formNoValidate, formTarget: _formTarget, name: _name, value: _value, ...link } = props
    return <a {...(link as AnchorHTMLAttributes<HTMLAnchorElement>)} href={disabled ? undefined : href} target={target} rel={rel ?? (target === '_blank' ? 'noreferrer' : undefined)} aria-disabled={disabled || undefined} className={`c-button ${className}`.trim()} {...data}>{content}</a>
  }
  return <button {...props} type={type} disabled={disabled || busy} aria-busy={busy || undefined} className={`c-button ${className}`.trim()} {...data}>{content}</button>
}
