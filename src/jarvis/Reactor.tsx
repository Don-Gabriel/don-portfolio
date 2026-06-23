/**
 * The Arc Reactor — the heart of the HUD. Layered SVG rings rotating at
 * different speeds around a glowing core. Pure SVG + CSS, perfectly smooth.
 */
export function Reactor({ size = 230 }: { size?: number }) {
  // ring of coil segments (the iconic inner ring)
  const coils = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2
    const x = 100 + Math.cos(a) * 52
    const y = 100 + Math.sin(a) * 52
    const rot = (a * 180) / Math.PI + 90
    return (
      <rect
        key={i}
        x={x - 5}
        y={y - 9}
        width={10}
        height={18}
        rx={2}
        transform={`rotate(${rot} ${x} ${y})`}
        fill="rgba(79,227,255,0.16)"
        stroke="rgba(79,227,255,0.7)"
        strokeWidth={1}
      />
    )
  })

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2
    const r1 = 88
    const r2 = i % 5 === 0 ? 78 : 83
    return (
      <line
        key={i}
        x1={100 + Math.cos(a) * r1}
        y1={100 + Math.sin(a) * r1}
        x2={100 + Math.cos(a) * r2}
        y2={100 + Math.sin(a) * r2}
        stroke="rgba(79,227,255,0.45)"
        strokeWidth={1}
      />
    )
  })

  return (
    <div className="reactor" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size}>
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#bff3ff" />
            <stop offset="70%" stopColor="#4fe3ff" />
            <stop offset="100%" stopColor="#0a4e6e" />
          </radialGradient>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* outer ring + ticks (slow) */}
        <g className="rg-slow" style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(79,227,255,0.3)" strokeWidth="1" />
          {ticks}
        </g>

        {/* dashed ring (medium reverse) */}
        <g className="rg-rev" style={{ transformOrigin: '100px 100px' }}>
          <circle
            cx="100" cy="100" r="70" fill="none"
            stroke="rgba(255,194,77,0.55)" strokeWidth="1.4"
            strokeDasharray="3 9"
          />
        </g>

        {/* coil ring (fast) */}
        <g className="rg-fast" style={{ transformOrigin: '100px 100px' }} filter="url(#glow)">
          {coils}
        </g>

        {/* core */}
        <circle cx="100" cy="100" r="34" fill="url(#core)" filter="url(#glow)" className="r-core" />
        <circle cx="100" cy="100" r="34" fill="none" stroke="#bff3ff" strokeWidth="1.5" opacity="0.8" />
        <polygon
          points="100,80 117,110 83,110"
          fill="rgba(255,255,255,0.85)"
          className="r-tri"
        />
        <polygon
          points="100,120 83,90 117,90"
          fill="rgba(191,243,255,0.6)"
        />
      </svg>
    </div>
  )
}
