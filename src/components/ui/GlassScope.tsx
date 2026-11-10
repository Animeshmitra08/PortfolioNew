import type { ReactNode } from 'react'
import { GlassProvider, GlassThemeProvider } from 'open-glass-ui'
import 'open-glass-ui/styles.css'
import { useTheme } from '../../hooks/useTheme'

/** Same OpenGlass setup as the hero header, for glass accents in later sections. */
export function GlassScope({ children }: { children: ReactNode }) {
  const theme = useTheme()
  return (
    <GlassProvider>
      <GlassThemeProvider appearance={theme} defaultAppearance="dark" className="contents">
        {children}
      </GlassThemeProvider>
    </GlassProvider>
  )
}
