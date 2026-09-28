import type { ReactNode } from 'react'
import { Icon, Stack, Text, type IconName } from '../atoms'
import './data-display.css'

export type TimelineItem = {
  id: string
  title: string
  dateTime: string
  dateLabel: string
  description?: ReactNode
  action?: ReactNode
  icon?: IconName
}

export type TimelineProps = { label: string; items: readonly TimelineItem[] }

export function Timeline({ label, items }: TimelineProps) {
  return <ol className="c-timeline" aria-label={label}>
    {items.map(item => <li className="c-timeline__item" key={item.id}>
      <span className="c-timeline__marker" aria-hidden="true">{item.icon ? <Icon name={item.icon} size="small" /> : <span />}</span>
      <Stack gap={2} className="c-timeline__content">
        <div className="c-timeline__heading">
          <Text as="span" variant="h6" className="c-timeline__title">{item.title}</Text>
          <time dateTime={item.dateTime}><Text as="span" variant="small" tone="secondary">{item.dateLabel}</Text></time>
        </div>
        {item.description != null && <Text as="div" variant="body">{item.description}</Text>}
        {item.action != null && <div className="c-timeline__action">{item.action}</div>}
      </Stack>
    </li>)}
  </ol>
}
