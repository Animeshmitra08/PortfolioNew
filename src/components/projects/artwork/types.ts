/** Illustrated covers available to projects without real screenshots yet. */
export type ArtworkKind = 'racing' | 'quest' | 'toolkit' | 'enterprise'

export interface ArtworkProps {
  /** Crop of the 1600 × 1000 canvas, e.g. for gallery details. */
  viewBox?: string
  className?: string
}

export const ARTWORK_VIEWBOX = '0 0 1600 1000'
