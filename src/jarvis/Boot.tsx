import { useEffect, useRef, useState } from 'react'
import { Reactor } from './Reactor'
import { IDENTITY } from '../data/universe'
import { getAudio } from '../audio/AudioEngine'

/**
 * Power-up sequence: the arc reactor charges while JARVIS runs diagnostics,
 * then hands control to the HUD. Skippable.
 */
const LINES = [
  '> initializing arc reactor .................. [<span class="ok">OK</span>]',
  '> core temperature nominal ................. [<span class="ok">OK</span>]',
  '> loading J.A.R.V.I.S. kernel .............. [<span class="ok">OK</span>]',
  '> mounting /projects /skills /experience ... [<span class="ok">OK</span>]',
  `> operator identified: <span class="dim">${IDENTITY.name}</span>`,
  '> all systems <span class="ok">ONLINE</span>',
]

export function Boot({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [charge, setCharge] = useState(0)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers: number[] = []
    LINES.forEach((l, i) => {
      timers.push(
        window.setTimeout(() => {
          setLines((p) => [...p, l])
          setCharge(Math.round(((i + 1) / LINES.length) * 100))
        }, 380 + i * 360),
      )
    })
    const endAt = 380 + LINES.length * 360 + 700
    timers.push(window.setTimeout(() => setCharge(100), endAt - 400))
    timers.push(window.setTimeout(() => setDone(true), endAt))
    timers.push(window.setTimeout(onDone, endAt + 1000))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  const skip = () => {
    // a click is a user gesture — safe to boot the audio context and greet
    try {
      const a = getAudio()
      a.init()
      a.power()
    } catch {
      /* audio unavailable */
    }
    setCharge(100)
    setDone(true)
    setTimeout(onDone, 200)
  }

  return (
    <div className={`boot ${done ? 'done' : ''}`}>
      {/* power-on flash on handoff */}
      <span className={`boot-flash ${done ? 'fire' : ''}`} aria-hidden="true" />
      <Reactor size={170} />
      <div className="boot-title">J · A · R · V · I · S</div>

      {/* reactor charge bar */}
      <div className="boot-charge" role="progressbar" aria-valuenow={charge} aria-valuemin={0} aria-valuemax={100} aria-label="Arc reactor charge">
        <div className="boot-charge-track">
          <div className="boot-charge-fill" style={{ width: `${charge}%` }} />
        </div>
        <div className="boot-charge-pct">REACTOR CHARGE · {String(charge).padStart(3, '0')}%</div>
      </div>

      <div className="boot-log" ref={logRef}>
        {lines.map((l, i) => (
          <div key={i} className="boot-line" dangerouslySetInnerHTML={{ __html: l }} />
        ))}
      </div>
      <button className="skip" onClick={skip}>
        skip intro ✕
      </button>
    </div>
  )
}
