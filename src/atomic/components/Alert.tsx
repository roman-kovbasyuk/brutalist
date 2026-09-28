import type { ReactNode } from 'react'
import { Heading, Icon, Inline, Stack, Surface, Text } from '../atoms'
import './alert.css'

export type AlertTone = 'neutral' | 'success' | 'danger' | 'warning' | 'info' | 'feature'
export type AlertVariant = 'filled' | 'light' | 'lighter' | 'stroke'
export type AlertSize = 'small' | 'large'
export type AnnouncementPolicy = 'off' | 'polite' | 'assertive'
export type AlertProps = { title: string; description?: ReactNode; tone?: AlertTone; variant?: AlertVariant; size?: AlertSize; showIcon?: boolean; announce?: boolean; announcement?: AnnouncementPolicy; className?: string; action?: ReactNode }

const toneIcon = (tone: AlertTone) => tone === 'success' ? 'check' : tone === 'danger' || tone === 'warning' ? 'TriangleAlert' : tone === 'feature' ? 'star' : tone === 'info' ? 'info' : 'info'

export function Alert({ title, description, tone = 'neutral', variant = 'stroke', size = 'small', showIcon = true, announce = false, announcement, className = '', action }: AlertProps) {
  const live = announcement ?? (announce ? tone === 'danger' || tone === 'warning' ? 'assertive' : 'polite' : 'off')
  return <Surface padding={size === 'large' ? 6 : 4} radius={size === 'large' ? 'large' : 'small'} className={`c-alert ${className}`.trim()} data-tone={tone} data-variant={variant} data-size={size} role={live === 'off' ? undefined : live === 'assertive' ? 'alert' : 'status'} aria-live={live === 'off' ? undefined : live}>
    <Inline gap={3}>{showIcon && <span className="c-alert__icon"><Icon name={toneIcon(tone)} size={tone === 'danger' ? 'medium' : 'small'} /></span>}<Stack gap={1} className="c-alert__copy"><Heading level={3} variant={size === 'large' ? 'h5' : 'h6'}>{title}</Heading>{description && <Text variant="small" tone="secondary">{description}</Text>}</Stack>{action}</Inline>
  </Surface>
}
