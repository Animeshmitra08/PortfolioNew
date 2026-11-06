import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { EXPERIENCE, EXPERIENCE_SECTION, type ExperienceEntry } from '../../data/experience'
import { cx } from '../../utils/cx'
import { Eyebrow } from '../ui/Eyebrow'
import { IN_VIEW, fadeUp, stagger } from '../ui/motion'
import { Reveal } from '../ui/Reveal'
import { RevealText } from '../ui/RevealText'
import { Section } from '../ui/Section'
import { TechTag } from '../ui/TechTag'
import { HEADING, LABEL } from '../ui/typography'

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 55%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <Section id="experience" labelledBy="experience-title">
      <div className="grid gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-16">
            <Reveal y={12}>
              <Eyebrow>{EXPERIENCE_SECTION.label}</Eyebrow>
            </Reveal>
            <RevealText id="experience-title" text={EXPERIENCE_SECTION.title} className={HEADING} />
          </div>
        </div>

        <ol ref={listRef} className="relative grid gap-20 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
          {/* Rail, and the part of it already "travelled". */}
          <span aria-hidden className="absolute top-2 bottom-0 left-[7px] w-px bg-neutral-200" />
          <motion.span
            aria-hidden
            className="absolute top-2 bottom-0 left-[7px] w-px origin-top bg-neutral-950"
            style={{ scaleY: reducedMotion ? 1 : progress }}
          />
          {EXPERIENCE.map((entry) => (
            <ExperienceItem key={`${entry.company}-${entry.role}`} entry={entry} />
          ))}
        </ol>
      </div>
    </Section>
  )
}

function ExperienceItem({ entry }: { entry: ExperienceEntry }) {
  const current = entry.end.toLowerCase() === 'present'

  return (
    <li className="relative pl-10 md:pl-14">
      <span
        aria-hidden
        className="absolute top-1 left-0 flex size-[15px] items-center justify-center rounded-full border border-neutral-950 bg-white"
      >
        <span className="size-[5px] rounded-full bg-neutral-950" />
        {current && (
          <span className="absolute inset-0 animate-ping rounded-full border border-neutral-950 opacity-40 [animation-duration:2.4s] motion-reduce:hidden" />
        )}
      </span>

      <Reveal>
        <p className={cx('flex flex-wrap items-center gap-x-4 gap-y-2 text-neutral-500', LABEL)}>
          <span className="font-mono tracking-[0.08em] text-neutral-950">
            {entry.start} — {entry.end}
          </span>
          {current && (
            <span className="rounded-full border border-neutral-300 px-2.5 py-1 text-[0.6rem] tracking-[0.18em] text-neutral-950">
              Current
            </span>
          )}
        </p>
        <h3 className="mt-5 max-w-[22ch] text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-neutral-950">
          {entry.role}
        </h3>
        <p className="mt-3 text-[0.95rem] text-neutral-500">
          {entry.company}
          {entry.location && <span className="text-neutral-400"> · {entry.location}</span>}
        </p>
      </Reveal>

      <motion.ul
        aria-label="Responsibilities"
        className="mt-10 border-t border-neutral-200"
        initial="hidden"
        whileInView="visible"
        viewport={IN_VIEW}
        variants={stagger(0.07)}
      >
        {entry.responsibilities.map((item, i) => (
          <motion.li
            key={item}
            variants={fadeUp}
            className="group grid grid-cols-[2.25rem_1fr] gap-3 border-b border-neutral-200 py-4 text-[0.95rem] leading-relaxed text-neutral-600 transition-colors duration-300 hover:text-neutral-950"
          >
            <span className="pt-1 font-mono text-xs text-neutral-400 transition-colors duration-300 group-hover:text-neutral-950">
              {String(i + 1).padStart(2, '0')}
            </span>
            {item}
          </motion.li>
        ))}
      </motion.ul>

      <Reveal className="mt-8">
        <p className={cx('text-neutral-400', LABEL)}>Technologies</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {entry.stack.map((tech) => (
            <li key={tech}>
              <TechTag label={tech} />
            </li>
          ))}
        </ul>
      </Reveal>
    </li>
  )
}
