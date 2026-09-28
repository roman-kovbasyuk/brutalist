import { createContext, useContext, type CSSProperties } from 'react'

export type AtomicTheme = 'light' | 'dark'
type ThemeContextValue = {
  theme: AtomicTheme
  customProperties: CSSProperties
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useInheritedTheme() {
  return useContext(ThemeContext)
}

export { ThemeContext }
