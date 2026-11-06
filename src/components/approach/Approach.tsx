import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { APPROACH_SECTION, APPROACH_STAGES } from '../../data/approach'
import { cx } from '../../utils/cx'
import { Icon } from '../ui/Icon'
import { IN_VIEW, fadeUp, stagger } from '../ui/motion'
import { Section, SectionHeader } from '../ui/Section'

const STAGE_COUNT = APPROACH_STAGES.length

/** Index of the last stage the scroll-driven line has reached (-1 for none). */
const reachedStage = (progress: number) =>
  progress <= 0.01 ? -1 : Math.min(STAGE_COUNT - 1, Math.floor(progress * STAGE_COUNT))

/**
 * Four stages on a line that fills as you scroll: horizontal from `md`,
 * vertical below. Each stage lights up as the line reaches it.
 */
export function Approach() {
  const trackRef = useRef<HTMLOListElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 85%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const [reached, setReached] = useState(-1)
  const [hovered, setHovered] = useState<number | null>(null)

  useMotionValueEvent(scrollYProgress, 'change', (value) => setReached(reachedStage(value)))

  const fill = reducedMotion ? 1 : progress

  return (
    <Section id="approach" labelledBy="approach-title">
      <SectionHeader id="approach-title" label={APPROACH_SECTION.label} title={APPROACH_SECTION.title} />

      <motion.ol
        ref={trackRef}
        className="relative mt-16 grid gap-12 md:mt-24 md:grid-cols-4 md:gap-8"
        initial="hidden"
        whileInView="visible"
        viewport={IN_VIEW}
        variants={stagger(0.1)}
      >
        {/* Horizontal rail (desktop). */}
        <span aria-hidden className="absolute top-[11px] right-0 left-0 hidden h-px bg-neutral-200 md:block">
          <motion.span className="block h-full origin-left bg-neutral-950" style={{ scaleX: fill }} />
        </span>
        {/* Vertical rail (mobile). */}
        <span aria-hidden className="absolute top-0 bottom-0 left-[11px] w-px bg-neutral-200 md:hidden">
          <motion.span className="block h-full origin-top bg-neutral-950" style={{ scaleY: fill }} />
        </span>

        {APPROACH_STAGES.map((stage, index) => {
          const lit = reducedMotion || index <= reached
          const focused = hovered === index
          return (
            <motion.li
              key={stage.title}
              variants={fadeUp}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered(null)}
              className="relative pl-12 md:pt-16 md:pl-0"
            >
              <span
                aria-hidden
                className={cx(
                  'absolute top-0 left-0 flex size-[23px] items-center justify-center rounded-full border bg-white transition-colors duration-500',
                  lit ? 'border-neutral-950' : 'border-neutral-300',
                )}
              >
                <span
                  className={cx(
                    'size-[7px] rounded-full transition-[background-color,scale] duration-500',
                    lit ? 'bg-neutral-950' : 'bg-neutral-300',
                    focused ? 'scale-150' : lit ? 'scale-100' : 'scale-75',
                  )}
                />
              </span>

              <span
                aria-hidden
                className={cx(
                  'block text-[clamp(3rem,6vw,5.5rem)] leading-none font-semibold tracking-[-0.05em] transition-colors duration-700',
                  lit ? 'text-neutral-950' : 'text-neutral-200',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="mt-6 flex items-center gap-3">
                <span
                  className={cx(
                    'flex size-9 items-center justify-center rounded-full border transition-colors duration-500',
                    focused
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 text-neutral-500',
                  )}
                >
                  <Icon name={stage.icon} className="size-4" />
                </span>
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-neutral-950">
                  <span className="sr-only">Step {index + 1}: </span>
                  {stage.title}
                </h3>
              </div>
              <p
                className={cx(
                  'mt-3 max-w-[30ch] text-sm leading-relaxed transition-colors duration-500 md:text-[0.95rem]',
                  focused ? 'text-neutral-950' : 'text-neutral-500',
                )}
              >
                {stage.body}
              </p>
            </motion.li>
          )
        })}
      </motion.ol>
    </Section>
  )
}
