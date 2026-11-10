import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Glass, type GlassLook } from 'open-glass-ui'
import { useGlassLightFollow } from '../../hooks/useGlassLightFollow'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { GLASS_EDGE_STYLE } from '../hero/glassTokens'

// Matches the nav pill: a dense, clear capsule with a bright rim.
const SURFACE_LOOK: GlassLook = {
  blur: 0.6,
  opacity: 1.4,
  rim: 1,
  highlight: 2,
  lightSpread: 80,
  lensing: 1.1,
  shadow: 0.7,
}

// Same sheen as the header: a glint at the lit point, grey falloff opposite.
const SHEEN_STYLE: CSSProperties = {
  background: [
    'radial-gradient(120px 40px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(255 255 255 / calc(0.6 * var(--glass-glint))), rgb(255 255 255 / 0) 70%)',
    'radial-gradient(900px 160px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(var(--glass-shade) / 0) 25%, rgb(var(--glass-shade) / 0.06) 100%)',
  ].join(', '),
}

interface GlassSurfaceProps {
  as?: 'div' | 'span' | 'nav'
  className?: string
  style?: CSSProperties
  /** Aim the specular light at the cursor, like the header. */
  followLight?: boolean
  children?: ReactNode
}

/** A glass capsule using the header's material, edge and light behaviour. */
export function GlassSurface({
  as = 'div',
  className,
  style,
  followLight = true,
  children,
}: GlassSurfaceProps) {
  const ref = useRef<HTMLElement>(null)
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useGlassLightFollow(ref, { enabled: followLight && canHover, instant: reducedMotion })

  return (
    <Glass
      ref={ref}
      as={as}
      material="clear"
      look={SURFACE_LOOK}
      style={{ ...GLASS_EDGE_STYLE, ...style }}
      className={className}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={SHEEN_STYLE} />
      {children}
    </Glass>
  )
}
