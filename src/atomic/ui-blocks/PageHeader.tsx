import type { ReactNode } from 'react'
import { Heading, Stack, Text } from '../atoms'
import { Breadcrumbs, type BreadcrumbItem } from '../components'
import './page-header.css'

export type PageHeaderProps = { title: string; /** Semantic level of the title; defaults to 1, the page heading. */ headingLevel?: 1 | 2 | 3; description?: ReactNode; breadcrumbs?: readonly BreadcrumbItem[]; actions?: ReactNode; meta?: ReactNode; /** Shown beside the title and description, such as an avatar or logo. */ leading?: ReactNode; className?: string }

/** The heading row of an application page. Actions wrap below the title on narrow screens. */
export function PageHeader({ title, headingLevel = 1, description, breadcrumbs, actions, meta, leading, className = '' }: PageHeaderProps) {
  return <header className={`b-page-header ${className}`.trim()}>
    {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
    <div className="b-page-header__row">
      <div className="b-page-header__identity">
        {leading && <div className="b-page-header__leading">{leading}</div>}
        <Stack gap={2} className="b-page-header__copy">
          <Heading level={headingLevel} variant="h2">{title}</Heading>
          {description != null && <Text tone="secondary">{description}</Text>}
          {meta}
        </Stack>
      </div>
      {actions && <div className="b-page-header__actions">{actions}</div>}
    </div>
  </header>
}
