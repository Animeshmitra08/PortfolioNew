import type { CSSProperties } from 'react'

/**
 * Edge treatment for OpenGlass surfaces on a white page: a grey hairline so
 * the white specular arc shows where light enters, and a fainter
 * counter-reflection so the light direction stays readable.
 *
 * These override OpenGlass's per-element `--ogui-lg-*` tokens, so they must be
 * set on every Glass element (they are not inherited from a parent Glass).
 */
export const GLASS_EDGE_STYLE = {
  borderRadius: 9999,
  '--ogui-glass-rim-width': '1.5px',
  '--ogui-lg-edge': 'rgb(10 10 10 / 0.2)',
  '--ogui-lg-spec-counter': 'rgb(255 255 255 / 0.3)',
} as CSSProperties
