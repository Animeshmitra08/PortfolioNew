import { useRef, type CSSProperties } from 'react'
import {
  Glass,
  GlassProvider,
  GlassThemeProvider,
  getMaterialPreset,
  useGlassCapabilities,
  useSdfFilter,
  type GlassLook,
  type GlassMaterial,
} from 'open-glass-ui'
import 'open-glass-ui/styles.css'
import { useElementSize } from '../../hooks/useElementSize'
import { useGlassLightFollow } from '../../hooks/useGlassLightFollow'
import { BackdropRefractionFilter } from './BackdropRefractionFilter'
import { GlassNavLinks } from './GlassNavLinks'
import { GLASS_EDGE_STYLE } from './glassTokens'

// Clear glass with a stronger rim, so the edge and its moving highlight read
// against a white page.
const HEADER_LOOK: GlassLook = {
  blur: 0.7,
  opacity: 0.3,
  saturation: 0.6,
  brightness: 0.92,
  rim: 1,
  highlight: 2,
  lightSpread: 70,
  lensing: 0.8,
  shadow: 0.9,
}

// A thick, very clear lens: deep bevel for strong edge bending. Dispersion is
// kept low (OpenGlass multiplies it by 9 per channel) so edges get a fine
// colour fringe instead of splitting thin lines into rainbows.
const LENS_MATERIAL: GlassMaterial = {
  ...getMaterialPreset('clear'),
  thickness: 1.1,
  bevel: 0.9,
  dispersion: 0.007,
  frost: 0.02,
}

// Lit point: a bright sheen. Away from it: a faint grey falloff, which is what
// makes the light direction visible on a white page.
const SHEEN_STYLE: CSSProperties = {
  background: [
    'radial-gradient(160px 36px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(255 255 255 / 0.3), rgb(255 255 255 / 0) 70%)',
    'radial-gradient(1400px 220px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(10 10 10 / 0) 20%, rgb(10 10 10 / 0.06) 100%)',
  ].join(', '),
}

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
  const glassRef = useRef<HTMLElement>(null)
  useGlassLightFollow(glassRef, { enabled: interactive, instant: reducedMotion })

  // Real refraction needs SVG filters in `backdrop-filter` (Chromium today);
  // elsewhere the CSS material is the fallback.
  const capabilities = useGlassCapabilities()
  const refract =
    capabilities.backdropUrlSyntax &&
    capabilities.svgFilterElements &&
    !capabilities.reducedTransparency &&
    !capabilities.forcedColors

  const { width, height } = useElementSize(glassRef)
  const lens = useSdfFilter({
    id: 'nav-glass',
    width: Math.max(width, 1),
    height: Math.max(height, 1),
    geometry: {
      kind: 'rounded-rect',
      width: Math.max(width, 1),
      height: Math.max(height, 1),
      cornerRadius: Math.max(height, 1) / 2,
    },
    material: LENS_MATERIAL,
    quality: 'high',
  })
  const refracting = refract && lens.ready && width > 0

  const style: CSSProperties = refracting
    ? {
        ...GLASS_EDGE_STYLE,
        // Nearly clear: the bent backdrop carries the look, not a tint.
        background: 'rgb(255 255 255 / 0.05)',
        backdropFilter: `url(#${lens.filterId}) saturate(1.2)`,
        WebkitBackdropFilter: `url(#${lens.filterId}) saturate(1.2)`,
      }
    : GLASS_EDGE_STYLE

  return (
    <header className="px-4 pt-4 md:px-8 md:pt-6">
      {refract && (
        <BackdropRefractionFilter filter={lens} width={width} height={height} frost={0.25} />
      )}
      <Glass
        ref={glassRef}
        material="clear"
        look={HEADER_LOOK}
        style={style}
        data-refracting={refracting ? 'true' : 'false'}
        className="flex items-center justify-between px-5 py-3 md:px-7 md:py-3.5"
      >
        {/* Sheen and shade that track the lit point on the edge. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={SHEEN_STYLE}
        />

        <a
          href="#"
          className="relative flex items-center gap-2.5 text-[0.95rem] font-semibold tracking-[-0.01em] text-neutral-950"
        >
          <span aria-hidden className="size-3 rotate-45 border-[1.5px] border-neutral-950" />
          Nexus
        </a>
        <nav aria-label="Primary" className="relative">
          <GlassNavLinks links={links} />
        </nav>
      </Glass>
    </header>
  )
}
