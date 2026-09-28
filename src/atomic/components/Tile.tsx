import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Heading, Icon, Stack, Text, type IconName } from '../atoms'
import { TileControlsContext } from './tileContext'
import './tile.css'

export type TileTone = 'surface' | 'canvas' | 'ink' | 'accent' | 'yellow' | 'green' | 'violet' | 'orange'
export type TileProps = Omit<HTMLAttributes<HTMLElement>, 'title'> & {
  /** Heading of the tile. */
  title?: ReactNode
  /** A short pill label above the title, such as “Revenue”. */
  label?: string
  description?: ReactNode
  /** Optional icon shown in a round badge beside the label. */
  icon?: IconName
  /** Controls in the top-right corner, such as a period switch or a link. */
  actions?: ReactNode
  /** Fill colour. Components inside adapt: ink tiles switch to light text, colour tiles keep black text and draw charts in ink. */
  tone?: TileTone
  headingLevel?: 2 | 3 | 4
  /** compact: 16px padding and gaps, for small or square tiles. */
  density?: 'default' | 'compact'
  children?: ReactNode
}

/**
 * A dashboard widget: one idea per tile, grouped into a bento grid by the page.
 * Tiles set their own colour tokens, so every component inside stays readable on the fill.
 */
export function Tile({ title, label, description, icon, actions, tone = 'surface', headingLevel = 2, density = 'default', children, className = '', ...props }: TileProps) {
  const titleId = useId()
  const [controls, setControls] = useState<HTMLElement | null>(null)
  const hasHeader = title != null || label || icon || actions
  return <section {...props} className={`c-tile ${className}`.trim()} data-tone={tone} data-density={density === 'compact' ? 'compact' : undefined} aria-labelledby={title != null ? titleId : undefined} aria-label={title == null ? label : undefined}>
    {hasHeader && <header className="c-tile__header">
      <Stack gap={2} className="c-tile__heading">
        {(label || icon) && <span className="c-tile__eyebrow">{icon && <span className="c-tile__icon"><Icon name={icon} size="small" /></span>}{label && <span className="c-tile__label"><Text as="span" variant="small" tone="inherit">{label}</Text></span>}</span>}
        {title != null && <Heading id={titleId} level={headingLevel} variant="h4">{title}</Heading>}
        {description != null && <Text variant="small" tone="secondary">{description}</Text>}
      </Stack>
      <div className="c-tile__actions"><span ref={setControls} className="c-tile__controls" />{actions}</div>
    </header>}
    {children != null && <TileControlsContext.Provider value={hasHeader ? controls : null}><div className="c-tile__body">{children}</div></TileControlsContext.Provider>}
  </section>
}

export type FigureProps = {
  value: string
  /** What the number is, shown under it. */
  caption?: ReactNode
  /** display (56px): the one headline number of a tile; large (32px): every other figure. Keep to these two on a page. */
  size?: 'display' | 'large' | 'medium'
  /** A signed change in a pill beside the value, e.g. { value: '3.51%', direction: 'up' }. */
  change?: { value: string; direction: 'up' | 'down' | 'flat'; positive?: boolean }
  className?: string
}

/** A big number with its caption. Use one display figure per tile. */
export function Figure({ value, caption, size = 'large', change, className = '' }: FigureProps) {
  const good = change ? (change.positive ?? change.direction === 'up') : undefined
  const sentiment = !change || change.direction === 'flat' ? 'neutral' : good ? 'positive' : 'negative'
  return <div className={`c-figure ${className}`.trim()} data-size={size}>
    <div className="c-figure__row">
      <span className="c-figure__value">{value}</span>
      {change && <span className="c-figure__change" data-sentiment={sentiment}><Icon name={change.direction === 'up' ? 'arrowUp' : change.direction === 'down' ? 'arrowDown' : 'minus'} size="small" /><Text as="span" variant="h7" tone="inherit">{change.value}</Text><span className="c-tile__hidden">{sentiment === 'positive' ? ' (improvement)' : sentiment === 'negative' ? ' (decline)' : ''}</span></span>}
    </div>
    {caption != null && <Text as="span" variant="small" tone="secondary" className="c-figure__caption">{caption}</Text>}
  </div>
}
