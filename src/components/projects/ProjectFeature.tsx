import { motion } from 'motion/react'
import type { Project } from '../../data/projects'
import { cx } from '../../utils/cx'
import { EASE_OUT, IN_VIEW } from '../ui/motion'
import { TechTag } from '../ui/TechTag'
import { TextLink } from '../ui/TextLink'
import { BODY, LABEL } from '../ui/typography'
import { ProjectMedia } from './ProjectMedia'
import { projectHref } from './projectRoute'

export type ProjectLayout = 'wide' | 'large' | 'tall' | 'split'

/**
 * Asymmetric editorial layouts. On mobile everything stacks at 4:3; from
 * `md` each project takes its own place on the 12-column grid.
 */
const LAYOUTS: Record<
  ProjectLayout,
  { article: string; inner: string; media: string; body: string; columns: boolean }
> = {
  // Cinematic full-width image, copy split into two columns underneath.
  wide: {
    article: 'md:col-span-12',
    inner: '',
    media: 'aspect-[4/3] md:aspect-[21/9]',
    body: 'mt-8 grid gap-6 md:mt-10 md:grid-cols-12 md:gap-8',
    columns: true,
  },
  // Large image on the left.
  large: {
    article: 'md:col-span-7',
    inner: '',
    media: 'aspect-[4/3]',
    body: 'mt-8 md:mt-10',
    columns: false,
  },
  // Narrow portrait image, dropped down for an offset rhythm.
  tall: {
    article: 'md:col-span-5 md:col-start-8 md:mt-24 lg:col-span-4 lg:col-start-9',
    inner: '',
    media: 'aspect-[4/3] md:aspect-[4/5]',
    body: 'mt-8 md:mt-10',
    columns: false,
  },
  // Copy on the left, image on the right.
  split: {
    article: 'md:col-span-12',
    inner: 'md:grid md:grid-cols-12 md:items-end md:gap-8',
    media: 'aspect-[4/3] md:col-span-8 md:col-start-5 md:row-start-1 md:aspect-[16/10]',
    body: 'mt-8 md:col-span-4 md:col-start-1 md:row-start-1 md:mt-0 md:pb-2',
    columns: false,
  },
}

interface ProjectFeatureProps {
  project: Project
  index: number
  layout: ProjectLayout
  /** Technology currently used to highlight projects, if any. */
  activeTech: string | null
  onToggleTech: (tech: string) => void
}

export function ProjectFeature({ project, index, layout, activeTech, onToggleTech }: ProjectFeatureProps) {
  const styles = LAYOUTS[layout]
  const href = projectHref(project.slug)
  const number = String(index + 1).padStart(2, '0')
  const titleId = `project-${project.slug}-title`
  const dimmed = activeTech !== null && !project.stack.includes(activeTech)

  const heading = (
    <>
      <p className={cx('flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-500', LABEL)}>
        <span className="font-mono tracking-normal text-neutral-950">{number}</span>
        <span aria-hidden className="h-px w-8 bg-neutral-300" />
        <span>{project.category}</span>
      </p>
      <h3
        id={titleId}
        className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-balance text-neutral-950 lg:text-4xl xl:text-5xl"
      >
        <a
          href={href}
          className="transition-colors duration-300 hover:text-neutral-600 focus-visible:underline focus-visible:decoration-1 focus-visible:underline-offset-8 focus-visible:outline-none"
        >
          {project.name}
        </a>
      </h3>
    </>
  )

  const details = (
    <>
      <p className={cx(BODY, 'max-w-xl')}>{project.summary}</p>
      <ul aria-label={`${project.name} technology`} className="mt-6 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li key={tech}>
            <TechTag label={tech} active={activeTech === tech} onToggle={onToggleTech} />
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <TextLink href={href}>
          Case study<span className="sr-only">: {project.name}</span>
        </TextLink>
        {project.links.github ? (
          <TextLink href={project.links.github} external>
            GitHub<span className="sr-only"> repository for {project.name}</span>
          </TextLink>
        ) : (
          <span className="text-xs text-neutral-400">Private repository</span>
        )}
        {project.links.live && (
          <TextLink href={project.links.live} external>
            Live demo<span className="sr-only"> of {project.name}</span>
          </TextLink>
        )}
      </div>
    </>
  )

  return (
    <motion.article
      aria-labelledby={titleId}
      className={styles.article}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={IN_VIEW}
      transition={{ duration: 0.8, ease: EASE_OUT }}
    >
      {/* Dimming lives on an inner element: motion owns the article's opacity. */}
      <div
        className={cx(
          'transition-opacity duration-500 motion-reduce:transition-none',
          dimmed && 'opacity-30',
          styles.inner,
        )}
      >
        <ProjectMedia project={project} href={href} className={styles.media} />
        <div className={styles.body}>
          {styles.columns ? (
            <>
              <div className="md:col-span-5">{heading}</div>
              <div className="md:col-span-6 md:col-start-7 lg:col-span-5 lg:col-start-8">{details}</div>
            </>
          ) : (
            <>
              {heading}
              <div className="mt-6">{details}</div>
            </>
          )}
        </div>
      </div>
    </motion.article>
  )
}
