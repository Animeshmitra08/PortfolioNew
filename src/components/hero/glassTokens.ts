import type { CSSProperties } from 'react'

/**
 * Edge treatment for OpenGlass surfaces: a hairline so the specular arc shows
 * where light enters, and a fainter counter-reflection so the light direction
 * stays readable. The colours are theme tokens from index.css (grey on the
 * white page, soft white on the black one).
 *
 * These override OpenGlass's per-element `--ogui-lg-*` tokens, so they must be
 * set on every Glass element (they are not inherited from a parent Glass).
 */
export const GLASS_EDGE_STYLE = {
  borderRadius: 9999,
  '--ogui-glass-rim-width': '1.5px',
  '--ogui-lg-edge': 'var(--glass-edge)',
  '--ogui-lg-spec-counter': 'var(--glass-spec-counter)',
} as CSSProperties
