import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { Space, tokens } from './tokens'

type Props = HTMLAttributes<HTMLDivElement>
type LayoutProps = Props & { gap?: Space }
const gapStyle = (gap: Space): CSSProperties => ({ '--layout-gap': `var(--a-space-${gap})` } as CSSProperties)

export function Stack({ gap = 4, className = '', style, ...props }: LayoutProps) {
  return <div {...props} className={`a-stack ${className}`.trim()} style={{ ...gapStyle(gap), ...style }} />
}
export function Inline({ gap = 2, className = '', style, ...props }: LayoutProps) {
  return <div {...props} className={`a-inline ${className}`.trim()} style={{ ...gapStyle(gap), ...style }} />
}
export function Grid({ gap = 4, minItemWidth = '16rem', className = '', style, ...props }: LayoutProps & { minItemWidth?: string }) {
  return <div {...props} className={`a-grid ${className}`.trim()} style={{ ...gapStyle(gap), '--grid-min': minItemWidth, ...style } as CSSProperties} />
}
export function Container({ className = '', style, maxWidth = '72rem', ...props }: Props & { maxWidth?: string }) {
  return <div {...props} className={`a-container ${className}`.trim()} style={{ maxWidth, ...style }} />
}
export type SurfaceProps = Props & { as?: 'div' | 'section' | 'article' | 'aside'; padding?: Space; radius?: keyof typeof tokens.radius; elevation?: keyof typeof tokens.shadow; tone?: 'canvas' | 'surface' }
export function Surface({ as: Tag = 'div', padding = 8, radius = 'large', elevation = 'none', tone = 'surface', className = '', style, ...props }: SurfaceProps) {
  return <Tag {...props} className={`a-surface ${className}`.trim()} style={{ padding: `var(--a-space-${padding})`, borderRadius: `var(--a-radius-${radius})`, '--surface-elevation': `var(--a-shadow-${elevation})`, background: `var(--a-color-${tone})`, ...style } as CSSProperties} />
}
export type DividerProps = HTMLAttributes<HTMLHRElement> & { /** Short text centred on the line, such as “or”. */ label?: string }
export function Divider({ label, className = '', ...props }: DividerProps) {
  if (label) return <div className={`a-divider-label ${className}`.trim()} role="separator" aria-label={label}><span aria-hidden="true">{label}</span></div>
  return <hr {...props} className={`a-divider ${className}`.trim()} />
}
export function ScrollArea({ label, className = '', style, maxHeight = '16rem', ...props }: Props & { label: string; maxHeight?: string }) {
  return <div {...props} className={`a-scroll ${className}`.trim()} style={{ maxHeight, ...style }} role="region" aria-label={label} tabIndex={0} />
}

export type AspectRatioProps = Props & { ratio?: number }
export function AspectRatio({ ratio = 1, className = '', style, ...props }: AspectRatioProps) {
  const aspectRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1
  return <div {...props} className={`a-aspect-ratio ${className}`.trim()} style={{ aspectRatio, ...style }} />
}

export type AppFrameProps = {
  header?: ReactNode
  navigation?: ReactNode
  children: ReactNode
  supporting?: ReactNode
  mainId?: string
  mainLabel?: string
  className?: string
}

export function AppFrame({ header, navigation, children, supporting, mainId = 'main-content', mainLabel, className = '' }: AppFrameProps) {
  return <div className={`a-app-frame ${className}`.trim()} data-has-navigation={navigation != null} data-has-supporting={supporting != null}>
    {header != null && <header className="a-app-frame__header">{header}</header>}
    <div className="a-app-frame__navigation">{navigation}</div>
    <main className="a-app-frame__main" id={mainId} aria-label={mainLabel}>{children}</main>
    {supporting != null && <aside className="a-app-frame__supporting">{supporting}</aside>}
  </div>
}
