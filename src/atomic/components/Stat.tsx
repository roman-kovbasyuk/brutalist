import type { ReactNode } from 'react'
import { Icon, Text } from '../atoms'
import './data-display.css'

export type StatProps = {
  label: string
  value: string | number | null
  unit?: string
  period?: string
  comparison?: { text: string; direction: 'up' | 'down' | 'flat'; tone?: 'neutral' | 'success' | 'danger' }
  unavailableLabel?: string
  source?: { label: string; href: string }
}

const directionIcon = { up: 'arrowUp', down: 'arrowDown', flat: 'minus' } as const

/** A metric tile: what is measured and over which period, the value, then how it changed. */
export function Stat({ label, value, unit, period, comparison, unavailableLabel = 'Unavailable', source }: StatProps) {
  const unavailable = value === null
  const displayValue: ReactNode = unavailable ? <span aria-hidden="true">—</span> : value
  return <div className="c-stat" role="group" aria-label={label} data-unavailable={unavailable || undefined}>
    <div className="c-stat__header">
      <Text as="span" variant="h7" className="c-stat__label">{label}</Text>
      {period && <Text as="span" variant="small" tone="secondary" className="c-stat__period">{period}</Text>}
    </div>
    <div className="c-stat__value-line">
      <Text as="span" variant="h2" tone={unavailable ? 'secondary' : 'ink'} className="c-stat__value">{displayValue}</Text>
      {!unavailable && unit && <Text as="span" variant="small" tone="secondary" className="c-stat__unit">{unit}</Text>}
    </div>
    {unavailable && <Text as="span" variant="small" tone="secondary" className="c-stat__note">{unavailableLabel}</Text>}
    {comparison && <span className="c-stat__comparison-line" data-tone={comparison.tone ?? 'neutral'}>
      <Icon name={directionIcon[comparison.direction]} size="small" />
      <Text as="span" variant="small" tone="inherit" className="c-stat__comparison" data-direction={comparison.direction} data-tone={comparison.tone ?? 'neutral'}>{comparison.text}</Text>
    </span>}
    {source && <a className="c-stat__source" href={source.href}>{source.label}<Icon name="arrowRight" size="small" /></a>}
  </div>
}
