import { useId } from 'react'
import { ARTWORK_VIEWBOX, type ArtworkProps } from './types'

// An isometric puzzle temple: stepped tiers with a gate, a crystal above the
// tower, floating puzzle blocks, a rune circle (the hidden clue), spike traps
// and two players heading in together.

const ISO = { ox: 800, oy: 373, ux: 46.8, uy: 27, uz: 54 }

function project(x: number, y: number, z: number): [number, number] {
  return [ISO.ox + (x - y) * ISO.ux, ISO.oy + (x + y) * ISO.uy - z * ISO.uz]
}
const toPoints = (corners: Array<[number, number, number]>) =>
  corners.map(([x, y, z]) => project(x, y, z).map((n) => n.toFixed(1)).join(',')).join(' ')

/** Affine map from a horizontal plane at height z onto the screen. */
const planeMatrix = (z: number) =>
  `matrix(${ISO.ux} ${ISO.uy} ${-ISO.ux} ${ISO.uy} ${ISO.ox} ${ISO.oy - z * ISO.uz})`

const SHADE = { top: '#ffffff', left: '#e8e8eb', right: '#d4d4d9' }
const STROKE = 'rgba(10, 10, 10, 0.17)'

interface Box {
  x: number
  y: number
  z: number
  w: number
  d: number
  h: number
  floating?: boolean
}
interface Spike {
  x: number
  y: number
}

const boxes: Box[] = []
const solid = new Set<string>()
const key = (x: number, y: number, z: number) => `${x},${y},${z}`
const cube = (x: number, y: number, z: number) => {
  boxes.push({ x, y, z, w: 1, d: 1, h: 1 })
  solid.add(key(x, y, z))
}

// Base platform.
for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) cube(x, y, 0)
// Second tier with a gate cut into its front-left face, and a lintel above.
for (let x = 1; x < 7; x++)
  for (let y = 1; y < 7; y++) if (!(y === 6 && (x === 3 || x === 4))) cube(x, y, 1)
for (let x = 2; x < 6; x++) cube(x, 6, 2)
// Third tier and tower.
for (let x = 2; x < 6; x++) for (let y = 2; y < 6; y++) cube(x, y, 2)
for (let z = 3; z < 5; z++) for (let x = 3; x < 5; x++) for (let y = 3; y < 5; y++) cube(x, y, z)
// Pillars, one of them broken.
for (let z = 0; z < 3; z++) cube(9, 1, z)
for (let z = 0; z < 2; z++) cube(-1, 8, z)
cube(9, 6, 0)
// Steps up to the gate.
boxes.push({ x: 3, y: 8, z: 0, w: 2, d: 0.7, h: 0.5 })
// Fallen pillar fragment and floating puzzle blocks.
boxes.push({ x: 9.4, y: 7.6, z: 0, w: 0.6, d: 0.6, h: 0.6 })
boxes.push({ x: 10.2, y: 3.2, z: 4.6, w: 0.55, d: 0.55, h: 0.55, floating: true })
boxes.push({ x: -1.4, y: 4.2, z: 4.1, w: 0.6, d: 0.6, h: 0.6, floating: true })
boxes.push({ x: 6.9, y: -1.7, z: 4.9, w: 0.42, d: 0.42, h: 0.42, floating: true })
// A far-off floating island.
boxes.push({ x: -6, y: 2, z: 3.2, w: 2.2, d: 1.4, h: 0.45, floating: true })

const spikes: Spike[] = []
for (const y of [9.3, 9.9]) {
  for (let x = 0.4; x < 2.6; x += 0.5) spikes.push({ x, y })
  for (let x = 5.2; x < 7.4; x += 0.5) spikes.push({ x, y })
}

interface Polygon {
  points: string
  fill: string
}

const isUnitCube = (b: Box) => b.w === 1 && b.d === 1 && b.h === 1
const depthOf = (x: number, y: number, z: number) => x + y + z

// Painter's algorithm: viewer looks from +x +y +z, so draw by ascending x+y+z.
const drawables: Array<{ depth: number; polygons: Polygon[] }> = [
  ...boxes.map((b) => {
    const unit = isUnitCube(b)
    const polygons: Polygon[] = []
    if (!(unit && solid.has(key(b.x + 1, b.y, b.z)))) {
      polygons.push({
        points: toPoints([
          [b.x + b.w, b.y, b.z],
          [b.x + b.w, b.y + b.d, b.z],
          [b.x + b.w, b.y + b.d, b.z + b.h],
          [b.x + b.w, b.y, b.z + b.h],
        ]),
        fill: SHADE.right,
      })
    }
    if (!(unit && solid.has(key(b.x, b.y + 1, b.z)))) {
      polygons.push({
        points: toPoints([
          [b.x, b.y + b.d, b.z],
          [b.x + b.w, b.y + b.d, b.z],
          [b.x + b.w, b.y + b.d, b.z + b.h],
          [b.x, b.y + b.d, b.z + b.h],
        ]),
        fill: SHADE.left,
      })
    }
    if (!(unit && solid.has(key(b.x, b.y, b.z + 1)))) {
      polygons.push({
        points: toPoints([
          [b.x, b.y, b.z + b.h],
          [b.x + b.w, b.y, b.z + b.h],
          [b.x + b.w, b.y + b.d, b.z + b.h],
          [b.x, b.y + b.d, b.z + b.h],
        ]),
        fill: SHADE.top,
      })
    }
    return { depth: depthOf(b.x + b.w / 2, b.y + b.d / 2, b.z + b.h / 2), polygons }
  }),
  ...spikes.map((s) => {
    const size = 0.32
    const apex: [number, number, number] = [s.x + size / 2, s.y + size / 2, 0.5]
    return {
      depth: depthOf(s.x + size / 2, s.y + size / 2, 0.2),
      polygons: [
        {
          points: toPoints([[s.x + size, s.y, 0], [s.x + size, s.y + size, 0], apex]),
          fill: SHADE.right,
        },
        {
          points: toPoints([[s.x, s.y + size, 0], [s.x + size, s.y + size, 0], apex]),
          fill: SHADE.left,
        },
      ],
    }
  }),
].sort((a, b) => a.depth - b.depth)

const POLYGONS = drawables.flatMap((d) => d.polygons)

const SHADOWS = boxes
  .filter((b) => b.floating)
  .map((b) =>
    toPoints([
      [b.x, b.y, 0],
      [b.x + b.w, b.y, 0],
      [b.x + b.w, b.y + b.d, 0],
      [b.x, b.y + b.d, 0],
    ]),
  )

const GRID_LINES = Array.from({ length: 21 }, (_, i) => i - 4)

const PATH = (() => {
  const points = [
    [4, 15.5],
    [4, 12.4],
    [3.6, 11.2],
    [4, 9.1],
  ].map(([x, y]) => project(x, y, 0))
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`
})()

const PLAYERS = [project(3.35, 7.35, 1), project(4.75, 7.05, 1)]
const [CRYSTAL_X, CRYSTAL_Y] = project(4, 4, 6.7)
const [TOWER_X, TOWER_Y] = project(4, 4, 5)
const RUNE_TICKS = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)

export function QuestArtwork({ viewBox = ARTWORK_VIEWBOX, className }: ArtworkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={id('sky')} cx="800" cy="420" r="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fbfbfb" />
          <stop offset="1" stopColor="#ededef" />
        </radialGradient>
        <radialGradient id={id('grid-fade')} cx="820" cy="640" r="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={id('grid-mask')}>
          <rect width="1600" height="1000" fill={url('grid-fade')} />
        </mask>
        <linearGradient id={id('fog')} x1="0" y1="760" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f1f1f3" stopOpacity="0" />
          <stop offset="1" stopColor="#f1f1f3" stopOpacity="1" />
        </linearGradient>
        <radialGradient id={id('crystal-glow')} cx={CRYSTAL_X} cy={CRYSTAL_Y} r="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1600" height="1000" fill={url('sky')} />
      {/* Pale moon. */}
      <circle cx="1230" cy="250" r="112" fill="#fff" />
      <circle cx="1230" cy="250" r="140" fill="none" stroke="#0a0a0a" strokeOpacity="0.05" />

      {/* Ground grid, fading out with distance. */}
      <g mask={url('grid-mask')} stroke="#0a0a0a" strokeOpacity="0.07" strokeWidth="1">
        {GRID_LINES.map((n) => {
          const [ax, ay] = project(n, -4, 0)
          const [bx, by] = project(n, 16, 0)
          const [cx1, cy1] = project(-4, n, 0)
          const [dx, dy] = project(16, n, 0)
          return (
            <g key={n}>
              <line x1={ax} y1={ay} x2={bx} y2={by} />
              <line x1={cx1} y1={cy1} x2={dx} y2={dy} />
            </g>
          )
        })}
      </g>

      {/* Ground markings: rune circle (the hidden clue), shadows, footpath. */}
      <g transform={planeMatrix(0)}>
        <g transform="translate(11.3 5.4)" fill="none" stroke="#0a0a0a" vectorEffect="non-scaling-stroke">
          <circle r="1.5" strokeOpacity="0.35" vectorEffect="non-scaling-stroke" />
          <circle r="1.15" strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />
          {RUNE_TICKS.map((angle) => (
            <line
              key={angle}
              x1={Math.cos(angle) * 1.15}
              y1={Math.sin(angle) * 1.15}
              x2={Math.cos(angle) * 1.5}
              y2={Math.sin(angle) * 1.5}
              strokeOpacity="0.3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d="M0 -0.75 L0.65 0.4 L-0.65 0.4 Z" strokeOpacity="0.45" vectorEffect="non-scaling-stroke" />
          <circle r="0.16" fill="#0a0a0a" fillOpacity="0.5" stroke="none" />
        </g>
      </g>
      {SHADOWS.map((points) => (
        <polygon key={points} points={points} fill="#0a0a0a" opacity="0.06" />
      ))}
      <path d={PATH} fill="none" stroke="#0a0a0a" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 16" />

      {/* Structure, traps and floating blocks in depth order. */}
      <g stroke={STROKE} strokeWidth="1" strokeLinejoin="round">
        {POLYGONS.map((polygon, i) => (
          <polygon key={i} points={polygon.points} fill={polygon.fill} />
        ))}
      </g>

      {/* Carved glyphs on the front face of the platform. */}
      {[1, 6].map((x) => {
        const [gx, gy] = project(x + 0.5, 8, 0.5)
        return (
          <g key={x} transform={`translate(${gx} ${gy})`} fill="none" stroke="#0a0a0a" strokeOpacity="0.4">
            <ellipse rx="11" ry="13" transform="skewY(30)" />
            <path d="M0 -6 L0 6" transform="skewY(30)" />
          </g>
        )
      })}

      {/* Glyph on the tower top, beam and floating crystal. */}
      <g transform={planeMatrix(5)} fill="none" stroke="#0a0a0a">
        <circle cx="4" cy="4" r="0.62" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
        <circle cx="4" cy="4" r="0.3" strokeOpacity="0.3" vectorEffect="non-scaling-stroke" />
      </g>
      <line x1={TOWER_X} y1={TOWER_Y} x2={CRYSTAL_X} y2={CRYSTAL_Y + 50} stroke="#0a0a0a" strokeOpacity="0.3" strokeDasharray="2 6" />
      <circle cx={CRYSTAL_X} cy={CRYSTAL_Y} r="120" fill={url('crystal-glow')} />
      <g transform={`translate(${CRYSTAL_X} ${CRYSTAL_Y})`} stroke="#0a0a0a" strokeOpacity="0.55" strokeLinejoin="round">
        <path d="M0 -50 L30 0 L0 50 Z" fill="#ffffff" />
        <path d="M0 -50 L-30 0 L0 50 Z" fill={SHADE.left} />
        <path d="M-30 0 L30 0" strokeOpacity="0.25" />
      </g>

      {/* Two players. */}
      {PLAYERS.map(([px, py], i) => (
        <g key={i} transform={`translate(${px} ${py})`}>
          <ellipse cx="0" cy="0" rx="12" ry="5" fill="#0a0a0a" opacity="0.12" />
          <rect x="-7" y="-30" width="14" height="24" rx="7" fill="#0a0a0a" />
          <circle cx="0" cy="-38" r="7" fill="#0a0a0a" />
        </g>
      ))}

      <rect y="760" width="1600" height="240" fill={url('fog')} />
    </svg>
  )
}
