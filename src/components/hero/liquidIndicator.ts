/**
 * Water-like motion for a capsule indicator.
 *
 * The two edges are independent damped springs. The edge on the side of
 * travel leads on a stiff spring while the trailing edge follows on a softer
 * one, so the capsule stretches toward its target like a drop being pulled,
 * then catches up. Height is tied to the stretch (roughly preserving area),
 * so it thins in flight, then fattens slightly and wobbles as it lands.
 */

interface Spring {
  x: number
  velocity: number
  target: number
}

interface SpringConfig {
  stiffness: number
  damping: number
}

// Both slightly underdamped (ζ ≈ 0.65), which gives the jelly-like settle.
const LEADING: SpringConfig = { stiffness: 420, damping: 27 }
const TRAILING: SpringConfig = { stiffness: 150, damping: 16 }

/** Fixed physics step for stable integration regardless of frame rate. */
const STEP = 1 / 240
const MAX_FRAME = 1 / 30
const MIN_WIDTH = 12

export interface LiquidIndicator {
  /** Move to a box (relative to the positioning parent). `instant` snaps without animating. */
  moveTo(x: number, width: number, options?: { instant?: boolean }): void
  destroy(): void
}

export function createLiquidIndicator(element: HTMLElement, restHeight: number): LiquidIndicator {
  const left: Spring = { x: 0, velocity: 0, target: 0 }
  const right: Spring = { x: 0, velocity: 0, target: 0 }
  let leadingEdge: Spring = right
  let frame: number | null = null
  let lastTime = 0
  let placed = false

  const render = () => {
    const width = Math.max(right.x - left.x, MIN_WIDTH)
    const restWidth = Math.max(right.target - left.target, MIN_WIDTH)
    // Stretched → thinner; compressed on landing → slightly fuller.
    const squash = Math.min(Math.max(Math.pow(width / restWidth, -0.5), 0.7), 1.12)
    element.style.width = `${width.toFixed(2)}px`
    element.style.height = `${(restHeight * squash).toFixed(2)}px`
    element.style.transform = `translate3d(${left.x.toFixed(2)}px, -50%, 0)`
  }

  const integrate = (spring: Spring, config: SpringConfig, dt: number) => {
    const acceleration =
      -config.stiffness * (spring.x - spring.target) - config.damping * spring.velocity
    spring.velocity += acceleration * dt
    spring.x += spring.velocity * dt
  }

  const settled = (spring: Spring) =>
    Math.abs(spring.x - spring.target) < 0.05 && Math.abs(spring.velocity) < 0.05

  const tick = (time: number) => {
    let remaining = lastTime ? Math.min((time - lastTime) / 1000, MAX_FRAME) : 1 / 60
    lastTime = time
    while (remaining > 0) {
      const dt = Math.min(STEP, remaining)
      integrate(left, leadingEdge === left ? LEADING : TRAILING, dt)
      integrate(right, leadingEdge === right ? LEADING : TRAILING, dt)
      remaining -= dt
    }

    if (settled(left) && settled(right)) {
      snap()
      return
    }
    render()
    frame = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (frame !== null) cancelAnimationFrame(frame)
    frame = null
    lastTime = 0
  }

  const snap = () => {
    stop()
    for (const spring of [left, right]) {
      spring.x = spring.target
      spring.velocity = 0
    }
    render()
  }

  return {
    moveTo(x, width, { instant = false } = {}) {
      const currentCenter = (left.x + right.x) / 2
      left.target = x
      right.target = x + width

      if (instant || !placed) {
        placed = true
        snap()
        return
      }
      // Whichever edge faces the destination leads; the other is dragged along.
      leadingEdge = x + width / 2 >= currentCenter ? right : left
      if (frame === null) frame = requestAnimationFrame(tick)
    },
    destroy: stop,
  }
}
