import { useId, type ReactNode } from 'react'
import { Container, Heading, Text } from '../atoms'
import { SectionHeading, TextAction } from '../components'
import './capability-grid.css'

export type CapabilityItem = {
  id: string
  title: string
  description: string
  /** Illustration read after the item's copy. */
  media?: ReactNode
  /** In the mixed layout, span two columns when the container has room. */
  wide?: boolean
  link?: { label: string; href: string }
}

export type CapabilityGridProps = {
  title: string
  description?: string
  /** Semantic level of the section title; item titles use the next level. Defaults to 2. */
  headingLevel?: 1 | 2 | 3
  /** list: equal ruled columns. mixed: bordered tiles where wide items span two columns. */
  layout?: 'list' | 'mixed'
  items: readonly CapabilityItem[]
}

/** A set of concrete capabilities, each with its own title, explanation and optional link or media. */
export function CapabilityGrid({ title, description, headingLevel = 2, layout = 'list', items }: CapabilityGridProps) {
  const titleId = `${useId()}-title`
  const itemLevel = (headingLevel + 1) as 2 | 3 | 4
  return <section className="b-capability-grid" data-layout={layout} aria-labelledby={titleId}>
    <Container className="b-capability-grid__inner">
      <SectionHeading id={titleId} level={headingLevel} variant="h2" title={title} description={description} />
      <ul className="b-capability-grid__items" role="list">
        {items.map(item => <li key={item.id} className="b-capability-grid__item" data-wide={item.wide || undefined} data-has-media={item.media != null || undefined}>
          <div className="b-capability-grid__copy">
            <Heading level={itemLevel} variant="h4">{item.title}</Heading>
            <Text tone="secondary">{item.description}</Text>
            {item.link && <TextAction href={item.link.href} className="b-capability-grid__link">{item.link.label}</TextAction>}
          </div>
          {item.media != null && <div className="b-capability-grid__media">{item.media}</div>}
        </li>)}
      </ul>
    </Container>
  </section>
}
