import type { ReactNode } from 'react'
import { Heading, Icon, Inline, Stack, Text } from '../atoms'
import {
  Avatar, Breadcrumbs, CommandMenu, InlineText, Menu, NavigationList, SearchField,
  SectionHeading, Button,
  type BreadcrumbsProps, type CommandItem, type InlineTextProps, type MenuItem,
  type NavigationListProps, type SearchFieldProps,
} from '../components'
import './workspace-navigation.css'

export type WorkspaceHeaderProps = {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  search?: SearchFieldProps
  level?: 1 | 2
}

export function WorkspaceHeader({ title, description, eyebrow, actions, search, level = 1 }: WorkspaceHeaderProps) {
  return <div className="b-workspace-header">
    <SectionHeading title={title} description={description} eyebrow={eyebrow} actions={actions} level={level} variant={level === 1 ? 'h2' : 'h3'} />
    {search && <SearchField hideLabel {...search} />}
  </div>
}

export type WorkspaceSwitcherProps = {
  label: string
  value: string
  items: readonly { id: string; label: string; description?: string; group?: string; disabled?: boolean }[]
  onChange: (id: string) => void
  searchable?: boolean
  disabled?: boolean
}

export function WorkspaceSwitcher({ label, value, items, onChange, searchable = false, disabled = false }: WorkspaceSwitcherProps) {
  const current = items.find(item => item.id === value)
  const selection = current?.label ?? label
  const trigger = <Button className="b-workspace-switcher__trigger" variant="secondary" icon="ChevronsUpDown" iconPosition="end" disabled={disabled}>
    <span className="b-workspace-switcher__content">
      <Avatar name={selection} shape="square" size="small" aria-hidden="true" />
      <span className="b-workspace-switcher__selection">
        <span className="b-workspace-switcher__label">{label}</span>
        <span className="b-workspace-switcher__value">{selection}</span>
      </span>
    </span>
  </Button>

  if (searchable) {
    const commands: CommandItem[] = items.map(item => ({ ...item, keywords: [item.group ?? '', item.description ?? ''] }))
    return <div className="b-workspace-switcher">
      <CommandMenu label={label} placeholder={`Search ${label.toLocaleLowerCase()}`} items={commands} onSelect={onChange} triggerElement={trigger} />
    </div>
  }

  const options: MenuItem[] = items.map(item => ({
    ...item,
    selection: 'radio',
    radioGroup: 'workspace',
    checked: item.id === value,
  }))
  return <div className="b-workspace-switcher"><Menu label={label} items={options} onSelect={onChange} triggerElement={trigger} disabled={disabled} /></div>
}

export type AccountMenuProps = {
  name: string
  description?: string
  avatarSrc?: string
  organization?: string
  items: readonly MenuItem[]
  onSelect: (id: string) => void
}

export function AccountMenu({ name, description, avatarSrc, organization, items, onSelect }: AccountMenuProps) {
  const trigger = <button type="button" className="b-account-menu__trigger" aria-label={`Account: ${name}`}>
    <Avatar name={name} src={avatarSrc} size="small" />
    <span className="b-account-menu__identity">
      <Text as="span" variant="h7">{name}</Text>
      {(description || organization) && <span className="b-account-menu__context">
        {description && <Text as="span" variant="small" tone="secondary">{description}</Text>}
        {organization && <Text as="span" variant="small" tone="secondary">{organization}</Text>}
      </span>}
    </span>
    <Icon name="ChevronsUpDown" size="small" />
  </button>
  return <Menu label={`Account for ${name}`} items={items} onSelect={id => {
    if (!items.some(item => item.id === id && item.href)) onSelect(id)
  }} triggerElement={trigger} />
}

export type PrimaryNavigationProps = NavigationListProps & {
  brand?: { label: string; href: string }
  footer?: ReactNode
}

export function PrimaryNavigation({ brand, footer, ...navigation }: PrimaryNavigationProps) {
  return <div className="b-primary-navigation" data-compact={navigation.compact || undefined}>
    {brand && <a href={brand.href} className="b-primary-navigation__brand" title={navigation.compact ? brand.label : undefined}>
      <Avatar name={brand.label} shape="square" size="small" aria-hidden="true" />
      <Text as="span" variant="h6" tone="inherit" className="b-primary-navigation__brand-label">{brand.label}</Text>
    </a>}
    <NavigationList {...navigation} />
    {footer != null && <div className="b-primary-navigation__footer">{footer}</div>}
  </div>
}

export type BreadcrumbHeaderProps = {
  items: BreadcrumbsProps['items']
  title: string
  description?: string
  actions?: ReactNode
  onTitleSave?: InlineTextProps['onSave']
  titleReadOnly?: boolean
}

export function BreadcrumbHeader({ items, title, description, actions, onTitleSave, titleReadOnly = false }: BreadcrumbHeaderProps) {
  const editable = Boolean(onTitleSave) && !titleReadOnly
  return <Stack gap={6} className="b-breadcrumb-header">
    <Breadcrumbs items={items} />
    {editable
      ? <Inline gap={4} className="b-breadcrumb-header__heading">
        <Stack gap={2} className="b-breadcrumb-header__content">
          <Heading level={1} variant="h2"><InlineText label="Page title" value={title} variant="h2" onSave={onTitleSave!} /></Heading>
          {description && <Text variant="body" tone="secondary">{description}</Text>}
        </Stack>
        {actions != null && <div className="b-breadcrumb-header__actions">{actions}</div>}
      </Inline>
      : <SectionHeading title={title} description={description} actions={actions} level={1} variant="h2" />}
  </Stack>
}
