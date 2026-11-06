import { useState } from 'react'
import { motion } from 'motion/react'
import { ABOUT } from '../../data/about'
import { cx } from '../../utils/cx'
import { Eyebrow } from '../ui/Eyebrow'
import { Icon } from '../ui/Icon'
import { IN_VIEW, fadeUp, stagger } from '../ui/motion'
import { Reveal } from '../ui/Reveal'
import { RevealText } from '../ui/RevealText'
import { Section } from '../ui/Section'
import { HEADING } from '../ui/typography'
import { SystemVisual } from './SystemVisual'

// Module-level so the canvas effect sees a stable array.
const HIGHLIGHT_TAGS = ABOUT.highlights.map((highlight) => highlight.tag)

/** "Studio" in the header navigation points here. */
export function About() {
  // Hovering a highlight lights up its node in the visual.
  const [active, setActive] = useState<number | null>(null)

  return (
    <Section id="studio" labelledBy="about-title">
      <div className="grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7 lg:col-span-6">
          <Reveal y={12}>
            <Eyebrow>{ABOUT.label}</Eyebrow>
          </Reveal>
          <RevealText id="about-title" text={ABOUT.headline} className={cx(HEADING, 'max-w-[13ch]')} />
          <motion.div
            className="mt-10 grid max-w-xl gap-5 text-[0.95rem] leading-relaxed text-neutral-500 md:mt-14 md:text-base"
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}
            variants={stagger(0.12, 0.2)}
          >
            {ABOUT.intro.map((paragraph, index) => (
              <motion.p
                key={index}
                variants={fadeUp}
                className={index === 0 ? 'text-neutral-950' : undefined}
              >
                {paragraph}
              </motion.p>
            ))}
          </motion.div>
        </div>

        <Reveal delay={0.15} className="md:col-span-5 md:col-start-8 md:self-center">
          <SystemVisual activeIndex={active} labels={HIGHLIGHT_TAGS} />
        </Reveal>
      </div>

      <motion.ul
        aria-label="Areas of focus"
        className="mt-20 grid gap-px border-y border-neutral-200 bg-neutral-200 sm:grid-cols-2 md:mt-28 lg:grid-cols-4"
        initial="hidden"
        whileInView="visible"
        viewport={IN_VIEW}
        variants={stagger(0.08)}
      >
        {ABOUT.highlights.map((highlight, index) => (
          <motion.li
            key={highlight.title}
            variants={fadeUp}
            onPointerEnter={() => setActive(index)}
            onPointerLeave={() => setActive(null)}
            className="group relative bg-white py-8 sm:px-6 md:py-10"
          >
            {/* Top rule draws across on hover. */}
            <span
              aria-hidden
              className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-neutral-950 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transition-none"
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400 transition-colors duration-300 group-hover:text-neutral-950">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon
                name={highlight.icon}
                className="size-5 text-neutral-400 transition-[color,rotate] duration-500 group-hover:-rotate-6 group-hover:text-neutral-950 motion-reduce:transition-none"
              />
            </div>
            <h3 className="mt-10 text-lg leading-snug font-semibold tracking-[-0.02em] text-neutral-950 md:mt-14">
              {highlight.title}
            </h3>
            <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-neutral-500">{highlight.body}</p>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  )
}
