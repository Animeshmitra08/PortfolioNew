import type { Project } from '../../data/projects'
import { ProjectArtwork } from './artwork/ProjectArtwork'

interface ProjectCoverProps {
  project: Project
  /** Crop of the illustration (ignored for real images). */
  viewBox?: string
  /** Load eagerly, e.g. for the case-study hero image. */
  eager?: boolean
}

/** The project's real cover image when provided, otherwise its illustration. */
export function ProjectCover({ project, viewBox, eager = false }: ProjectCoverProps) {
  if (project.cover) {
    return (
      <img
        src={project.cover.src}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="block size-full object-cover"
      />
    )
  }
  return <ProjectArtwork kind={project.artwork} viewBox={viewBox} className="block size-full" />
}
