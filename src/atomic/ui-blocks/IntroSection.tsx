import { useId, type ReactNode } from 'react'
import { Container, Inline } from '../atoms'
import { SectionHeading } from '../components'
import './intro-section.css'

export type IntroSectionProps = {
  title: string
  eyebrow?: string
  description?: string
  /** Caller-owned buttons or links; they wrap below the description. */
  actions?: ReactNode
  /** Illustration or supporting composition; always read after the actions. */
  media?: ReactNode
  /** text: one column with media beneath. split: copy beside media on wide containers. */
  layout?: 'text' | 'split'
  /** Semantic level of the title; defaults to 1, the page heading. */
  headingLevel?: 1 | 2 | 3
}

/** The opening section of a page: title, description, actions and optional media, in that reading order. */
export function IntroSection({ title, eyebrow, description, actions, media, layout = 'text', headingLevel = 1 }: IntroSectionProps) {
  const titleId = `${useId()}-title`
  return <section className="b-intro-section" data-layout={layout} data-has-media={media != null || undefined} aria-labelledby={titleId}>
    <Container className="b-intro-section__inner">
      <div className="b-intro-section__copy">
        <SectionHeading id={titleId} level={headingLevel} variant="h1" title={title} eyebrow={eyebrow} description={description} />
        {actions != null && <Inline gap={3} className="b-intro-section__actions">{actions}</Inline>}
      </div>
      {media != null && <div className="b-intro-section__media">{media}</div>}
    </Container>
  </section>
}
