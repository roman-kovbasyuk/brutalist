import type { ReactNode } from 'react'
import { Heading, Inline, Stack, Text, type HeadingRole } from '../atoms'
import './data-display.css'

export type SectionHeadingProps = {
  title: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: HeadingRole
  eyebrow?: string
  description?: ReactNode
  actions?: ReactNode
  id?: string
}

export function SectionHeading({ title, level = 2, variant, eyebrow, description, actions, id }: SectionHeadingProps) {
  return <Inline className="c-section-heading" gap={4}>
    <Stack gap={2} className="c-section-heading__content">
      {eyebrow && <Text as="span" variant="small" tone="secondary" className="c-section-heading__eyebrow">{eyebrow}</Text>}
      <Heading id={id} level={level} variant={variant}>{title}</Heading>
      {description != null && <Text variant="body" tone="secondary" className="c-section-heading__description">{description}</Text>}
    </Stack>
    {actions != null && <div className="c-section-heading__actions">{actions}</div>}
  </Inline>
}
