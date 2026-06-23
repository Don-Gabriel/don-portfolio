import { useEffect, useRef } from 'react'

/**
 * Lightweight HUD energy field — drifting data motes with faint links near
 * the cursor. Canvas2D, capped particle count, rAF. Smooth on any device.
 */
export function Background() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const mouse = { x: -999, y: -999 }

    const COUNT = window.innerWidth < 820 ? 50 : 110
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00025,
      vy: (Math.random() - 0.5) * 0.00025,
      r: Math.random() * 1.6 + 0.4,
      t: Math.random() * Math.PI * 2,
    }))

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const move = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('pointermove', move)

    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
        p.t += 0.02
        const px = p.x * w
        const py = p.y * h
        const tw = 0.5 + 0.5 * Math.sin(p.t)

        // link to cursor when close
        const dx = px - mouse.x
        const dy = py - mouse.y
        const d2 = dx * dx + dy * dy
        if (d2 < 130 * 130) {
          const a = (1 - Math.sqrt(d2) / 130) * 0.4
          ctx.strokeStyle = `rgba(79,227,255,${a})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(px, py, p.r, 0, 7)
        ctx.fillStyle = `rgba(79,227,255,${0.25 + tw * 0.5})`
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return <canvas ref={ref} className="hud-canvas" />
}
