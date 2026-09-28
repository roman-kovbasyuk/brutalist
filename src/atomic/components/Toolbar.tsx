import { useLayoutEffect, useRef, useState } from 'react'
import { Toolbar as R } from 'radix-ui'
import type { IconName } from '../atoms'
import { Button } from './Button'
import { ToggleButton } from './ToggleButton'
import './toolbar.css'

export type ToolbarItem = {
  id: string
  label: string
  icon?: IconName
  disabled?: boolean
  pressed?: boolean
  separatorBefore?: boolean
}

export type ToolbarProps = {
  label: string
  items: readonly ToolbarItem[]
  onAction: (id: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Toolbar({ label, items, onAction, orientation = 'horizontal', className = '' }: ToolbarProps) {
  const root = useRef<HTMLDivElement>(null)
  const [inheritedDirection, setInheritedDirection] = useState<'ltr' | 'rtl'>()
  useLayoutEffect(() => {
    const container = root.current?.parentElement
    if (!container) return
    const syncDirection = () => {
      const declared = container.closest('[dir]')?.getAttribute('dir')
      const computed = getComputedStyle(container).direction
      setInheritedDirection(computed === 'rtl' ? 'rtl' : declared ? 'ltr' : undefined)
    }
    syncDirection()
    const observer = new MutationObserver(syncDirection)
    for (let ancestor: HTMLElement | null = container; ancestor; ancestor = ancestor.parentElement) {
      observer.observe(ancestor, { attributes: true, attributeFilter: ['dir', 'style', 'class'] })
    }
    return () => observer.disconnect()
  }, [])
  return <R.Root ref={root} dir={inheritedDirection} aria-label={label} orientation={orientation} className={`c-toolbar ${className}`.trim()}>
    {items.map(item => <span className="c-toolbar__entry" key={item.id}>
      {item.separatorBefore && <R.Separator className="c-toolbar__separator" />}
      <R.Button asChild disabled={item.disabled}>
        {item.pressed === undefined
          ? <Button size="compact" icon={item.icon} disabled={item.disabled} onClick={() => onAction(item.id)}>{item.label}</Button>
          : <ToggleButton size="compact" icon={item.icon} disabled={item.disabled} pressed={item.pressed} onPressedChange={() => onAction(item.id)}>{item.label}</ToggleButton>}
      </R.Button>
    </span>)}
  </R.Root>
}
