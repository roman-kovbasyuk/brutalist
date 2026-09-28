import type { ReactNode } from 'react'
import { ScrollArea, Text, Icon } from '../atoms'
import { Alert } from './Alert'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import './table.css'

export type TableSort = { column: string; direction: 'asc' | 'desc' }
export type TableColumn<T> = { id: string; header: string; render: (row: T) => ReactNode; sortable?: boolean; align?: 'start' | 'center' | 'end' }
export type TableSelection<T> = {
  selectedIds: readonly string[]
  onSelectionChange: (ids: string[]) => void
  isRowSelectable?: (row: T) => boolean
  rowLabel: (row: T) => string
}
export type TableProps<T> = {
  label: string
  rows: readonly T[]
  rowKey: (row: T) => string
  columns: readonly TableColumn<T>[]
  sort?: TableSort
  onSort?: (sort: TableSort) => void
  emptyMessage?: string
  selection?: TableSelection<T>
  status?: 'ready' | 'loading' | 'error'
  errorMessage?: string
  onRetry?: () => void
  /** `simple` keeps only horizontal rules; `grid` (default) draws every cell edge. */
  variant?: 'grid' | 'simple'
  /** Tints every second row to help the eye follow wide rows. */
  striped?: boolean
}

export function Table<T>({ label, rows, rowKey, columns, sort, onSort, emptyMessage = 'No rows to display.', selection, status = 'ready', errorMessage = 'Unable to load rows.', onRetry, variant = 'grid', striped = false }: TableProps<T>) {
  const loading = status === 'loading'
  const selectable = selection ? rows.filter(row => selection.isRowSelectable?.(row) !== false) : []
  const selected = selection ? new Set(selection.selectedIds) : new Set<string>()
  const allSelected = selectable.length > 0 && selectable.every(row => selected.has(rowKey(row)))
  const someSelected = !allSelected && selectable.some(row => selected.has(rowKey(row)))

  const toggleAll = () => {
    if (!selection) return
    const pageIds = new Set(selectable.map(rowKey))
    const offPageIds = selection.selectedIds.filter(id => !pageIds.has(id))
    selection.onSelectionChange(allSelected ? offPageIds : [...offPageIds, ...selectable.map(rowKey)])
  }

  const content = status === 'loading'
    ? <Text variant="small" tone="secondary">Loading {label}…</Text>
    : status === 'error'
      ? <Alert title="Unable to load data" description={errorMessage} tone="danger" announce action={onRetry ? <Button size="small" onClick={onRetry}>Retry</Button> : undefined} />
      : emptyMessage

  return <ScrollArea label={`${label} table`} maxHeight="none"><table className="c-table" data-variant={variant} data-striped={striped || undefined} aria-label={label} aria-busy={loading || undefined}>
    <thead><tr>
      {selection && <th scope="col" className="c-table__selection"><Checkbox hideLabel label={`Select all ${label} on this page`} checked={allSelected} indeterminate={someSelected} disabled={loading || rows.length === 0 || selectable.length === 0} onChange={toggleAll} /></th>}
      {columns.map(column => <th key={column.id} scope="col" data-align={column.align ?? 'start'} aria-sort={sort?.column === column.id ? sort.direction === 'asc' ? 'ascending' : 'descending' : undefined}>{column.sortable && onSort ? <button type="button" className="c-table__sort" onClick={() => onSort({ column: column.id, direction: sort?.column === column.id && sort.direction === 'asc' ? 'desc' : 'asc' })}><Text as="span" variant="h7">{column.header}</Text><Icon name={sort?.column === column.id && sort.direction === 'asc' ? 'arrowUp' : 'arrowDown'} size="small" /></button> : <Text as="span" variant="h7">{column.header}</Text>}</th>)}
    </tr></thead>
    <tbody>
      {rows.map(row => {
        const id = rowKey(row), canSelect = Boolean(selection && selection.isRowSelectable?.(row) !== false)
        return <tr key={id}>
          {selection && <td className="c-table__selection">{canSelect && <Checkbox hideLabel label={`Select ${selection.rowLabel(row)}`} checked={selected.has(id)} onChange={() => selection.onSelectionChange(selected.has(id) ? selection.selectedIds.filter(selectedId => selectedId !== id) : [...selection.selectedIds, id])} />}</td>}
          {columns.map(column => <td key={column.id} data-align={column.align ?? 'start'}>{column.render(row)}</td>)}
        </tr>
      })}
      {(!rows.length || status !== 'ready') && <tr className="c-table__status"><td colSpan={columns.length + (selection ? 1 : 0)}>{content}</td></tr>}
    </tbody>
  </table></ScrollArea>
}
