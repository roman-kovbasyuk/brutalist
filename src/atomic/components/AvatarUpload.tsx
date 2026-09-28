import { useRef, useState, type ChangeEvent } from 'react'
import { Icon } from '../atoms'
import { Avatar, type AvatarProps } from './Avatar'
import './avatar-upload.css'

export type AvatarUploadProps = {
  /** The person's name: the initials fallback and part of the accessible name. */
  name: string
  /** Current photo URL, if any. */
  src?: string
  /** Receives the chosen image. Rejected files (wrong type or too large) go to onError instead. */
  onFile: (file: File) => void
  onError?: (message: string) => void
  accept?: string
  maxSize?: number
  size?: AvatarProps['size']
  /** Accessible name of the button; defaults to “Change photo for {name}”. */
  label?: string
  disabled?: boolean
}

/** An avatar that is also the upload control: activating it opens the file picker for a new photo. */
export function AvatarUpload({ name, src, onFile, onError, accept = 'image/png,image/jpeg,image/webp', maxSize = 2 * 1024 * 1024, size = 'large', label, disabled = false }: AvatarUploadProps) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const take = (file?: File) => {
    if (!file) return
    const types = accept.split(',').map(type => type.trim())
    if (!types.some(type => type === file.type || (type.endsWith('/*') && file.type.startsWith(type.slice(0, -1))))) { onError?.('Choose a PNG, JPEG or WebP image.'); return }
    if (file.size > maxSize) { onError?.(`Choose an image under ${Math.round(maxSize / 1024 / 1024)} MB.`); return }
    onFile(file)
  }
  return <span className="c-avatar-upload" data-size={size} data-dragging={dragging || undefined}>
    <button type="button" className="c-avatar-upload__button" aria-label={label ?? `Change photo for ${name}`} disabled={disabled} onClick={() => input.current?.click()}
      onDragOver={event => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)}
      onDrop={event => { event.preventDefault(); setDragging(false); take(event.dataTransfer.files[0]) }}>
      <Avatar name={name} src={src} size={size} aria-hidden="true" />
      <span className="c-avatar-upload__badge" aria-hidden="true"><Icon name="Camera" size="small" /></span>
    </button>
    <input ref={input} type="file" accept={accept} hidden tabIndex={-1} onChange={(event: ChangeEvent<HTMLInputElement>) => { take(event.target.files?.[0]); event.target.value = '' }} />
  </span>
}
