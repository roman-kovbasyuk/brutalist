import { useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Container, Divider, Stack, Text } from '../atoms'
import { Button, Drawer, NavigationList, NavigationMenu, type NavigationItem, type NavigationMenuProps } from '../components'
import './site-header.css'

export type SiteHeaderProps = {
  brand: { label: string; href: string }
  navigation: NavigationMenuProps['items']
  /** Rendered once: in the bar on wide layouts, inside the menu drawer on narrow ones. */
  actions?: ReactNode
  /** Accessible name of the navigation landmark; defaults to “Main”. */
  label?: string
  labels?: { openMenu?: string; closeMenu?: string; mobileTitle?: string }
}

/**
 * A website header: brand link, primary destinations and actions. Wide containers show a NavigationMenu;
 * narrow ones collapse the destinations and actions into a Drawer opened from a menu button.
 */
export function SiteHeader({ brand, navigation, actions, label = 'Main', labels }: SiteHeaderProps) {
  const { openMenu = 'Open menu', closeMenu = 'Close menu', mobileTitle = 'Site navigation' } = labels ?? {}
  const root = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const brandLink = useRef<HTMLAnchorElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  // Narrow first: until measured, actions wait for the drawer rather than crowding a small bar.
  const [compact, setCompact] = useState(true)

  // The container query in site-header.css decides the layout; the header reads it back from the menu toggle.
  useLayoutEffect(() => {
    const header = root.current, menuToggle = toggle.current
    if (!header || !menuToggle) return
    const measure = () => {
      const narrow = getComputedStyle(menuToggle).display !== 'none'
      setCompact(narrow)
      if (!narrow) {
        // A hidden trigger cannot take focus back, so a drawer closed by resizing returns it to the brand link.
        returnFocus.current = brandLink.current
        setOpen(false)
      }
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (next) returnFocus.current = trigger.current
    setOpen(next)
  }
  const close = () => setOpen(false)
  // Links among the actions close the drawer too; buttons may open their own overlays, so they leave it open.
  const closeOnLink = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a[href]')) close()
  }
  const drawerItems = navigation.map((item): NavigationItem => ({
    id: item.id,
    label: item.label,
    href: item.href,
    current: item.current,
    disabled: item.disabled,
    onClick: close,
    children: item.children?.map(child => ({ id: child.id, label: child.label, href: child.href, disabled: item.disabled, onClick: close })),
  }))
  const hasNavigation = navigation.length > 0
  const hasActions = actions != null && actions !== false

  return <header ref={root} className="b-site-header">
    <Container className="b-site-header__bar">
      <a ref={brandLink} href={brand.href} className="b-site-header__brand">
        <Text as="span" variant="h5" tone="inherit">{brand.label}</Text>
      </a>
      {hasNavigation && <div className="b-site-header__navigation"><NavigationMenu label={label} items={navigation} /></div>}
      <div className="b-site-header__end">
        {hasActions && !compact && <div className="b-site-header__actions">{actions}</div>}
        <div ref={toggle} className="b-site-header__toggle">
          {(hasNavigation || hasActions) && <Drawer
            closeLabel={closeMenu}
            title={mobileTitle}
            trigger={openMenu}
            triggerElement={<Button ref={trigger} iconOnly icon="menu" aria-label={open ? closeMenu : openMenu} />}
            open={open}
            onOpenChange={handleOpenChange}
            returnFocusRef={returnFocus}
            size="small"
          >
            <Stack gap={6}>
              {hasNavigation && <NavigationList label={label} items={drawerItems} />}
              {hasActions && compact && <>
                {hasNavigation && <Divider />}
                <div className="b-site-header__drawer-actions" onClick={closeOnLink}>{actions}</div>
              </>}
            </Stack>
          </Drawer>}
        </div>
      </div>
    </Container>
  </header>
}
