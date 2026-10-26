/**
 * Staircase step geometry: used by both StaircasePath (drawing) and
 * MovingZero (positioning).  Extracted to its own file so StaircasePath.tsx
 * exports only React components (required by react-refresh).
 */

export interface StepGeometry {
  x: number
  y: number
  w: number
  h: number
  num: number
}

export function buildSteps(count: number): StepGeometry[] {
  const steps: StepGeometry[] = []
  const startX = 80
  const startY = 60
  const stepW = 80
  const stepH = 16
  const gapX = 8
  const gapY = 44

  for (let i = 0; i < count; i++) {
    steps.push({
      x: startX + i * (stepW + gapX),
      y: startY + i * gapY,
      w: stepW,
      h: stepH,
      num: i + 1,
    })
  }
  return steps
}

/** Centre of each step, used for positioning the moving zero. */
export function getStepCentres() {
  return buildSteps(10).map((s) => ({
    cx: s.x + s.w / 2,
    cy: s.y + s.h / 2,
  }))
}

