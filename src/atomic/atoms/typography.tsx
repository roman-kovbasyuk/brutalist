import type { CSSProperties, HTMLAttributes } from 'react'
import { themeVariables, tokenVariables, typeVariables, type HeadingRole, type TypeRole } from './tokens'
import { ThemeContext, useInheritedTheme, type AtomicTheme } from './theme'

type ElementProps = HTMLAttributes<HTMLElement>

export type AtomsRootProps = HTMLAttributes<HTMLDivElement> & { theme?: AtomicTheme }

/** The theme of the nearest AtomsRoot. Portaled overlays and charts read it so they match the page. */
export const useTheme = (): AtomicTheme => useInheritedTheme()?.theme ?? 'light'

function customProperties(style: CSSProperties | undefined): CSSProperties {
  if (!style) return {}
  return Object.fromEntries(Object.entries(style).filter(([key]) => key.startsWith('--'))) as CSSProperties
}

export function AtomsRoot({ className = '', style, theme: requestedTheme, ...props }: AtomsRootProps) {
  const inherited = useInheritedTheme()
  const theme = requestedTheme ?? inherited?.theme ?? 'light'
  const localCustomProperties = customProperties(style)
  const inheritedCustomProperties = inherited?.customProperties ?? {}
  const value = { theme, customProperties: { ...inheritedCustomProperties, ...localCustomProperties } }
  return <ThemeContext.Provider value={value}>
    <div {...props} data-theme={theme} className={`atomic-root ${className}`.trim()} style={{
      ...tokenVariables,
      ...themeVariables(theme),
      ...inheritedCustomProperties,
      ...localCustomProperties,
      colorScheme: theme,
      ...style,
    }} />
  </ThemeContext.Provider>
}

export type HeadingProps = ElementProps & { level: 1 | 2 | 3 | 4 | 5 | 6; variant?: HeadingRole }
export function Heading({ level, variant = `h${level}`, className = '', style, ...props }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return <Tag {...props} className={`a-type ${className}`.trim()} data-type={variant} style={{ ...typeVariables(variant), ...style }} />
}

export type TextProps = ElementProps & { as?: 'p' | 'span' | 'div'; variant?: TypeRole; tone?: 'ink' | 'secondary' | 'inherit' }
export function Text({ as: Tag = 'p', variant = 'body', tone = 'ink', className = '', style, ...props }: TextProps) {
  return <Tag {...props} className={`a-type ${className}`.trim()} data-type={variant} style={{ ...typeVariables(variant), color: tone === 'inherit' ? 'inherit' : `var(--a-color-${tone})`, ...style }} />
}
