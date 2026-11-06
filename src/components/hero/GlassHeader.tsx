import { GlassProvider, GlassThemeProvider } from 'open-glass-ui'
import 'open-glass-ui/styles.css'
import { useScrolledPast } from '../../hooks/useScrolledPast'
import { GlassNavLinks } from './GlassNavLinks'
import { LiquidGlassBar } from './LiquidGlassBar'

interface GlassHeaderProps {
  links: string[]
  /** Fine pointer available — the light follows the cursor. */
  interactive: boolean
  reducedMotion: boolean
}

export function GlassHeader(props: GlassHeaderProps) {
  return (
    <GlassProvider>
      <GlassThemeProvider appearance="light" defaultAppearance="light" className="contents">
        <GlassBar {...props} />
      </GlassThemeProvider>
    </GlassProvider>
  )
}

function GlassBar({ links, interactive, reducedMotion }: GlassHeaderProps) {
  // Over the white hero the lens stays clear. Past it, the bar floats over
  // any content (including dark imagery), so it frosts to keep text legible.
  const pastHero = useScrolledPast(0.75)

  return (
    // Pinned to the viewport so the bar stays available on every section. The
    // wrapper ignores pointer events so its padding never blocks the page below.
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-6">
      <LiquidGlassBar
        lensId="nav-glass"
        interactive={interactive}
        reducedMotion={reducedMotion}
        frosted={pastHero}
        className="pointer-events-auto flex items-center justify-between px-5 py-3 md:px-7 md:py-3.5"
      >
        <a
          href="#"
          className="relative flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-[-0.01em] text-neutral-950"
        >
          <span aria-hidden className="size-3 rotate-45 border-[1.5px] border-neutral-950" />
          Animesh
        </a>
        <nav aria-label="Primary" className="relative">
          <GlassNavLinks links={links} interactive={interactive} />
        </nav>
      </LiquidGlassBar>
    </header>
  )
}
