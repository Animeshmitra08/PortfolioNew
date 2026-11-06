import { useId } from 'react'
import { ARTWORK_VIEWBOX, type ArtworkProps } from './types'

// An editor window running the extension: its sidebar, the command palette,
// a freshly generated screen and an Expo session in the terminal. The window
// sits inside x 440–1160 so it survives the narrow portrait crop.

type Tone = 'kw' | 'str' | 'tag' | 'fn' | 'id' | 'punct'
const TONE: Record<Tone, number> = { kw: 0.95, fn: 0.85, tag: 0.78, id: 0.66, str: 0.5, punct: 0.4 }

const CODE: Array<Array<[string, Tone]>> = [
  [['import', 'kw'], [' { View, Text } ', 'id'], ['from', 'kw'], [" 'react-native'", 'str']],
  [['import', 'kw'], [' { Screen } ', 'id'], ['from', 'kw'], [" '@/components/Screen'", 'str']],
  [],
  [['export default function', 'kw'], [' ProfileScreen', 'fn'], ['() {', 'punct']],
  [['  return', 'kw'], [' (', 'punct']],
  [['    <', 'punct'], ['Screen', 'tag'], [' title=', 'id'], ['"Profile"', 'str'], ['>', 'punct']],
  [['      <', 'punct'], ['View', 'tag'], [' style=', 'id'], ['{styles.header}', 'punct'], ['>', 'punct']],
  [['        <', 'punct'], ['Text', 'tag'], [' style=', 'id'], ['{styles.name}', 'punct'], ['>', 'punct'], ['Hello', 'id'], ['</', 'punct'], ['Text', 'tag'], ['>', 'punct']],
  [['      </', 'punct'], ['View', 'tag'], ['>', 'punct']],
  [['    </', 'punct'], ['Screen', 'tag'], ['>', 'punct']],
  [['  )', 'punct']],
  [['}', 'punct']],
]

const SIDEBAR_ACTIONS = [
  '◇  Analyze project',
  '▷  Expo: Start',
  '▷  Expo: Prebuild',
  '+  Generate component',
  '+  Generate screen',
]
const TREE = ['▾ app', '   ▾ (tabs)', '      profile.tsx', '▸ components', '▸ hooks', '   app.json', '   package.json']
const PALETTE = ['RN Toolkit: Generate Screen', 'RN Toolkit: Generate Component', 'RN Toolkit: Analyze Project']
const TERMINAL: Array<[string, number]> = [
  ['$ npx expo start', 0.85],
  ['› Starting Metro Bundler', 0.5],
  ['› Metro waiting on exp://192.168.1.4:8081', 0.5],
  ['› Press a │ open Android   › Press i │ open iOS', 0.5],
  ['✓ Created app/(tabs)/profile.tsx', 0.85],
]

const WINDOW = { x: 440, y: 160, w: 720, h: 680 }
const RIGHT = WINDOW.x + WINDOW.w
const ACTIVITY = { x: WINDOW.x, w: 46 }
const SIDEBAR = { x: ACTIVITY.x + ACTIVITY.w, w: 178 }
const EDITOR_X = SIDEBAR.x + SIDEBAR.w
const EDITOR_W = RIGHT - EDITOR_X
const ICON_X = ACTIVITY.x + ACTIVITY.w / 2
const CODE_TOP = 284
const LINE_HEIGHT = 26
const PALETTE_BOX = { x: 690, y: 228, w: 440, h: 168 }

export function ToolkitArtwork({ viewBox = ARTWORK_VIEWBOX, className }: ArtworkProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `${uid}-${name}`
  const url = (name: string) => `url(#${id(name)})`
  const mono = { fontFamily: 'var(--mono)' }

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={id('dots')} width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="1" fill="#fff" fillOpacity="0.08" />
        </pattern>
        <radialGradient id={id('glow')} cx="800" cy="480" r="720" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.09" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('window')}>
          <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} rx="16" />
        </clipPath>
        <filter id={id('shadow')} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill="#0a0a0a" />
      <rect width="1600" height="1000" fill={url('dots')} />
      <rect width="1600" height="1000" fill={url('glow')} />

      <rect x={WINDOW.x + 10} y={WINDOW.y + 30} width={WINDOW.w - 20} height={WINDOW.h} rx="16" fill="#000" opacity="0.8" filter={url('shadow')} />

      <g clipPath={url('window')}>
        <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} fill="#111113" />

        {/* Title bar. */}
        <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height="46" fill="#0d0d0f" />
        {[0, 22, 44].map((offset) => (
          <circle key={offset} cx={WINDOW.x + 26 + offset} cy="183" r="6" fill="#2e2e33" />
        ))}
        <text x="800" y="188" textAnchor="middle" fontSize="14" fill="#fff" fillOpacity="0.45" style={mono}>
          profile.tsx — expo-app
        </text>

        {/* Activity bar, with the extension's view active. */}
        <rect x={ACTIVITY.x} y="206" width={ACTIVITY.w} height="600" fill="#0c0c0e" />
        <g fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.6">
          <rect x={ICON_X - 8} y="229" width="16" height="20" rx="2" />
          <circle cx={ICON_X} cy="288" r="8" />
          <path d={`M${ICON_X + 6} 294 l6 6`} />
          <path d={`M${ICON_X - 6} 330 v22 M${ICON_X + 6} 330 v8 a6 6 0 0 1 -6 6 h-6`} />
        </g>
        <rect x={ACTIVITY.x} y="372" width="3" height="36" fill="#fff" />
        <g fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.6">
          <rect x={ICON_X - 9} y="381" width="8" height="8" rx="1" />
          <rect x={ICON_X + 2} y="381" width="8" height="8" rx="1" />
          <rect x={ICON_X - 9} y="392" width="8" height="8" rx="1" />
          <rect x={ICON_X + 3} y="390" width="8" height="8" rx="1" transform={`rotate(45 ${ICON_X + 7} 394)`} />
        </g>

        {/* Extension sidebar. */}
        <rect x={SIDEBAR.x} y="206" width={SIDEBAR.w} height="600" fill="#0f0f11" />
        <text x={SIDEBAR.x + 14} y="242" fontSize="11" letterSpacing="2" fill="#fff" fillOpacity="0.5" style={mono}>
          RN TOOLKIT
        </text>
        <rect x={SIDEBAR.x} y={272 + 4 * 34 - 4} width={SIDEBAR.w} height="30" fill="#fff" fillOpacity="0.07" />
        <rect x={SIDEBAR.x} y={272 + 4 * 34 - 4} width="2" height="30" fill="#fff" fillOpacity="0.85" />
        {SIDEBAR_ACTIONS.map((action, i) => (
          <text
            key={action}
            x={SIDEBAR.x + 14}
            y={292 + i * 34}
            fontSize="12"
            fill="#fff"
            fillOpacity={i === 4 ? 0.95 : 0.62}
            style={{ ...mono, whiteSpace: 'pre' }}
          >
            {action}
          </text>
        ))}
        <text x={SIDEBAR.x + 14} y="478" fontSize="11" letterSpacing="2" fill="#fff" fillOpacity="0.4" style={mono}>
          PROJECT
        </text>
        {TREE.map((item, i) => (
          <text
            key={item}
            x={SIDEBAR.x + 14}
            y={508 + i * 28}
            fontSize="12"
            fill="#fff"
            fillOpacity={i === 2 ? 0.92 : 0.5}
            style={{ ...mono, whiteSpace: 'pre' }}
          >
            {item}
          </text>
        ))}

        {/* Tabs. */}
        <rect x={EDITOR_X} y="206" width={EDITOR_W} height="40" fill="#0c0c0e" />
        <rect x={EDITOR_X} y="206" width="186" height="40" fill="#111113" />
        <rect x={EDITOR_X} y="206" width="186" height="2" fill="#fff" fillOpacity="0.8" />
        <text x={EDITOR_X + 20} y="231" fontSize="13" fill="#fff" fillOpacity="0.88" style={mono}>
          profile.tsx
        </text>
        <text x={EDITOR_X + 206} y="231" fontSize="13" fill="#fff" fillOpacity="0.38" style={mono}>
          Card.tsx
        </text>

        {/* Code. */}
        <rect x={EDITOR_X} y={CODE_TOP + 7 * LINE_HEIGHT - 18} width={EDITOR_W} height={LINE_HEIGHT} fill="#fff" fillOpacity="0.04" />
        {CODE.map((segments, line) => (
          <g key={line}>
            <text x={EDITOR_X + 34} y={CODE_TOP + line * LINE_HEIGHT} fontSize="14" textAnchor="end" fill="#fff" fillOpacity="0.2" style={mono}>
              {line + 1}
            </text>
            <text x={EDITOR_X + 50} y={CODE_TOP + line * LINE_HEIGHT} fontSize="14" fill="#fff" style={{ ...mono, whiteSpace: 'pre' }}>
              {segments.map(([text, tone], i) => (
                <tspan key={i} fillOpacity={TONE[tone]}>
                  {text}
                </tspan>
              ))}
            </text>
          </g>
        ))}

        {/* Terminal. */}
        <rect x={EDITOR_X} y="600" width={EDITOR_W} height="206" fill="#0d0d0f" />
        <line x1={EDITOR_X} y1="600" x2={RIGHT} y2="600" stroke="#fff" strokeOpacity="0.08" />
        <g fontSize="12" letterSpacing="1.5" style={mono}>
          <text x={EDITOR_X + 24} y="628" fill="#fff" fillOpacity="0.85">TERMINAL</text>
          <rect x={EDITOR_X + 24} y="636" width="70" height="1.5" fill="#fff" fillOpacity="0.8" />
          <text x={EDITOR_X + 130} y="628" fill="#fff" fillOpacity="0.35">PROBLEMS</text>
          <text x={EDITOR_X + 240} y="628" fill="#fff" fillOpacity="0.35">OUTPUT</text>
        </g>
        {TERMINAL.map(([line, opacity], i) => (
          <text key={line} x={EDITOR_X + 24} y={668 + i * 25} fontSize="13" fill="#fff" fillOpacity={opacity} style={{ ...mono, whiteSpace: 'pre' }}>
            {line}
          </text>
        ))}

        {/* Status bar. */}
        <rect x={WINDOW.x} y="806" width={WINDOW.w} height="34" fill="#0c0c0e" />
        <line x1={WINDOW.x} y1="806" x2={RIGHT} y2="806" stroke="#fff" strokeOpacity="0.06" />
        <g fontSize="12" style={mono} fill="#fff">
          <text x={WINDOW.x + 20} y="828" fillOpacity="0.5">⎇ main</text>
          <text x={WINDOW.x + 108} y="828" fillOpacity="0.35">TypeScript JSX</text>
          <text x={RIGHT - 20} y="828" textAnchor="end" fillOpacity="0.7">RN Toolkit ✓</text>
        </g>
      </g>
      <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} rx="16" fill="none" stroke="#fff" strokeOpacity="0.12" />

      {/* Command palette. */}
      <rect x={PALETTE_BOX.x + 10} y={PALETTE_BOX.y + 18} width={PALETTE_BOX.w} height={PALETTE_BOX.h} rx="10" fill="#000" opacity="0.7" filter={url('shadow')} />
      <rect x={PALETTE_BOX.x} y={PALETTE_BOX.y} width={PALETTE_BOX.w} height={PALETTE_BOX.h} rx="10" fill="#18181b" stroke="#fff" strokeOpacity="0.16" />
      <text x={PALETTE_BOX.x + 20} y="260" fontSize="14" fill="#fff" fillOpacity="0.9" style={{ ...mono, whiteSpace: 'pre' }}>
        {'> RN Toolkit: gen'}
      </text>
      <rect x={PALETTE_BOX.x + 168} y="246" width="2" height="18" fill="#fff" />
      <line x1={PALETTE_BOX.x} y1="276" x2={PALETTE_BOX.x + PALETTE_BOX.w} y2="276" stroke="#fff" strokeOpacity="0.08" />
      <rect x={PALETTE_BOX.x + 8} y="284" width={PALETTE_BOX.w - 16} height="32" rx="6" fill="#fff" fillOpacity="0.09" />
      {PALETTE.map((item, i) => (
        <text key={item} x={PALETTE_BOX.x + 20} y={305 + i * 34} fontSize="13" fill="#fff" fillOpacity={i === 0 ? 0.95 : 0.55} style={mono}>
          {item}
        </text>
      ))}
      <text x={PALETTE_BOX.x + PALETTE_BOX.w - 20} y="305" fontSize="12" textAnchor="end" fill="#fff" fillOpacity="0.45" style={mono}>
        ⏎
      </text>
    </svg>
  )
}
