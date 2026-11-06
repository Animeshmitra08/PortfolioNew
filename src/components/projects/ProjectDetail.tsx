import { useEffect, useRef } from 'react'
import { PROJECTS } from '../../data/projects'
import { useLocationHash } from '../../hooks/useLocationHash'
import { ProjectCaseStudy } from './ProjectCaseStudy'
import { CASE_STUDY_TITLE_ID, projectHref, replaceHash, slugFromHash } from './projectRoute'

/**
 * Full-screen case study driven by `#work/<slug>`. A native modal dialog
 * provides focus containment, Escape handling and an inert page behind it.
 */
export function ProjectDetail() {
  const hash = useLocationHash()
  const slug = slugFromHash(hash)
  const index = slug ? PROJECTS.findIndex((project) => project.slug === slug) : -1
  const project = index >= 0 ? PROJECTS[index] : null
  const isOpen = project !== null

  const dialogRef = useRef<HTMLDialogElement>(null)
  // Opened from a link on this page (Back returns to it) vs. loaded directly.
  const openedInPage = useRef(false)
  const mounted = useRef(false)
  // Guards against closing twice (e.g. cancel + forced close) before the URL updates.
  const closing = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    closing.current = false
    if (project && !dialog.open) {
      openedInPage.current = mounted.current
      dialog.showModal()
    } else if (!project && dialog.open) {
      dialog.close()
    }
    if (project) dialog.scrollTo({ top: 0 })
    mounted.current = true
  }, [project])

  // Keep the page behind from scrolling, without a layout jump.
  useEffect(() => {
    if (!isOpen) return
    const root = document.documentElement
    const scrollbar = window.innerWidth - root.clientWidth
    const previous = { overflow: root.style.overflow, paddingRight: root.style.paddingRight }
    root.style.overflow = 'hidden'
    if (scrollbar > 0) root.style.paddingRight = `${scrollbar}px`
    return () => {
      root.style.overflow = previous.overflow
      root.style.paddingRight = previous.paddingRight
    }
  }, [isOpen])

  const close = () => {
    if (closing.current) return
    closing.current = true
    if (openedInPage.current) {
      window.history.back()
      return
    }
    // Arrived via a shared link: land on the work section instead of leaving.
    replaceHash('#work')
    document.getElementById('work')?.scrollIntoView()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={CASE_STUDY_TITLE_ID}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      // Browsers may still force-close (e.g. repeated Escape); resync the URL.
      onClose={() => {
        if (slugFromHash(window.location.hash)) close()
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-x-hidden overflow-y-auto overscroll-contain border-0 bg-white p-0 text-neutral-950 backdrop:bg-white"
    >
      {project && (
        <ProjectCaseStudy
          key={project.slug}
          project={project}
          index={index}
          next={PROJECTS[(index + 1) % PROJECTS.length]}
          onClose={close}
          // Moving between case studies replaces the entry, so Back still
          // returns to the page in one step.
          onNavigate={(nextSlug) => replaceHash(projectHref(nextSlug))}
        />
      )}
    </dialog>
  )
}
