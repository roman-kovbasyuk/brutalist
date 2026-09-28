import type { ReactNode } from 'react'
import { Text } from '../atoms'
import './data-display.css'

export type DescriptionListProps = {
  label: string
  items: readonly { id: string; term: ReactNode; description: ReactNode }[]
  layout?: 'stacked' | 'columns'
}

export function DescriptionList({ label, items, layout = 'stacked' }: DescriptionListProps) {
  return <div role="group" aria-label={label}>
    <dl className="c-description-list" data-layout={layout}>
      {items.map(item => <div key={item.id} className="c-description-list__item">
        <dt><Text as="span" variant="small" tone="secondary">{item.term}</Text></dt>
        <dd><Text as="span" variant="body">{item.description}</Text></dd>
      </div>)}
    </dl>
  </div>
}
