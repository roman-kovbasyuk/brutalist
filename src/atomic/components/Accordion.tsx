import { useState, type ReactNode } from 'react'
import { Icon, Text } from '../atoms'
import './reference-components.css'

export type AccordionItem = { id: string; title: string; content: ReactNode; defaultOpen?: boolean }
export type AccordionProps = { label: string; items: readonly AccordionItem[]; multiple?: boolean; openIds?: readonly string[]; onOpenChange?: (ids: string[]) => void; className?: string }

export function Accordion({ label, items, multiple = false, openIds, onOpenChange, className = '' }: AccordionProps) {
  const [internalOpenIds, setInternalOpenIds] = useState(() => {
    const initialOpenItems = items.filter(item => item.defaultOpen)
    return (multiple ? initialOpenItems : initialOpenItems.slice(0, 1)).map(item => item.id)
  })
  const controlled = openIds !== undefined
  const expandedIds = controlled ? openIds : internalOpenIds
  function handleToggle(itemId: string, isOpen: boolean) {
    const nextIds = isOpen
      ? (multiple ? [...expandedIds, itemId] : [itemId])
      : expandedIds.filter(id => id !== itemId)
    const next = items.filter(item => nextIds.includes(item.id)).map(item => item.id)
    if (!controlled) setInternalOpenIds(next)
    onOpenChange?.(next)
  }
  return <section className={`c-accordion ${className}`.trim()} aria-label={label}>{items.map(item => {
    const isOpen = expandedIds.includes(item.id)
    return <details key={item.id} open={isOpen} className="c-accordion__item"><summary onClick={event => {
      event.preventDefault()
      handleToggle(item.id, !isOpen)
    }}><Text as="span" variant="h6">{item.title}</Text><Icon name="chevronDown" size="small" /></summary><div className="c-accordion__content"><div className="c-accordion__content-inner">{item.content}</div></div></details>
  })}</section>
}
