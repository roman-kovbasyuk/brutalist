import { useId } from 'react'
import { Container, Heading, Text } from '../atoms'
import { SectionHeading, TextAction } from '../components'
import './process-steps.css'

export type ProcessStep = {
  id: string
  title: string
  description: string
  /** A real destination for more detail about this step. */
  link?: { label: string; href: string }
}

export type ProcessStepsProps = {
  title: string
  description?: string
  /** Semantic level of the section title; step titles use the next level. Defaults to 2. */
  headingLevel?: 1 | 2 | 3
  /** horizontal: steps side by side on wide containers. vertical: steps down a rail beside the heading. Both stack on narrow containers. */
  orientation?: 'horizontal' | 'vertical'
  /** Rendered as an ordered list in the supplied order. */
  steps: readonly ProcessStep[]
}

/** How something happens, as a numbered sequence of steps. Not a progress indicator: no step is current or complete. */
export function ProcessSteps({ title, description, headingLevel = 2, orientation = 'horizontal', steps }: ProcessStepsProps) {
  const titleId = `${useId()}-title`
  const stepLevel = (headingLevel + 1) as 2 | 3 | 4
  return <section className="b-process-steps" data-orientation={orientation} aria-labelledby={titleId}>
    <Container className="b-process-steps__inner">
      <SectionHeading id={titleId} level={headingLevel} variant="h2" title={title} description={description} />
      <ol className="b-process-steps__list" role="list">
        {steps.map((step, index) => <li key={step.id} className="b-process-steps__step">
          <span className="b-process-steps__marker" aria-hidden="true"><Text as="span" variant="h6" tone="inherit">{String(index + 1).padStart(2, '0')}</Text></span>
          <div className="b-process-steps__content">
            <Heading level={stepLevel} variant="h4">{step.title}</Heading>
            <Text tone="secondary">{step.description}</Text>
            {step.link && <TextAction href={step.link.href} className="b-process-steps__link">{step.link.label}</TextAction>}
          </div>
        </li>)}
      </ol>
    </Container>
  </section>
}
