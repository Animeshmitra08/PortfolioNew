import { useRef, useState, type PointerEvent } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import type { Project } from '../../data/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cx } from '../../utils/cx'
import { ArrowIcon } from '../ui/ArrowIcon'
import { GlassSurface } from '../ui/GlassSurface'
import { ARTWORK_META } from './artwork/meta'
import { ProjectCover } from './ProjectCover'

interface ProjectMediaProps {
  project: Project
  href: string
  /** Aspect-ratio (and grid placement) classes for this layout. */
  className?: string
}

/**
 * Large project preview: subtle scroll parallax, slow zoom on hover and a
 * glass "View" lens that trails the cursor. Touch devices get a static label.
 */
export function ProjectMedia({ project, href, className }: ProjectMediaProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const reducedMotion = useReducedMotion()
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  // Kept within the 5% overscan of the image layer (percent of its own height).
  const parallax = useTransform(scrollYProgress, [0, 1], reducedMotion ? ['0%', '0%'] : ['-4%', '4%'])

  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const lensX = useSpring(cursorX, { stiffness: 350, damping: 32, mass: 0.6 })
  const lensY = useSpring(cursorY, { stiffness: 350, damping: 32, mass: 0.6 })
  const [hovering, setHovering] = useState(false)

  const track = (event: PointerEvent<HTMLAnchorElement>, jump: boolean) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    if (jump || reducedMotion) {
      lensX.jump(x)
      lensY.jump(y)
    }
    cursorX.set(x)
    cursorY.set(y)
  }

  const dark = !project.cover && ARTWORK_META[project.artwork].tone === 'dark'

  return (
    <a
      ref={ref}
      href={href}
      // The title and "Case study" links carry the same destination for
      // keyboard and screen-reader users.
      tabIndex={-1}
      aria-hidden="true"
      onPointerEnter={(event) => {
        if (event.pointerType === 'touch') return
        track(event, true)
        setHovering(true)
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== 'touch') track(event, false)
      }}
      onPointerLeave={() => setHovering(false)}
      className={cx('group/media relative block overflow-hidden bg-neutral-100', className)}
    >
      <motion.div className="absolute inset-x-0 -top-[5%] -bottom-[5%]" style={{ y: parallax }}>
        <div className="size-full transition-transform duration-500 group-hover/media:scale-[1.045] motion-reduce:transition-none">
          <ProjectCover project={project} />
        </div>
      </motion.div>

      {/* Flat, soft shade on hover. */}
      <span className="pointer-events-none absolute inset-0 bg-neutral-950/10 opacity-0 transition-opacity duration-300 group-hover/media:opacity-100" />

      {canHover ? (
        <motion.span
          className="pointer-events-none absolute top-0 left-0 z-10"
          style={{ x: lensX, y: lensY }}
        >
          <motion.span
            className="block -translate-x-1/2 -translate-y-1/2"
            initial={false}
            animate={{ scale: hovering ? 1 : 0.4, opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <GlassSurface
              as="span"
              followLight={false}
              className="flex size-24 items-center justify-center gap-2 text-sm font-medium text-neutral-950"
              style={{ background: 'rgb(255 255 255 / 0.55)' }}
            >
              <span className="relative">View</span>
              <ArrowIcon direction="up-right" className="relative text-xs" />
            </GlassSurface>
          </motion.span>
        </motion.span>
      ) : (
        <span
          className={cx(
            'absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium backdrop-blur-md',
            dark
              ? 'border-white/25 bg-white/10 text-white'
              : 'border-neutral-950/10 bg-white/70 text-neutral-950',
          )}
        >
          Case study
          <ArrowIcon direction="up-right" className="text-xs" />
        </span>
      )}
    </a>
  )
}
