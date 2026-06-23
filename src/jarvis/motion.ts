/**
 * Shared framer-motion vocabulary for the HUD.
 * One source of truth for variants, springs and easings so every animated
 * surface feels like the same machine — and one a11y off-switch.
 *
 * These LAYER ON TOP of the existing CSS/Canvas animations; they do not
 * replace them.
 */
import { useReducedMotion } from 'framer-motion'
import type { Variants, Transition } from 'framer-motion'

/** HUD signature easing — matches the CSS --ease-hud. */
export const easeHud = [0.16, 1, 0.3, 1] as const

export const spring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
  mass: 0.7,
}

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
}

/** Stagger container — children animate in sequence. */
export const stagger = (gap = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: gap, delayChildren: delay },
  },
})

/**
 * View container — staggers its children in, and slides/blurs out on exit
 * (used with AnimatePresence mode="wait" for module transitions).
 */
export const viewContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.06 },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(6px)',
    transition: { duration: 0.3, ease: easeHud },
  },
}

/** Rise + fade — the default entrance for cards, rows, chips. */
export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: easeHud },
  },
}

/** Horizontal wipe-in — for kickers / labels. */
export const wipeIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: easeHud } },
}

/** Scale-in dialog — for the detail overlay panel. */
export const dialogPanel: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.2 } },
}

export const backdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

/**
 * Returns variants made safe for reduced-motion: when the user prefers
 * reduced motion, transforms/blur are dropped and only opacity remains.
 */
export function useReducedMotionSafe() {
  const reduce = useReducedMotion()

  /** Pick the right variants — collapse motion to opacity-only when reduced. */
  const v = (variants: Variants): Variants => {
    if (!reduce) return variants
    const flat: Variants = {}
    for (const key of Object.keys(variants)) {
      const state = variants[key]
      flat[key] =
        typeof state === 'object'
          ? { opacity: (state as { opacity?: number }).opacity ?? 1, transition: { duration: 0.001 } }
          : state
    }
    return flat
  }

  return { reduce, v }
}
