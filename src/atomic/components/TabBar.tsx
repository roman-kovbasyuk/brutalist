import { Icon, Text, type IconName } from '../atoms'
import './tab-bar.css'

export type TabBarItem = { id: string; label: string; icon: IconName; href?: string; /** Unread count shown on the icon. */ count?: number }
export type TabBarProps = { label: string; items: readonly TabBarItem[]; value: string; onChange?: (id: string) => void; className?: string }

/** Bottom navigation for a phone app: three to five top-level destinations, always labelled. */
export function TabBar({ label, items, value, onChange, className = '' }: TabBarProps) {
  return <nav className={`c-tab-bar ${className}`.trim()} aria-label={label}>
    <ul style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map(item => {
        const current = item.id === value
        const content = <>
          <span className="c-tab-bar__icon"><Icon name={item.icon} />{item.count ? <span className="c-tab-bar__count" aria-hidden="true">{item.count > 99 ? '99+' : item.count}</span> : null}</span>
          <Text as="span" variant="small" tone="inherit">{item.label}</Text>
          {item.count ? <span className="c-tab-bar__hidden">, {item.count} new</span> : null}
        </>
        return <li key={item.id}>{item.href
          ? <a href={item.href} aria-current={current ? 'page' : undefined} onClick={onChange ? event => { event.preventDefault(); onChange(item.id) } : undefined}>{content}</a>
          : <button type="button" aria-current={current ? 'page' : undefined} onClick={() => onChange?.(item.id)}>{content}</button>}</li>
      })}
    </ul>
  </nav>
}
