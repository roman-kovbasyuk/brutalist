import './data-display.css'

export type MeterProps = {
  label: string
  value: number
  min?: number
  max?: number
  valueText?: string
  low?: number
  high?: number
  optimum?: number
}

function normalizedBounds(min: number, max: number): [number, number] {
  return Number.isFinite(min) && Number.isFinite(max) && max > min ? [min, max] : [0, 100]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function Meter({ label, value, min = 0, max = 100, valueText, low, high, optimum }: MeterProps) {
  const [boundedMin, boundedMax] = normalizedBounds(min, max)
  const boundedValue = Number.isFinite(value) ? clamp(value, boundedMin, boundedMax) : boundedMin
  const boundedLow = low !== undefined && Number.isFinite(low) ? clamp(low, boundedMin, boundedMax) : undefined
  const boundedHigh = high !== undefined && Number.isFinite(high) ? clamp(high, boundedMin, boundedMax) : undefined
  const hasOrderedThresholds = boundedLow === undefined || boundedHigh === undefined || boundedLow <= boundedHigh
  const boundedOptimum = optimum !== undefined && Number.isFinite(optimum) ? clamp(optimum, boundedMin, boundedMax) : undefined

  return <meter className="c-meter" aria-label={label} min={boundedMin} max={boundedMax} value={boundedValue}
    aria-valuetext={valueText} low={hasOrderedThresholds ? boundedLow : undefined} high={hasOrderedThresholds ? boundedHigh : undefined}
    optimum={boundedOptimum} />
}
