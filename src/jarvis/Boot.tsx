import { useEffect, useRef, useState } from 'react'
import { Reactor } from './Reactor'
import { IDENTITY } from '../data/universe'

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
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers: number[] = []
    LINES.forEach((l, i) => {
      timers.push(window.setTimeout(() => setLines((p) => [...p, l]), 380 + i * 360))
    })
    const endAt = 380 + LINES.length * 360 + 700
    timers.push(window.setTimeout(() => setDone(true), endAt))
    timers.push(window.setTimeout(onDone, endAt + 1000))
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  const skip = () => {
    setDone(true)
    setTimeout(onDone, 200)
  }

  return (
    <div className={`boot ${done ? 'done' : ''}`}>
      <Reactor size={170} />
      <div className="boot-title">J · A · R · V · I · S</div>
      <div className="boot-log" ref={logRef}>
        {lines.map((l, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
        ))}
      </div>
      <button className="skip" onClick={skip}>
        skip intro ✕
      </button>
    </div>
  )
}
