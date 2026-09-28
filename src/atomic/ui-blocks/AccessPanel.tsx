import type { ReactNode } from 'react'
import { Alert, CheckboxCard, Fieldset, Form, FormActions, Panel, RadioCardGroup, type RadioCardGroupProps, type SubmissionState } from '../components'
import './settings-blocks.css'

export type AccessValue = { roleId: string; permissionIds: readonly string[] }
export type AccessPanelProps = {
  title: string
  /** Optional line under the title, such as who the access applies to. */
  description?: ReactNode
  value: AccessValue
  onChange: (value: AccessValue) => void
  roles: RadioCardGroupProps['options']
  permissions?: readonly { id: string; label: string; description?: string; disabled?: boolean; reason?: string }[]
  onSubmit: (value: AccessValue) => void
  onCancel?: () => void
  state?: SubmissionState
  readOnly?: boolean
}

export function AccessPanel({ title, description, value, onChange, roles, permissions = [], onSubmit, onCancel, state = { status: 'idle' }, readOnly = false }: AccessPanelProps) {
  const pending = state.status === 'pending'
  const disabled = pending || readOnly
  const toggle = (id: string, checked: boolean) => onChange({ ...value, permissionIds: checked ? [...value.permissionIds, id] : value.permissionIds.filter(current => current !== id) })
  return <Panel title={title} description={description} headingLevel={2} variant="split" className="b-settings-panel b-access-panel">
    <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!disabled) onSubmit(value) }}>
      <div className="b-settings-panel__sections">
        <RadioCardGroup className="b-settings-panel__section" label="Role" options={roles} value={value.roleId} disabled={disabled} onChange={roleId => onChange({ ...value, roleId })} />
        {permissions.length > 0 && <Fieldset className="b-settings-panel__section" legend="Permissions" disabled={disabled}>
          <div className="b-settings-panel__controls">{permissions.map(permission => <CheckboxCard key={permission.id} label={permission.label} description={[permission.description, permission.disabled ? permission.reason : undefined].filter(Boolean).join(' ')} checked={value.permissionIds.includes(permission.id)} disabled={permission.disabled || disabled} onChange={event => toggle(permission.id, event.currentTarget.checked)} />)}</div>
        </Fieldset>}
      </div>
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
      {!readOnly && <div className="b-settings-panel__footer"><FormActions onCancel={onCancel} submitLabel="Save access" busy={pending} disabled={pending} /></div>}
    </Form>
  </Panel>
}
