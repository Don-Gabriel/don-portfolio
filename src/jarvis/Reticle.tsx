import { useEffect, useRef } from 'react'

/** A targeting reticle that tracks the cursor and locks onto interactives. */
export function Reticle() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current!
    let raf = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    const move = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      const hot = !!(e.target as HTMLElement)?.closest?.(
        'button, a, .card, .rail-btn, .hbtn, .rowcard',
      )
      el.classList.toggle('hot', hot)
    }
    window.addEventListener('pointermove', move)

    const tick = () => {
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div ref={ref} className="reticle">
      <span className="tick t" />
      <span className="tick b" />
      <span className="tick l" />
      <span className="tick r" />
    </div>
  )
}
