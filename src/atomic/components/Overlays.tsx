import { useId, type ReactElement, type ReactNode, type RefObject } from 'react'
import { Dialog as D, DropdownMenu as M, Popover as P, Tooltip as T } from 'radix-ui'
import { AtomsRoot, Heading, Icon, Stack, Text, type IconName } from '../atoms'
import { Button } from './Button'
import { usePointerAwareFocusReturn } from './overlayFocus'
import './overlays.css'

export type OverlayComposition = {
  triggerElement?: ReactElement
  size?: 'small' | 'medium' | 'large'
}
type DialogBehavior = {
  hideTrigger?: boolean
  dismissible?: boolean
  returnFocusRef?: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
}
export type DialogProps = OverlayComposition & DialogBehavior & {
  tone?: 'neutral' | 'warning' | 'confirmation'
  title: string
  description?: string
  trigger: string
  /** Accessible name of the close button; defaults to “Close dialog”. A drawer used as a menu can say “Close menu”. */
  closeLabel?: string
  /** Optional trigger icon. With triggerIconOnly the trigger text becomes its accessible name. */
  triggerIcon?: IconName
  triggerIconOnly?: boolean
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}
export type DrawerProps = DialogProps & { side?: 'left' | 'right' | 'top' | 'bottom' }

function Modal({ title, description, closeLabel = 'Close dialog', trigger, triggerIcon, triggerIconOnly = false, triggerElement, children, open, onOpenChange, hideTrigger, dismissible = true, returnFocusRef, initialFocusRef, size = 'medium', drawer = false, side = 'right', tone = 'neutral' }: DialogProps & { drawer?: boolean; side?: DrawerProps['side'] }) {
  const descriptionId = useId()
  if (hideTrigger && (open === undefined || !onOpenChange || !returnFocusRef)) {
    throw new Error('A hidden dialog trigger requires controlled open, onOpenChange, and returnFocusRef props.')
  }
  return <D.Root open={open} onOpenChange={onOpenChange}>
    {!hideTrigger && <D.Trigger asChild>{triggerElement ?? (triggerIconOnly && triggerIcon
      ? <Button className={drawer ? 'c-drawer-trigger' : 'c-dialog-trigger'} iconOnly icon={triggerIcon} aria-label={trigger} />
      : <Button className={drawer ? 'c-drawer-trigger' : 'c-dialog-trigger'} icon={triggerIcon}>{trigger}</Button>)}</D.Trigger>}
    <D.Portal><AtomsRoot className="c-overlay-root"><D.Overlay className="c-backdrop" /><D.Content
      className={drawer ? 'c-modal c-drawer' : 'c-modal'}
      data-size={size}
      data-side={drawer ? side : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onOpenAutoFocus={initialFocusRef ? event => {
        event.preventDefault()
        initialFocusRef.current?.focus()
      } : undefined}
      onEscapeKeyDown={dismissible ? undefined : event => event.preventDefault()}
      onPointerDownOutside={dismissible ? undefined : event => event.preventDefault()}
      onInteractOutside={dismissible ? undefined : event => event.preventDefault()}
      onCloseAutoFocus={returnFocusRef ? event => {
        event.preventDefault()
        returnFocusRef.current?.focus()
      } : undefined}
    >
      <Stack gap={4}><div className="c-modal__header"><D.Title asChild><Heading level={2} variant="h4">{tone !== 'neutral' && <Icon name={tone === 'warning' ? 'alert' : 'check'} size="small" />} {title}</Heading></D.Title><D.Close asChild><Button iconOnly icon="close" size="compact" aria-label={closeLabel} disabled={!dismissible} /></D.Close></div>{description && <D.Description asChild id={descriptionId}><Text tone="secondary">{description}</Text></D.Description>}{children}</Stack>
    </D.Content></AtomsRoot></D.Portal>
  </D.Root>
}
export function Dialog(props: DialogProps) { return <Modal {...props} /> }
export function Drawer(props: DrawerProps) { return <Modal {...props} drawer side={props.side ?? 'right'} /> }

export type PopoverProps = Pick<OverlayComposition, 'triggerElement'> & { label: string; children: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void; disabled?: boolean; variant?: 'default' | 'field'; side?: 'top' | 'right' | 'bottom' | 'left'; /** Icon-only trigger; label becomes its accessible name. */ icon?: IconName; iconOnly?: boolean; /** Trigger shape; see Button. */ shape?: 'default' | 'circle' }
export function Popover({ label, children, open, onOpenChange, disabled, variant = 'default', triggerElement, side = 'bottom', icon, iconOnly = false, shape }: PopoverProps) {
  const trigger = triggerElement ?? (variant === 'field'
    ? <button type="button" className="c-text-input c-select-trigger" disabled={disabled}>{label}<Icon name="chevronDown" size="small" /></button>
    : iconOnly && icon
      ? <Button className="c-popover-trigger" iconOnly icon={icon} aria-label={label} disabled={disabled} shape={shape} />
      : <Button className="c-popover-trigger" icon="chevronDown" iconPosition="end" disabled={disabled} shape={shape}>{label}</Button>)
  return <P.Root open={open} onOpenChange={onOpenChange}><P.Trigger asChild disabled={disabled}>{trigger}</P.Trigger><P.Portal><AtomsRoot className="c-overlay-root"><P.Content side={side} className={variant === 'field' ? 'c-popup c-dropdown-popup' : 'c-popup'} sideOffset={8} collisionPadding={16} aria-label={label}>{children}</P.Content></AtomsRoot></P.Portal></P.Root>
}

export type MenuItem = {
  id: string
  label: string
  icon?: IconName
  disabled?: boolean
  danger?: boolean
  group?: string
  separatorBefore?: boolean
  href?: string
  selection?: 'checkbox' | 'radio'
  checked?: boolean
  radioGroup?: string
  shortcut?: string
  description?: string
}
export type MenuProps = {
  iconOnly?: boolean
  icon?: IconName
  /** Trigger shape; see Button. */
  shape?: 'default' | 'circle'
  side?: 'top' | 'bottom'
  label: string
  items: readonly MenuItem[]
  onSelect: (id: string) => void
  onCheckedChange?: (id: string, checked: boolean) => void
  triggerElement?: ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  className?: string
}
const menuIcons: Record<string, IconName> = { copy: 'copy', duplicate: 'copy', delete: 'delete', download: 'download', edit: 'edit', settings: 'settings' }

function MenuItemContent({ item, itemIcon }: { item: MenuItem; itemIcon?: IconName }) {
  return <>
    {itemIcon && <Icon name={itemIcon} size="small" />}
    <span className="c-menu__copy"><Text as="span" variant="small" tone="inherit">{item.label}</Text>{item.description && <Text as="span" variant="small" tone="secondary">{item.description}</Text>}</span>
    {item.shortcut && <kbd className="c-menu__shortcut">{item.shortcut}</kbd>}
  </>
}

export function Menu({ label, items, onSelect, onCheckedChange, disabled, iconOnly, icon = 'more', side = 'bottom', shape, triggerElement, open, onOpenChange, className = '' }: MenuProps) {
  const focusReturn = usePointerAwareFocusReturn<HTMLButtonElement>()
  const triggerClassName = `c-menu-trigger ${className}`.trim()
  const trigger = triggerElement ?? (iconOnly
    ? <Button className={triggerClassName} variant="quiet" iconOnly aria-label={label} icon={icon} disabled={disabled} shape={shape} />
    : <Button className={triggerClassName} icon={icon} disabled={disabled} shape={shape}>{label}</Button>)
  const selectionItems = items.filter(item => item.selection === 'radio')
  const renderItem = (item: MenuItem) => {
    const itemIcon = item.icon ?? menuIcons[item.id]
    const itemClass = 'c-menu__item'
    if (item.selection === 'checkbox') return <M.CheckboxItem key={item.id} className={itemClass} checked={item.checked ?? false} disabled={item.disabled} onSelect={event => event.preventDefault()} onCheckedChange={checked => onCheckedChange?.(item.id, checked)} data-danger={item.danger || undefined}>
      <M.ItemIndicator className="c-menu__indicator"><Icon name="check" size="small" /></M.ItemIndicator><MenuItemContent item={item} itemIcon={itemIcon} />
    </M.CheckboxItem>
    if (item.selection === 'radio') return <M.RadioItem key={item.id} className={itemClass} value={item.id} disabled={item.disabled} onSelect={event => event.preventDefault()} data-danger={item.danger || undefined}>
      <M.ItemIndicator className="c-menu__indicator"><span className="c-menu__radio-dot" /></M.ItemIndicator><MenuItemContent item={item} itemIcon={itemIcon} />
    </M.RadioItem>
    const content = <MenuItemContent item={item} itemIcon={itemIcon} />
    if (item.href) return <M.Item key={item.id} asChild className={itemClass} disabled={item.disabled} data-danger={item.danger || undefined} onSelect={event => { if (item.disabled) event.preventDefault(); else onSelect(item.id) }}>
      <a href={item.disabled ? undefined : item.href} aria-disabled={item.disabled || undefined}>{content}</a>
    </M.Item>
    return <M.Item className={itemClass} key={item.id} disabled={item.disabled} data-danger={item.danger || undefined} onSelect={() => onSelect(item.id)}>{content}</M.Item>
  }

  const nodes: ReactNode[] = []
  let previousGroup: string | undefined
  const addItemHeading = (index: number, item: MenuItem) => {
    if (item.separatorBefore && index > 0) nodes.push(<M.Separator className="c-menu__separator" key={`separator-${item.id}`} />)
    if (item.group && item.group !== previousGroup) {
      if (nodes.length && !item.separatorBefore) nodes.push(<M.Separator className="c-menu__separator" key={`separator-group-${item.id}`} />)
      nodes.push(<M.Label className="c-menu__group-label" key={`group-${item.id}`}>{item.group}</M.Label>)
    }
    previousGroup = item.group
  }
  for (let index = 0; index < items.length;) {
    const item = items[index]
    addItemHeading(index, item)
    if (item.selection !== 'radio') {
      nodes.push(renderItem(item))
      index += 1
      continue
    }

    const radioGroup = item.radioGroup ?? 'default'
    const run: MenuItem[] = [item]
    let nextIndex = index + 1
    while (nextIndex < items.length) {
      const next = items[nextIndex]
      if (next.selection !== 'radio' || (next.radioGroup ?? 'default') !== radioGroup || next.separatorBefore || next.group !== item.group) break
      run.push(next)
      nextIndex += 1
    }
    const selected = selectionItems.find(candidate => (candidate.radioGroup ?? 'default') === radioGroup && candidate.checked)?.id
    nodes.push(<M.RadioGroup key={`radio-group-${radioGroup}-${item.id}`} value={selected} onValueChange={onSelect}>{run.map(renderItem)}</M.RadioGroup>)
    index = nextIndex
  }

  const content = <M.Content {...focusReturn.contentProps} side={side} className="c-popup c-menu" sideOffset={8} collisionPadding={16} aria-label={label}>{nodes}</M.Content>
  return <M.Root open={open} onOpenChange={onOpenChange}><M.Trigger ref={focusReturn.trigger} asChild disabled={disabled} className={triggerClassName}>{trigger}</M.Trigger><M.Portal><AtomsRoot className="c-overlay-root">{content}</AtomsRoot></M.Portal></M.Root>
}

export type TooltipProps = { label: string; content: string; triggerElement?: ReactElement }
export function Tooltip({ label, content, triggerElement }: TooltipProps) {
  const trigger = triggerElement ?? <Button className="c-tooltip-trigger" icon="info" size="compact">{label}</Button>
  return <T.Provider delayDuration={150}><T.Root><T.Trigger asChild>{trigger}</T.Trigger><T.Portal><AtomsRoot className="c-overlay-root"><T.Content className="c-tooltip" sideOffset={8} collisionPadding={16}><Text variant="small" tone="inherit">{content}</Text></T.Content></AtomsRoot></T.Portal></T.Root></T.Provider>
}
