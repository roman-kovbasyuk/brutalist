import { Button, CommandMenu, Kbd, type CommandItem, type CommandMenuProps } from '../components'
import './command-search.css'

export type RecentDestination = {
  id: string
  label: string
  href: string
  keywords?: readonly string[]
}

export type CommandSearchProps = Omit<CommandMenuProps, 'items' | 'onSelect'> & {
  commands: readonly CommandItem[]
  recent?: readonly RecentDestination[]
  onCommand: (id: string) => void
  onNavigate: (href: string) => void
}

type Selection = { kind: 'command'; id: string } | { kind: 'recent'; href: string }

export function CommandSearch({ commands, recent = [], onCommand, onNavigate, triggerElement, ...menuProps }: CommandSearchProps) {
  const selections = new Map<string, Selection>()
  const items: CommandItem[] = [
    ...commands.map(item => {
      const internalId = `command:${item.id}`
      selections.set(internalId, { kind: 'command', id: item.id })
      return { ...item, id: internalId, group: item.group ?? 'Commands' }
    }),
    ...recent.map(item => {
      const internalId = `recent:${item.id}`
      selections.set(internalId, { kind: 'recent', href: item.href })
      return { id: internalId, label: item.label, keywords: item.keywords, group: 'Recent destinations' }
    }),
  ]
  const hint = menuProps.shortcutHint ?? (menuProps.shortcut ? '⌘K' : undefined)
  const trigger = triggerElement ?? <Button className="b-command-search__trigger" icon="search" aria-keyshortcuts={menuProps.shortcut ? 'Meta+K Control+K' : undefined}>
    <span className="b-command-search__label">{menuProps.label}</span>
    {hint && <Kbd aria-hidden="true">{hint}</Kbd>}
  </Button>

  return <CommandMenu
    {...menuProps}
    triggerElement={trigger}
    items={items}
    onSelect={internalId => {
      const selection = selections.get(internalId)
      if (!selection) return
      if (selection.kind === 'command') onCommand(selection.id)
      else onNavigate(selection.href)
    }}
  />
}
