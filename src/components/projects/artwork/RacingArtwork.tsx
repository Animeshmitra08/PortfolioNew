import { useId } from 'react'
import { mulberry32 } from '../../../utils/random'
import { ARTWORK_VIEWBOX, type ArtworkProps } from './types'

// Night chase-cam: a perspective track running to a glowing vanishing point,
// with a low supercar seen from behind. Monochrome, like the rest of the site.

const HORIZON = 470
const VP_X = 800
const SPREAD = 706 / 530 // road-edge slope (px of x per px of y)

const rowY = (depth: number) => HORIZON + 530 / depth
const leftEdge = (y: number) => 786 - (y - HORIZON) * SPREAD
const rightEdge = (y: number) => 814 + (y - HORIZON) * SPREAD

const random = mulberry32(5)

const GROUND_RAYS = Array.from({ length: 25 }, (_, i) => -1600 + i * 200)
const GROUND_ROWS = [1.35, 1.8, 2.4, 3.2, 4.4, 6, 8.5, 12].map(rowY)

const CENTRE_DASHES = [
  [1.15, 1.45],
  [1.9, 2.3],
  [2.9, 3.5],
  [4.3, 5.2],
  [6.4, 7.8],
  [9.5, 12],
].map(([near, far]) => {
  const top = rowY(far)
  const bottom = rowY(near)
  const topHalf = 1 + (top - HORIZON) * 0.012
  const bottomHalf = 1 + (bottom - HORIZON) * 0.012
  return `${VP_X - topHalf},${top} ${VP_X + topHalf},${top} ${VP_X + bottomHalf},${bottom} ${VP_X - bottomHalf},${bottom}`
})

const LAMPS = [1.25, 1.7, 2.4, 3.5, 5.5, 9].flatMap((depth) => {
  const y = rowY(depth)
  const offset = 70 / depth
  const height = 420 / depth
  const arm = 40 / depth
  return [
    { x: leftEdge(y) - offset, y, height, arm, depth },
    { x: rightEdge(y) + offset, y, height, arm: -arm, depth },
  ]
})

// Motion streaks radiating from the vanishing point, kept clear of the car.
const STREAKS = Array.from({ length: 34 }, (_, i) => {
  const band = i % 3
  const degrees =
    band === 0 ? 100 + random() * 70 : band === 1 ? 10 + random() * 70 : 195 + random() * 150
  const angle = (degrees * Math.PI) / 180
  const r1 = 240 + random() * 460
  const r2 = r1 + 60 + random() * 200
  return {
    x1: VP_X + Math.cos(angle) * r1,
    y1: HORIZON + Math.sin(angle) * r1 * 0.7,
    x2: VP_X + Math.cos(angle) * r2,
    y2: HORIZON + Math.sin(angle) * r2 * 0.7,
    opacity: 0.04 + random() * 0.14,
    width: 1 + random() * 1.2,
  }
})

const CITY_LIGHTS = Array.from({ length: 46 }, () => ({
  x: 120 + random() * 1360,
  y: HORIZON - 4 - random() * 16,
  r: 0.8 + random() * 1.4,
  opacity: 0.15 + random() * 0.5,
}))

const SKYLINE = (() => {
  let d = `M0 ${HORIZON}`
  for (let x = 0; x <= 1600; x += 40) {
    const height = 8 + random() * 26 + (Math.abs(x - VP_X) < 160 ? -6 : 0)
    d += ` L${x} ${HORIZON - height} L${x + 22} ${HORIZON - height}`
  }
  return `${d} L1600 ${HORIZON} Z`
})()

export function RacingArtwork({ viewBox = ARTWORK_VIEWBOX, className }: ArtworkProps) {
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
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060606" />
          <stop offset="0.47" stopColor="#1c1c1f" />
          <stop offset="1" stopColor="#09090a" />
        </linearGradient>
        <radialGradient id={id('glow')} cx={VP_X} cy={HORIZON} r="640" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('road')} x1="0" y1={HORIZON} x2="0" y2="1000" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2b2b2f" />
          <stop offset="1" stopColor="#111113" />
        </linearGradient>
        <linearGradient id={id('body')} x1="0" y1="-240" x2="0" y2="-20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="0.4" stopColor="#1d1d20" />
          <stop offset="1" stopColor="#0b0b0c" />
        </linearGradient>
        <linearGradient id={id('reflection')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={id('blur-lg')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
        <filter id={id('blur-sm')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill={url('sky')} />
      <rect width="1600" height="1000" fill={url('glow')} />

      {/* Distant skyline and city lights. */}
      <path d={SKYLINE} fill="#141416" />
      {CITY_LIGHTS.map((light, i) => (
        <circle key={i} cx={light.x} cy={light.y} r={light.r} fill="#fff" opacity={light.opacity} />
      ))}

      {/* Perspective ground grid. */}
      <g stroke="#fff" strokeOpacity="0.07" strokeWidth="1">
        {GROUND_RAYS.map((x) => (
          <line key={x} x1={VP_X} y1={HORIZON} x2={x} y2={1000} />
        ))}
        {GROUND_ROWS.map((y) => (
          <line key={y} x1="0" y1={y} x2="1600" y2={y} />
        ))}
      </g>

      {/* Track. */}
      <path d={`M786 ${HORIZON} L814 ${HORIZON} L1520 1000 L80 1000 Z`} fill={url('road')} />
      <path
        d={`M786 ${HORIZON} L80 1000 M814 ${HORIZON} L1520 1000`}
        stroke="#fff"
        strokeOpacity="0.6"
        strokeWidth="2.5"
      />
      {CENTRE_DASHES.map((points) => (
        <polygon key={points} points={points} fill="#fff" opacity="0.45" />
      ))}

      {/* Lamp posts receding to the horizon. */}
      {LAMPS.map((lamp, i) => (
        <g key={i}>
          <line
            x1={lamp.x}
            y1={lamp.y}
            x2={lamp.x}
            y2={lamp.y - lamp.height}
            stroke="#fff"
            strokeOpacity="0.16"
            strokeWidth={Math.max(1, 5 / lamp.depth)}
          />
          <line
            x1={lamp.x}
            y1={lamp.y - lamp.height}
            x2={lamp.x + lamp.arm}
            y2={lamp.y - lamp.height}
            stroke="#fff"
            strokeOpacity="0.16"
            strokeWidth={Math.max(1, 4 / lamp.depth)}
          />
          <circle
            cx={lamp.x + lamp.arm}
            cy={lamp.y - lamp.height + 3}
            r={22 / lamp.depth + 4}
            fill="#fff"
            opacity="0.35"
            filter={url('blur-sm')}
          />
          <circle cx={lamp.x + lamp.arm} cy={lamp.y - lamp.height + 3} r={5 / lamp.depth + 1} fill="#fff" />
        </g>
      ))}

      {/* Speed streaks. */}
      <g strokeLinecap="round">
        {STREAKS.map((streak, i) => (
          <line
            key={i}
            x1={streak.x1}
            y1={streak.y1}
            x2={streak.x2}
            y2={streak.y2}
            stroke="#fff"
            strokeOpacity={streak.opacity}
            strokeWidth={streak.width}
          />
        ))}
      </g>

      {/* Supercar, rear view. Local origin: ground contact, centre. */}
      <g transform="translate(800 828) scale(0.82)">
        <ellipse cx="0" cy="-2" rx="310" ry="26" fill="#000" opacity="0.9" filter={url('blur-lg')} />
        <rect x="-230" y="4" width="460" height="90" fill={url('reflection')} />

        {/* Tyres. */}
        {[-266, 180].map((x) => (
          <g key={x}>
            <rect x={x} y="-102" width="86" height="102" rx="14" fill="#050505" />
            {[-84, -66, -48, -30, -12].map((y) => (
              <line key={y} x1={x + 8} y1={y} x2={x + 78} y2={y} stroke="#fff" strokeOpacity="0.06" />
            ))}
          </g>
        ))}

        {/* Body. */}
        <path
          d="M-262 -70 C-270 -110 -268 -140 -250 -160 C-228 -184 -186 -192 -150 -196 C-128 -222 -96 -236 -56 -238 L56 -238 C96 -236 128 -222 150 -196 C186 -192 228 -184 250 -160 C268 -140 270 -110 262 -70 L176 -70 C170 -40 160 -28 140 -24 L-140 -24 C-160 -28 -170 -40 -176 -70 Z"
          fill={url('body')}
          stroke="#fff"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        {/* Shoulder highlight. */}
        <path
          d="M-246 -158 C-224 -180 -184 -186 -148 -190 C-126 -214 -94 -228 -56 -230 L56 -230 C94 -228 126 -214 148 -190 C184 -186 224 -180 246 -158"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.32"
          strokeWidth="1.2"
        />

        {/* Rear glass with engine-cover slats. */}
        <path d="M-96 -228 L96 -228 L128 -200 L-128 -200 Z" fill="#050506" stroke="#fff" strokeOpacity="0.14" />
        {[-60, -30, 0, 30, 60].map((x) => (
          <line key={x} x1={x} y1="-224" x2={x * 1.15} y2="-203" stroke="#fff" strokeOpacity="0.1" />
        ))}

        {/* Swan-neck wing. */}
        <rect x="-98" y="-262" width="8" height="40" fill="#0a0a0a" stroke="#fff" strokeOpacity="0.15" />
        <rect x="90" y="-262" width="8" height="40" fill="#0a0a0a" stroke="#fff" strokeOpacity="0.15" />
        <path d="M-244 -276 L244 -276 L236 -260 L-236 -260 Z" fill="#0d0d0f" stroke="#fff" strokeOpacity="0.3" />
        <rect x="-252" y="-288" width="12" height="40" rx="2" fill="#0d0d0f" stroke="#fff" strokeOpacity="0.22" />
        <rect x="240" y="-288" width="12" height="40" rx="2" fill="#0d0d0f" stroke="#fff" strokeOpacity="0.22" />

        {/* Full-width light bar. */}
        <rect x="-238" y="-156" width="476" height="9" rx="4.5" fill="#fff" opacity="0.6" filter={url('blur-lg')} />
        <rect x="-238" y="-155" width="476" height="7" rx="3.5" fill="#fff" />
        <path d="M-240 -170 L-196 -170 L-196 -140" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />
        <path d="M240 -170 L196 -170 L196 -140" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />

        {/* Vents and plate. */}
        {[-1, 1].map((side) => (
          <g key={side}>
            <rect x={side < 0 ? -232 : 150} y="-128" width="82" height="40" rx="6" fill="#050506" stroke="#fff" strokeOpacity="0.1" />
            {[-118, -108, -98].map((y) => (
              <line key={y} x1={side < 0 ? -226 : 156} y1={y} x2={side < 0 ? -156 : 226} y2={y} stroke="#fff" strokeOpacity="0.08" />
            ))}
          </g>
        ))}
        <rect x="-64" y="-130" width="128" height="30" rx="3" fill="#0e0e10" stroke="#fff" strokeOpacity="0.22" />

        {/* Diffuser and exhausts. */}
        {[-105, -70, -35, 0, 35, 70, 105].map((x) => (
          <line key={x} x1={x} y1="-66" x2={x} y2="-27" stroke="#fff" strokeOpacity="0.14" strokeWidth="2" />
        ))}
        {[-42, 42].map((x) => (
          <g key={x}>
            <circle cx={x} cy="-50" r="13" fill="#000" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
            <circle cx={x} cy="-50" r="7" fill="none" stroke="#fff" strokeOpacity="0.15" />
          </g>
        ))}
      </g>

      {/* HUD. */}
      <g fill="#fff" style={{ fontFamily: 'var(--mono)' }}>
        <text x="200" y="214" fontSize="20" letterSpacing="6" opacity="0.85">
          TIME TRIAL
        </text>
        <text x="200" y="246" fontSize="15" letterSpacing="4" opacity="0.45">
          LAP 2 / 3
        </text>
        <text x="1400" y="222" fontSize="34" textAnchor="end" letterSpacing="2" opacity="0.9">
          01:24.360
        </text>
        <text x="1340" y="800" fontSize="64" textAnchor="end" fontWeight="600" opacity="0.92" style={{ fontFamily: 'var(--sans)' }}>
          214
        </text>
        <text x="1400" y="800" fontSize="15" textAnchor="end" letterSpacing="3" opacity="0.45">
          KM/H
        </text>
      </g>
      <g transform="translate(196 664)">
        <path
          d="M10 60 C10 18 52 6 96 14 L150 26 C186 34 194 74 166 92 L120 104 C100 110 96 128 78 132 L34 136 C14 138 10 100 10 60 Z"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.5"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="150" cy="26" r="6" fill="#fff" />
        <circle cx="34" cy="136" r="4" fill="#fff" opacity="0.4" />
      </g>
    </svg>
  )
}
