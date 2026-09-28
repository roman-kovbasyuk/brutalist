import { Icon, Text } from '../atoms'
import './workflow.css'
export type WorkflowStep = { id: string; label: string; description?: string; complete?: boolean; disabled?: boolean }
export type WorkflowStepsProps = { label: string; steps: readonly WorkflowStep[]; current: string; onChange?: (id: string) => void; orientation?: 'horizontal' | 'vertical'; disabled?: boolean; readOnly?: boolean }
export function WorkflowSteps({ label, steps, current, onChange, orientation = 'horizontal', disabled = false, readOnly = false }: WorkflowStepsProps) {
  const interactive = !readOnly && Boolean(onChange)
  return <nav className="c-workflow" aria-label={label} data-orientation={orientation}><ol>{steps.map((step, index) => {
    const state = step.id === current ? 'current' : step.complete ? 'complete' : 'upcoming'
    const content = <>
      <span className="c-workflow__circle">{state === 'complete' ? <Icon name="check" size="small" /> : <Text as="span" variant="h7" tone="inherit">{index + 1}</Text>}</span>
      <span className="c-workflow__copy">
        <Text as="span" variant="h7" tone={state === 'upcoming' ? 'secondary' : 'ink'}>{step.label}</Text>
        {step.description && <Text as="span" variant="small" tone="secondary">{step.description}</Text>}
      </span>
    </>
    return <li key={step.id} data-state={state} aria-current={!interactive && state === 'current' ? 'step' : undefined}>
      {interactive ? <button type="button" className="c-workflow__step" aria-current={state === 'current' ? 'step' : undefined} disabled={disabled || step.disabled} onClick={() => onChange?.(step.id)}>{content}</button> : <div className="c-workflow__step">{content}</div>}
    </li>
  })}</ol></nav>
}
