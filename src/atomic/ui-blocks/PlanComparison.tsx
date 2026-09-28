import { useId, type CSSProperties } from 'react'
import { Heading, Icon, Text } from '../atoms'
import { Badge, Button, SectionHeading, SegmentedControl, Table, type TableColumn } from '../components'
import './plan-comparison.css'

/** A formatted price supplied by the caller. The block never calculates or converts it. */
export type PlanPrice = { value: string; suffix?: string; note?: string }
/** One feature entry. Features are joined across plans by `id`; a boolean reads as included or not included. */
export type PlanFeature = { id: string; label: string; value: string | boolean }
export type PlanPeriod = { id: string; label: string }
export type PlanComparisonPlan = {
  id: string
  name: string
  description?: string
  /** Marks the plan with a visible badge and a stronger edge. */
  featured?: boolean
  /** Prices keyed by period id, or by `default` when the section has no billing periods. */
  prices: Readonly<Record<string, PlanPrice>>
  features: readonly PlanFeature[]
  /** Destination for choosing the plan. Omitted while the plan has no price for the current period. */
  action: { label: string; href: string }
  /** Shown instead of a price the plan does not supply. Defaults to “Price unavailable”. */
  unavailableLabel?: string
}
export type PlanComparisonProps = {
  title: string
  description?: string
  headingLevel?: 1 | 2 | 3
  layout?: 'cards' | 'table'
  periods?: readonly PlanPeriod[]
  /** The selected period id. Controlled: the displayed prices change only when this prop changes. */
  period?: string
  onPeriodChange?: (id: string) => void
  plans: readonly PlanComparisonPlan[]
}

type Row = { kind: 'price' } | { kind: 'feature'; id: string; label: string }

const UNAVAILABLE = 'Price unavailable'
const FEATURED = 'Recommended'

function FeatureValue({ value }: { value: PlanFeature['value'] | undefined }) {
  if (value === undefined) return <Text as="span" variant="small" tone="secondary">Not specified</Text>
  if (typeof value === 'boolean') return <span className="b-plan-comparison__mark" data-included={value}>
    <Icon name={value ? 'check' : 'close'} size="small" />
    <span className="b-plan-comparison__assistive">{value ? 'Included' : 'Not included'}</span>
  </span>
  return <Text as="span" variant="h7">{value}</Text>
}

function PriceView({ price, unavailable, size }: { price: PlanPrice | undefined; unavailable: string; size: 'cards' | 'table' }) {
  if (!price) return <Text variant={size === 'cards' ? 'h5' : 'h6'} tone="secondary" className="b-plan-comparison__unavailable">{unavailable}</Text>
  return <div className="b-plan-comparison__price">
    <p className="b-plan-comparison__amount">
      <Text as="span" variant={size === 'cards' ? 'display' : 'h3'}>{price.value}</Text>
      {price.suffix && <>{' '}<Text as="span" variant="small" tone="secondary">{price.suffix}</Text></>}
    </p>
    {price.note && <Text variant="small" tone="secondary">{price.note}</Text>}
  </div>
}

/** Compares supplied plans as cards or as a feature table. Billing periods are controlled by the caller. */
export function PlanComparison({ title, description, headingLevel = 2, layout = 'cards', periods, period, onPeriodChange, plans }: PlanComparisonProps) {
  const baseId = useId()
  const titleId = `${baseId}-title`
  const planLevel = (headingLevel + 1) as 2 | 3 | 4
  const activePeriod = period ?? periods?.[0]?.id ?? 'default'
  const showSwitch = Boolean(periods?.length && period !== undefined && onPeriodChange)
  const periodLabel = periods?.find(item => item.id === activePeriod)?.label
  const nameId = (index: number) => `${baseId}-plan-${index}`

  const periodSwitch = showSwitch && periods && onPeriodChange
    // Wrapped so the heading's action slot sizes the wrapper, not the control's own scroll area.
    ? <div className="b-plan-comparison__period"><SegmentedControl label="Billing period" options={periods.map(item => ({ value: item.id, label: item.label }))} value={period} onChange={onPeriodChange} /></div>
    : undefined

  // A plan without a price for the current period has nothing to choose, so its action is omitted.
  const action = (plan: PlanComparisonPlan, describedBy?: string) => plan.prices[activePeriod]
    ? <Button href={plan.action.href} variant={plan.featured ? 'primary' : 'secondary'} fullWidth aria-describedby={describedBy}>{plan.action.label}</Button>
    : null

  // Every card renders the same slots, so a subgrid lines up names, prices, features and actions across cards.
  const hasDescription = plans.some(plan => plan.description)
  const hasFeatures = plans.some(plan => plan.features.length > 0)
  const cards = <ul className="b-plan-comparison__plans" style={{ '--plan-rows': 3 + Number(hasDescription) + Number(hasFeatures) } as CSSProperties}>
    {plans.map((plan, index) => <li key={plan.id} className="b-plan-comparison__plan" data-featured={plan.featured || undefined}>
      <div className="b-plan-comparison__plan-header">
        <Heading id={nameId(index)} level={planLevel} variant="h4">{plan.name}</Heading>
        {plan.featured && <Badge tone="accent">{FEATURED}</Badge>}
      </div>
      {hasDescription && <div>{plan.description && <Text tone="secondary">{plan.description}</Text>}</div>}
      <PriceView price={plan.prices[activePeriod]} unavailable={plan.unavailableLabel ?? UNAVAILABLE} size="cards" />
      {hasFeatures && (plan.features.length > 0 ? <ul className="b-plan-comparison__features" aria-label={`${plan.name} features`}>
        {plan.features.map(feature => <li key={feature.id} className="b-plan-comparison__feature">
          <Text as="span" tone={feature.value === false ? 'secondary' : 'ink'} className="b-plan-comparison__feature-label">{feature.label}</Text>
          <FeatureValue value={feature.value} />
        </li>)}
      </ul> : <div />)}
      <div className="b-plan-comparison__action-slot">{action(plan, nameId(index))}</div>
    </li>)}
  </ul>

  const anyFeatured = plans.some(plan => plan.featured)
  const featureRows = new Map<string, string>()
  for (const plan of plans) for (const feature of plan.features) if (!featureRows.has(feature.id)) featureRows.set(feature.id, feature.label)
  const rows: Row[] = [{ kind: 'price' }, ...[...featureRows].map(([id, label]) => ({ kind: 'feature' as const, id, label }))]
  const columns: TableColumn<Row>[] = [
    { id: 'feature', header: 'Feature', render: row => row.kind === 'price'
      ? <span className="b-plan-comparison__row-label"><Text as="span" variant="h7">Price</Text>{periodLabel && <Text as="span" variant="small" tone="secondary">{periodLabel}</Text>}</span>
      : <Text as="span">{row.label}</Text> },
    ...plans.map((plan): TableColumn<Row> => ({
      id: plan.id,
      header: plan.name,
      render: row => <div className="b-plan-comparison__cell" data-featured={plan.featured || undefined}>
        {row.kind === 'price'
          ? <>
            {plan.featured
              ? <Badge tone="accent">{FEATURED}</Badge>
              // Reserves the badge's height so prices and actions stay on one line across columns.
              : anyFeatured && <span className="b-plan-comparison__badge-space" aria-hidden="true"><Badge tone="accent">{FEATURED}</Badge></span>}
            <PriceView price={plan.prices[activePeriod]} unavailable={plan.unavailableLabel ?? UNAVAILABLE} size="table" />
            {action(plan)}
          </>
          : <FeatureValue value={plan.features.find(feature => feature.id === row.id)?.value} />}
      </div>,
    })),
  ]
  const table = <div className="b-plan-comparison__table">
    <Table label={title} rows={rows} rowKey={row => row.kind === 'price' ? 'price' : `feature-${row.id}`} columns={columns} />
  </div>

  return <section className="b-plan-comparison" data-layout={layout} aria-labelledby={titleId} style={{ '--plan-count': Math.max(1, plans.length) } as CSSProperties}>
    <SectionHeading id={titleId} level={headingLevel} variant="h2" title={title} description={description} actions={periodSwitch} />
    {layout === 'table' ? table : cards}
  </section>
}
