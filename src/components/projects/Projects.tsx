import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { PROJECTS, PROJECTS_SECTION } from '../../data/projects'
import { Section, SectionHeader } from '../ui/Section'
import { TechTag } from '../ui/TechTag'
import { ProjectFeature, type ProjectLayout } from './ProjectFeature'

const LAYOUT_SEQUENCE: ProjectLayout[] = ['wide', 'large', 'tall', 'split']

/** "Work" in the header navigation points here. */
export function Projects() {
  // Selecting a technology tag highlights every project built with it.
  const [activeTech, setActiveTech] = useState<string | null>(null)
  const toggleTech = (tech: string) => setActiveTech((current) => (current === tech ? null : tech))
  const matches = activeTech ? PROJECTS.filter((p) => p.stack.includes(activeTech)).length : 0

  return (
    <Section id="work" labelledBy="work-title">
      <SectionHeader
        id="work-title"
        label={PROJECTS_SECTION.label}
        title={PROJECTS_SECTION.title}
        intro={PROJECTS_SECTION.intro}
      />

      <div
        aria-live="polite"
        className="mt-12 flex min-h-9 flex-wrap items-center gap-3 border-t border-neutral-200 pt-5 text-sm text-neutral-500 md:mt-16"
      >
        <AnimatePresence mode="wait" initial={false}>
          {activeTech ? (
            <motion.div
              key="active"
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <span>
                {matches} {matches === 1 ? 'project' : 'projects'} built with
              </span>
              <TechTag label={activeTech} active onToggle={toggleTech} />
              <button
                type="button"
                onClick={() => setActiveTech(null)}
                className="cursor-pointer text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
              >
                Show all
              </button>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              className="text-neutral-400"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              Select a technology to highlight related work.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-24 md:mt-16 md:grid-cols-12 md:gap-y-36">
        {PROJECTS.map((project, index) => (
          <ProjectFeature
            key={project.slug}
            project={project}
            index={index}
            layout={LAYOUT_SEQUENCE[index % LAYOUT_SEQUENCE.length]}
            activeTech={activeTech}
            onToggleTech={toggleTech}
          />
        ))}
      </div>
    </Section>
  )
}
