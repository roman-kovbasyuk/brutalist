import { useId } from 'react'
import { Heading } from '../atoms'
import { Accordion, SectionHeading, type AccordionProps } from '../components'
import './questions-section.css'

/** One topic of questions. A single untitled group is the plain, single-section form. */
export type QuestionGroup = { id: string; title?: string; items: AccordionProps['items'] }
export type QuestionsSectionProps = {
  title: string
  description?: string
  headingLevel?: 1 | 2 | 3
  groups: readonly QuestionGroup[]
}

/** Frequently asked questions: one shared Accordion per supplied group, with a heading when the group has a title. */
export function QuestionsSection({ title, description, headingLevel = 2, groups }: QuestionsSectionProps) {
  const baseId = useId()
  const titleId = `${baseId}-title`
  const groupLevel = (headingLevel + 1) as 2 | 3 | 4
  return <section className="b-questions" aria-labelledby={titleId}><div className="b-questions__body">
    <div className="b-questions__intro">
      <SectionHeading id={titleId} level={headingLevel} variant="h2" title={title} description={description} />
    </div>
    <div className="b-questions__groups">
      {groups.map((group, index) => {
        // Ids come from useId, so repeated caller ids across groups or sections never collide in the DOM.
        const headingId = `${baseId}-group-${index}`
        const label = group.title ?? (groups.length > 1 ? `${title} ${index + 1}` : title)
        return <div key={group.id} className="b-questions__group">
          {group.title && <Heading id={headingId} level={groupLevel} variant="h5">{group.title}</Heading>}
          <Accordion label={label} items={group.items} multiple />
        </div>
      })}
    </div>
  </div></section>
}
