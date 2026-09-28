import type { ReactNode } from 'react'
import { Alert, Fieldset, Form, FormActions, Panel, type SubmissionState } from '../components'
import './settings-blocks.css'

export type PreferencesPanelProps = {
  title: string
  /** Optional line under the title. */
  description?: ReactNode
  sections: readonly { id: string; title: string; description?: string; content: ReactNode }[]
  onSubmit: () => void
  onCancel?: () => void
  state?: SubmissionState
  readOnly?: boolean
}

export function PreferencesPanel({ title, description, sections, onSubmit, onCancel, state = { status: 'idle' }, readOnly = false }: PreferencesPanelProps) {
  const pending = state.status === 'pending'
  const disabled = readOnly || pending
  return <Panel title={title} description={description} headingLevel={2} variant="split" className="b-settings-panel">
    <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!disabled) onSubmit() }}>
      <div className="b-settings-panel__sections">
        {sections.map(section => <Fieldset key={section.id} className="b-settings-panel__section" legend={section.title} instructions={section.description} disabled={disabled}>
          <div className="b-settings-panel__controls">{section.content}</div>
        </Fieldset>)}
      </div>
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
      {!readOnly && <div className="b-settings-panel__footer"><FormActions onCancel={onCancel} submitLabel="Save changes" busy={pending} disabled={pending} /></div>}
    </Form>
  </Panel>
}
