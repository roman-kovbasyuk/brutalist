import { Icon, Inline, Text, Surface, Stack, Heading } from '../atoms'
import type { ReactNode } from 'react'
import './loading.css'
export type SpinnerProps = { label: string }
/** A block glides clockwise around a 2×2 grid of slots, easing in and out of each one. */
function SpinnerMark() {
  const slots = [[1.5, 1.5], [13.5, 1.5], [13.5, 13.5], [1.5, 13.5]]
  return <svg className="c-spinner__mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <g className="c-spinner__slots">{slots.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" rx="1.5" />)}</g>
    <rect className="c-spinner__block" x="1.5" y="1.5" width="9" height="9" rx="1.5" />
  </svg>
}
export function Spinner({ label }: SpinnerProps) { return <Inline gap={3} className="c-spinner" role="status" aria-label={label}><SpinnerMark /><Text variant="small">{label}</Text></Inline> }
export type SkeletonProps = { label?: string; lines?: number }
export function Skeleton({ label = 'Loading', lines = 3 }: SkeletonProps) { return <Stack gap={3} className="c-skeleton" role="status" aria-label={label}>{Array.from({ length: Math.min(10, Math.max(1, Math.floor(lines) || 1)) }, (_, i) => <span key={i} aria-hidden="true" />)}</Stack> }
export type EmptyStateProps = { title: string; description?: string; action?: ReactNode }
export function EmptyState({ title, description, action }: EmptyStateProps) { return <Surface padding={8} className="c-empty-state"><Stack gap={3}><Icon name="folder" size="large" /><Heading level={3} variant="h5">{title}</Heading>{description && <Text tone="secondary">{description}</Text>}{action}</Stack></Surface> }
