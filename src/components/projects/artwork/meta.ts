import type { ArtworkKind } from './types'

interface ArtworkMeta {
  /**
   * Background tone, so overlays can pick a legible colour. Light artwork is
   * inverted in the dark theme (see ProjectArtwork); dark artwork never changes.
   */
  tone: 'dark' | 'light'
  /** 16:10 detail crops shown in the case-study gallery until screenshots exist. */
  crops: [string, string]
}

export const ARTWORK_META: Record<ArtworkKind, ArtworkMeta> = {
  racing: { tone: 'dark', crops: ['440 520 720 450', '150 160 800 500'] },
  quest: { tone: 'light', crops: ['400 400 640 400', '560 100 560 350'] },
  toolkit: { tone: 'dark', crops: ['620 200 640 400', '440 440 640 400'] },
  enterprise: { tone: 'light', crops: ['1000 160 480 300', '486 248 640 400'] },
}
