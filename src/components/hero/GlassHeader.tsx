import { GlassProvider, GlassThemeProvider } from 'open-glass-ui'
import 'open-glass-ui/styles.css'
import { PRIMARY_NAV, SECTION_IDS } from '../../data/navigation'
import { PROFILE } from '../../data/profile'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useScrolledPast } from '../../hooks/useScrolledPast'
import { useTheme } from '../../hooks/useTheme'
import { ThemeToggle } from '../ui/ThemeToggle'
import { CONTAINER } from '../ui/typography'
import { GlassNavLinks } from './GlassNavLinks'
import { LiquidGlassBar } from './LiquidGlassBar'
import { MobileMenu } from './MobileMenu'

interface GlassHeaderProps {
  /** Fine pointer available — the light follows the cursor. */
  interactive: boolean
  reducedMotion: boolean
}

export function GlassHeader(props: GlassHeaderProps) {
  const theme = useTheme()
  return (
    <GlassProvider>
      <GlassThemeProvider appearance={theme} defaultAppearance="dark" className="contents">
        <GlassBar {...props} />
      </GlassThemeProvider>
    </GlassProvider>
  )
}

function GlassBar({ interactive, reducedMotion }: GlassHeaderProps) {
  // Over the plain hero the lens stays clear. Past it, the bar floats over
  // any content (including dark imagery), so it frosts to keep text legible.
  const pastHero = useScrolledPast(0.75)
  // While the bar is over the speckled hero, the lens blurs what it bends so
  // the flecks read as soft mottling through frosted glass, not streaks.
  const overHero = !useScrolledPast(1)
  const activeId = useActiveSection(SECTION_IDS)
  const activeHref = activeId ? `#${activeId}` : null

  return (
    // Pinned to the viewport so the bar stays available on every section. The
    // wrapper ignores pointer events so its padding never blocks the page below.
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-6">
      <LiquidGlassBar
        lensId="nav-glass"
        interactive={interactive}
        reducedMotion={reducedMotion}
        frosted={pastHero}
        backdropBlur={overHero ? 4 : 0.25}
        className={`pointer-events-auto flex items-center justify-between px-6 py-3 md:px-8 md:py-4 ${CONTAINER}`}
      >
        <a
          href="#"
          className="relative flex items-center gap-3 text-base font-semibold tracking-[-0.01em] text-neutral-950"
        >
          <span aria-hidden className="size-3 rotate-45 border-[1.5px] border-neutral-950" />
          {PROFILE.name}
        </a>
        <div className="relative flex items-center gap-6">
          <nav aria-label="Primary">
            <GlassNavLinks links={PRIMARY_NAV} activeHref={activeHref} interactive={interactive} />
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="-my-2 md:-mr-2" />
            <MobileMenu activeHref={activeHref} reducedMotion={reducedMotion} />
          </div>
        </div>
      </LiquidGlassBar>
    </header>
  )
}
