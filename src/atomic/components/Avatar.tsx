import { useEffect, useState, type HTMLAttributes } from 'react'
import { Text } from '../atoms'
import './avatar.css'

export type AvatarTone = 'accent' | 'blue' | 'teal' | 'amber' | 'rose' | 'violet' | 'green'
export type AvatarProps = HTMLAttributes<HTMLSpanElement> & { name: string; src?: string; size?: 'small' | 'medium' | 'large'; status?: 'online' | 'offline' | 'busy'
  /** `square` suits organizations, workspaces and brand marks. */
  shape?: 'circle' | 'square'
  /** Background behind initials. `auto` derives a stable tone from the name, so each person keeps one color. */
  tone?: AvatarTone | 'auto' }

const autoTones: readonly AvatarTone[] = ['accent', 'blue', 'teal', 'amber', 'rose', 'violet', 'green']
const toneFor = (name: string) => autoTones[[...name].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7) % autoTones.length]

export function Avatar({ name, src, size = 'medium', status, shape = 'circle', tone = 'accent', className = '', ...props }: AvatarProps) {
  const [failedSource, setFailedSource] = useState<string | undefined>()
  useEffect(() => { setFailedSource(undefined) }, [src])
  const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const showImage = Boolean(src) && failedSource !== src
  const resolvedTone = tone === 'auto' ? toneFor(name) : tone
  return <span {...props} className={`c-avatar ${className}`.trim()} data-size={size} data-shape={shape === 'square' ? 'square' : undefined} data-tone={resolvedTone === 'accent' ? undefined : resolvedTone} data-status={status} role="img" aria-label={status ? `${name}, ${status}` : name}>
    {showImage ? <img key={src} src={src} alt="" onError={() => setFailedSource(src)} /> : <Text as="span" variant="h6" tone="inherit">{initials}</Text>}
    {status && <span className="c-avatar__status" aria-hidden="true" />}
  </span>
}
