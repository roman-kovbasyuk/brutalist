import { useEffect, useRef, useState } from 'react'
import { Heading, Stack, Surface, Text, ScrollArea, type IconName } from '../atoms'
import { Avatar, Button, Menu, NavigationList, SearchField, type MenuItem, type NavigationItem } from '../components'
import './sidebar-panel.css'

export type SidebarPanelProps = {
  brand: { label: string }
  primaryAction: { label: string; icon?: IconName; onClick: () => void }
  navigation: readonly NavigationItem[]
  projects: readonly { id: string; title: string; href: string; pinned?: boolean; current?: boolean; actions?: readonly MenuItem[] }[]
  account?: { label: string; actions: readonly MenuItem[]; onAction: (id: string) => void }
  onProjectAction?: (projectId: string, actionId: string) => void
}

export function SidebarPanel({ brand, primaryAction, navigation, projects, account, onProjectAction }: SidebarPanelProps) {
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const searchButton = useRef<HTMLButtonElement>(null)
  const restore = useRef(false)
  useEffect(() => { if (!searching && restore.current) { searchButton.current?.focus(); restore.current = false } }, [searching])
  const matches = projects.filter(project => project.title.toLowerCase().includes(query.trim().toLowerCase()))
  const rows = (items: typeof projects) => items.map(item => ({
    id: item.id, label: item.title, href: item.href, current: item.current,
    trailing: item.actions?.length ? <Menu label={`Actions for ${item.title}`} iconOnly items={item.actions} onSelect={id => onProjectAction?.(item.id, id)} /> : undefined,
  }))
  return <Surface as="aside" tone="canvas" radius="none" padding={4} className="b-sidebar" aria-label="Sidebar">
    <Stack gap={6}>
      {searching
        ? <SearchField label="Search projects" hideLabel placeholder="Search projects" autoFocus value={query} onChange={setQuery} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); restore.current = true; setQuery(''); setSearching(false) } }} />
        : <div className="b-sidebar__header">
          <Avatar name={brand.label} shape="square" size="small" aria-hidden="true" />
          <Heading level={2} variant="h5" className="b-sidebar__brand">{brand.label}</Heading>
          <Button ref={searchButton} iconOnly size="compact" variant="quiet" icon="search" aria-label="Search projects" onClick={() => setSearching(true)} />
        </div>}
      {!searching && <>
        <Button variant="primary" icon={primaryAction.icon ?? 'plus'} onClick={primaryAction.onClick}>{primaryAction.label}</Button>
        <NavigationList label="Workspace navigation" items={navigation} />
      </>}
      <ScrollArea label="Projects" maxHeight="28rem" className="b-sidebar__projects">
        <Stack gap={6}>
          {(['Pinned', 'Recent projects'] as const).map(group => {
            const items = matches.filter(project => group === 'Pinned' ? project.pinned : !project.pinned)
            return items.length ? <Stack gap={1} key={group}><Heading level={3} variant="h7" className="b-sidebar__group">{group}</Heading><NavigationList label={group} items={rows(items)} /></Stack> : null
          })}
          {!matches.length && <Text variant="small" tone="secondary">{query ? 'No matching projects.' : 'No projects yet.'}</Text>}
        </Stack>
      </ScrollArea>
    </Stack>
    {account && <div className="b-sidebar__account"><Menu label={account.label} icon="UserRound" side="top" items={account.actions} onSelect={account.onAction} /></div>}
  </Surface>
}
