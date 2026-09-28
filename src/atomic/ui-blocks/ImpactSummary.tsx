import { useId } from 'react'
import { Container } from '../atoms'
import { SectionHeading, Stat, type StatProps } from '../components'
import './impact-summary.css'

export type ImpactMetric = StatProps & { id: string }

export type ImpactSummaryProps = {
  title: string
  description?: string
  /** Semantic level of the title; defaults to 2. */
  headingLevel?: 1 | 2 | 3
  /** Each metric renders as a Stat with its own label, period, unit, source and unavailable state. */
  metrics: readonly ImpactMetric[]
  /** row: the heading above one row of equal tiles. editorial: the heading beside the figures, led by the first metric. */
  layout?: 'row' | 'editorial'
}

/** A small set of measured outcomes, each shown with the context needed to read it. */
export function ImpactSummary({ title, description, headingLevel = 2, metrics, layout = 'row' }: ImpactSummaryProps) {
  const titleId = `${useId()}-title`
  return <section className="b-impact-summary" data-layout={layout} aria-labelledby={titleId}>
    <Container className="b-impact-summary__inner">
      <SectionHeading id={titleId} level={headingLevel} variant="h2" title={title} description={description} />
      <ul className="b-impact-summary__metrics" role="list">
        {metrics.map(({ id, ...metric }) => <li key={id} className="b-impact-summary__metric"><Stat {...metric} /></li>)}
      </ul>
    </Container>
  </section>
}
