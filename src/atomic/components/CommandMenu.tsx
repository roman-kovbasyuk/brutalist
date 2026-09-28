import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactElement } from 'react'
import { Text } from '../atoms'
import { Button } from './Button'
import { Dialog } from './Overlays'
import { Kbd } from './ReferenceComponents'
import type { MenuItem } from './Overlays'
import './command-menu.css'

export type CommandItem = MenuItem & { keywords?: readonly string[] }
type CommandMenuAdditions = {
  triggerElement?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  emptyMessage?: string
  shortcut?: 'mod+k'
  shortcutHint?: string
}
export type CommandMenuProps = CommandMenuAdditions & {
  label: string
  items: readonly CommandItem[]
  onSelect: (id: string) => void
  placeholder?: string
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"]'))
}

export function CommandMenu({ label, items, onSelect, placeholder = 'Search commands', open, onOpenChange, triggerElement, emptyMessage = 'No commands found.', shortcut, shortcutHint }: CommandMenuProps) {
  const id = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const changeOpenRef = useRef<(next: boolean) => void>(() => undefined)
  const isControlled = open !== undefined
  const expanded = isControlled ? open : uncontrolledOpen
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    if (!search) return items
    return items.filter(item => [item.label, ...(item.keywords ?? [])].some(text => text.toLocaleLowerCase().includes(search)))
  }, [items, query])
  const enabled = filtered.filter(item => !item.disabled)
  const active = enabled.find(item => item.id === activeId) ?? enabled[0]

  const changeOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next)
    onOpenChange?.(next)
    if (!next) {
      setQuery('')
      setActiveId(null)
    } else {
      setActiveId(null)
    }
  }
  changeOpenRef.current = changeOpen

  useEffect(() => {
    if (!shortcut) return
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || isEditableTarget(event.target)) return
      const modifier = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? event.metaKey : event.ctrlKey
      if (modifier && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        changeOpenRef.current(true)
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [shortcut])

  const selectItem = (item: CommandItem) => {
    if (item.disabled) return
    onSelect(item.id)
    changeOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    const activeIndex = active ? enabled.findIndex(item => item.id === active.id) : -1
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!enabled.length) return
      const delta = event.key === 'ArrowDown' ? 1 : -1
      const next = activeIndex < 0 ? (delta > 0 ? 0 : enabled.length - 1) : (activeIndex + delta + enabled.length) % enabled.length
      setActiveId(enabled[next].id)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveId(enabled.length ? enabled[event.key === 'Home' ? 0 : enabled.length - 1].id : null)
    } else if (event.key === 'Enter' && active) {
      event.preventDefault()
      selectItem(active)
    }
  }

  const rows: ReactElement[] = []
  let previousGroup: string | undefined
  filtered.forEach(item => {
    if (item.group && item.group !== previousGroup) {
      rows.push(<div className="c-command-menu__group-label" key={`group-${item.group}-${item.id}`} role="presentation">{item.group}</div>)
    }
    previousGroup = item.group
    const activeRow = item.id === active?.id
    rows.push(<div
      aria-disabled={item.disabled || undefined}
      aria-selected={activeRow}
      className="c-command-menu__option"
      id={`${id}-option-${item.id}`}
      key={item.id}
      onClick={() => selectItem(item)}
      onMouseDown={event => event.preventDefault()}
      role="option"
      data-active={activeRow || undefined}
      data-disabled={item.disabled || undefined}
    >
      <Text as="span" variant="small">{item.label}</Text>
      {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
    </div>)
  })

  const trigger = triggerElement ?? <Button icon="search">{label}</Button>
  return <div className="c-command-menu">
    <Dialog
      title={label}
      trigger={label}
      triggerElement={trigger}
      open={expanded}
      onOpenChange={changeOpen}
      size="large"
      hideTrigger={false}
      initialFocusRef={searchRef}
    >
      <div className="c-command-menu__surface">
        <div className="c-command-menu__search-row">
          <input
            ref={searchRef}
            aria-activedescendant={active ? `${id}-option-${active.id}` : undefined}
            aria-autocomplete="list"
            aria-controls={filtered.length ? `${id}-listbox` : undefined}
            aria-expanded={expanded}
            aria-label={placeholder}
            autoComplete="off"
            className="c-command-menu__search"
            onChange={event => { setQuery(event.target.value); setActiveId(null) }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            role="combobox"
            value={query}
          />
          {shortcutHint && <Kbd>{shortcutHint}</Kbd>}
        </div>
        {filtered.length
          ? <div aria-label={`${label} results`} className="c-command-menu__results" id={`${id}-listbox`} role="listbox">{rows}</div>
          : <Text className="c-command-menu__empty" variant="small" tone="secondary">{emptyMessage}</Text>}
        <div className="c-command-menu__hints"><span><Kbd>↑</Kbd><Kbd>↓</Kbd> to navigate</span><span><Kbd>Enter</Kbd> to run</span><span><Kbd>Esc</Kbd> to close</span></div>
      </div>
    </Dialog>
  </div>
}
