import type { ReactNode } from 'react'
import { Alert, Avatar, Button, FileDropzone, Form, FormActions, Panel, TextArea, TextField, type FileDropzoneProps, type SubmissionState } from '../components'
import './settings-blocks.css'
import './profile-blocks.css'

export type ProfileSettingsValue = { name: string; email: string; description: string }
export type ProfileSettingsProps = {
  title: string
  /** Optional line under the title. */
  description?: ReactNode
  value: ProfileSettingsValue
  onChange: (value: ProfileSettingsValue) => void
  onSubmit: (value: ProfileSettingsValue) => void
  onCancel?: () => void
  state?: SubmissionState
  errors?: Partial<Record<keyof ProfileSettingsValue, string>>
  readOnly?: boolean
  avatarSrc?: string
  onAvatarFiles?: (files: File[]) => void
  avatarUpload?: FileDropzoneProps['state']
  avatarError?: string
}

export function ProfileSettings({ title, description, value, onChange, onSubmit, onCancel, state = { status: 'idle' }, errors, readOnly = false, avatarSrc, onAvatarFiles, avatarUpload, avatarError }: ProfileSettingsProps) {
  const pending = state.status === 'pending'
  const update = <K extends keyof ProfileSettingsValue>(key: K, next: ProfileSettingsValue[K]) => onChange({ ...value, [key]: next })
  const upload = onAvatarFiles && !readOnly
  return <Panel title={title} description={description} headingLevel={2} variant="split" className="b-settings-panel b-profile-settings">
    <div className="b-profile-settings__avatar" data-upload={upload || undefined}>
      <Avatar name={value.name} src={avatarSrc} size="large" />
      {upload && <FileDropzone label="Profile image" accept="image/*" multiple={false} size="small" disabled={pending} state={avatarUpload} error={avatarError} onFiles={onAvatarFiles} />}
    </div>
    <Form label={title} aria-busy={pending || undefined} onSubmit={event => { event.preventDefault(); if (!pending && !readOnly) onSubmit(value) }}>
      <div className="b-profile-settings__fields">
        <TextField label="Name" name="name" autoComplete="name" required disabled={pending} readOnly={readOnly} value={value.name} onChange={event => update('name', event.target.value)} error={errors?.name} />
        <TextField label="Email" type="email" name="email" autoComplete="email" required disabled={pending} readOnly={readOnly} value={value.email} onChange={event => update('email', event.target.value)} error={errors?.email} />
      </div>
      <TextArea label="Description" name="description" disabled={pending} readOnly={readOnly} value={value.description} onChange={event => update('description', event.target.value)} error={errors?.description} />
      {state.status === 'error' && <Alert title={state.message} tone="danger" announce />}
      {state.status === 'success' && <Alert title={state.message} tone="success" announcement="polite" />}
      {(!readOnly || onCancel) && <div className="b-settings-panel__footer">
        {readOnly ? <Button onClick={onCancel}>Cancel</Button> : <FormActions onCancel={onCancel} submitLabel="Save changes" busy={pending} />}
      </div>}
    </Form>
  </Panel>
}
