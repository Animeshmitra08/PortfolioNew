import { useRef, type CSSProperties, type ReactNode } from 'react'
import {
  Glass,
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
import { GLASS_EDGE_STYLE } from './glassTokens'

// Clear glass with a stronger rim, so the edge and its moving highlight read
// against a white page.
const BAR_LOOK: GlassLook = {
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
// makes the light direction visible on a white page. Both are scaled by theme
// tokens (index.css): on the black page the glint is softer and the falloff off.
const SHEEN_STYLE: CSSProperties = {
  background: [
    'radial-gradient(160px 36px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(255 255 255 / calc(0.3 * var(--glass-glint))), rgb(255 255 255 / 0) 70%)',
    'radial-gradient(1400px 220px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(var(--glass-shade) / 0) 20%, rgb(var(--glass-shade) / 0.06) 100%)',
  ].join(', '),
}

interface LiquidGlassBarProps {
  /** Unique id for this bar's SVG lens filter (bars can be on screen together). */
  lensId: string
  /** Fine pointer available: the light follows the cursor. */
  interactive: boolean
  reducedMotion: boolean
  /**
   * Adds a light frost for when the bar floats over busy or dark content, so
   * dark text on it stays legible. Over a white page the lens stays clear.
   */
  frosted?: boolean
  /**
   * Blur (px) applied to the backdrop before it is refracted. The default
   * keeps the lens nearly clear; raise it over fine texture, which a sharp
   * lens would smear into streaks.
   */
  backdropBlur?: number
  className?: string
  children: ReactNode
}

/**
 * The header's liquid-glass capsule: the page behind it is refracted through
 * an SDF lens (Chromium), with OpenGlass's CSS material as the fallback, plus
 * a sheen that tracks the cursor-lit point on the rim.
 *
 * Must be rendered inside OpenGlass's `GlassProvider`.
 */
export function LiquidGlassBar({
  lensId,
  interactive,
  reducedMotion,
  frosted = false,
  backdropBlur = 0.25,
  className,
  children,
}: LiquidGlassBarProps) {
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
    id: lensId,
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

  const frost: CSSProperties = {
    transition: 'background-color 400ms ease',
    // Strong enough that the grey secondary links stay readable over imagery.
    ...(frosted && { backgroundColor: 'var(--glass-frost)' }),
  }

  const style: CSSProperties = refracting
    ? {
        ...GLASS_EDGE_STYLE,
        // Nearly clear: the bent backdrop carries the look, not a tint.
        backgroundImage: 'none',
        backgroundColor: 'rgb(255 255 255 / 0.05)',
        backdropFilter: `url(#${lens.filterId}) saturate(1.2)`,
        WebkitBackdropFilter: `url(#${lens.filterId}) saturate(1.2)`,
        ...frost,
      }
    : { ...GLASS_EDGE_STYLE, ...frost }

  return (
    <>
      {refract && <BackdropRefractionFilter filter={lens} width={width} height={height} frost={backdropBlur} />}
      <Glass
        ref={glassRef}
        material="clear"
        look={BAR_LOOK}
        style={style}
        data-refracting={refracting ? 'true' : 'false'}
        className={className}
      >
        {/* Sheen and shade that track the lit point on the edge. */}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={SHEEN_STYLE} />
        {children}
      </Glass>
    </>
  )
}
