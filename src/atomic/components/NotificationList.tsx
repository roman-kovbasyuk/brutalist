import { useId, type ReactNode } from 'react'
import { Heading, Icon, Text, type IconName } from '../atoms'
import { Avatar } from './Avatar'
import { Button } from './Button'
import './notification-list.css'

export type NotificationItem = {
  id: string
  /** The message. Keep it to one sentence that names what happened. */
  title: ReactNode
  /** When it happened, e.g. “2 hours ago”. */
  time: string
  /** Optional second detail, shown before the time. */
  detail?: string
  unread?: boolean
  /** Leading visual: a person (initials avatar) or an icon for system events. */
  avatar?: string
  icon?: IconName
  /** Makes the whole row a link to the thing it is about. */
  href?: string
}
export type NotificationListProps = {
  items: readonly NotificationItem[]
  title?: string
  /** Shows “Mark all read” while any item is unread. */
  onMarkAllRead?: () => void
  emptyMessage?: string
  headingLevel?: 2 | 3
  className?: string
}

/** A short feed of recent events, for a popover or a panel. Unread rows are bold and carry a dot, so state never rests on colour. */
export function NotificationList({ items, title = 'Notifications', onMarkAllRead, emptyMessage = 'You are all caught up.', headingLevel = 2, className = '' }: NotificationListProps) {
  const titleId = useId()
  const unread = items.filter(item => item.unread).length
  return <section className={`c-notification-list ${className}`.trim()} aria-labelledby={titleId}>
    <header className="c-notification-list__head">
      <Heading id={titleId} level={headingLevel} variant="h6">{title}{unread > 0 && <span className="c-notification-list__count"><span aria-hidden="true">{unread}</span><span className="c-notification-list__hidden">, {unread} unread</span></span>}</Heading>
      {onMarkAllRead && unread > 0 && <Button size="xxsmall" variant="quiet" icon="CheckCheck" onClick={onMarkAllRead}>Mark all read</Button>}
    </header>
    {items.length === 0
      ? <Text variant="small" tone="secondary" className="c-notification-list__empty">{emptyMessage}</Text>
      : <ul className="c-notification-list__items">{items.map(item => {
        const body = <>
          <span className="c-notification-list__lead" aria-hidden="true">{item.avatar ? <Avatar name={item.avatar} size="small" /> : <span className="c-notification-list__icon"><Icon name={item.icon ?? 'Bell'} size="small" /></span>}</span>
          <span className="c-notification-list__copy">
            <Text as="span" variant="small" tone="inherit" className="c-notification-list__title">{item.unread && <span className="c-notification-list__hidden">Unread: </span>}{item.title}</Text>
            <Text as="span" variant="small" tone="secondary">{item.detail ? `${item.detail} · ${item.time}` : item.time}</Text>
          </span>
          {item.unread && <span className="c-notification-list__dot" aria-hidden="true" />}
        </>
        return <li key={item.id} data-unread={item.unread || undefined}>{item.href ? <a className="c-notification-list__row" href={item.href}>{body}</a> : <div className="c-notification-list__row">{body}</div>}</li>
      })}</ul>}
  </section>
}
