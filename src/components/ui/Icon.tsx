import type { ReactNode } from 'react'

export type IconName =
  | 'phone'
  | 'cube'
  | 'layers'
  | 'target'
  | 'browser'
  | 'nodes'
  | 'terminal'
  | 'search'
  | 'pen'
  | 'code'
  | 'send'
  | 'mail'
  | 'github'
  | 'linkedin'
  | 'close'
  | 'alert'
  | 'check'
  | 'copy'

type StrokeIconName = Exclude<IconName, 'github' | 'linkedin'>

// Minimal 24px line icons, drawn at the same 1.5 stroke as the arrows.
const STROKE_ICONS: Record<StrokeIconName, ReactNode> = {
  phone: (
    <>
      <rect x="7" y="2.75" width="10" height="18.5" rx="2.25" />
      <path d="M11 18h2" />
    </>
  ),
  // Echoes the hero cube: an isometric wireframe.
  cube: (
    <>
      <path d="M12 2.75 20 7.25v9.5l-8 4.5-8-4.5v-9.5z" />
      <path d="M4 7.25 12 11.75l8-4.5M12 11.75v9.5" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3 21 7.5 12 12 3 7.5z" />
      <path d="M3 12 12 16.5 21 12" />
      <path d="M3 16.5 12 21 21 16.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 12h.01" />
    </>
  ),
  browser: (
    <>
      <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2" />
      <path d="M2.75 8.75h18.5M6 6.5h.01M8.5 6.5h.01" />
    </>
  ),
  nodes: (
    <>
      <circle cx="6" cy="6" r="2.25" />
      <circle cx="18" cy="6" r="2.25" />
      <circle cx="12" cy="18" r="2.25" />
      <path d="M8.25 6h7.5M7.1 8l3.8 8M16.9 8l-3.8 8" />
    </>
  ),
  terminal: (
    <>
      <rect x="2.75" y="4.25" width="18.5" height="15.5" rx="2" />
      <path d="m7 9.5 3 2.5-3 2.5M12.5 15H17" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="m15.25 15.25 5 5" />
    </>
  ),
  pen: (
    <>
      <path d="M12 2.75 18.5 9 12 21.25 5.5 9z" />
      <path d="M12 21.25V12.5" />
      <circle cx="12" cy="11" r="1.5" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4.5l-3 15" />,
  send: (
    <>
      <path d="M3.75 11.5 20.25 3.75 14.5 20.25l-3-6.75z" />
      <path d="m11.5 13.5 8.75-9.75" />
    </>
  ),
  mail: (
    <>
      <rect x="2.75" y="5" width="18.5" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5M12 16h.01" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" />
    </>
  ),
}

interface IconProps {
  name: IconName
  className?: string
}

/** Decorative icon; give the surrounding control its accessible name. */
export function Icon({ name, className }: IconProps) {
  if (name === 'github') {
    // Same mark as public/icons.svg, recoloured to inherit text colour.
    return (
      <svg viewBox="0 0 19 19" fill="currentColor" aria-hidden="true" className={className}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844"
        />
      </svg>
    )
  }
  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {STROKE_ICONS[name]}
    </svg>
  )
}
