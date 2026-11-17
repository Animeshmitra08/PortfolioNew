import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import { motion, type Variants } from 'motion/react'
import { detectRendererCapabilities } from 'open-glass-ui'
import { useElementSize } from '../../hooks/useElementSize'
import { EASE_IN_OUT, EASE_SOFT } from '../ui/motion'
import type { PointerState } from './pointer'

/** The display face (index.css `--font-display`). Exile ships one weight. */
const FONT_FAMILY = 'Exile'
const FONT_WEIGHT = 400

/** Share of the hero the wordmark may fill. */
const MAX_WIDTH = 0.92
const MAX_HEIGHT = 0.34
/** Never wider than the page's content column (max-w-7xl), so it lines up with the header. */
const MAX_WIDTH_PX = 1280
/** Lift above the hero's centre, as a share of its height (keeps clear of the hero copy). */
const LIFT = 0.2

/** Light falls from the top left, matching the header glass and the studio light. */
const LIGHT = { x: -0.55, y: -0.83 }

/** How the glyph shapes become glass. */
interface GlassText {
  /** Box size in CSS pixels; the glyphs sit inside with padding for the shadow. */
  width: number
  height: number
  fontSize: number
  /** Glyph alpha, used as the glass element's mask. */
  mask: string
  /** Highlights, shade, hairline rim and drop shadow, drawn over the glass. */
  rim: string
  /** Displacement map: R/G hold the bevel's slope, 128 meaning "no shift". */
  map: string
  /** Peak displacement for `feDisplacementMap`, in pixels. */
  shift: number
  /** Cursor droplet: radius, its displacement dome and its glint. */
  dropRadius: number
  drop: string
  glint: string
}

/* ------------------------------------------------------------------------- */
/* Canvas rendering                                                           */
/* ------------------------------------------------------------------------- */

function font(size: number) {
  return `${FONT_WEIGHT} ${size}px ${FONT_FAMILY}`
}

/**
 * Draws the text blurred by `sigma` px. Uses the shadow of a copy drawn off
 * canvas, which every browser supports (unlike `ctx.filter`). `shadowBlur`
 * is twice the Gaussian standard deviation.
 */
function drawBlurred(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, sigma: number) {
  const offset = ctx.canvas.width * 2
  ctx.save()
  ctx.shadowColor = '#fff'
  ctx.shadowBlur = sigma * 2
  ctx.shadowOffsetX = offset
  ctx.fillStyle = '#fff'
  ctx.fillText(text, x - offset, y)
  ctx.restore()
}

/** Alpha channel of a canvas as 0..1 floats. */
function alphaField(ctx: CanvasRenderingContext2D): Float32Array {
  const { width, height } = ctx.canvas
  const data = ctx.getImageData(0, 0, width, height).data
  const field = new Float32Array(width * height)
  for (let i = 0; i < field.length; i++) field[i] = data[i * 4 + 3] / 255
  return field
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('2D canvas unavailable')
  return { canvas, ctx }
}

const clamp = (v: number, min = -1, max = 1) => (v < min ? min : v > max ? max : v)

/**
 * Lays out `text` to fit the area, then renders the three images the glass
 * needs. Work is limited to the text's own bounding box, not the whole hero.
 */
function renderGlassText(text: string, areaWidth: number, areaHeight: number, dpr: number): GlassText {
  const probe = makeCanvas(1, 1).ctx
  probe.font = font(100)
  const sample = probe.measureText(text)
  const sampleHeight = sample.actualBoundingBoxAscent + sample.actualBoundingBoxDescent
  const fontSize = Math.floor(
    Math.min((Math.min(areaWidth * MAX_WIDTH, MAX_WIDTH_PX) / sample.width) * 100, ((areaHeight * MAX_HEIGHT) / sampleHeight) * 100),
  )

  probe.font = font(fontSize)
  const metrics = probe.measureText(text)
  const ascent = metrics.actualBoundingBoxAscent
  const pad = Math.max(40, Math.round(fontSize * 0.2))
  const width = Math.ceil(metrics.width) + pad * 2
  const height = Math.ceil(ascent + metrics.actualBoundingBoxDescent) + pad * 2

  // Bevel width: how far in from the edge the glass keeps curving.
  const bevel = Math.max(3, fontSize * 0.045)
  const shift = Math.min(48, fontSize * 0.14)

  /* Displacement map, at CSS pixel scale (the filter works in CSS pixels). */
  const bevel1x = makeCanvas(width, height).ctx
  bevel1x.font = font(fontSize)
  drawBlurred(bevel1x, text, pad, pad + ascent, bevel)
  const field = alphaField(bevel1x)

  const mapImage = bevel1x.createImageData(width, height)
  const map = mapImage.data
  const gain = bevel * 2.2
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const left = field[x > 0 ? i - 1 : i]
      const right = field[x < width - 1 ? i + 1 : i]
      const up = field[y > 0 ? i - width : i]
      const down = field[y < height - 1 ? i + width : i]
      const gx = clamp((right - left) * 0.5 * gain)
      const gy = clamp((down - up) * 0.5 * gain)
      // Down the slope, i.e. outward: the rim pulls in what lies just beyond it.
      map[i * 4] = 128 - gx * 127
      map[i * 4 + 1] = 128 - gy * 127
      map[i * 4 + 2] = 128
      map[i * 4 + 3] = 255
    }
  }
  bevel1x.putImageData(mapImage, 0, 0)

  /* Mask and rim, at device resolution so the edges stay crisp. */
  const w = Math.round(width * dpr)
  const h = Math.round(height * dpr)
  const sizeD = fontSize * dpr
  const x0 = pad * dpr
  const y0 = (pad + ascent) * dpr

  const glyphs = makeCanvas(w, h).ctx
  glyphs.font = font(sizeD)
  glyphs.fillStyle = '#fff'
  glyphs.fillText(text, x0, y0)
  const sharp = alphaField(glyphs)

  const soft = makeCanvas(w, h).ctx
  soft.font = font(sizeD)
  drawBlurred(soft, text, x0, y0, bevel * dpr)
  const body = alphaField(soft)

  const fine = makeCanvas(w, h).ctx
  fine.font = font(sizeD)
  drawBlurred(fine, text, x0, y0, Math.max(0.8, dpr * 0.8))
  const edge = alphaField(fine)

  const rimCtx = makeCanvas(w, h).ctx
  const rimImage = rimCtx.createImageData(w, h)
  const rim = rimImage.data
  const gainD = bevel * dpr * 2.2
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const a = sharp[i]
      if (a === 0) continue

      const gx = clamp((body[i + 1] - body[i - 1]) * 0.5 * gainD)
      const gy = clamp((body[i + w] - body[i - w]) * 0.5 * gainD)
      // Positive on edges facing the light (top left), negative facing away.
      const lit = -(gx * LIGHT.x + gy * LIGHT.y)
      const slope = Math.min(1, Math.hypot(gx, gy))
      const hairline = Math.min(1, Math.hypot(edge[i + 1] - edge[i - 1], edge[i + w] - edge[i - w]) * 1.6)

      const highlight = Math.pow(Math.max(0, lit), 1.4) * 0.85 + slope * 0.1 + hairline * 0.4
      const shade = Math.max(0, -lit) * 0.2

      const o = i * 4
      const tone = highlight >= shade ? 255 : 0
      rim[o] = tone
      rim[o + 1] = tone
      rim[o + 2] = tone
      rim[o + 3] = Math.round(Math.min(1, Math.max(highlight, shade)) * a * 255)
    }
  }
  rimCtx.putImageData(rimImage, 0, 0)

  // A soft contact shadow outside the glyphs, then the rim on top.
  const final = makeCanvas(w, h).ctx
  final.font = font(sizeD)
  final.save()
  final.shadowColor = 'rgb(0 0 0 / 0.09)'
  final.shadowBlur = fontSize * 0.12 * dpr
  final.shadowOffsetY = fontSize * 0.05 * dpr
  final.fillStyle = '#000'
  final.fillText(text, x0, y0)
  final.restore()
  final.globalCompositeOperation = 'destination-out'
  final.fillText(text, x0, y0)
  final.globalCompositeOperation = 'source-over'
  final.drawImage(rimCtx.canvas, 0, 0)

  return {
    width,
    height,
    fontSize,
    mask: glyphs.canvas.toDataURL(),
    rim: final.canvas.toDataURL(),
    map: bevel1x.canvas.toDataURL(),
    shift,
    ...renderDroplet(Math.max(70, Math.round(fontSize * 0.6))),
  }
}

/**
 * The cursor's droplet: a dome-shaped displacement map that pulls samples
 * toward its centre (magnifying what lies under it), plus a soft glint.
 * Both are square, 2·radius on a side, and positioned at the cursor.
 */
function renderDroplet(radius: number) {
  const size = radius * 2
  const lens = makeCanvas(size, size).ctx
  const image = lens.createImageData(size, size)
  const data = image.data
  // r·(1 − r²)² peaks at r = 1/√5; normalise that peak to the full ±127 range.
  const norm = 1 / ((1 / Math.sqrt(5)) * Math.pow(1 - 1 / 5, 2))
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5 - radius) / radius
      const dy = (y + 0.5 - radius) / radius
      const r2 = dx * dx + dy * dy
      const falloff = r2 < 1 ? Math.pow(1 - r2, 2) * norm : 0
      const o = (y * size + x) * 4
      data[o] = 128 - dx * falloff * 127
      data[o + 1] = 128 - dy * falloff * 127
      data[o + 2] = 128
      data[o + 3] = 255
    }
  }
  lens.putImageData(image, 0, 0)

  const glint = makeCanvas(size, size).ctx
  const gradient = glint.createRadialGradient(radius, radius, 0, radius, radius, radius)
  gradient.addColorStop(0, 'rgb(255 255 255 / 0.9)')
  gradient.addColorStop(0.45, 'rgb(255 255 255 / 0.25)')
  gradient.addColorStop(1, 'rgb(255 255 255 / 0)')
  glint.fillStyle = gradient
  glint.fillRect(0, 0, size, size)

  return { dropRadius: radius, drop: lens.canvas.toDataURL(), glint: glint.canvas.toDataURL() }
}

/* ------------------------------------------------------------------------- */
/* Lens filter                                                                */
/* ------------------------------------------------------------------------- */

const CHANNELS = [
  { name: 'R', matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', spread: 1 },
  { name: 'G', matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', spread: 1.05 },
  { name: 'B', matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', spread: 1.1 },
]

/**
 * Filter primitives the liquid animation writes to every frame, tagged with
 * `data-liquid` and looked up once the filter is in the DOM.
 */
const LIQUID_NODES = ['turbulence', 'wave', 'drop', 'dropShift', 'glint', 'glintAlpha'] as const
type LiquidNode = (typeof LIQUID_NODES)[number]

function findLiquidNodes(filterId: string) {
  const filter = document.getElementById(liquidId(filterId))
  const nodes = {} as Record<LiquidNode, Element | null>
  for (const name of LIQUID_NODES) nodes[name] = filter?.querySelector(`[data-liquid="${name}"]`) ?? null
  return nodes
}

/** Base noise frequency for the wobble; it drifts slightly so the surface flows. */
const WAVE_FREQUENCY = { x: 0.006, y: 0.011 }

const glintAlphaMatrix = (alpha: number) =>
  `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alpha.toFixed(3)} 0`

/** The liquid variant of a wordmark filter. */
const liquidId = (id: string) => `${id}-liquid`

/** `backdrop-filter` value for the still or the liquid glass. */
const surfaceFilter = (id: string, liquid: boolean) =>
  `url(#${liquid ? liquidId(id) : id}) brightness(1.05) saturate(1.3)`

/**
 * The whole glass, built inside a backdrop filter so it can be warped as a
 * liquid:
 *   1. bend the backdrop through the glyph-shaped bevel (per-channel, for a
 *      fine dispersion fringe), and cut it to the glyphs;
 *   2. add the tint, the cursor glint and the lit rim;
 *   3. warp the result with a noise wobble (driven by pointer speed) and a
 *      droplet lens that follows the cursor.
 * Everything outside the glyphs is transparent, so the page shows through.
 *
 * Two filters: the still one stops after step 2, because the warp stages
 * resample every pixel and soften the edges even at zero strength. The
 * surface switches to the liquid one only while the cursor is stirring it.
 */
function LensFilter({ id, glass }: { id: string; glass: GlassText }) {
  const box = { x: '0', y: '0', width: glass.width, height: glass.height }
  return (
    <svg aria-hidden focusable="false" width="0" height="0" className="absolute">
      <defs>
        <filter id={id} {...box} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <GlassStages glass={glass} liquid={false} />
        </filter>
        <filter id={liquidId(id)} {...box} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <GlassStages glass={glass} liquid />
        </filter>
      </defs>
    </svg>
  )
}

function GlassStages({ glass, liquid }: { glass: GlassText; liquid: boolean }) {
  const size = glass.dropRadius * 2
  const hidden = -size * 4 // Parks the droplet off the glass until the cursor arrives.
  const box = { x: '0', y: '0', width: glass.width, height: glass.height }

  return (
    <>
          {/* 1. Refraction. A light frost: speckles inside the glass go soft. */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" edgeMode="duplicate" result="SOURCE" />
          <feImage href={glass.map} {...box} preserveAspectRatio="none" result="MAP" />
          {CHANNELS.map(({ name, matrix, spread }) => [
            <feDisplacementMap
              key={`${name}-shift`}
              in="SOURCE"
              in2="MAP"
              scale={glass.shift * 2 * spread}
              xChannelSelector="R"
              yChannelSelector="G"
              result={`${name}_SHIFT`}
            />,
            <feColorMatrix key={`${name}-only`} in={`${name}_SHIFT`} type="matrix" values={matrix} result={name} />,
          ])}
          <feBlend in="R" in2="G" mode="screen" result="RG" />
          <feBlend in="RG" in2="B" mode="screen" result="BENT" />
          <feImage href={glass.mask} {...box} preserveAspectRatio="none" result="GLYPHS" />
          <feComposite in="BENT" in2="GLYPHS" operator="in" result="GLASS" />

          {/* 2. Tint (follows the theme), cursor glint and rim. */}
          <feFlood style={{ floodColor: 'var(--color-neutral-950)' }} floodOpacity="0.04" result="TINT_FILL" />
          <feComposite in="TINT_FILL" in2="GLYPHS" operator="in" result="TINT" />
          <feImage href={glass.rim} {...box} preserveAspectRatio="none" result="RIM" />
          {!liquid && (
            <feMerge>
              <feMergeNode in="GLASS" />
              <feMergeNode in="TINT" />
              <feMergeNode in="RIM" />
            </feMerge>
          )}
          {liquid && (
            <>
          <feImage
            data-liquid="glint"
            href={glass.glint}
            x={hidden}
            y={hidden}
            width={size}
            height={size}
            result="GLINT_RAW"
          />
          <feColorMatrix
            data-liquid="glintAlpha"
            in="GLINT_RAW"
            type="matrix"
            values={glintAlphaMatrix(0)}
            result="GLINT_FADED"
          />
          <feComposite in="GLINT_FADED" in2="GLYPHS" operator="in" result="GLINT" />
          <feMerge result="COMPOSED">
            <feMergeNode in="GLASS" />
            <feMergeNode in="TINT" />
            <feMergeNode in="GLINT" />
            <feMergeNode in="RIM" />
          </feMerge>

          {/*
            3a. Wobble: one octave of noise, blurred so outlines ripple
            smoothly instead of crinkling, and made opaque to read as a map.
          */}
          <feTurbulence
            data-liquid="turbulence"
            type="fractalNoise"
            baseFrequency={`${WAVE_FREQUENCY.x} ${WAVE_FREQUENCY.y}`}
            numOctaves={1}
            seed={7}
            result="NOISE"
          />
          <feColorMatrix
            in="NOISE"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1"
            result="NOISE_OPAQUE"
          />
          <feGaussianBlur in="NOISE_OPAQUE" stdDeviation="6" edgeMode="duplicate" result="NOISE_MAP" />
          <feDisplacementMap
            data-liquid="wave"
            in="COMPOSED"
            in2="NOISE_MAP"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="WAVED"
          />

          {/* 3b. Droplet: a dome map over a neutral (no-shift) field. */}
          <feFlood floodColor="rgb(128 128 128)" floodOpacity="1" result="NEUTRAL" />
          <feImage
            data-liquid="drop"
            href={glass.drop}
            x={hidden}
            y={hidden}
            width={size}
            height={size}
            result="DROP_RAW"
          />
          <feMerge result="DROP_MAP">
            <feMergeNode in="NEUTRAL" />
            <feMergeNode in="DROP_RAW" />
          </feMerge>
          <feDisplacementMap
            data-liquid="dropShift"
            in="WAVED"
            in2="DROP_MAP"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="DROPPED"
          />
          {/* Displacement samples without smoothing; half a pixel of blur hides the stair-steps. */}
          <feGaussianBlur in="DROPPED" stdDeviation="0.5" />
            </>
          )}
    </>
  )
}

/* ------------------------------------------------------------------------- */
/* Liquid motion                                                              */
/* ------------------------------------------------------------------------- */

interface LiquidOptions {
  filterId: string
  pointerRef: RefObject<PointerState>
  /** Where the glass box sits inside the hero, in CSS pixels. */
  layout: RefObject<{ left: number; top: number; areaWidth: number; areaHeight: number } | null>
  glass: GlassText | null
  enabled: boolean
}

/**
 * Drives the filter from the hero's pointer, outside React. The droplet
 * follows the cursor on a slightly underdamped spring, so it lags and
 * overshoots a little like a drop of water; pointer speed stirs the wobble,
 * which then settles slowly.
 */
function useLiquid({ filterId, pointerRef, layout, glass, enabled }: LiquidOptions) {
  useEffect(() => {
    if (!enabled || !glass) return
    const n = findLiquidNodes(filterId)
    const surface = document.querySelector<HTMLElement>(`[data-wordmark-surface="${filterId}"]`)

    // Points the surface at the still or the liquid filter (no-op if already there).
    let liquidOn = false
    const setLiquid = (liquid: boolean) => {
      if (!surface || liquid === liquidOn) return
      liquidOn = liquid
      const value = surfaceFilter(filterId, liquid)
      surface.style.backdropFilter = value
      surface.style.setProperty('-webkit-backdrop-filter', value)
    }

    const STIFFNESS = 140
    const DAMPING = 15 // Under critical (≈ 23.7): a soft overshoot.
    const maxDrop = Math.min(52, glass.fontSize * 0.24)
    // Blurred noise has less contrast, so the wobble needs a larger scale.
    const maxWave = Math.min(40, glass.fontSize * 0.18)

    const pos = { x: glass.width / 2, y: glass.height / 2 }
    const vel = { x: 0, y: 0 }
    let presence = 0
    let stir = 0
    let wasIdle = false
    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      // Real elapsed time (capped after a stalled tab), so fades keep pace
      // even when the frame rate drops.
      const dt = Math.min((now - last) / 1000, 0.25)
      last = now
      const p = pointerRef.current
      const box = layout.current
      if (!box || dt <= 0) return

      // Pointer in the glass box's own coordinates (the filter's user space).
      const targetX = ((p.targetX + 1) / 2) * box.areaWidth - box.left
      const targetY = ((1 - p.targetY) / 2) * box.areaHeight - box.top
      const inside = p.inside && !p.ghost

      if (inside && presence < 0.02) {
        // Arriving: start at the cursor instead of sliding in from elsewhere.
        pos.x = targetX
        pos.y = targetY
        vel.x = vel.y = 0
      }

      // The spring takes fixed small steps: stable at any frame rate.
      const steps = Math.ceil(dt / (1 / 120))
      const h = dt / steps
      for (let s = 0; s < steps; s++) {
        vel.x += ((targetX - pos.x) * STIFFNESS - vel.x * DAMPING) * h
        vel.y += ((targetY - pos.y) * STIFFNESS - vel.y * DAMPING) * h
        pos.x += vel.x * h
        pos.y += vel.y * h
      }

      // Ease presence in and out; speed raises the stir fast and lets it fall slowly.
      presence += ((inside ? 1 : 0) - presence) * (1 - Math.exp(-dt * (inside ? 4 : 2)))
      const speed = Math.min(Math.hypot(vel.x, vel.y) / 1400, 1)
      stir += (speed - stir) * (1 - Math.exp(-dt * (speed > stir ? 8 : 1.5)))

      // At rest, hand back to the still filter so the edges stay crisp.
      const idle = presence < 0.01 && stir < 0.01 // Under half a pixel of warp.
      if (idle) {
        if (!wasIdle) setLiquid(false)
        wasIdle = true
        return
      }
      wasIdle = false

      const t = now / 1000
      const r = glass.dropRadius
      n.drop?.setAttribute('x', (pos.x - r).toFixed(1))
      n.drop?.setAttribute('y', (pos.y - r).toFixed(1))
      n.glint?.setAttribute('x', (pos.x - r).toFixed(1))
      n.glint?.setAttribute('y', (pos.y - r).toFixed(1))
      n.dropShift?.setAttribute('scale', (presence * maxDrop).toFixed(2))
      n.glintAlpha?.setAttribute('values', glintAlphaMatrix(presence * 0.25))
      // A gentle swell while hovering, much more when the cursor moves fast.
      n.wave?.setAttribute('scale', ((presence * 0.1 + stir) * maxWave).toFixed(2))
      setLiquid(true)
      n.turbulence?.setAttribute(
        'baseFrequency',
        `${(WAVE_FREQUENCY.x * (1 + Math.sin(t * 0.7) * 0.12)).toFixed(5)} ${(
          WAVE_FREQUENCY.y *
          (1 + Math.cos(t * 0.55) * 0.12)
        ).toFixed(5)}`,
      )
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      // Restore the still filter directly: `liquidOn` may be stale after a React re-render.
      if (surface) {
        surface.style.backdropFilter = surfaceFilter(filterId, false)
        surface.style.setProperty('-webkit-backdrop-filter', surfaceFilter(filterId, false))
      }
    }
  }, [filterId, pointerRef, layout, glass, enabled])
}

/* ------------------------------------------------------------------------- */
/* Component                                                                  */
/* ------------------------------------------------------------------------- */

const rise: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      y: { duration: 1.8, delay: 0.3, ease: EASE_IN_OUT },
      opacity: { duration: 1.4, delay: 0.3, ease: EASE_SOFT },
    },
  },
}

type Mode = 'refract' | 'frost' | 'flat'

function detectMode(): Mode {
  const caps = detectRendererCapabilities()
  if (caps.reducedTransparency || caps.forcedColors) return 'flat'
  if (caps.backdropUrlSyntax && caps.svgFilterElements) return 'refract'
  return caps.backdropFilter ? 'frost' : 'flat'
}

interface HeroWordmarkProps {
  text: string
  /** Entrance state, shared with the rest of the hero. */
  initial: 'hidden' | false
  animate: 'hidden' | 'visible'
  /** The hero's pointer, for the liquid hover. */
  pointerRef: RefObject<PointerState>
  /** Fine pointer available and motion allowed: the glass reacts to the cursor. */
  interactive: boolean
  /** False while the hero is scrolled out of view: the liquid loop stops. */
  active: boolean
  className?: string
}

/**
 * Large liquid-glass lettering behind the hero's 3D scene. The page behind
 * the letters (speckle and travelling light) is refracted through a lens
 * shaped like the glyphs (Chromium), or frosted elsewhere, with a lit rim.
 *
 * Decorative: the same words are in the hero copy for assistive tech.
 */
export function HeroWordmark({
  text,
  initial,
  animate,
  pointerRef,
  interactive,
  active,
  className,
}: HeroWordmarkProps) {
  const areaRef = useRef<HTMLDivElement>(null)
  const area = useElementSize(areaRef)
  const filterId = `wordmark-${useId().replace(/[^\w-]/g, '')}`
  const [mode] = useState(detectMode)
  const [glass, setGlass] = useState<GlassText | null>(null)
  const layout = useRef<{ left: number; top: number; areaWidth: number; areaHeight: number } | null>(null)

  // Re-render the glyph images once the font is in and whenever the hero resizes.
  useEffect(() => {
    if (area.width === 0 || area.height === 0) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      try {
        await document.fonts.load(font(100), text)
        if (cancelled) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        setGlass(renderGlassText(text, area.width, area.height, dpr))
      } catch {
        // No canvas or font: the hero simply goes without the wordmark.
      }
    }, 120)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [text, area.width, area.height])

  const left = glass ? (area.width - glass.width) / 2 : 0
  const top = glass ? (area.height - glass.height) / 2 - area.height * LIFT : 0
  useEffect(() => {
    layout.current = { left, top, areaWidth: area.width, areaHeight: area.height }
  }, [left, top, area.width, area.height])

  useLiquid({
    filterId,
    pointerRef,
    layout,
    glass,
    enabled: mode === 'refract' && interactive && active,
  })

  const box: CSSProperties | undefined = glass
    ? { width: glass.width, height: glass.height, left, top }
    : undefined

  // Chromium: the filter draws the whole glass (glyph cut, tint, rim), so the
  // box needs no mask and the edges are free to ripple.
  if (mode === 'refract') {
    return (
      <div ref={areaRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className ?? ''}`}>
        {glass && (
          <>
            <LensFilter id={filterId} glass={glass} />
            {/*
              Animates itself rather than through a wrapper: opacity on an
              ancestor would cut it off from the backdrop it bends.
            */}
            <motion.div
              data-wordmark-surface={filterId}
              className="absolute"
              style={{
                ...box,
                backdropFilter: surfaceFilter(filterId, false),
                WebkitBackdropFilter: surfaceFilter(filterId, false),
              }}
              variants={rise}
              initial={initial}
              animate={animate}
            />
          </>
        )}
      </div>
    )
  }

  // Elsewhere: frosted (or flat) glyphs through a mask, with the rim on top.
  const masked: CSSProperties | undefined = glass
    ? {
        ...box,
        maskImage: `url(${glass.mask})`,
        WebkitMaskImage: `url(${glass.mask})`,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        ...(mode === 'frost' && {
          backdropFilter: 'blur(10px) brightness(1.06) saturate(1.4)',
          WebkitBackdropFilter: 'blur(10px) brightness(1.06) saturate(1.4)',
        }),
      }
    : undefined

  return (
    <div ref={areaRef} aria-hidden className={`pointer-events-none absolute inset-0 ${className ?? ''}`}>
      {glass && (
        <>
          <motion.div
            className={mode === 'flat' ? 'absolute bg-neutral-200' : 'absolute bg-neutral-950/4'}
            style={masked}
            variants={rise}
            initial={initial}
            animate={animate}
          />
          <motion.img
            alt=""
            src={glass.rim}
            className="absolute max-w-none select-none"
            style={box}
            variants={rise}
            initial={initial}
            animate={animate}
          />
        </>
      )}
    </div>
  )
}
