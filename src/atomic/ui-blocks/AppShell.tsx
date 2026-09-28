import { useState, type ReactNode } from 'react'
import { Drawer } from '../components'
import './app-shell.css'

export type AppShellProps = {
  /** Sidebar content: brand, navigation, account. Rendered in a drawer below the desktop breakpoint. */
  sidebar: ReactNode
  /** Top bar content beside the page, such as search and account actions. */
  topBar?: ReactNode
  /** Compact brand shown in the mobile top bar. */
  mobileBrand?: ReactNode
  children: ReactNode
  navigationLabel?: string
  /** Render the content area as a plain div when the shell is embedded inside another page's main landmark. */
  contentElement?: 'main' | 'div'
  className?: string
}

/** A full-height application frame: sticky sidebar on wide screens, a menu drawer on narrow ones. */
export function AppShell({ sidebar, topBar, mobileBrand, children, navigationLabel = 'Main navigation', contentElement = 'main', className = '' }: AppShellProps) {
  const [open, setOpen] = useState(false)
  const Content = contentElement
  return <div className={`b-app-shell ${className}`.trim()}>
    <aside className="b-app-shell__sidebar" aria-label={navigationLabel}>{sidebar}</aside>
    <div className="b-app-shell__main">
      <header className="b-app-shell__top">
        <div className="b-app-shell__mobile">
          <Drawer title={navigationLabel} trigger="Open menu" triggerIcon="menu" triggerIconOnly open={open} onOpenChange={setOpen}>
            <div className="b-app-shell__drawer" onClick={event => { if ((event.target as HTMLElement).closest('a[href]')) setOpen(false) }}>{sidebar}</div>
          </Drawer>
          {mobileBrand}
        </div>
        {topBar && <div className="b-app-shell__top-content">{topBar}</div>}
      </header>
      <Content className="b-app-shell__content" id={contentElement === 'main' ? 'main-content' : undefined} tabIndex={contentElement === 'main' ? -1 : undefined}>{children}</Content>
    </div>
  </div>
}
