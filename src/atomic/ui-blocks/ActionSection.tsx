import { useId, type ReactNode } from 'react'
import { Container, Inline } from '../atoms'
import { SectionHeading } from '../components'
import './action-section.css'

export type ActionSectionProps = {
  title: string
  description?: string
  /** Caller-owned buttons or links that complete the section. */
  actions: ReactNode
  /** inline: a bordered callout within the page. full: a full-width closing section. */
  layout?: 'inline' | 'full'
  /** Semantic level of the title; defaults to 2. */
  headingLevel?: 1 | 2 | 3
}

/** A short prompt that leads to one or two next steps, as an inline callout or a closing section. */
export function ActionSection({ title, description, actions, layout = 'inline', headingLevel = 2 }: ActionSectionProps) {
  const titleId = `${useId()}-title`
  return <section className="b-action-section" data-layout={layout} aria-labelledby={titleId}>
    <Container className="b-action-section__inner">
      <SectionHeading id={titleId} level={headingLevel} variant={layout === 'full' ? 'h1' : 'h3'} title={title} description={description} />
      <Inline gap={3} className="b-action-section__actions">{actions}</Inline>
    </Container>
  </section>
}
