import { Alert, Avatar, Checkbox, EmptyState, Menu, Skeleton, Table, Tag, TextAction, type MenuItem, type TableColumn } from '../components'
import { Text } from '../atoms'
import './settings-blocks.css'

export type DirectoryMember = { id: string; name: string; email: string; role: string; avatarSrc?: string; disabled?: boolean }
export type MemberDirectoryProps = {
  title: string
  layout?: 'list' | 'table'
  members: readonly DirectoryMember[]
  actions?: readonly MenuItem[]
  onAction?: (memberId: string, actionId: string) => void
  selectedIds?: readonly string[]
  onSelectionChange?: (ids: string[]) => void
  status?: 'ready' | 'loading' | 'error'
  errorMessage?: string
  onRetry?: () => void
}

function Identity({ member }: { member: DirectoryMember }) {
  return <span className="b-member-directory__identity">
    <Avatar name={member.name} src={member.avatarSrc} size="small" />
    <span className="b-member-directory__person">
      <Text as="span" variant="h7">{member.name}</Text>
      <Text as="span" variant="small" tone="secondary">{member.email}</Text>
    </span>
  </span>
}

export function MemberDirectory({ title, layout = 'list', members, actions, onAction, selectedIds, onSelectionChange, status = 'ready', errorMessage, onRetry }: MemberDirectoryProps) {
  const selectable = selectedIds !== undefined && onSelectionChange !== undefined
  const hasActions = Boolean(actions?.length && onAction)
  const renderAction = (member: DirectoryMember) => hasActions
    ? <Menu label={`Actions for ${member.name}`} iconOnly items={actions!} onSelect={actionId => {
      if (!actions!.some(action => action.id === actionId && action.href)) onAction!(member.id, actionId)
    }} />
    : null
  const columns: TableColumn<DirectoryMember>[] = [
    { id: 'member', header: 'Member', render: member => <Identity member={member} /> },
    { id: 'role', header: 'Role', render: member => <Tag>{member.role}</Tag> },
    ...(hasActions ? [{ id: 'actions', header: 'Actions', align: 'end' as const, render: renderAction }] : []),
  ]

  if (layout === 'table') return <div className="b-member-directory-table"><Table label={title} rows={members} rowKey={member => member.id} columns={columns} status={status} errorMessage={errorMessage} onRetry={onRetry} emptyMessage="No members to show." selection={selectable ? { selectedIds, onSelectionChange, rowLabel: member => member.name, isRowSelectable: member => !member.disabled } : undefined} /></div>
  if (status === 'loading') return <Skeleton label={`Loading ${title}`} lines={3} />
  if (status === 'error') return <Alert title="Unable to load members" description={errorMessage ?? `Unable to load ${title.toLocaleLowerCase()}.`} tone="danger" announce action={onRetry ? <TextAction onClick={onRetry}>Retry</TextAction> : undefined} />
  if (members.length === 0) return <EmptyState title="No members to show." />

  return <ul className="b-member-directory" aria-label={title}>
    {members.map(member => <li key={member.id} className="b-member-directory__row" data-disabled={member.disabled || undefined}>
      {selectable && <Checkbox hideLabel label={`Select ${member.name}`} checked={selectedIds.includes(member.id)} disabled={member.disabled} onChange={() => onSelectionChange(selectedIds.includes(member.id) ? selectedIds.filter(id => id !== member.id) : [...selectedIds, member.id])} />}
      <Identity member={member} />
      <Tag>{member.role}</Tag>
      {hasActions && renderAction(member)}
    </li>)}
  </ul>
}
