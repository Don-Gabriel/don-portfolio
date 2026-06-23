import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ico, type IconName } from './Icons'

/**
 * Minimal HUD status feed. Call `toast('MESSAGE')` from anywhere to push a
 * self-dismissing notification into the bottom-right stack — the "system
 * acknowledges your action" feel.
 */
export interface Toast {
  id: number
  msg: string
  icon?: IconName
}

type Listener = (t: Toast) => void
const listeners = new Set<Listener>()
let seq = 0

export function toast(msg: string, icon: IconName = 'command') {
  const t: Toast = { id: ++seq, msg, icon }
  listeners.forEach((l) => l(t))
}

export function Toasts() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    const onToast: Listener = (t) => {
      setItems((p) => [...p, t].slice(-4))
      window.setTimeout(() => {
        setItems((p) => p.filter((x) => x.id !== t.id))
      }, 2600)
    }
    listeners.add(onToast)
    return () => {
      listeners.delete(onToast)
    }
  }, [])

  return (
    <div className="toasts" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            <span className="toast-ico"><Ico name={t.icon ?? 'command'} size={15} /></span>
            <span className="toast-msg">{t.msg}</span>
            <span className="toast-bar" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
