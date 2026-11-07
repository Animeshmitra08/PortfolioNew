import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { mulberry32 } from '../../utils/random'

// Hero palette: ink, net nodes (#4a4a50) and net lines (#7c7c83).
const INK = '10, 10, 10'
const NODE = '74, 74, 80'
const LINE = '124, 124, 131'

const SPACING = 30
const BASE_TILT = 0.36
const RING_RADIUS = 2.3
const CAMERA_DISTANCE = 7
const SQRT3 = Math.sqrt(3)
const ALPHA_BUCKETS = 6
const LABEL_FONT = '500 10px "Geist Mono Variable", ui-monospace, monospace'

type Vec3 = [number, number, number]

function rotateX([x, y, z]: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [x, y * c - z * s, y * s + z * c]
}
function rotateY([x, y, z]: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [x * c + z * s, y, -x * s + z * c]
}
function rotateZ([x, y, z]: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return [x * c - y * s, x * s + y * c, z]
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

// The hero cube's orientation: balanced on a vertex, body diagonal vertical.
const CORNERS: Vec3[] = []
for (const x of [-1, 1])
  for (const y of [-1, 1])
    for (const z of [-1, 1]) CORNERS.push(rotateZ(rotateY([x, y, z], Math.PI / 4), Math.atan(Math.SQRT2)))

// Corners that differ along exactly one axis share an edge.
const EDGES: Array<[number, number]> = []
for (let i = 0; i < 8; i++) for (const bit of [1, 2, 4]) if (!(i & bit)) EDGES.push([i, i | bit])

interface Lattice {
  base: Float32Array
  pos: Float32Array
  alpha: Float32Array
  segments: Uint32Array
  count: number
}

/** Jittered, triangulated lattice — the hero's net mesh, flattened to 2D. */
function buildLattice(width: number, height: number): Lattice {
  const cols = Math.max(2, Math.ceil(width / SPACING) + 2)
  const rows = Math.max(2, Math.ceil(height / SPACING) + 2)
  const random = mulberry32(11)
  const count = cols * rows
  const base = new Float32Array(count * 2)
  const originX = (width - (cols - 1) * SPACING) / 2
  const originY = (height - (rows - 1) * SPACING) / 2
  const jitter = SPACING * 0.3

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      base[i * 2] = originX + col * SPACING + (random() - 0.5) * 2 * jitter
      base[i * 2 + 1] = originY + row * SPACING + (random() - 0.5) * 2 * jitter
    }
  }

  const segments: number[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col
      const right = col < cols - 1
      const down = row < rows - 1
      if (right) segments.push(i, i + 1)
      if (down) segments.push(i, i + cols)
      if (right && down) {
        if ((row + col) % 2 === 0) segments.push(i, i + cols + 1)
        else segments.push(i + 1, i + cols)
      }
    }
  }

  return {
    base,
    pos: new Float32Array(count * 2),
    alpha: new Float32Array(count),
    segments: Uint32Array.from(segments),
    count,
  }
}

interface SystemVisualProps {
  /** Index of the highlighted orbit node, or null. */
  activeIndex: number | null
  /** One short label per orbit node. */
  labels: string[]
}

/**
 * A wireframe of the hero cube, orbited by one node per area of expertise,
 * over a faint net that wakes up around the cursor. Pure 2D canvas, so it
 * costs far less than a second WebGL scene, and it pauses off-screen.
 */
export function SystemVisual({ activeIndex, labels }: SystemVisualProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const readoutRef = useRef<HTMLSpanElement>(null)
  const activeRef = useRef(activeIndex)
  const redrawRef = useRef<(() => void) | null>(null)

  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  useEffect(() => {
    activeRef.current = activeIndex
    redrawRef.current?.()
  }, [activeIndex])

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!frame || !canvas || !context) return
    const ctx = context

    let width = 0
    let height = 0
    let lattice = buildLattice(1, 1)
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, inside: false, presence: 0 }
    const emphasis = labels.map(() => 0)
    let spin = 0.6
    let orbit = 0
    let time = 0
    let raf: number | null = null
    let lastTime = 0
    let visible = false
    let readoutClock = 0
    const ghost = !canHover && !reducedMotion

    const render = (dt: number) => {
      if (width === 0 || height === 0) return
      const motion = reducedMotion ? 0 : 1
      time += dt

      // --- Inputs, eased (frame-rate independent).
      if (ghost) {
        // Touch: a slow autonomous drift keeps the net gently alive.
        pointer.targetX = Math.sin(time * 0.33) * 0.55
        pointer.targetY = Math.sin(time * 0.27 + 1.2) * 0.45
        pointer.inside = true
      }
      const follow = 1 - Math.exp(-6 * dt)
      pointer.x += (pointer.targetX - pointer.x) * follow
      pointer.y += (pointer.targetY - pointer.y) * follow
      const presenceRate = pointer.inside ? 3.5 : 1.6
      pointer.presence +=
        ((pointer.inside ? (ghost ? 0.6 : 1) : 0) - pointer.presence) * (1 - Math.exp(-presenceRate * dt))

      spin += dt * 0.3 * motion
      orbit -= dt * 0.1 * motion
      const emphasisRate = reducedMotion || dt === 0 ? 1 : 1 - Math.exp(-8 * dt)
      for (let i = 0; i < emphasis.length; i++) {
        emphasis[i] += ((activeRef.current === i ? 1 : 0) - emphasis[i]) * emphasisRate
      }

      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2
      const size = Math.min(width, height)
      const unit = size * 0.13
      const cubeRadius = unit * SQRT3 * 1.1

      // --- Net: displaced away from the pointer and revealed around it.
      const px = (pointer.x * 0.5 + 0.5) * width
      const py = (0.5 - pointer.y * 0.5) * height
      const radius = size * 0.34
      const reveal = pointer.presence
      const push = 9 * reveal * motion
      const { base, pos, alpha, segments, count } = lattice
      for (let i = 0; i < count; i++) {
        const bx = base[i * 2]
        const by = base[i * 2 + 1]
        const dx = bx - px
        const dy = by - py
        const dist = Math.hypot(dx, dy) || 1
        let influence = 1 - smoothstep(0, radius, dist)
        influence *= influence
        pos[i * 2] = bx + (dx / dist) * push * influence
        pos[i * 2 + 1] = by + (dy / dist) * push * influence
        const visibility = 1 - smoothstep(0, radius * 1.3, dist)
        // A calm halo around the cube so the net never competes with it.
        const calm = 0.2 + 0.8 * smoothstep(cubeRadius * 0.8, cubeRadius * 1.6, Math.hypot(bx - cx, by - cy))
        // Fade out toward the frame so the net never reads as a border.
        const edge = smoothstep(0, 48, Math.min(bx, by, width - bx, height - by))
        alpha[i] = Math.min(1, (0.16 + reveal * visibility * 0.9) * calm * edge)
      }

      const linePaths = Array.from({ length: ALPHA_BUCKETS }, () => new Path2D())
      for (let s = 0; s < segments.length; s += 2) {
        const a = segments[s]
        const b = segments[s + 1]
        const level = Math.min(alpha[a], alpha[b])
        if (level < 0.02) continue
        const bucket = Math.min(ALPHA_BUCKETS - 1, Math.floor(level * ALPHA_BUCKETS))
        linePaths[bucket].moveTo(pos[a * 2], pos[a * 2 + 1])
        linePaths[bucket].lineTo(pos[b * 2], pos[b * 2 + 1])
      }
      ctx.lineWidth = 1
      linePaths.forEach((path, bucket) => {
        ctx.strokeStyle = `rgba(${LINE}, ${((bucket + 0.5) / ALPHA_BUCKETS) * 0.55})`
        ctx.stroke(path)
      })
      for (let i = 0; i < count; i++) {
        if (alpha[i] < 0.02) continue
        ctx.fillStyle = `rgba(${NODE}, ${alpha[i] * 0.85})`
        ctx.fillRect(pos[i * 2] - 1, pos[i * 2 + 1] - 1, 2, 2)
      }

      // --- Cube and orbit, leaning toward the cursor like the hero cube.
      const lean = canHover ? pointer.presence * motion : 0
      const yaw = pointer.x * 0.5 * lean
      const pitch = BASE_TILT - pointer.y * 0.35 * lean
      const wobble = Math.sin(time * 0.35) * 0.08 * motion
      const toView = (v: Vec3) => rotateX(rotateY(v, yaw), pitch)
      const project = (v: Vec3) => {
        const scale = CAMERA_DISTANCE / (CAMERA_DISTANCE - v[2])
        return { x: cx + v[0] * unit * scale, y: cy - v[1] * unit * scale, z: v[2] }
      }

      // Vertex-up axis, dashed like a drafting construction line.
      const axisTop = project(toView([0, 2.7, 0]))
      const axisBottom = project(toView([0, -2.7, 0]))
      ctx.setLineDash([2, 5])
      ctx.strokeStyle = `rgba(${INK}, 0.2)`
      ctx.beginPath()
      ctx.moveTo(axisTop.x, axisTop.y)
      ctx.lineTo(axisBottom.x, axisBottom.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Ring, split into the half behind the cube and the half in front.
      const ringPitch = 0.12
      const ringPoint = (theta: number) =>
        project(toView(rotateX([RING_RADIUS * Math.cos(theta), 0, RING_RADIUS * Math.sin(theta)], ringPitch)))
      const back = new Path2D()
      const front = new Path2D()
      const STEPS = 96
      for (let i = 0; i < STEPS; i++) {
        const a = ringPoint((i / STEPS) * Math.PI * 2)
        const b = ringPoint(((i + 1) / STEPS) * Math.PI * 2)
        const path = (a.z + b.z) / 2 < 0 ? back : front
        path.moveTo(a.x, a.y)
        path.lineTo(b.x, b.y)
      }

      const nodes = labels.map((label, i) => {
        const point = ringPoint(orbit + (i * Math.PI) / 2 + Math.PI / 4)
        return { ...point, label: `${String(i + 1).padStart(2, '0')} ${label.toUpperCase()}`, i }
      })

      const drawNode = (node: (typeof nodes)[number]) => {
        const e = emphasis[node.i]
        const depth = 0.55 + 0.45 * ((node.z + RING_RADIUS) / (2 * RING_RADIUS))
        if (e > 0.01) {
          ctx.setLineDash([3, 4])
          ctx.strokeStyle = `rgba(${INK}, ${0.4 * e})`
          ctx.beginPath()
          ctx.moveTo(node.x, node.y)
          ctx.lineTo(cx, cy)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.strokeStyle = `rgba(${INK}, ${0.18 * e})`
          ctx.beginPath()
          ctx.arc(node.x, node.y, 4 + 10 * e, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(node.x, node.y, 3 + 2 * e, 0, Math.PI * 2)
        ctx.fillStyle = e > 0.5 ? `rgb(${INK})` : '#fff'
        ctx.fill()
        ctx.lineWidth = 1.25
        ctx.strokeStyle = `rgba(${INK}, ${(0.45 + 0.55 * e) * depth})`
        ctx.stroke()
        ctx.lineWidth = 1

        // Label sits outward from the centre, aligned away from the cube.
        const dx = node.x - cx
        const dy = node.y - cy
        const length = Math.hypot(dx, dy) || 1
        ctx.font = LABEL_FONT
        ctx.letterSpacing = '1px'
        ctx.textAlign = dx < 0 ? 'right' : 'left'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = `rgba(${INK}, ${(0.32 + 0.63 * e) * depth})`
        // Keep labels inside the frame on narrow screens.
        const textWidth = ctx.measureText(node.label).width
        const margin = 10
        let labelX = node.x + (dx / length) * 14
        labelX = dx < 0 ? Math.max(labelX, margin + textWidth) : Math.min(labelX, width - margin - textWidth)
        ctx.fillText(node.label, labelX, node.y + (dy / length) * 10)
      }

      ctx.setLineDash([2, 4])
      ctx.strokeStyle = `rgba(${INK}, 0.2)`
      ctx.stroke(back)
      ctx.setLineDash([])
      nodes.filter((node) => node.z < 0).forEach(drawNode)

      // Wireframe cube: depth-cued edges, hidden edges dashed.
      const corners = CORNERS.map((corner) => project(toView(rotateX(rotateY(corner, spin), wobble))))
      const edges = EDGES.map(([a, b]) => ({ a: corners[a], b: corners[b], z: (corners[a].z + corners[b].z) / 2 }))
      edges.sort((p, q) => p.z - q.z)
      ctx.lineWidth = 1.25
      for (const edge of edges) {
        const t = (edge.z + SQRT3) / (2 * SQRT3)
        ctx.setLineDash(t < 0.4 ? [3, 4] : [])
        ctx.strokeStyle = `rgba(${INK}, ${0.18 + 0.72 * t})`
        ctx.beginPath()
        ctx.moveTo(edge.a.x, edge.a.y)
        ctx.lineTo(edge.b.x, edge.b.y)
        ctx.stroke()
      }
      ctx.setLineDash([])
      for (const corner of corners) {
        const t = (corner.z + SQRT3) / (2 * SQRT3)
        ctx.beginPath()
        ctx.arc(corner.x, corner.y, 2.4, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.strokeStyle = `rgba(${INK}, ${0.25 + 0.7 * t})`
        ctx.stroke()
      }
      ctx.lineWidth = 1

      ctx.strokeStyle = `rgba(${INK}, 0.42)`
      ctx.stroke(front)
      nodes.filter((node) => node.z >= 0).forEach(drawNode)

      // Live rotation readout in the caption.
      readoutClock += dt
      if ((readoutClock > 0.1 || dt === 0) && readoutRef.current) {
        readoutClock = 0
        const degrees = (((spin * 180) / Math.PI) % 360).toFixed(1).padStart(5, '0')
        readoutRef.current.textContent = `Rot ${degrees}°`
      }
    }

    const loop = (now: number) => {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 1 / 60
      lastTime = now
      render(dt)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (raf !== null || !visible || reducedMotion) return
      lastTime = 0
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf !== null) cancelAnimationFrame(raf)
      raf = null
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lattice = buildLattice(width, height)
      render(0)
    }

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const rect = frame.getBoundingClientRect()
      pointer.targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.targetY = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      pointer.inside = true
    }
    const handleLeave = () => {
      pointer.inside = false
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    visibilityObserver.observe(frame)
    if (canHover && !reducedMotion) {
      frame.addEventListener('pointermove', handleMove, { passive: true })
      frame.addEventListener('pointerleave', handleLeave)
    }
    // Static frames (reduced motion / off-screen) still reflect hover state.
    redrawRef.current = () => {
      if (raf === null) render(0)
    }

    return () => {
      stop()
      redrawRef.current = null
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      frame.removeEventListener('pointermove', handleMove)
      frame.removeEventListener('pointerleave', handleLeave)
    }
  }, [reducedMotion, canHover, labels])

  return (
    <div ref={frameRef} className="relative aspect-square w-full border border-neutral-200 bg-white">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Wireframe cube orbited by four areas of focus: ${labels.join(', ')}.`}
        className="absolute inset-0 size-full"
      />
      {/* Registration marks, like a technical drawing. */}
      {['-top-1.5 -left-1.5', '-top-1.5 -right-1.5', '-bottom-1.5 -left-1.5', '-bottom-1.5 -right-1.5'].map((position) => (
        <span key={position} aria-hidden className={`absolute ${position} size-3`}>
          <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-neutral-950" />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-neutral-950" />
        </span>
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 font-mono text-xs tracking-[0.14em] text-neutral-400 uppercase"
      >
        <span>Fig. 01</span>
        <span>Areas of focus</span>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between p-4 font-mono text-xs tracking-[0.14em] text-neutral-400 uppercase"
      >
        <span>Vertex / up</span>
        <span ref={readoutRef}>Rot 034.4°</span>
      </div>
    </div>
  )
}
