import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from 'motion/react'
import { cx } from '../../utils/cx'
import { EASE_IN_OUT, EASE_SOFT } from '../ui/motion'

/** How long the panels take to part. The page's entrance is timed against this. */
export const OPENING_PART_S = 1.6

/** Beat between the corner details fading and the panels starting to move. */
const PART_DELAY_S = 0.25

type Half = 'start' | 'end'

/**
 * The two halves of the screen, split along the diagonal from the top-right
 * corner to the bottom-left one. Percentages follow the viewport, so the cut
 * always runs corner to corner whatever its shape.
 */
const CLIP: Record<Half, string> = {
  start: 'polygon(0 0, 100% 0, 0 100%)',
  end: 'polygon(100% 0, 100% 100%, 0 100%)',
}

/** Each half leaves through its own corner; 60% clears the corner fully. */
const OFFSET: Record<Half, string> = {
  start: '-60%',
  end: '60%',
}

const panelVariants = (half: Half, reducedMotion: boolean): Variants => ({
  closed: { x: 0, y: 0, opacity: 1, transition: { duration: 1.2, ease: EASE_IN_OUT } },
  open: reducedMotion
    ? { opacity: 0, transition: { duration: 0.6, ease: EASE_SOFT } }
    : {
        x: OFFSET[half],
        y: OFFSET[half],
        transition: { duration: OPENING_PART_S, delay: PART_DELAY_S, ease: EASE_IN_OUT },
      },
})

/* ------------------------------------------------------------------------- */
/* Stage motion                                                               */
/* ------------------------------------------------------------------------- */

type StageState = 'hidden' | 'visible' | 'leaving'

/**
 * The whole stage: still while the screen is up, then a slow push-in while
 * the panels part, so the exit feels like moving forward into the page.
 */
const stageVariants = (reducedMotion: boolean): Variants => ({
  hidden: { scale: 1 },
  visible: { scale: 1 },
  leaving: reducedMotion
    ? { scale: 1 }
    : {
        scale: 1.08,
        transition: { duration: OPENING_PART_S + PART_DELAY_S, ease: EASE_IN_OUT },
      },
})

/** The title: each letter rises out of a mask in a slow, overlapping wave. */
const titleVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
}

const letterVariants = (reducedMotion: boolean): Variants =>
  reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, ease: EASE_SOFT } },
      }
    : {
        hidden: { y: '100%', rotate: 4, opacity: 0, filter: 'blur(8px)' },
        visible: {
          y: '0%',
          rotate: 0,
          opacity: 1,
          filter: 'blur(0px)',
          transition: {
            // Travel eases in and out; the fade and focus land a touch earlier.
            y: { duration: 1.2, ease: EASE_IN_OUT },
            rotate: { duration: 1.2, ease: EASE_IN_OUT },
            opacity: { duration: 0.9, ease: EASE_SOFT },
            filter: { duration: 1, ease: EASE_SOFT },
          },
        },
      }

/** Corner metadata and tagline: drift up into focus, then drift out before the panels part. */
const metaVariants = (reducedMotion: boolean): Variants => ({
  hidden: { opacity: 0, y: reducedMotion ? 0 : 10, filter: reducedMotion ? 'none' : 'blur(6px)' },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1, delay: reducedMotion ? 0 : delay, ease: EASE_SOFT },
  }),
  leaving: {
    opacity: 0,
    y: reducedMotion ? 0 : -8,
    filter: reducedMotion ? 'none' : 'blur(4px)',
    transition: { duration: 0.5, ease: EASE_IN_OUT },
  },
})

/** The hairlines either side of the tagline draw outwards from it, and retract on exit. */
const ruleVariants = (reducedMotion: boolean): Variants => ({
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: reducedMotion ? 0 : 1.1, delay: reducedMotion ? 0 : 1, ease: EASE_IN_OUT },
  },
  leaving: { scaleX: 0, transition: { duration: 0.5, ease: EASE_IN_OUT } },
})

type StageProps = {
  title: string
  tagline: string
  role: string
  counter: MotionValue<string>
  progress: MotionValue<number>
  isOpen: boolean
  reducedMotion: boolean
}

/**
 * Everything drawn on a panel. Both halves render an identical stage with the
 * same timing, so it reads as one screen until the panels part and tear it
 * along the cut.
 */
function Stage({ title, tagline, role, counter, progress, isOpen, reducedMotion }: StageProps) {
  const meta = metaVariants(reducedMotion)
  const letter = letterVariants(reducedMotion)
  const rule = ruleVariants(reducedMotion)
  const year = new Date().getFullYear()
  // The title has no `leaving` state, so it stays whole and is torn by the panels.
  const state: StageState = isOpen ? 'leaving' : 'visible'

  return (
    <motion.div
      aria-hidden
      className="relative flex size-full flex-col justify-between p-6 text-neutral-950 md:p-10"
      variants={stageVariants(reducedMotion)}
      initial="hidden"
      animate={state}
    >
      {/* Top row: what this is, and who made it. */}
      <div className="flex items-start justify-between gap-6 font-mono text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase">
        <motion.span variants={meta} custom={0.3}>
          Portfolio <span className="text-neutral-400">©{year}</span>
        </motion.span>
        <motion.span variants={meta} custom={0.45} className="text-right">
          {role}
        </motion.span>
      </div>

      {/* Centre: the name, and a tagline between two drawn rules. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        <motion.p
          variants={titleVariants}
          className="m-0 flex overflow-hidden px-[0.06em] py-[0.1em] text-6xl leading-none font-display font-normal tracking-normal uppercase sm:text-8xl lg:text-9xl"
        >
          {Array.from(title).map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              variants={letter}
              className="inline-block origin-bottom-left will-change-transform"
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
        </motion.p>

        <div className="mt-4 flex items-center gap-4 md:mt-6">
          <motion.span variants={rule} className="block h-px w-8 origin-right bg-neutral-400 md:w-16" />
          <motion.span
            variants={meta}
            custom={1.15}
            className="font-mono text-xs font-medium tracking-[0.3em] whitespace-nowrap text-neutral-500 uppercase"
          >
            {tagline}
          </motion.span>
          <motion.span variants={rule} className="block h-px w-8 origin-left bg-neutral-400 md:w-16" />
        </div>
      </div>

      {/* Bottom row: a counter and a meter that fill during the hold. */}
      <div className="flex items-end justify-between gap-6">
        <motion.span
          variants={meta}
          custom={0.6}
          className="flex items-start text-5xl leading-none font-display font-normal tracking-normal tabular-nums md:text-7xl"
        >
          <motion.span>{counter}</motion.span>
          <span className="ml-1 font-mono text-xs font-medium tracking-normal text-neutral-400">%</span>
        </motion.span>

        <motion.div variants={meta} custom={0.75} className="flex w-32 flex-col gap-3 md:w-48">
          <span className="font-mono text-xs font-medium tracking-[0.18em] text-neutral-500 uppercase">
            Loading
          </span>
          <span className="relative block h-px w-full bg-neutral-300">
            <motion.span
              className="absolute inset-0 block origin-left bg-neutral-950"
              style={{ scaleX: progress }}
            />
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------------- */
/* Panels                                                                     */
/* ------------------------------------------------------------------------- */

type PanelProps = Omit<StageProps, 'isOpen'> & {
  half: Half
  isOpen: boolean
  onSettled?: (state: 'open' | 'closed') => void
}

/** One diagonal half: a full-screen layer clipped to a triangle. */
function Panel({ half, isOpen, reducedMotion, onSettled, ...stage }: PanelProps) {
  return (
    <motion.div
      className={cx('absolute inset-0', half === 'start' ? 'bg-neutral-100' : 'bg-white')}
      style={{ clipPath: CLIP[half] }}
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      variants={panelVariants(half, reducedMotion)}
      onAnimationComplete={(definition) => onSettled?.(definition as 'open' | 'closed')}
    >
      <Stage {...stage} isOpen={isOpen} reducedMotion={reducedMotion} />
    </motion.div>
  )
}

type OpeningProps = {
  /** The word in the middle of the screen. */
  title?: string
  /** Short line under the title. */
  tagline?: string
  /** Shown in the top-right corner. */
  role?: string
  /**
   * Controls the panels. Leave it out and the screen runs on its own: the
   * title arrives, the counter fills over `holdMs`, then the panels open.
   */
  open?: boolean
  /** How long the closed screen stays up (and the counter runs) before opening. */
  holdMs?: number
  /**
   * Fires as the panels start to part. Use it to start the page's own
   * entrance so it plays while the panels are still moving away.
   */
  onOpening?: () => void
  /** Fires once the panels have fully parted (a good time to unmount). */
  onOpened?: () => void
  /** Fires once the panels have come back together after being open. */
  onClosed?: () => void
}

/**
 * Full-screen opening: a name that rises in letter by letter, framed by
 * mono metadata and a counter, over two panels cut along the diagonal. The
 * panels slide apart through opposite corners to reveal the page, and slide
 * back together when `open` turns false.
 */
export function Opening({
  title = 'ANIMESH',
  tagline = 'Apps · 3D · Products',
  role = 'Software Developer',
  open,
  holdMs = 2800,
  onOpening,
  onOpened,
  onClosed,
}: OpeningProps) {
  const reducedMotion = !!useReducedMotion()
  const [autoOpen, setAutoOpen] = useState(false)
  const isOpen = open ?? autoOpen
  const hasOpened = useRef(false)

  // One shared value drives both halves' counter and meter, so they never drift.
  const percent = useMotionValue(0)
  const counter = useTransform(percent, (v) => String(Math.round(v)).padStart(3, '0'))
  const progress = useTransform(percent, [0, 100], [0, 1])

  // The counter lands at 100 a beat before the panels move, so the exit never
  // starts mid-count.
  useEffect(() => {
    const controls = animate(percent, 100, {
      duration: reducedMotion ? 0 : (holdMs / 1000) * 0.85,
      ease: EASE_IN_OUT,
    })
    return () => controls.stop()
  }, [percent, holdMs, reducedMotion])

  // Let the page start its entrance as the panels begin to part.
  const onOpeningRef = useRef(onOpening)
  useEffect(() => {
    onOpeningRef.current = onOpening
  })
  useEffect(() => {
    if (isOpen) onOpeningRef.current?.()
  }, [isOpen])

  // Uncontrolled: open on our own after the hold.
  useEffect(() => {
    if (open !== undefined) return
    const timer = window.setTimeout(() => setAutoOpen(true), holdMs)
    return () => window.clearTimeout(timer)
  }, [open, holdMs])

  // The page underneath shouldn't scroll while it's covered.
  useEffect(() => {
    if (isOpen) return
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [isOpen])

  const handleSettled = (state: 'open' | 'closed') => {
    if (state === 'open') {
      hasOpened.current = true
      onOpened?.()
    } else if (hasOpened.current) {
      onClosed?.()
    }
  }

  const stage = { title, tagline, role, counter, progress, reducedMotion }

  return (
    <div
      role="status"
      aria-hidden={isOpen}
      className={cx('fixed inset-0 z-[100] overflow-hidden', isOpen && 'pointer-events-none')}
    >
      <span className="sr-only">Loading {title}</span>

      <Panel half="start" isOpen={isOpen} {...stage} />
      <Panel half="end" isOpen={isOpen} {...stage} onSettled={handleSettled} />

      {/* The cut: a hairline drawn corner to corner before the panels part. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.line
          x1="100"
          y1="0"
          x2="0"
          y2="100"
          vectorEffect="non-scaling-stroke"
          className="stroke-neutral-300"
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 1 }}
          animate={isOpen ? { pathLength: 1, opacity: 0 } : { pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: reducedMotion ? 0 : 1.1, delay: 0.8, ease: EASE_IN_OUT },
            opacity: { duration: 0.5, ease: EASE_SOFT },
          }}
        />
      </svg>
    </div>
  )
}
