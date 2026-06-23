import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { getAudio } from '../audio/AudioEngine'

/**
 * A reactive HUD button: magnetic pull toward the cursor, a radial glow that
 * tracks the pointer, a press spring, and a soft sound-coupled hover blip.
 * Falls back to a plain, motionless button under reduced-motion.
 *
 * Reuses the existing `.hbtn` look — this only adds reactivity on top.
 */
export function HudButton({
  children,
  onClick,
  gold,
  solid,
  href,
  target,
  className = '',
  magnet = 14,
}: {
  children: ReactNode
  onClick?: () => void
  gold?: boolean
  solid?: boolean
  href?: string
  target?: string
  className?: string
  /** max magnetic offset in px */
  magnet?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 18 })
  const y = useSpring(my, { stiffness: 260, damping: 18 })

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    mx.set(Math.max(-magnet, Math.min(magnet, dx * 0.3)))
    my.set(Math.max(-magnet, Math.min(magnet, dy * 0.3)))
    // glow position as % for the radial highlight
    ref.current.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
    ref.current.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
  }
  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }
  const onEnter = () => {
    try {
      getAudio().blip(gold ? 3 : 1)
    } catch {
      /* audio not yet initialised — ignore */
    }
  }

  const cls = `hbtn reactive ${gold ? 'gold' : ''} ${solid ? 'solid' : ''} ${className}`
  const common = {
    ref: ref as never,
    className: cls,
    style: { x, y },
    onMouseMove: onMove,
    onMouseLeave: onLeave,
    onMouseEnter: onEnter,
    whileTap: reduce ? undefined : { scale: 0.95 },
  }

  if (href) {
    return (
      <motion.a {...common} href={href} target={target} rel="noreferrer" onClick={onClick}>
        <span className="hbtn-glow" />
        <span className="hbtn-inner">{children}</span>
      </motion.a>
    )
  }
  return (
    <motion.button {...common} onClick={onClick}>
      <span className="hbtn-glow" />
      <span className="hbtn-inner">{children}</span>
    </motion.button>
  )
}
