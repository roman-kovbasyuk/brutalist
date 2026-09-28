import { createPortal } from 'react-dom'
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { Icon, Inline, Stack, Text, type IconName } from '../atoms'
import { Button } from './Button'
import { Table } from './Table'
import { useTileControls } from './tileContext'
import './charts.css'

/** One named series. Series take chart colours in the order given; keep the order stable when filtering. */
export type ChartSeries = { id: string; label: string; values: readonly number[] }
export type ValueFormat = (value: number) => string
/** categorical: distinct hues in a fixed order. monochrome: shades of one blue, dark to light, for a calm single-family look. */
export type ChartPalette = 'categorical' | 'monochrome'

const MAX_SLOTS = 6
const seriesColor = (index: number) => `var(--a-color-chart-${(index % MAX_SLOTS) + 1})`
const defaultFormat: ValueFormat = value => new Intl.NumberFormat('en', { maximumFractionDigits: 1 }).format(value)
/** 1,284 · 12.9K · 4.2M */
export const formatCompact: ValueFormat = value => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

function useElementWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => { const next = Math.round(element.getBoundingClientRect().width); if (next > 0) setWidth(next) }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** Clean axis ticks from zero: 0 / 250 / 500 / 750 / 1,000. */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const power = 10 ** Math.floor(Math.log10(raw))
  const step = ([1, 2, 2.5, 5, 10].find(multiple => multiple * power >= raw) ?? 10) * power
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, index) => Number((index * step).toPrecision(12)))
}

function LegendKey({ index, shape }: { index: number; shape: 'line' | 'block' }) {
  return <span className="c-chart__key" data-shape={shape} style={{ background: seriesColor(index) }} aria-hidden="true" />
}

function Legend({ series, shape }: { series: readonly { id: string; label: string }[]; shape: 'line' | 'block' }) {
  if (series.length < 2) return null
  return <ul className="c-chart__legend" aria-label="Legend">{series.map((item, index) => <li key={item.id}><LegendKey index={index} shape={shape} /><Text as="span" variant="small">{item.label}</Text></li>)}</ul>
}

type FrameProps = { label: string; description?: string; legend?: ReactNode; showTable: boolean; onToggleTable: () => void; table: ReactNode; children: ReactNode; chartIcon: IconName; palette?: ChartPalette }
function ChartFrame({ label, description, legend, showTable, onToggleTable, table, children, chartIcon, palette = 'categorical' }: FrameProps) {
  const slot = useTileControls()
  const toggle = slot
    ? createPortal(<Button size="xsmall" shape="circle" iconOnly icon={showTable ? chartIcon : 'Table'} onClick={onToggleTable} aria-pressed={showTable} aria-label={showTable ? `Show ${label} as a chart` : `Show ${label} as a table`} />, slot)
    : <Button size="xxsmall" variant="quiet" icon={showTable ? chartIcon : 'Table'} onClick={onToggleTable} aria-pressed={showTable}>{showTable ? 'Chart' : 'Table'}</Button>
  return <figure className="c-chart" aria-label={label} data-palette={palette}>
    {slot ? <>{legend && <div className="c-chart__toolbar">{legend}</div>}{toggle}</> : <div className="c-chart__toolbar">
      {legend ?? <span />}
      {toggle}
    </div>}
    {showTable ? table : children}
    {description && <figcaption><Text variant="small" tone="secondary">{description}</Text></figcaption>}
  </figure>
}

function SeriesTable({ label, categories, series, format }: { label: string; categories: readonly string[]; series: readonly ChartSeries[]; format: ValueFormat }) {
  const rows = categories.map((category, index) => ({ category, index }))
  return <Table label={label} rows={rows} rowKey={row => `${row.index}`} columns={[
    { id: 'category', header: 'Category', render: row => <Text variant="small">{row.category}</Text> },
    ...series.map(item => ({ id: item.id, header: item.label, render: (row: { index: number }) => <Text variant="small" className="c-chart__number">{format(item.values[row.index] ?? 0)}</Text> })),
  ]} />
}

function Tooltip({ title, rows, x, width, shape }: { title: string; rows: { label: string; value: string; index: number }[]; x: number; width: number; shape: 'line' | 'block' }) {
  const flip = x > width - 180
  return <div className="c-chart__tooltip" style={flip ? { right: width - x + 12 } : { left: x + 12 }} aria-hidden="true">
    <Text variant="small" tone="secondary">{title}</Text>
    {rows.map(row => <div key={row.label} className="c-chart__tooltip-row"><LegendKey index={row.index} shape={shape} /><Text as="span" variant="h7" className="c-chart__number">{row.value}</Text><Text as="span" variant="small" tone="secondary">{row.label}</Text></div>)}
  </div>
}

type CartesianProps = {
  /** Accessible name; also the table caption. */
  label: string
  description?: string
  categories: readonly string[]
  series: readonly ChartSeries[]
  height?: number
  valueFormat?: ValueFormat
  /** Format for axis ticks; defaults to compact numbers. */
  axisFormat?: ValueFormat
  palette?: ChartPalette
}

/** Shared plot geometry and keyboard/pointer focus for category charts. */
function useCartesian({ categories, series, height, axisFormat, stacked, bare = false }: { categories: readonly string[]; series: readonly ChartSeries[]; height: number; axisFormat: ValueFormat; stacked: boolean; bare?: boolean }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(640)
  const [active, setActive] = useState<number | null>(null)
  const totals = categories.map((_, index) => stacked ? series.reduce((sum, item) => sum + Math.max(0, item.values[index] ?? 0), 0) : Math.max(0, ...series.map(item => item.values[index] ?? 0)))
  const ticks = niceTicks(Math.max(0, ...totals))
  const max = ticks[ticks.length - 1]
  const labelWidth = bare ? 4 : Math.max(...ticks.map(tick => axisFormat(tick).length)) * 7.5 + 12
  const box = { top: bare ? 24 : 12, right: bare ? 4 : 12, bottom: 28, left: labelWidth }
  const plotWidth = Math.max(40, width - box.left - box.right)
  const plotHeight = Math.max(40, height - box.top - box.bottom)
  const y = (value: number) => box.top + plotHeight - (value / max) * plotHeight
  const labelEvery = Math.max(1, Math.ceil(categories.length / Math.max(1, Math.floor(plotWidth / (bare ? 36 : 72)))))
  const move = (index: number) => setActive(Math.min(categories.length - 1, Math.max(0, index)))
  const onKeyDown = (event: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: (active ?? -1) + 1, ArrowLeft: (active ?? categories.length) - 1, Home: 0, End: categories.length - 1 }
    if (event.key in keys) { event.preventDefault(); move(keys[event.key]) }
    if (event.key === 'Escape') setActive(null)
  }
  return { ref, width, active, setActive, ticks, y, box, plotWidth, plotHeight, labelEvery, onKeyDown }
}

function Axes({ ticks, y, box, width, axisFormat, categories, labelEvery, xOf, bare = false }: { ticks: number[]; y: (value: number) => number; box: { left: number; right: number; top: number }; width: number; axisFormat: ValueFormat; categories: readonly string[]; labelEvery: number; xOf: (index: number) => number; bare?: boolean }) {
  const bottom = y(0)
  return <g className="c-chart__axes">
    {!bare && ticks.map(tick => <g key={tick}><line x1={box.left} x2={width - box.right} y1={y(tick)} y2={y(tick)} className={tick === 0 ? 'c-chart__baseline' : 'c-chart__grid'} /><text x={box.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">{axisFormat(tick)}</text></g>)}
    {categories.map((category, index) => index % labelEvery === 0 && <text key={`${category}-${index}`} x={xOf(index)} y={bottom + 18} textAnchor={index === 0 && labelEvery > 1 ? 'start' : 'middle'}>{category}</text>)}
  </g>
}

const describe = (categories: readonly string[], series: readonly ChartSeries[], index: number, format: ValueFormat) => `${categories[index]}: ${series.map(item => `${item.label} ${format(item.values[index] ?? 0)}`).join(', ')}`

export type LineChartProps = CartesianProps & { /** Adds a 10% wash under the first series, the one the chart is about. */ area?: boolean }
/** Change over time for up to six series. Arrow keys move between points; a table view is always one click away. */
export function LineChart({ label, description, categories, series, height = 260, area = false, palette, valueFormat = defaultFormat, axisFormat = formatCompact }: LineChartProps) {
  const [showTable, setShowTable] = useState(false)
  const chart = useCartesian({ categories, series, height, axisFormat, stacked: false })
  const { ref, width, active, setActive, ticks, y, box, plotWidth, labelEvery, onKeyDown } = chart
  const step = categories.length > 1 ? plotWidth / (categories.length - 1) : 0
  const x = (index: number) => box.left + (categories.length > 1 ? index * step : plotWidth / 2)
  const onPointer = (event: PointerEvent<SVGRectElement>) => { const bounds = event.currentTarget.getBoundingClientRect(); setActive(step ? Math.round((event.clientX - bounds.left) / step) : 0) }
  const liveId = useId()
  return <ChartFrame palette={palette} label={label} description={description} chartIcon="ChartLine" legend={<Legend series={series} shape="line" />} showTable={showTable} onToggleTable={() => setShowTable(value => !value)} table={<SeriesTable label={label} categories={categories} series={series} format={valueFormat} />}>
    <div ref={ref} className="c-chart__plot" tabIndex={0} role="group" aria-roledescription="line chart" aria-label={`${label}. Use arrow keys to read values.`} aria-describedby={liveId} onKeyDown={onKeyDown} onBlur={() => setActive(null)}>
      <svg width={width} height={height} aria-hidden="true">
        <Axes ticks={ticks} y={y} box={box} width={width} axisFormat={axisFormat} categories={categories} labelEvery={labelEvery} xOf={x} />
        {series.map((item, seriesIndex) => {
          const points = item.values.map((value, index) => `${x(index)},${y(Math.max(0, value))}`)
          return <g key={item.id}>
            {area && seriesIndex === 0 && <path d={`M${x(0)},${y(0)} L${points.join(' L')} L${x(item.values.length - 1)},${y(0)} Z`} fill={seriesColor(seriesIndex)} className="c-chart__area" />}
            <polyline points={points.join(' ')} className="c-chart__line" stroke={seriesColor(seriesIndex)} />
            <circle cx={x(item.values.length - 1)} cy={y(Math.max(0, item.values[item.values.length - 1] ?? 0))} r={4} fill={seriesColor(seriesIndex)} className="c-chart__dot" />
          </g>
        })}
        {active !== null && <g>
          <line x1={x(active)} x2={x(active)} y1={box.top} y2={y(0)} className="c-chart__crosshair" />
          {series.map((item, seriesIndex) => <circle key={item.id} cx={x(active)} cy={y(Math.max(0, item.values[active] ?? 0))} r={5} fill={seriesColor(seriesIndex)} className="c-chart__dot" />)}
        </g>}
        <rect x={box.left - step / 2} y={0} width={plotWidth + step} height={height} fill="transparent" onPointerMove={onPointer} onPointerLeave={() => setActive(null)} />
      </svg>
      {active !== null && <Tooltip title={categories[active]} x={x(active)} width={width} shape="line" rows={series.map((item, index) => ({ label: item.label, value: valueFormat(item.values[active] ?? 0), index }))} />}
      <span id={liveId} className="c-chart__live" aria-live="polite">{active !== null ? describe(categories, series, active, valueFormat) : ''}</span>
    </div>
  </ChartFrame>
}

export type BarChartProps = CartesianProps & {
  /** Stack series into one column per category. */
  stacked?: boolean
  /** pill: one series as fully rounded columns on a light track, without a value axis. For a single, glanceable comparison inside a tile. */
  appearance?: 'standard' | 'pill'
  /** pill only: the category to emphasise; the others are drawn in ink. */
  highlight?: string
  /** pill only: print each value above its column. */
  showValues?: boolean
}
/** Magnitude by category. Grouped or stacked columns, capped at 24px thick with a 2px gap between touching marks. */
export function BarChart({ label, description, categories, series, height = 260, stacked = false, palette, appearance = 'standard', highlight, showValues = false, valueFormat = defaultFormat, axisFormat = formatCompact }: BarChartProps) {
  const [showTable, setShowTable] = useState(false)
  const pill = appearance === 'pill'
  if (pill) series = series.slice(0, 1)
  const chart = useCartesian({ categories, series, height, axisFormat, stacked: stacked && !pill, bare: pill })
  const { ref, width, active, setActive, ticks, y, box, plotWidth, labelEvery, onKeyDown } = chart
  const band = plotWidth / Math.max(1, categories.length)
  const x = (index: number) => box.left + band * index + band / 2
  const gap = 2
  const barWidth = pill ? Math.min(56, band * 0.72) : stacked ? Math.min(24, band * 0.6) : Math.min(24, (band * 0.72 - gap * (series.length - 1)) / Math.max(1, series.length))
  const bar = (left: number, top: number, bottom: number, rounded: boolean) => {
    const r = rounded ? Math.min(4, barWidth / 2, Math.max(0, bottom - top)) : 0
    return `M${left},${bottom} V${top + r} Q${left},${top} ${left + r},${top} H${left + barWidth - r} Q${left + barWidth},${top} ${left + barWidth},${top + r} V${bottom} Z`
  }
  const onPointer = (event: PointerEvent<SVGRectElement>) => { const bounds = event.currentTarget.getBoundingClientRect(); setActive(Math.min(categories.length - 1, Math.max(0, Math.floor((event.clientX - bounds.left) / band)))) }
  const liveId = useId()
  const total = (index: number) => series.reduce((sum, item) => sum + (item.values[index] ?? 0), 0)
  return <ChartFrame palette={palette} label={label} description={description} chartIcon="ChartColumn" legend={<Legend series={series} shape="block" />} showTable={showTable} onToggleTable={() => setShowTable(value => !value)} table={<SeriesTable label={label} categories={categories} series={series} format={valueFormat} />}>
    <div ref={ref} className="c-chart__plot" tabIndex={0} role="group" aria-roledescription="bar chart" aria-label={`${label}. Use arrow keys to read values.`} aria-describedby={liveId} onKeyDown={onKeyDown} onBlur={() => setActive(null)}>
      <svg width={width} height={height} aria-hidden="true">
        {active !== null && <rect x={box.left + band * active} y={box.top} width={band} height={y(0) - box.top} className="c-chart__band" />}
        <Axes ticks={ticks} y={y} box={box} width={width} axisFormat={axisFormat} categories={categories} labelEvery={labelEvery} xOf={x} bare={pill} />
        {pill && categories.map((category, index) => {
          const value = Math.max(0, series[0]?.values[index] ?? 0), left = x(index) - barWidth / 2, top = Math.min(y(value), y(0) - barWidth)
          const emphasis = highlight === undefined ? 'series' : highlight === category ? 'highlight' : 'muted'
          return <g key={category}>
            <rect x={left} y={box.top} width={barWidth} height={y(0) - box.top} rx={barWidth / 2} className="c-chart__track" />
            {value > 0 && <rect x={left} y={top} width={barWidth} height={y(0) - top} rx={barWidth / 2} className="c-chart__bar c-chart__pill" data-emphasis={emphasis} data-active={active === index || undefined} data-dim={active !== null && active !== index || undefined} />}
            {showValues && <text x={x(index)} y={top - 8} textAnchor="middle" className="c-chart__value">{valueFormat(value)}</text>}
          </g>
        })}
        {!pill && categories.map((category, index) => {
          if (stacked) {
            let base = 0
            const drawn = series.map((item, seriesIndex) => ({ item, seriesIndex, value: Math.max(0, item.values[index] ?? 0) })).filter(entry => entry.value > 0)
            return <g key={category}>{drawn.map((entry, order) => {
              const bottom = y(base) - (order > 0 ? gap : 0)
              base += entry.value
              return <path key={entry.item.id} d={bar(x(index) - barWidth / 2, Math.min(y(base), bottom), bottom, order === drawn.length - 1)} fill={seriesColor(entry.seriesIndex)} className="c-chart__bar" data-active={active === index || undefined} data-dim={active !== null && active !== index || undefined} />
            })}</g>
          }
          const groupWidth = barWidth * series.length + gap * (series.length - 1)
          return <g key={category}>{series.map((item, seriesIndex) => {
            const left = x(index) - groupWidth / 2 + seriesIndex * (barWidth + gap)
            return <path key={item.id} d={bar(left, y(Math.max(0, item.values[index] ?? 0)), y(0), true)} fill={seriesColor(seriesIndex)} className="c-chart__bar" data-active={active === index || undefined} data-dim={active !== null && active !== index || undefined} />
          })}</g>
        })}
        <rect x={box.left} y={0} width={plotWidth} height={height} fill="transparent" onPointerMove={onPointer} onPointerLeave={() => setActive(null)} />
      </svg>
      {active !== null && <Tooltip title={stacked && series.length > 1 ? `${categories[active]} · ${valueFormat(total(active))} total` : categories[active]} x={x(active)} width={width} shape="block" rows={series.map((item, index) => ({ label: item.label, value: valueFormat(item.values[active] ?? 0), index }))} />}
      <span id={liveId} className="c-chart__live" aria-live="polite">{active !== null ? describe(categories, series, active, valueFormat) : ''}</span>
    </div>
  </ChartFrame>
}

export type DonutSegment = { id: string; label: string; value: number }
export type DonutChartProps = { label: string; description?: string; segments: readonly DonutSegment[]; valueFormat?: ValueFormat; /** Text in the hole, e.g. the total. */ centerValue?: string; centerLabel?: string; size?: number; /** ring: thinner, rounded segments with open gaps and a larger centre figure. */ appearance?: 'solid' | 'ring'; /** Put the legend under the chart instead of beside it. */ legendPosition?: 'side' | 'bottom'; palette?: ChartPalette }
/** Part-to-whole for two to six parts. Extra parts fold into “Other”. The legend always carries the values. */
export function DonutChart({ label, description, segments, valueFormat = defaultFormat, centerValue, centerLabel, size = 184, appearance = 'solid', legendPosition = 'side', palette }: DonutChartProps) {
  const ring = appearance === 'ring'
  const [showTable, setShowTable] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const folded = segments.length > MAX_SLOTS ? [...segments.slice(0, MAX_SLOTS - 1), { id: 'other', label: 'Other', value: segments.slice(MAX_SLOTS - 1).reduce((sum, item) => sum + item.value, 0) }] : segments
  const total = folded.reduce((sum, item) => sum + Math.max(0, item.value), 0) || 1
  const radius = size / 2, inner = radius - 24, pad = 2 / radius, stroke = Math.max(14, size * 0.075), mid = radius - stroke / 2, ringGap = (stroke + 10) / mid
  let angle = -Math.PI / 2
  const point = (r: number, a: number) => `${radius + r * Math.cos(a)},${radius + r * Math.sin(a)}`
  const arcs = folded.map((segment, index) => {
    const sweep = (Math.max(0, segment.value) / total) * Math.PI * 2
    const start = angle + (folded.length > 1 ? pad / 2 : 0), end = angle + sweep - (folded.length > 1 ? pad / 2 : 0)
    angle += sweep
    const large = end - start > Math.PI ? 1 : 0
    const d = sweep >= Math.PI * 2 - 0.0001
      ? `M${point(radius, 0)} A${radius},${radius} 0 1 1 ${point(radius, Math.PI)} A${radius},${radius} 0 1 1 ${point(radius, 0)} M${point(inner, 0)} A${inner},${inner} 0 1 0 ${point(inner, Math.PI)} A${inner},${inner} 0 1 0 ${point(inner, 0)} Z`
      : `M${point(radius, start)} A${radius},${radius} 0 ${large} 1 ${point(radius, end)} L${point(inner, end)} A${inner},${inner} 0 ${large} 0 ${point(inner, start)} Z`
    const ringStart = angle - sweep + (folded.length > 1 ? ringGap / 2 : 0), ringEnd = angle - (folded.length > 1 ? ringGap / 2 : 0)
    const ringD = sweep >= Math.PI * 2 - 0.0001 ? `M${point(mid, -Math.PI / 2)} A${mid},${mid} 0 1 1 ${point(mid, Math.PI / 2)} A${mid},${mid} 0 1 1 ${point(mid, -Math.PI / 2)}` : `M${point(mid, ringStart)} A${mid},${mid} 0 ${ringEnd - ringStart > Math.PI ? 1 : 0} 1 ${point(mid, ringEnd)}`
    return { segment, index, d: ring ? ringD : d, visible: ring ? ringEnd > ringStart : end > start }
  })
  const percent = (value: number) => `${Math.round((value / total) * 100)}%`
  return <ChartFrame palette={palette} label={label} description={description} chartIcon="ChartPie" showTable={showTable} onToggleTable={() => setShowTable(value => !value)} table={<Table label={label} rows={folded} rowKey={row => row.id} columns={[{ id: 'label', header: 'Part', render: row => <Text variant="small">{row.label}</Text> }, { id: 'value', header: 'Value', render: row => <Text variant="small" className="c-chart__number">{valueFormat(row.value)}</Text> }, { id: 'share', header: 'Share', render: row => <Text variant="small" className="c-chart__number">{percent(row.value)}</Text> }]} />}>
    <div className="c-donut" data-legend={legendPosition} data-appearance={appearance}>
      <div className="c-donut__figure" style={{ width: size, height: size }}>
        <svg width={size} height={size} aria-hidden="true">{arcs.map(arc => arc.visible && <path key={arc.segment.id} d={arc.d} fillRule="evenodd" {...(ring ? { fill: 'none', strokeWidth: stroke, strokeLinecap: 'round' as const, stroke: arc.segment.id === 'other' && segments.length > MAX_SLOTS ? 'var(--a-color-secondary)' : seriesColor(arc.index) } : {})} fill={ring ? 'none' : arc.segment.id === 'other' && segments.length > MAX_SLOTS ? 'var(--a-color-secondary)' : seriesColor(arc.index)} className="c-chart__bar" data-active={active === arc.segment.id || undefined} data-dim={active !== null && active !== arc.segment.id || undefined} onPointerEnter={() => setActive(arc.segment.id)} onPointerLeave={() => setActive(null)} />)}</svg>
        {(centerValue || centerLabel) && <div className="c-donut__center">{centerValue && <Text as="span" variant={ring ? 'display' : 'h4'} className="c-chart__figure">{centerValue}</Text>}{centerLabel && <Text as="span" variant="small" tone="secondary">{centerLabel}</Text>}</div>}
      </div>
      <ul className="c-donut__legend" aria-label={`${label} values`}>{arcs.map(arc => <li key={arc.segment.id} data-active={active === arc.segment.id || undefined} onPointerEnter={() => setActive(arc.segment.id)} onPointerLeave={() => setActive(null)}>
        <span className="c-chart__key" data-shape="block" style={{ background: arc.segment.id === 'other' && segments.length > MAX_SLOTS ? 'var(--a-color-secondary)' : seriesColor(arc.index) }} aria-hidden="true" />
        <Text as="span" variant="small" className="c-donut__label">{arc.segment.label}</Text>
        <Text as="span" variant="h7" className="c-chart__number c-donut__value">{valueFormat(arc.segment.value)}</Text>
        <Text as="span" variant="small" tone="secondary" className="c-chart__number c-donut__share">{percent(arc.segment.value)}</Text>
      </li>)}</ul>
    </div>
  </ChartFrame>
}

export type BarListItem = { id: string; label: string; value: number; href?: string }
export type BarListProps = { label: string; items: readonly BarListItem[]; valueFormat?: ValueFormat; valueHeader?: string; palette?: ChartPalette }
/** A ranked list with proportional bars: top pages, sources, products. The text stays readable over a light wash. */
export function BarList({ label, items, valueFormat = defaultFormat, valueHeader = 'Value', palette = 'categorical' }: BarListProps) {
  const max = Math.max(1, ...items.map(item => item.value))
  return <div className="c-bar-list" role="table" aria-label={label} data-palette={palette}>
    <div className="c-bar-list__head" role="row"><Text as="span" role="columnheader" variant="small" tone="secondary">Name</Text><Text as="span" role="columnheader" variant="small" tone="secondary">{valueHeader}</Text></div>
    {items.map(item => <div key={item.id} className="c-bar-list__row" role="row" data-link={item.href ? true : undefined}>
      <span role="cell" className="c-bar-list__bar"><span className="c-bar-list__fill" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} aria-hidden="true" />{item.href ? <a href={item.href}><Text as="span" variant="small" tone="inherit">{item.label}</Text></a> : <Text as="span" variant="small">{item.label}</Text>}</span>
      <Text as="span" role="cell" variant="h7" className="c-chart__number">{valueFormat(item.value)}</Text>
    </div>)}
  </div>
}

export type SparklineProps = { label: string; values: readonly number[]; height?: number; tone?: 'series' | 'neutral'; /** Three hairlines behind the line, for a sparkline that stands on its own in a tile. */ grid?: boolean }
/** A word-sized trend without axes. Use it beside a figure, never alone. */
export function Sparkline({ label, values, height = 36, tone = 'series', grid = false }: SparklineProps) {
  const [ref, width] = useElementWidth<HTMLSpanElement>(120)
  const min = Math.min(...values), max = Math.max(...values), span = max - min || 1, inset = 5
  const x = (index: number) => inset + (values.length > 1 ? (index / (values.length - 1)) * (width - inset * 2) : (width - inset * 2) / 2)
  const y = (value: number) => inset + (1 - (value - min) / span) * (height - inset * 2)
  const last = values.length - 1
  return <span ref={ref} className="c-sparkline" role="img" aria-label={`${label}: ${values.length ? `from ${defaultFormat(values[0])} to ${defaultFormat(values[last])}` : 'no data'}`} data-tone={tone}>
    {values.length > 0 && <svg width={width} height={height} aria-hidden="true">{grid && [0, 0.5, 1].map(step => <line key={step} x1={0} x2={width} y1={inset + step * (height - inset * 2)} y2={inset + step * (height - inset * 2)} className="c-chart__grid" />)}<polyline points={values.map((value, index) => `${x(index)},${y(value)}`).join(' ')} className="c-chart__line" /><circle cx={x(last)} cy={y(values[last])} r={4} className="c-chart__dot c-sparkline__end" /></svg>}
  </span>
}

export type StatDelta = { value: string; direction: 'up' | 'down' | 'flat'; /** Whether this direction is good news. Defaults to up = good. */ positive?: boolean; period?: string }
export type StatCardProps = { label: string; value: string; delta?: StatDelta; trend?: readonly number[]; description?: string; icon?: IconName; className?: string }
/** A labelled figure with an optional change and trend. The delta pairs an arrow with text, so meaning never rests on colour. */
export function StatCard({ label, value, delta, trend, description, icon, className = '' }: StatCardProps) {
  const good = delta ? (delta.positive ?? (delta.direction === 'up')) : undefined
  const sentiment = !delta || delta.direction === 'flat' ? 'neutral' : good ? 'positive' : 'negative'
  return <div className={`c-stat ${className}`.trim()} role="group" aria-label={label}>
    <Stack gap={2}>
      <Inline gap={2} className="c-stat__label">{icon && <Icon name={icon} size="small" />}<Text as="span" variant="small" tone="secondary">{label}</Text></Inline>
      <Text as="span" variant="h2" className="c-chart__figure">{value}</Text>
      {delta && <Inline gap={2}>
        <span className="c-stat__delta" data-sentiment={sentiment}><Icon name={delta.direction === 'up' ? 'arrowUp' : delta.direction === 'down' ? 'arrowDown' : 'minus'} size="small" /><Text as="span" variant="h7" tone="inherit">{delta.value}</Text><span className="c-chart__live">{sentiment === 'positive' ? ' (improvement)' : sentiment === 'negative' ? ' (decline)' : ''}</span></span>
        {delta.period && <Text as="span" variant="small" tone="secondary">{delta.period}</Text>}
      </Inline>}
      {description && <Text variant="small" tone="secondary">{description}</Text>}
    </Stack>
    {trend && trend.length > 1 && <Sparkline label={`${label} trend`} values={trend} />}
  </div>
}

const share = (value: number, total: number) => `${Math.round((value / (total || 1)) * 1000) / 10}%`

export type GaugeProps = { label: string; segments: readonly DonutSegment[]; centerValue?: string; centerLabel?: string; valueFormat?: ValueFormat; size?: number; palette?: ChartPalette; /** pill: rounded segments with open gaps. */ appearance?: 'solid' | 'pill' }
/** Part-to-whole on a half circle, with the total in the middle. Best for two to four parts; the legend carries every share. */
export function Gauge({ label, segments, centerValue, centerLabel, valueFormat = defaultFormat, size: maxSize = 280, palette, appearance = 'solid' }: GaugeProps) {
  const [showTable, setShowTable] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [ref, available] = useElementWidth<HTMLDivElement>(maxSize)
  const size = Math.max(140, Math.min(maxSize, available))
  const parts = segments.slice(0, MAX_SLOTS)
  const total = parts.reduce((sum, item) => sum + Math.max(0, item.value), 0) || 1
  const radius = size / 2, thickness = Math.max(24, size * 0.14), inner = radius - thickness, pad = 3 / radius, pillWidth = Math.max(16, size * 0.085)
  const point = (r: number, a: number) => `${radius + r * Math.cos(a)},${radius + r * Math.sin(a)}`
  let angle = Math.PI
  const arcs = parts.map((segment, index) => {
    const sweep = (Math.max(0, segment.value) / total) * Math.PI
    const start = angle + (index > 0 ? pad / 2 : 0), end = angle + sweep - (index < parts.length - 1 ? pad / 2 : 0)
    angle += sweep
    const mid = radius - pillWidth / 2 - 2, cap = (pillWidth / 2 + 2) / mid
    const pillStart = start - pad / 2 + (index > 0 ? cap : pillWidth / 2 / mid), pillEnd = end + pad / 2 - (index < parts.length - 1 ? cap : pillWidth / 2 / mid)
    return appearance === 'pill'
      ? { segment, index, visible: pillEnd > pillStart, pill: true, d: `M${point(mid, pillStart)} A${mid},${mid} 0 0 1 ${point(mid, pillEnd)}` }
      : { segment, index, visible: end > start, pill: false, d: `M${point(radius, start)} A${radius},${radius} 0 0 1 ${point(radius, end)} L${point(inner, end)} A${inner},${inner} 0 0 0 ${point(inner, start)} Z` }
  })
  return <ChartFrame palette={palette} label={label} chartIcon="Gauge" showTable={showTable} onToggleTable={() => setShowTable(value => !value)} table={<Table label={label} rows={parts} rowKey={row => row.id} columns={[{ id: 'label', header: 'Part', render: row => <Text variant="small">{row.label}</Text> }, { id: 'value', header: 'Value', render: row => <Text variant="small" className="c-chart__number">{valueFormat(row.value)}</Text> }, { id: 'share', header: 'Share', render: row => <Text variant="small" className="c-chart__number">{share(row.value, total)}</Text> }]} />}>
    <div className="c-gauge" ref={ref}>
      <div className="c-gauge__figure" style={{ width: size, height: radius + 4 }}>
        <svg width={size} height={radius + 4} aria-hidden="true">{arcs.map(arc => arc.visible && <path key={arc.segment.id} d={arc.d} {...(arc.pill ? { fill: 'none', stroke: seriesColor(arc.index), strokeWidth: pillWidth, strokeLinecap: 'round' as const } : { fill: seriesColor(arc.index) })} className="c-chart__bar" data-active={active === arc.segment.id || undefined} data-dim={active !== null && active !== arc.segment.id || undefined} onPointerEnter={() => setActive(arc.segment.id)} onPointerLeave={() => setActive(null)} />)}</svg>
        {(centerValue || centerLabel) && <div className="c-gauge__center">{centerValue && <Text as="span" variant="h2" className="c-chart__figure">{centerValue}</Text>}{centerLabel && <Text as="span" variant="small" tone="secondary">{centerLabel}</Text>}</div>}
      </div>
      <ul className="c-gauge__legend" aria-label={`${label} values`}>{parts.map((segment, index) => <li key={segment.id} data-active={active === segment.id || undefined} onPointerEnter={() => setActive(segment.id)} onPointerLeave={() => setActive(null)}>
        <span className="c-gauge__key"><span className="c-chart__key" data-shape="block" style={{ background: seriesColor(index), borderRadius: '50%' }} aria-hidden="true" /><Text as="span" variant="small">{segment.label}</Text></span>
        <Text as="span" variant="h7" className="c-chart__number">{share(segment.value, total)}</Text>
      </li>)}</ul>
    </div>
  </ChartFrame>
}

export type ProportionBarProps = { label: string; segments: readonly DonutSegment[]; valueFormat?: ValueFormat; palette?: ChartPalette }
/** A single bar split into its parts, with each share printed above its part. Reads well at small sizes; up to six parts. */
export function ProportionBar({ label, segments, valueFormat = defaultFormat, palette = 'categorical' }: ProportionBarProps) {
  const parts = segments.slice(0, MAX_SLOTS)
  const total = parts.reduce((sum, item) => sum + Math.max(0, item.value), 0) || 1
  return <figure className="c-proportion" aria-label={label} data-palette={palette}>
    <div className="c-proportion__track" aria-hidden="true">{parts.map((segment, index) => <div key={segment.id} className="c-proportion__part" style={{ flexGrow: Math.max(0, segment.value) || 0.0001 }}>
      <Text as="span" variant="h7" className="c-chart__number">{share(segment.value, total)}</Text>
      <span className="c-proportion__fill" style={{ background: seriesColor(index) }} />
    </div>)}</div>
    <ul className="c-proportion__legend" aria-label={`${label} values`}>{parts.map((segment, index) => <li key={segment.id}>
      <span className="c-chart__key" data-shape="block" style={{ background: seriesColor(index), borderRadius: '50%' }} aria-hidden="true" />
      <Text as="span" variant="small">{segment.label}</Text>
      <span className="c-chart__live">{`: ${valueFormat(segment.value)}, ${share(segment.value, total)}`}</span>
    </li>)}</ul>
  </figure>
}

export type HeatmapProps = { label: string; description?: string; rows: readonly string[]; columns: readonly string[]; /** values[row][column] */ values: readonly (readonly number[])[]; valueFormat?: ValueFormat; /** Number of colour steps, 3 to 5. */ steps?: 3 | 4 | 5; /** compact: small square cells for many columns, such as twelve months. */ density?: 'default' | 'compact' }
const heatSteps = ['var(--a-color-blue-300)', 'var(--a-color-blue-400)', 'var(--a-color-blue-500)', 'var(--a-color-blue-700)', 'var(--a-color-blue-900)']
/** Magnitude across two categories, such as weekday by hour. One hue from light to dark; arrow keys move between cells. */
export function Heatmap({ label, description, rows, columns, values, valueFormat = defaultFormat, steps = 5, density = 'default' }: HeatmapProps) {
  const [showTable, setShowTable] = useState(false)
  const [active, setActive] = useState<[number, number] | null>(null)
  const flat = values.flat(), min = flat.length ? Math.min(...flat) : 0, max = flat.length ? Math.max(...flat) : 0, span = max - min || 1
  const palette = steps === 3 ? [heatSteps[0], heatSteps[2], heatSteps[4]] : steps === 4 ? [heatSteps[0], heatSteps[1], heatSteps[3], heatSteps[4]] : heatSteps
  const bin = (value: number) => Math.min(palette.length - 1, Math.floor(((value - min) / span) * palette.length))
  const bounds = palette.map((_, index) => min + (span / palette.length) * index)
  const liveId = useId()
  const onKeyDown = (event: KeyboardEvent) => {
    if (!rows.length || !columns.length) return
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']
    if (keys.includes(event.key) && !active) { event.preventDefault(); setActive([0, 0]); return }
    const [r, c] = active ?? [0, 0]
    const next: Record<string, [number, number]> = { ArrowRight: [r, Math.min(columns.length - 1, c + 1)], ArrowLeft: [r, Math.max(0, c - 1)], ArrowDown: [Math.min(rows.length - 1, r + 1), c], ArrowUp: [Math.max(0, r - 1), c], Home: [r, 0], End: [r, columns.length - 1] }
    if (event.key in next) { event.preventDefault(); setActive(next[event.key]) }
    if (event.key === 'Escape') setActive(null)
  }
  const table = <Table label={label} rows={rows.map((row, index) => ({ row, index }))} rowKey={row => `${row.index}`} columns={[{ id: 'row', header: '', render: row => <Text variant="small">{row.row}</Text> }, ...columns.map((column, c) => ({ id: `c${c}`, header: column, render: (row: { index: number }) => <Text variant="small" className="c-chart__number">{valueFormat(values[row.index]?.[c] ?? 0)}</Text> }))]} />
  return <ChartFrame label={label} description={description} chartIcon="Grid3x3" showTable={showTable} onToggleTable={() => setShowTable(value => !value)} table={table}
    legend={<ul className="c-heatmap__scale" aria-label="Colour scale">{palette.map((color, index) => <li key={color}><span className="c-chart__key" data-shape="block" style={{ background: color }} aria-hidden="true" /><Text as="span" variant="small" tone="secondary">{index === 0 ? `Under ${valueFormat(bounds[1] ?? max)}` : index === palette.length - 1 ? `${valueFormat(bounds[index])}+` : `${valueFormat(bounds[index])}–${valueFormat(bounds[index + 1])}`}</Text></li>)}</ul>}>
    <div className="c-heatmap" data-density={density} tabIndex={0} role="group" aria-roledescription="heatmap" aria-label={`${label}. Use arrow keys to read values.`} aria-describedby={liveId} onKeyDown={onKeyDown} onBlur={() => setActive(null)} onPointerLeave={() => setActive(null)} style={{ gridTemplateColumns: `auto repeat(${columns.length}, minmax(0, 1fr))` }}>
      {rows.map((row, r) => [<Text key={`label-${row}`} as="span" variant="small" tone="secondary" className="c-heatmap__row">{row}</Text>, ...columns.map((column, c) => {
        const value = values[r]?.[c] ?? 0
        return <span key={`${row}-${column}`} className="c-heatmap__cell" data-active={active?.[0] === r && active?.[1] === c || undefined} style={{ background: palette[bin(value)] }} onPointerEnter={() => setActive([r, c])} aria-hidden="true">{active?.[0] === r && active?.[1] === c && <span className="c-chart__tooltip c-heatmap__tip"><Text variant="small" tone="secondary">{row} · {column}</Text><Text as="span" variant="h7" className="c-chart__number">{valueFormat(value)}</Text></span>}</span>
      })])}
      <span />{columns.map(column => <Text key={`col-${column}`} as="span" variant="small" tone="secondary" className="c-heatmap__column">{density === 'compact' ? <><span className="c-heatmap__column-full">{column}</span><span className="c-heatmap__column-short" aria-hidden="true">{column.slice(0, 1)}</span></> : column}</Text>)}
      <span id={liveId} className="c-chart__live" aria-live="polite">{active ? `${rows[active[0]]}, ${columns[active[1]]}: ${valueFormat(values[active[0]]?.[active[1]] ?? 0)}` : ''}</span>
    </div>
  </ChartFrame>
}
