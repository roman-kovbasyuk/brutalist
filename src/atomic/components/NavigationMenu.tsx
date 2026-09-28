import { NavigationMenu as R } from 'radix-ui'
import { Icon, Text } from '../atoms'
import './navigation-menu.css'

export type NavigationMenuChild = { id: string; label: string; href: string; description?: string }
export type NavigationMenuItem = { id: string; label: string; href?: string; description?: string; children?: readonly NavigationMenuChild[]; disabled?: boolean; current?: boolean }
export type NavigationMenuProps = { label: string; items: readonly NavigationMenuItem[]; className?: string; onNavigate?: (id: string) => void }

export function NavigationMenu({ label, items, className = '', onNavigate }: NavigationMenuProps) {
  return <R.Root aria-label={label} className={`c-navigation-menu ${className}`.trim()}>
    <R.List className="c-navigation-menu__list">
      {items.map(item => <R.Item key={item.id} value={item.id}>
        {item.children?.length ? <>
          {item.href && !item.disabled && <R.Link asChild active={item.current}><a className="c-navigation-menu__trigger c-navigation-menu__parent-link" aria-current={item.current ? 'page' : undefined} href={item.href} onClick={() => onNavigate?.(item.id)}><Text as="span" variant="small" tone="inherit">{item.label}</Text></a></R.Link>}
          <R.Trigger className={`c-navigation-menu__trigger${item.href && !item.disabled ? ' c-navigation-menu__trigger--disclosure' : ''}`} aria-label={item.href && !item.disabled ? `Open ${item.label} menu` : undefined} disabled={item.disabled}>
            {(!item.href || item.disabled) && <Text as="span" variant="small" tone="inherit">{item.label}</Text>}
            <Icon name="chevronDown" size="small" />
          </R.Trigger>
          <R.Content className="c-navigation-menu__panel">
            {item.children.map(child => <R.Link key={child.id} asChild><a className="c-navigation-menu__link" href={item.disabled ? undefined : child.href} aria-disabled={item.disabled || undefined} tabIndex={item.disabled ? -1 : undefined} onClick={event => { if (item.disabled) event.preventDefault(); else onNavigate?.(child.id) }}>
              <Text as="span" variant="small" tone="inherit">{child.label}</Text>{child.description && <Text as="span" variant="small" tone="secondary">{child.description}</Text>}
            </a></R.Link>)}
          </R.Content>
        </> : <R.Link asChild active={item.current}><a className="c-navigation-menu__trigger" aria-current={item.current ? 'page' : undefined} href={item.disabled ? undefined : item.href} aria-disabled={item.disabled || undefined} tabIndex={item.disabled ? -1 : undefined} onClick={event => { if (item.disabled) event.preventDefault(); else onNavigate?.(item.id) }}><Text as="span" variant="small" tone="inherit">{item.label}</Text></a></R.Link>}
      </R.Item>)}
    </R.List>
    <R.Viewport className="c-navigation-menu__viewport" />
  </R.Root>
}
