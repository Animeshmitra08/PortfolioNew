import { useId } from 'react'
import { mulberry32 } from '../../../utils/random'
import { ARTWORK_VIEWBOX, type ArtworkProps } from './types'

// A fleet dashboard with live vehicle tracking, and a phone running a
// configurable approval workflow on top of it.

const random = mulberry32(21)

const MAP = { x: 486, y: 248, w: 678, h: 566 }
const MAP_CENTRE = { x: MAP.x + MAP.w / 2, y: MAP.y + MAP.h / 2 }
const BLOCK = { w: 70, h: 50, gap: 18, x0: 440, y0: 230 }

const roadX = (column: number) => BLOCK.x0 + column * (BLOCK.w + BLOCK.gap) - BLOCK.gap / 2
const roadY = (row: number) => BLOCK.y0 + row * (BLOCK.h + BLOCK.gap) - BLOCK.gap / 2

const BLOCKS = Array.from({ length: 11 * 10 }, (_, i) => {
  const column = i % 10
  const row = Math.floor(i / 10)
  const shade = random()
  return {
    x: BLOCK.x0 + column * (BLOCK.w + BLOCK.gap),
    y: BLOCK.y0 + row * (BLOCK.h + BLOCK.gap),
    fill: shade < 0.12 ? '#e2e2e6' : shade < 0.55 ? '#ececef' : '#f1f1f3',
  }
})

const toPath = (nodes: Array<[number, number]>) =>
  nodes.map(([c, r], i) => `${i ? 'L' : 'M'}${roadX(c)} ${roadY(r)}`).join(' ')

// Route nodes are road intersections (column, row), kept clear of the phone.
const ROUTE_START: [number, number] = [2, 7]
const VEHICLE: [number, number] = [5, 5]
const DESTINATION: [number, number] = [7, 2]
const ROUTE_DONE = toPath([ROUTE_START, [2, 6], [5, 6], VEHICLE])
const ROUTE_AHEAD = toPath([VEHICLE, [5, 4], [7, 4], DESTINATION])
const OTHER_VEHICLES: Array<[number, number]> = [
  [3, 3],
  [7, 7],
  [4, 2],
  [1, 4],
]

const FLEET = [
  { status: 'In transit', progress: 0.62 },
  { status: 'Loading', progress: 0.24 },
  { status: 'At depot', progress: 0.08 },
  { status: 'In transit', progress: 0.44 },
  { status: 'Delivered', progress: 1 },
  { status: 'Scheduled', progress: 0 },
]

const STEPS = [
  { label: 'Request created', note: 'Submitted', state: 'done' },
  { label: 'Manager review', note: 'Approved', state: 'done' },
  { label: 'Dispatch vehicle', note: 'Awaiting action', state: 'current' },
  { label: 'Delivery confirmed', note: 'Pending', state: 'pending' },
] as const

export function EnterpriseArtwork({ viewBox = ARTWORK_VIEWBOX, className }: ArtworkProps) {
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
      style={{ fontFamily: 'var(--sans)' }}
    >
      <defs>
        <pattern id={id('grid')} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#0a0a0a" strokeOpacity="0.045" />
        </pattern>
        <clipPath id={id('map')}>
          <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx="14" />
        </clipPath>
        <filter id={id('shadow')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
        <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill="#f4f4f5" />
      <rect width="1600" height="1000" fill={url('grid')} />

      {/* Dashboard card. */}
      <rect x="236" y="196" width="944" height="650" rx="20" fill="#0a0a0a" opacity="0.08" filter={url('shadow')} />
      <rect x="220" y="170" width="960" height="660" rx="20" fill="#fff" stroke="#0a0a0a" strokeOpacity="0.08" />
      <rect x="250" y="194" width="20" height="20" rx="3" fill="none" stroke="#0a0a0a" strokeWidth="1.6" transform="rotate(45 260 204)" />
      <text x="288" y="211" fontSize="19" fontWeight="600" fill="#0a0a0a" letterSpacing="-0.3">
        Fleet operations
      </text>
      <rect x="944" y="190" width="80" height="30" rx="15" fill="#0a0a0a" />
      <circle cx="964" cy="205" r="4" fill="#fff" />
      <text x="976" y="210" fontSize="13" fontWeight="500" fill="#fff">
        Live
      </text>
      <rect x="1034" y="190" width="90" height="30" rx="15" fill="none" stroke="#0a0a0a" strokeOpacity="0.15" />
      <text x="1079" y="210" fontSize="13" fill="#0a0a0a" fillOpacity="0.6" textAnchor="middle">
        Today
      </text>
      <line x1="220" y1="232" x2="1180" y2="232" stroke="#0a0a0a" strokeOpacity="0.07" />

      {/* Fleet list. */}
      {FLEET.map((vehicle, i) => {
        const y = 252 + i * 92
        const selected = i === 0
        return (
          <g key={i}>
            <rect
              x="236"
              y={y}
              width="234"
              height="76"
              rx="12"
              fill="#fff"
              stroke="#0a0a0a"
              strokeOpacity={selected ? 0.9 : 0.08}
              strokeWidth={selected ? 1.5 : 1}
            />
            <circle cx="266" cy={y + 30} r="14" fill="#f4f4f5" />
            <rect x="258" y={y + 25} width="12" height="9" rx="1.5" fill="#0a0a0a" opacity="0.75" />
            <rect x="270" y={y + 28} width="5" height="6" rx="1" fill="#0a0a0a" opacity="0.75" />
            <text x="292" y={y + 28} fontSize="14" fontWeight="600" fill="#0a0a0a">
              Vehicle {String(i + 1).padStart(2, '0')}
            </text>
            <text x="292" y={y + 47} fontSize="12" fill="#0a0a0a" fillOpacity="0.5">
              {vehicle.status}
            </text>
            <rect x="292" y={y + 58} width="160" height="4" rx="2" fill="#0a0a0a" opacity="0.07" />
            <rect x="292" y={y + 58} width={160 * vehicle.progress} height="4" rx="2" fill="#0a0a0a" opacity="0.85" />
          </g>
        )
      })}

      {/* Map. */}
      <g clipPath={url('map')}>
        <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} fill="#fafafa" />
        <g transform={`rotate(-8 ${MAP_CENTRE.x} ${MAP_CENTRE.y})`}>
          {BLOCKS.map((block, i) => (
            <rect key={i} x={block.x} y={block.y} width={BLOCK.w} height={BLOCK.h} rx="4" fill={block.fill} />
          ))}
          <path
            d="M380 760 C560 690 660 770 820 700 S1080 590 1260 640"
            fill="none"
            stroke="#e1e1e5"
            strokeWidth="34"
            strokeLinecap="round"
          />
          <path d={ROUTE_AHEAD} fill="none" stroke="#0a0a0a" strokeOpacity="0.4" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROUTE_DONE} fill="none" stroke="#0a0a0a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {OTHER_VEHICLES.map(([c, r]) => (
            <circle key={`${c}-${r}`} cx={roadX(c)} cy={roadY(r)} r="7" fill="#0a0a0a" opacity="0.4" stroke="#fff" strokeWidth="2" />
          ))}
          <circle cx={roadX(ROUTE_START[0])} cy={roadY(ROUTE_START[1])} r="9" fill="#fff" stroke="#0a0a0a" strokeWidth="3" />
          {/* Counter-rotated so the pin stays upright. */}
          <g transform={`translate(${roadX(DESTINATION[0])} ${roadY(DESTINATION[1])}) rotate(8)`}>
            <path d="M0 0 C-14 -16 -14 -30 0 -34 C14 -30 14 -16 0 0 Z" fill="#0a0a0a" />
            <circle cx="0" cy="-22" r="5" fill="#fff" />
          </g>
          <g transform={`translate(${roadX(VEHICLE[0])} ${roadY(VEHICLE[1])})`}>
            <circle r="34" fill="#0a0a0a" opacity="0.07" />
            <circle r="22" fill="#0a0a0a" opacity="0.1" />
            <circle r="14" fill="#0a0a0a" stroke="#fff" strokeWidth="3" />
            <path d="M0 -7 L5.5 5 L0 2.5 L-5.5 5 Z" fill="#fff" />
          </g>
        </g>

        {/* Map controls and trip card. */}
        <rect x="502" y="264" width="40" height="76" rx="10" fill="#fff" stroke="#0a0a0a" strokeOpacity="0.1" />
        <path d="M514 284 h16 M522 276 v16 M514 320 h16" stroke="#0a0a0a" strokeOpacity="0.7" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="846" y="728" width="236" height="74" rx="12" fill="#0a0a0a" opacity="0.08" filter={url('soft')} />
        <rect x="840" y="720" width="236" height="74" rx="12" fill="#fff" stroke="#0a0a0a" strokeOpacity="0.08" />
        <text x="860" y="748" fontSize="14" fontWeight="600" fill="#0a0a0a">
          Vehicle 01
        </text>
        <text x="860" y="768" fontSize="12" fill="#0a0a0a" fillOpacity="0.5">
          In transit · Site B
        </text>
        <rect x="860" y="778" width="196" height="4" rx="2" fill="#0a0a0a" opacity="0.07" />
        <rect x="860" y="778" width="122" height="4" rx="2" fill="#0a0a0a" opacity="0.85" />
      </g>
      <rect x={MAP.x} y={MAP.y} width={MAP.w} height={MAP.h} rx="14" fill="none" stroke="#0a0a0a" strokeOpacity="0.08" />

      {/* Phone. */}
      <rect x="1124" y="176" width="280" height="720" rx="44" fill="#0a0a0a" opacity="0.2" filter={url('shadow')} />
      <rect x="1100" y="140" width="280" height="720" rx="44" fill="#0a0a0a" />
      <rect x="1112" y="152" width="256" height="696" rx="34" fill="#fff" />
      <rect x="1202" y="166" width="76" height="24" rx="12" fill="#0a0a0a" />
      <text x="1140" y="184" fontSize="13" fontWeight="600" fill="#0a0a0a">
        9:41
      </text>
      <rect x="1318" y="175" width="24" height="11" rx="3" fill="none" stroke="#0a0a0a" strokeWidth="1.4" />
      <rect x="1320" y="177" width="16" height="7" rx="1.5" fill="#0a0a0a" />

      <text x="1136" y="238" fontSize="12" letterSpacing="2" fill="#0a0a0a" fillOpacity="0.45">
        WORKFLOW
      </text>
      <text x="1136" y="268" fontSize="24" fontWeight="700" fill="#0a0a0a" letterSpacing="-0.6">
        Approval
      </text>

      <line x1="1150" y1="312" x2="1150" y2="492" stroke="#0a0a0a" strokeOpacity="0.15" strokeWidth="2" />
      <line x1="1150" y1="312" x2="1150" y2="432" stroke="#0a0a0a" strokeWidth="2" />
      {STEPS.map((step, i) => {
        const y = 312 + i * 60
        return (
          <g key={step.label}>
            {step.state === 'done' && (
              <>
                <circle cx="1150" cy={y} r="11" fill="#0a0a0a" />
                <path d={`M1145 ${y} l3.5 3.5 l6.5 -7`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </>
            )}
            {step.state === 'current' && (
              <>
                <circle cx="1150" cy={y} r="16" fill="#0a0a0a" opacity="0.08" />
                <circle cx="1150" cy={y} r="11" fill="#fff" stroke="#0a0a0a" strokeWidth="2" />
                <circle cx="1150" cy={y} r="4.5" fill="#0a0a0a" />
              </>
            )}
            {step.state === 'pending' && (
              <circle cx="1150" cy={y} r="11" fill="#fff" stroke="#0a0a0a" strokeOpacity="0.25" strokeWidth="2" />
            )}
            <text
              x="1174"
              y={y - 2}
              fontSize="14"
              fontWeight={step.state === 'current' ? 700 : 500}
              fill="#0a0a0a"
              fillOpacity={step.state === 'pending' ? 0.45 : 1}
            >
              {step.label}
            </text>
            <text x="1174" y={y + 16} fontSize="12" fill="#0a0a0a" fillOpacity="0.45">
              {step.note}
            </text>
          </g>
        )
      })}

      <rect x="1132" y="540" width="216" height="134" rx="16" fill="#f4f4f5" />
      {[
        ['Vehicle', 'Vehicle 01'],
        ['Route', 'Route A'],
        ['Priority', 'High'],
      ].map(([label, value], i) => (
        <g key={label}>
          <text x="1150" y={574 + i * 40} fontSize="12" fill="#0a0a0a" fillOpacity="0.5">
            {label}
          </text>
          <text x="1330" y={574 + i * 40} fontSize="13" fontWeight="600" fill="#0a0a0a" textAnchor="end">
            {value}
          </text>
          {i < 2 && <line x1="1150" y1={590 + i * 40} x2="1330" y2={590 + i * 40} stroke="#0a0a0a" strokeOpacity="0.07" />}
        </g>
      ))}

      <rect x="1132" y="764" width="98" height="46" rx="23" fill="none" stroke="#0a0a0a" strokeOpacity="0.2" />
      <text x="1181" y="792" fontSize="14" fontWeight="600" fill="#0a0a0a" textAnchor="middle">
        Reject
      </text>
      <rect x="1240" y="764" width="108" height="46" rx="23" fill="#0a0a0a" />
      <text x="1294" y="792" fontSize="14" fontWeight="600" fill="#fff" textAnchor="middle">
        Approve
      </text>
      <rect x="1200" y="830" width="80" height="5" rx="2.5" fill="#0a0a0a" opacity="0.85" />
    </svg>
  )
}
