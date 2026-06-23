import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Terminal "decrypt" text reveal — characters resolve from random glyphs into
 * the final string, left to right. On-brand for the Cyberpunk/HUD aesthetic.
 * Respects reduced-motion (renders the final text instantly).
 */
const GLYPHS = '!<>-_\\/[]{}=+*^?#01XΛΣΔΞ░▒▓'

export function Scramble({
  text,
  className,
  speed = 28,
  delay = 0,
  as: Tag = 'span',
}: {
  text: string
  className?: string
  /** ms per resolve tick */
  speed?: number
  /** ms before the reveal starts */
  delay?: number
  as?: 'span' | 'h1' | 'h2' | 'div'
}) {
  const reduce = useReducedMotion()
  const [out, setOut] = useState(reduce ? text : '')
  const raf = useRef<number>(0)

  useEffect(() => {
    if (reduce) {
      setOut(text)
      return
    }
    let frame = 0
    let started = false
    const startFrame = delay / speed
    const len = text.length

    const tick = () => {
      frame++
      if (!started && frame < startFrame) {
        raf.current = requestAnimationFrame(tick)
        return
      }
      started = true
      const progress = frame - startFrame
      // ~1.4 chars resolve per tick
      const settled = Math.floor(progress / 1.4)
      let s = ''
      for (let i = 0; i < len; i++) {
        if (text[i] === ' ') s += ' '
        else if (i < settled) s += text[i]
        else s += GLYPHS[(frame + i * 7) % GLYPHS.length]
      }
      setOut(s)
      if (settled < len) raf.current = requestAnimationFrame(tick)
      else setOut(text)
    }
    // drive on a fixed cadence rather than raw rAF for legible speed
    const id = window.setInterval(tick, speed)
    return () => {
      window.clearInterval(id)
      cancelAnimationFrame(raf.current)
    }
  }, [text, speed, delay, reduce])

  return <Tag className={className}>{out}</Tag>
}
