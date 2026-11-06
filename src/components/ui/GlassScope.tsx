import type { ReactNode } from 'react'
import { GlassProvider, GlassThemeProvider } from 'open-glass-ui'
import 'open-glass-ui/styles.css'

/** Same OpenGlass setup as the hero header, for glass accents in later sections. */
export function GlassScope({ children }: { children: ReactNode }) {
  return (
    <GlassProvider>
      <GlassThemeProvider appearance="light" defaultAppearance="light" className="contents">
        {children}
      </GlassThemeProvider>
    </GlassProvider>
  )
}
