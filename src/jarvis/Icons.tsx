/**
 * HUD icon set — thin-stroke, 24×24, single-path/line SVGs that read as
 * targeting-system glyphs rather than generic UI icons. Replaces the emoji /
 * unicode glyphs used in the rail and buttons (skill anti-pattern + a11y).
 *
 * `currentColor` everywhere so they inherit the HUD accent.
 */
export type IconName =
  | 'home'
  | 'systems'
  | 'matrix'
  | 'career'
  | 'academy'
  | 'honors'
  | 'comms'
  | 'memory'
  | 'sound-on'
  | 'sound-off'
  | 'close'
  | 'download'
  | 'external'
  | 'command'
  | 'arrow'

const P: Record<IconName, JSX.Element> = {
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  systems: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  matrix: (
    <>
      <path d="M4 18V9" />
      <path d="M9 18V5" />
      <path d="M14 18v-7" />
      <path d="M19 18V8" />
      <path d="M3 20h18" />
    </>
  ),
  career: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </>
  ),
  academy: (
    <>
      <path d="M12 4 2 9l10 5 10-5-10-5Z" />
      <path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
    </>
  ),
  honors: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M8.5 13 7 21l5-2.5L17 21l-1.5-8" />
    </>
  ),
  comms: (
    <>
      <path d="M4 5h16v11H7l-3 3V5Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </>
  ),
  memory: (
    <>
      <path d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
      <path d="M3.5 12 12 16.5 20.5 12" />
      <path d="M3.5 16.5 12 21l8.5-4.5" />
    </>
  ),
  'sound-on': (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18.5 7a7 7 0 0 1 0 10" />
    </>
  ),
  'sound-off': (
    <>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M22 9l-6 6" />
      <path d="M16 9l6 6" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M19 5l-8 8" />
      <path d="M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>
  ),
  command: (
    <>
      <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
}

export function Ico({
  name,
  size = 18,
  className,
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {P[name]}
    </svg>
  )
}
