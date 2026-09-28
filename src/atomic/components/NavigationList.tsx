import { Fragment, useEffect, useState, type ReactElement, type ReactNode } from 'react'
import { Heading, Icon, Stack, Text, type IconName } from '../atoms'
import { Disclosure } from './Disclosure'
import { Tooltip } from './Overlays'
import './navigation-list.css'

export type NavigationItem = { id:string; label:string; href?:string; icon?:IconName; current?:boolean; trailing?:ReactNode; onClick?:()=>void; status?:string; children?:readonly NavigationItem[]; group?:string; disabled?:boolean }
export type NavigationListProps = { label:string; items:readonly NavigationItem[]; compact?:boolean; expandedIds?:readonly string[]; onExpandedChange?:(ids:string[])=>void }

function NavigationRow({ item, compact, expandedIds, onExpandedChange }: { item: NavigationItem; compact: boolean; expandedIds?: readonly string[]; onExpandedChange?: (ids: string[]) => void }) {
  const hasChildren = Boolean(item.children?.length)
  const currentExpandedIds = expandedIds ?? []
  const expanded = currentExpandedIds.includes(item.id)
  const missing = item.status === 'Missing component'
  const status = item.status && !missing ? <Text as="span" variant="small" tone="secondary" aria-hidden="true">{item.status}</Text> : null
  const destination = item.disabled ? undefined : item.href
  const link = destination
    ? <a href={destination} aria-label={item.label} aria-current={item.current?'page':undefined} onClick={item.onClick} title={item.label}>{item.icon&&<Icon name={item.icon} size="small"/>}{(!compact||!item.icon)&&<Text as="span" variant="small" tone="inherit">{item.label}</Text>}{status}</a>
    : compact && item.icon
      ? <button type="button" className="c-navigation-row__static" aria-label={item.label} aria-disabled="true" title={item.label}><Icon name={item.icon} size="small"/><Text as="span" variant="small" tone="inherit" className="c-navigation-row__label--visually-hidden">{item.label}</Text>{status}</button>
      : <div className="c-navigation-row__static" title={item.label}>{item.icon&&<Icon name={item.icon} size="small"/>}<Text as="span" variant="small" tone="inherit">{item.label}</Text>{status}</div>
  const visibleLink = compact && item.icon
    ? <Tooltip label={item.label} content={item.label} triggerElement={link as ReactElement} />
    : link
  return <div className={`c-navigation-row${item.status ? ' c-navigation-row--missing' : ''}${missing ? ' c-navigation-row--unavailable' : ''}${compact ? ' c-navigation-row--compact' : ''}`} key={item.id}>
    {visibleLink}
    {item.trailing}
    {hasChildren && <Disclosure label={`Show ${item.label} navigation`} open={expanded} defaultOpen={expandedIds === undefined ? false : undefined} onOpenChange={open => {
      onExpandedChange?.(open ? [...currentExpandedIds, item.id] : currentExpandedIds.filter(id => id !== item.id))
    }} variant="quiet" className="c-navigation-row__disclosure">
      <Stack gap={1}>{item.children!.map(child => <NavigationRow key={child.id} item={child} compact={compact} expandedIds={expandedIds} onExpandedChange={onExpandedChange} />)}</Stack>
    </Disclosure>}
  </div>
}

const holdsCurrent = (item: NavigationItem): boolean => Boolean(item.current || item.children?.some(holdsCurrent))
const currentBranches = (items: readonly NavigationItem[]): string[] => items.flatMap(item => item.children?.length ? [...(holdsCurrent(item) ? [item.id] : []), ...currentBranches(item.children)] : [])

/** Rows of links. Items with `children` open a submenu; uncontrolled, the branch holding the current page opens by itself. */
export function NavigationList({label,items,compact=false,expandedIds,onExpandedChange}:NavigationListProps){
 const [internalExpandedIds, setInternalExpandedIds] = useState<string[]>(() => currentBranches(items))
 const expanded = expandedIds ?? internalExpandedIds
 const current = currentBranches(items).join(' ')
 useEffect(() => {
   if (expandedIds !== undefined || !current) return
   setInternalExpandedIds(open => { const added = current.split(' ').filter(id => !open.includes(id)); return added.length ? [...open, ...added] : open })
 }, [current, expandedIds])
 function handleExpandedChange(ids: string[]) {
   if (expandedIds === undefined) setInternalExpandedIds(ids)
   onExpandedChange?.(ids)
 }
 return <nav aria-label={label}><Stack gap={1}>{items.map((item,index)=><Fragment key={item.id}>{item.group && item.group !== items[index - 1]?.group && <Heading level={3} variant="h7" className="c-navigation-list__group">{item.group}</Heading>}<NavigationRow item={item} compact={compact} expandedIds={expanded} onExpandedChange={handleExpandedChange}/></Fragment>)}</Stack></nav>
}
