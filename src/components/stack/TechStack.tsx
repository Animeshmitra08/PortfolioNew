import { motion } from 'motion/react'
import { SKILL_GROUPS, SKILLS_SECTION } from '../../data/skills'
import { Icon } from '../ui/Icon'
import { IN_VIEW, fadeUp, stagger } from '../ui/motion'
import { Section, SectionHeader } from '../ui/Section'
import { TechTag } from '../ui/TechTag'

/**
 * One editorial row per category. Hovering a row draws its top rule, fills
 * its icon and wakes its tags; no progress bars or scores.
 */
export function TechStack() {
  return (
    <Section id="stack" labelledBy="stack-title">
      <SectionHeader
        id="stack-title"
        label={SKILLS_SECTION.label}
        title={SKILLS_SECTION.title}
        intro={SKILLS_SECTION.intro}
      />

      <motion.ul
        className="mt-16 border-t border-neutral-200 md:mt-20"
        initial="hidden"
        whileInView="visible"
        viewport={IN_VIEW}
        variants={stagger(0.08)}
      >
        {SKILL_GROUPS.map((group, index) => (
          <motion.li
            key={group.title}
            variants={fadeUp}
            className="group relative grid gap-6 border-b border-neutral-200 py-8 md:grid-cols-12 md:items-center md:gap-8 md:py-10"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-neutral-950 transition-transform duration-500 group-hover:scale-x-100 motion-reduce:transition-none"
            />

            <div className="flex items-center gap-4 md:col-span-5 lg:col-span-4">
              <span className="w-6 font-mono text-xs text-neutral-400 transition-colors duration-300 group-hover:text-neutral-950">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white">
                <Icon name={group.icon} className="size-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-[-0.02em] text-balance text-neutral-950 md:text-xl">
                {group.title}
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-neutral-500 md:col-span-3 lg:col-span-3">{group.blurb}</p>

            <ul
              aria-label={`${group.title} tools`}
              className="flex flex-wrap gap-2 md:col-span-12 lg:col-span-5 lg:justify-end"
            >
              {group.items.map((item, itemIndex) => (
                <li
                  key={item}
                  // Tags ripple slightly, left to right, when the row is hovered.
                  className="transition-transform duration-500 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                  style={{ transitionDelay: `${itemIndex * 30}ms` }}
                >
                  <TechTag label={item} />
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  )
}
