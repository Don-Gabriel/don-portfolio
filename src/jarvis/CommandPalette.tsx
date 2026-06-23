import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJarvis, type ModuleId } from '../state/useJarvis'
import { UNIVERSE, galaxyById } from '../data/universe'
import { getAudio } from '../audio/AudioEngine'
import { Ico, type IconName } from './Icons'
import { backdrop } from './motion'

interface Command {
  id: string
  label: string
  hint: string
  icon: IconName
  run: () => void
  keywords?: string
}

const MODULE_CMDS: { id: ModuleId; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'projects', label: 'Systems', icon: 'systems' },
  { id: 'skills', label: 'Capability Matrix', icon: 'matrix' },
  { id: 'experience', label: 'Career Log', icon: 'career' },
  { id: 'education', label: 'Academy', icon: 'academy' },
  { id: 'achievements', label: 'Honors', icon: 'honors' },
  { id: 'contact', label: 'Comms', icon: 'comms' },
]

/**
 * JARVIS command palette — the on-brand "speak to the system" control.
 * Open with ⌘K / Ctrl+K or the "J" key. Jump to any module, open any
 * project, toggle sound, grab the résumé. Full keyboard control.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = useMemo<Command[]>(() => {
    const jump: Command[] = MODULE_CMDS.map((m) => ({
      id: `go:${m.id}`,
      label: `Go to ${m.label}`,
      hint: 'MODULE',
      icon: m.icon,
      keywords: m.id,
      run: () => useJarvis.getState().openModule(m.id),
    }))

    const projects = galaxyById('projects')
    const projectCmds: Command[] =
      projects?.entities.map((e) => ({
        id: `open:${e.id}`,
        label: e.name,
        hint: 'SYSTEM',
        icon: 'systems' as IconName,
        keywords: `${e.tagline} ${(e.tech ?? []).join(' ')}`,
        run: () => {
          useJarvis.getState().openModule('projects')
          useJarvis.getState().openDetail(e.id)
        },
      })) ?? []

    const muted = useJarvis.getState().muted
    const actions: Command[] = [
      {
        id: 'sound',
        label: muted ? 'Enable sound' : 'Mute sound',
        hint: 'ACTION',
        icon: muted ? 'sound-off' : 'sound-on',
        run: () => useJarvis.getState().toggleMute(),
      },
    ]
    const resume = UNIVERSE.identity.resumeUrl
    if (resume) {
      actions.push({
        id: 'resume',
        label: 'Download résumé',
        hint: 'ACTION',
        icon: 'download',
        run: () => window.open(resume, '_blank', 'noreferrer'),
      })
    }
    return [...jump, ...projectCmds, ...actions]
  }, [open])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return commands
    return commands.filter((c) =>
      `${c.label} ${c.hint} ${c.keywords ?? ''}`.toLowerCase().includes(term),
    )
  }, [q, commands])

  // global open/close hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      } else if ((e.key === 'j' || e.key === 'J') && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('jarvis:cmdk', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('jarvis:cmdk', onOpen)
    }
  }, [])

  // reset + focus on open
  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      try {
        getAudio().blip(4)
      } catch {
        /* idle */
      }
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(0, filtered.length - 1)))
  }, [filtered.length])

  const exec = (c?: Command) => {
    if (!c) return
    c.run()
    try {
      getAudio().blip(2)
    } catch {
      /* idle */
    }
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % Math.max(1, filtered.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      exec(filtered[active])
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk"
          variants={backdrop}
          initial="hidden"
          animate="show"
          exit="exit"
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="cmdk-panel"
            role="dialog"
            aria-modal="true"
            aria-label="JARVIS command palette"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="cmdk-head">
              <span className="cmdk-prompt">JARVIS ›</span>
              <input
                ref={inputRef}
                className="cmdk-input"
                placeholder="Type a command or search…"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setActive(0)
                }}
                aria-label="Command search"
              />
              <kbd className="cmdk-esc">ESC</kbd>
            </div>
            <ul className="cmdk-list" role="listbox">
              {filtered.length === 0 && (
                <li className="cmdk-empty">No matching systems.</li>
              )}
              {filtered.map((c, i) => (
                <li
                  key={c.id}
                  role="option"
                  aria-selected={i === active}
                  className={`cmdk-item ${i === active ? 'active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => exec(c)}
                >
                  <span className="cmdk-ico"><Ico name={c.icon} size={16} /></span>
                  <span className="cmdk-label">{c.label}</span>
                  <span className="cmdk-hint">{c.hint}</span>
                </li>
              ))}
            </ul>
            <div className="cmdk-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> select</span>
              <span><kbd>⌘K</kbd> / <kbd>J</kbd> toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
