import { useId, useRef, useState } from 'react'
import { Icon, Inline, Stack, Surface, Text } from '../atoms'
import { Button } from './Button'
import './files.css'
import { ProgressBar } from './ProgressBar'

export type FileRejection = { file: File; code: 'type' | 'size' | 'count'; message: string }
export type FileDropzoneProps = { label: string; onFiles: (files: File[]) => void; accept?: string; multiple?: boolean; maxSize?: number; disabled?: boolean; state?: 'idle' | 'uploading' | 'success' | 'error'; progress?: number | null; error?: string; onRetry?: () => void; onReject?: (items: readonly FileRejection[]) => void; size?: 'default' | 'small' }

function formatLimit(maxSize: number) {
  const units = [{ size: 1024 * 1024, label: 'MB' }, { size: 1024, label: 'KB' }]
  for (const unit of units) {
    if (maxSize < unit.size) continue
    for (const decimals of [0, 1, 2]) {
      const scale = 10 ** decimals
      const scaled = maxSize / unit.size * scale
      if (Number.isInteger(scaled)) return `${(scaled / scale).toFixed(decimals)} ${unit.label}`
    }
  }
  return `${maxSize} bytes`
}

function rejectionFor(file: File, accept: string | undefined, maxSize: number): FileRejection | undefined {
  if (file.size > maxSize) return { file, code: 'size', message: `${file.name} exceeds the ${formatLimit(maxSize)} per-file limit.` }
  if (accept && !accept.split(',').some(rule => {
    const type = rule.trim().toLowerCase()
    return type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type
  })) return { file, code: 'type', message: `${file.name} has an unsupported file type.` }
  return undefined
}

export function FileDropzone({ label, onFiles, accept, multiple = false, maxSize = 10 * 1024 * 1024, disabled, state = 'idle', progress = 0, error: externalError, onRetry, onReject, size = 'default' }: FileDropzoneProps) {
  const id = useId(), [error, setError] = useState(''), [dragging, setDragging] = useState(false), input = useRef<HTMLInputElement>(null)
  const blocked = disabled || state === 'uploading', message = externalError || error
  const receive = (files: File[]) => {
    if (blocked) return
    const rejected = files.map((file, index) => {
      const invalid = rejectionFor(file, accept, maxSize)
      if (invalid) return invalid
      if (!multiple && index > 0) return { file, code: 'count' as const, message: 'Choose one file.' }
      return undefined
    }).filter((item): item is FileRejection => Boolean(item))
    if (rejected.length) {
      setError(rejected.map(item => item.message).join(' '))
      onReject?.(rejected)
      return
    }
    setError('')
    if (files.length) onFiles(files)
  }
  return <Surface padding={size === 'small' ? 4 : 6} radius="small" className="c-file-dropzone" data-size={size} data-state={dragging ? 'dragging' : state} aria-disabled={blocked || undefined} onDragEnter={event => { event.preventDefault(); if (!blocked) setDragging(true) }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false) }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); setDragging(false); receive(Array.from(event.dataTransfer.files)) }}><Stack gap={3}><Icon name="upload" /><label htmlFor={id}><Text as="span" variant="h6">{label}</Text></label><Text variant="small" tone="secondary">Choose {multiple ? 'files' : 'a file'} or drop {multiple ? 'them' : 'it'} here. Maximum {formatLimit(maxSize)} per file.</Text><input ref={input} className="c-file-dropzone__input" tabIndex={-1} id={id} type="file" accept={accept} multiple={multiple} disabled={blocked} aria-describedby={message ? `${id}-error` : undefined} onChange={event => { receive(Array.from(event.target.files ?? [])); event.target.value = '' }} /><Inline><Button icon="upload" disabled={blocked} onClick={() => input.current?.click()}>Choose files</Button>{state === 'error' && onRetry && <Button onClick={onRetry} disabled={blocked}>Retry upload</Button>}</Inline>{state === 'uploading' && <ProgressBar label="Uploading files" value={progress ?? undefined} />}{state === 'success' && <Text variant="small" role="status">Files uploaded.</Text>}{message && <Text id={`${id}-error`} tone="inherit" className="c-field-error" variant="small" role="alert">{message}</Text>}</Stack></Surface>
}

export type FileItem = { id: string; name: string; size?: number; status?: 'queued' | 'uploading' | 'complete' | 'error'; progress?: number; error?: string }
export type FileListProps = { files: readonly FileItem[]; onRemove?: (id: string) => void; onRetry?: (id: string) => void; onCancel?: (id: string) => void; disabled?: boolean }
function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** One row per file: name, a size and status line, a thin progress track while uploading, and icon actions. */
export function FileList({ files, onRemove, onRetry, onCancel, disabled }: FileListProps) {
  return <ul className="c-file-list" aria-label="Files">{files.map(file => {
    const busy = file.status === 'uploading' || file.status === 'queued'
    const failed = file.status === 'error'
    const status = file.status === 'uploading' ? (file.progress === undefined ? 'Uploading' : `Uploading · ${Math.round(Math.max(0, Math.min(100, file.progress)))}%`) : file.status === 'queued' ? 'Waiting to upload' : file.status === 'complete' ? 'Uploaded' : undefined
    return <li key={file.id} data-status={file.status ?? 'ready'}>
      <span className="c-file-list__icon"><Icon name={file.status === 'complete' ? 'check' : failed ? 'alert' : 'file'} size="small" /></span>
      <span className="c-file-list__copy">
        <Text as="span" variant="h7" className="c-file-list__name">{file.name}</Text>
        {failed
          ? <Text as="span" variant="small" tone="inherit" role="alert" className="c-file-list__error">{file.error ?? `Couldn’t upload ${file.name}.`}</Text>
          : (file.size !== undefined || status) && <Text as="span" variant="small" tone="secondary" role={file.status === 'complete' ? 'status' : undefined}>{[file.size !== undefined ? fileSize(file.size) : '', status].filter(Boolean).join(' · ')}</Text>}
        {file.status === 'uploading' && <span className="c-file-list__progress"><ProgressBar label={`Uploading ${file.name}`} value={file.progress} showValue={false} /></span>}
      </span>
      <span className="c-file-list__actions">
        {onRetry && failed && <Button iconOnly size="compact" variant="quiet" icon="RotateCcw" aria-label={`Retry ${file.name}`} disabled={disabled} onClick={() => onRetry(file.id)} />}
        {onCancel && busy
          ? <Button iconOnly size="compact" variant="quiet" icon="close" aria-label={`Cancel ${file.name}`} disabled={disabled} onClick={() => onCancel(file.id)} />
          : onRemove && <Button iconOnly size="compact" variant="quiet" icon="delete" aria-label={`Remove ${file.name}`} disabled={disabled} onClick={() => onRemove(file.id)} />}
      </span>
    </li>
  })}</ul>
}
