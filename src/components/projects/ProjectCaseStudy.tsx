import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import type { Project } from '../../data/projects'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cx } from '../../utils/cx'
import { LiquidGlassBar } from '../hero/LiquidGlassBar'
import { ArrowIcon } from '../ui/ArrowIcon'
import { Eyebrow } from '../ui/Eyebrow'
import { Icon } from '../ui/Icon'
import { EASE_OUT, IN_VIEW, fadeUp, stagger } from '../ui/motion'
import { TechTag } from '../ui/TechTag'
import { TextLink } from '../ui/TextLink'
import { BODY, FOCUS_RING, LABEL } from '../ui/typography'
import { ARTWORK_META } from './artwork/meta'
import { ProjectArtwork } from './artwork/ProjectArtwork'
import { ProjectCover } from './ProjectCover'
import { CASE_STUDY_TITLE_ID, projectHref } from './projectRoute'

interface ProjectCaseStudyProps {
  project: Project
  index: number
  next: Project
  onClose: () => void
  onNavigate: (slug: string) => void
}

export function ProjectCaseStudy({ project, index, next, onClose, onNavigate }: ProjectCaseStudyProps) {
  const number = String(index + 1).padStart(2, '0')
  const { detail, links } = project

  const interactive = useMediaQuery('(hover: hover) and (pointer: fine)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Like the header: a clear lens at the top, frosted once content (such as
  // the dark cover image) scrolls underneath it. The dialog is the scroller.
  const rootRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const scroller = rootRef.current?.closest('dialog')
    if (!scroller) return
    const update = () => setScrolled(scroller.scrollTop > 24)
    scroller.addEventListener('scroll', update, { passive: true })
    return () => scroller.removeEventListener('scroll', update)
  }, [])

  return (
    <div ref={rootRef} className="min-h-full bg-white text-left">
      {/* The header's liquid-glass bar, in the header's position. */}
      <nav
        aria-label="Case study"
        className="pointer-events-none sticky top-0 z-20 px-4 pt-4 md:px-8 md:pt-6"
      >
        <LiquidGlassBar
          lensId="case-study-glass"
          interactive={interactive}
          reducedMotion={reducedMotion}
          frosted={scrolled}
          className="pointer-events-auto flex items-center justify-between gap-4 px-3 py-2 md:px-4 md:py-2.5"
        >
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className={cx(
              'group relative inline-flex cursor-pointer items-center gap-2.5 rounded-full px-2 py-1.5 text-sm text-neutral-500 transition-colors duration-300 hover:text-neutral-950',
              FOCUS_RING,
            )}
          >
            <ArrowIcon direction="left" className="text-[0.8rem]" />
            All work
          </button>
          <p className="relative hidden min-w-0 truncate text-sm font-medium text-neutral-950 sm:block">
            <span className="mr-2 font-mono text-neutral-400">{number}</span>
            {project.name}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close case study"
            className={cx(
              'relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-950 transition-colors duration-300 hover:bg-neutral-950 hover:text-white',
              FOCUS_RING,
            )}
          >
            <Icon name="close" className="size-4" />
          </button>
        </LiquidGlassBar>
      </nav>

      <motion.article
        aria-labelledby={CASE_STUDY_TITLE_ID}
        className="px-6 pb-16 md:px-10 md:pb-24"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        <header className="grid gap-8 pt-14 md:grid-cols-12 md:items-end md:pt-24">
          <div className="md:col-span-8">
            <Eyebrow>
              {number} — {project.category}
            </Eyebrow>
            <h2
              id={CASE_STUDY_TITLE_ID}
              className="m-0 text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-neutral-950"
            >
              {project.name}
            </h2>
          </div>
          <p className={cx(BODY, 'max-w-sm md:col-span-4 md:justify-self-end')}>{project.summary}</p>
        </header>

        <dl className="mt-12 grid gap-px border-y border-neutral-200 bg-neutral-200 sm:grid-cols-3 md:mt-16">
          <MetaCell label="Category">{project.category}</MetaCell>
          <MetaCell label="Stack">{project.stack.join(', ')}</MetaCell>
          <MetaCell label="Links">
            <span className="flex flex-wrap gap-x-6 gap-y-2">
              {links.github ? (
                <TextLink href={links.github} external>
                  GitHub
                </TextLink>
              ) : (
                <span className="text-neutral-500">Private repository</span>
              )}
              {links.live && (
                <TextLink href={links.live} external>
                  Live demo
                </TextLink>
              )}
              {links.related?.map((link) => (
                <TextLink key={link.href} href={link.href} external>
                  {link.label}
                </TextLink>
              ))}
            </span>
          </MetaCell>
        </dl>

        <figure className="mt-10 overflow-hidden bg-neutral-100 md:mt-14">
          <div className="aspect-[4/3] sm:aspect-[16/9]">
            <ProjectCover project={project} eager />
          </div>
          {!project.cover && <figcaption className="sr-only">Illustrative preview of {project.name}.</figcaption>}
        </figure>

        <Block label="Overview">
          <p className="text-[clamp(1.2rem,2vw,1.6rem)] leading-snug font-medium tracking-[-0.015em] text-neutral-950">
            {detail.overview}
          </p>
        </Block>

        <Block label="Problem">
          <p className={cx(BODY, 'max-w-2xl md:text-base')}>{detail.problem}</p>
        </Block>

        <Block label="Solution">
          <p className={cx(BODY, 'max-w-2xl md:text-base')}>{detail.solution}</p>
        </Block>

        <Block label="Features">
          <motion.ol
            className="grid gap-px border-y border-neutral-200 bg-neutral-200 sm:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}
            variants={stagger(0.06)}
          >
            {detail.features.map((feature, i) => (
              <motion.li key={feature} variants={fadeUp} className="flex gap-4 bg-white py-4 sm:pr-6">
                <span className="pt-0.5 font-mono text-xs text-neutral-400">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[0.95rem] text-neutral-950">{feature}</span>
              </motion.li>
            ))}
          </motion.ol>
        </Block>

        <Block label="Technical implementation">
          <NoteList notes={detail.implementation} />
        </Block>

        <Block label="Technology stack">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li key={tech}>
                <TechTag label={tech} />
              </li>
            ))}
          </ul>
        </Block>

        {/* With a real cover but no screenshots there is nothing new to show. */}
        {(project.gallery.length > 0 || !project.cover) && (
          <Block label="Gallery">
            <Gallery project={project} />
          </Block>
        )}

        <Block label="Development challenges">
          <NoteList notes={detail.challenges} numbered />
        </Block>

        <nav aria-label="Next project" className="mt-20 border-t border-neutral-950 pt-8 md:mt-28">
          <a
            href={projectHref(next.slug)}
            onClick={(event) => {
              event.preventDefault()
              onNavigate(next.slug)
            }}
            className="group grid gap-3 focus-visible:outline-none md:grid-cols-12 md:items-end md:gap-8"
          >
            <span className={cx('text-neutral-400 md:col-span-3', LABEL)}>Next project</span>
            <span className="flex items-center justify-between gap-6 md:col-span-9">
              <span className="text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-neutral-950 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 group-focus-visible:underline group-focus-visible:decoration-2 group-focus-visible:underline-offset-8">
                {next.name}
              </span>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-950 transition-colors duration-300 group-hover:border-neutral-950 group-hover:bg-neutral-950 group-hover:text-white md:size-16">
                <ArrowIcon direction="right" />
              </span>
            </span>
          </a>
        </nav>
      </motion.article>
    </div>
  )
}

function MetaCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-white py-5 sm:px-6 sm:first:pl-0">
      <dt className={cx('text-neutral-400', LABEL)}>{label}</dt>
      <dd className="mt-2 text-sm text-neutral-950">{children}</dd>
    </div>
  )
}

function Block({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="mt-16 grid gap-6 border-t border-neutral-200 pt-8 md:mt-24 md:grid-cols-12 md:gap-8 md:pt-10">
      <h3 className={cx('text-neutral-400 md:col-span-3', LABEL)}>{label}</h3>
      <motion.div
        className="md:col-span-9 lg:col-span-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={IN_VIEW}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </section>
  )
}

function NoteList({ notes, numbered = false }: { notes: Project['detail']['implementation']; numbered?: boolean }) {
  return (
    <dl className="border-t border-neutral-200">
      {notes.map((note, i) => (
        <div key={note.title} className="grid gap-2 border-b border-neutral-200 py-5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
          <dt className="flex gap-3 text-[0.95rem] font-semibold tracking-[-0.01em] text-neutral-950">
            {numbered && <span className="pt-0.5 font-mono text-xs font-normal text-neutral-400">{String(i + 1).padStart(2, '0')}</span>}
            {note.title}
          </dt>
          <dd className={BODY}>{note.body}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Real screenshots when provided; otherwise two detail crops of the illustration. */
function Gallery({ project }: { project: Project }) {
  if (project.gallery.length > 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {project.gallery.map((image) => (
          <figure key={image.src} className="m-0">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="block aspect-[16/10] w-full bg-neutral-100 object-cover"
            />
            {image.caption && <figcaption className="mt-3 text-xs text-neutral-500">{image.caption}</figcaption>}
          </figure>
        ))}
      </div>
    )
  }

  const crops = ARTWORK_META[project.artwork].crops
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {crops.map((crop, i) => (
        <figure key={crop} className="group m-0">
          <div className="aspect-[16/10] overflow-hidden bg-neutral-100">
            <div className="size-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none">
              <ProjectArtwork kind={project.artwork} viewBox={crop} className="block size-full" />
            </div>
          </div>
          <figcaption className="mt-3 flex gap-3 text-xs text-neutral-500">
            <span className="font-mono text-neutral-400">Fig. {String(i + 1).padStart(2, '0')}</span>
            Illustrative detail
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
