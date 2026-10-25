import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { Glass, type GlassLook } from 'open-glass-ui'
import { useGlassLightFollow } from '../../hooks/useGlassLightFollow'
import { useLocationHash } from '../../hooks/useLocationHash'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { GLASS_EDGE_STYLE } from './glassTokens'
import { createLiquidIndicator, type LiquidIndicator } from './liquidIndicator'

/** Horizontal breathing room between a link's text and the pill's edge. */
const PILL_PADDING_X = 14

// A small, denser lens than the bar so it reads as a raised capsule. Its light
// is aimed from its own centre (not inherited from the bar), so a pill on the
// left lights from the right when the cursor is to its right.
const PILL_LOOK: GlassLook = {
  blur: 0.5,
  opacity: 1.4,
  rim: 1,
  highlight: 2,
  lightSpread: 80,
  lensing: 1.1,
  shadow: 0.7,
}

// Positioning is inline on purpose: OpenGlass's stylesheet is unlayered and
// sets `position: relative` on every glass element, which beats Tailwind's
// layered utilities like `absolute`.
// Width, height and transform are owned by the liquid indicator.
const PILL_STYLE = {
  ...GLASS_EDGE_STYLE,
  position: 'absolute',
  top: '50%',
  left: 0,
  display: 'block',
} as CSSProperties

/** Resting pill height; it thins while stretching and swells as it lands. */
const PILL_HEIGHT = 34

// Same idea as the bar's sheen, scaled to the capsule: a bright glint at the
// lit point and a soft grey falloff on the far side.
const PILL_SHEEN_STYLE: CSSProperties = {
  background: [
    'radial-gradient(44px 18px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(255 255 255 / 0.95), rgb(255 255 255 / 0) 70%)',
    'radial-gradient(150px 56px at var(--glass-light-x, 30%) var(--glass-light-y, 0%), rgb(10 10 10 / 0) 25%, rgb(10 10 10 / 0.09) 100%)',
  ].join(', '),
}

interface GlassNavLinksProps {
  links: string[]
  /** Fine pointer available — the pill's light follows the cursor. */
  interactive: boolean
}

export function GlassNavLinks({ links, interactive }: GlassNavLinksProps) {
  const hash = useLocationHash()
  const hrefs = links.map((label) => `#${label.toLowerCase()}`)
  const activeHref = hrefs.includes(hash) ? hash : hrefs[0]

  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const listRef = useRef<HTMLUListElement>(null)
  const pillRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<LiquidIndicator | null>(null)

  const refreshLight = useGlassLightFollow(pillRef, {
    enabled: interactive,
    instant: reducedMotion,
  })

  // The spring-driven indicator writes styles directly, so its motion never
  // re-renders React. Declared before the placement effect so it exists first.
  // Each frame it re-aims the light, so it tracks a still cursor mid-flow.
  useLayoutEffect(() => {
    const pill = pillRef.current
    if (!pill) return
    const indicator = createLiquidIndicator(pill, PILL_HEIGHT, refreshLight)
    indicatorRef.current = indicator
    return () => {
      indicator.destroy()
      indicatorRef.current = null
    }
  }, [refreshLight])

  // Flow the glass pill to the active link.
  useLayoutEffect(() => {
    const list = listRef.current
    const pill = pillRef.current
    if (!list || !pill) return

    const place = (instant: boolean) => {
      const link = list.querySelector<HTMLElement>(`a[href="${activeHref}"]`)
      // Hidden links (e.g. collapsed on mobile) have no box to sit under.
      if (!link || link.offsetWidth === 0) {
        pill.style.opacity = '0'
        return
      }
      const listBox = list.getBoundingClientRect()
      const linkBox = link.getBoundingClientRect()
      const x = linkBox.left - listBox.left - PILL_PADDING_X
      const width = linkBox.width + PILL_PADDING_X * 2
      indicatorRef.current?.moveTo(x, width, { instant })
      pill.style.opacity = '1'
    }

    place(reducedMotion)

    // Real layout changes (resize, font load) snap rather than flow. The
    // observer also fires once on observe; skip that so it can't cut the flow.
    let size = `${list.offsetWidth}x${list.offsetHeight}`
    const observer = new ResizeObserver(() => {
      const next = `${list.offsetWidth}x${list.offsetHeight}`
      if (next === size) return
      size = next
      place(true)
    })
    observer.observe(list)
    return () => observer.disconnect()
  }, [activeHref, reducedMotion])

  return (
    <ul ref={listRef} className="relative flex items-center gap-7 text-sm text-neutral-500">
      {/* Decorative indicator; hidden from assistive tech (aria-current carries the state). */}
      <li aria-hidden className="pointer-events-none absolute inset-0">
        <Glass
          ref={pillRef}
          as="span"
          material="clear"
          look={PILL_LOOK}
          style={PILL_STYLE}
          className="opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
        >
          <span className="absolute inset-0 rounded-[inherit]" style={PILL_SHEEN_STYLE} />
        </Glass>
      </li>

      {links.map((label, index) => {
        const href = hrefs[index]
        const active = href === activeHref
        return (
          <li key={label} className={`relative ${index < links.length - 1 ? 'hidden md:block' : ''}`}>
            <a
              href={href}
              aria-current={active ? 'location' : undefined}
              className={`transition-colors duration-300 hover:text-neutral-950 focus-visible:text-neutral-950 ${
                active ? 'text-neutral-950' : ''
              }`}
            >
              {label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
