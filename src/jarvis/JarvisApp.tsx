import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import './jarvis.css'
import { Background } from './Background'
import { Reticle } from './Reticle'
import { Reactor } from './Reactor'
import { Boot } from './Boot'
import { Scramble } from './Scramble'
import { HudButton } from './HudButton'
import { Ico, type IconName } from './Icons'
import { CountUp, MetricValue } from './CountUp'
import { CommandPalette } from './CommandPalette'
import { Toasts, toast } from './Toasts'
import { stagger, fadeRise, spring, viewContainer, backdrop, dialogPanel } from './motion'
import { useJarvis, type ModuleId } from '../state/useJarvis'
import { UNIVERSE, IDENTITY, MEMORIES, galaxyById, type Entity, type MemoryItem } from '../data/universe'
import { coverArt } from '../art/cover'
import { getAudio } from '../audio/AudioEngine'

const MODULES: { id: ModuleId; label: string; ico: IconName }[] = [
  { id: 'home', label: 'Home', ico: 'home' },
  { id: 'projects', label: 'Systems', ico: 'systems' },
  { id: 'skills', label: 'Matrix', ico: 'matrix' },
  { id: 'experience', label: 'Career', ico: 'career' },
  { id: 'education', label: 'Academy', ico: 'academy' },
  { id: 'achievements', label: 'Honors', ico: 'honors' },
  { id: 'memory', label: 'Archive', ico: 'memory' },
  { id: 'contact', label: 'Comms', ico: 'comms' },
]

const JARVIS_LINES: Record<ModuleId, string> = {
  home: `Welcome. I am JARVIS. This is the work of ${IDENTITY.name} — where shall we begin?`,
  projects: 'Systems catalogue. Each one is fully operational — select for diagnostics.',
  skills: 'Capability matrix calibrated across language, mobile, web, data and core systems.',
  experience: 'Field-deployment history. Currently active.',
  education: 'Training records and credentials on file.',
  achievements: 'Commendations logged. The 3LC victory is, I must say, rather impressive.',
  memory: 'The Archive — moments worth stepping back into. Memories, not records.',
  contact: 'Opening a secure channel. Mr. Gabriel is available for work.',
}

export default function JarvisApp() {
  const booted = useJarvis((s) => s.booted)
  const module = useJarvis((s) => s.module)
  const detailId = useJarvis((s) => s.detail)
  const muted = useJarvis((s) => s.muted)

  const detail =
    galaxyById(module)?.entities.find((e) => e.id === detailId) ?? undefined

  // Detect keyboard navigation → restore the real cursor + show focus rings.
  // Pointer activity switches back to the immersive reticle.
  useEffect(() => {
    const hud = document.querySelector('.hud')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') hud?.classList.add('kbd')
    }
    const onPointer = () => hud?.classList.remove('kbd')
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('pointermove', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="hud">
        <a className="skip-link" href="#hud-stage">Skip to content</a>
        <div className="hud-bg" />
        <Background />
        <div className="hud-grid" />
        <div className="hud-scan" />
        <div className="hud-vignette" />

        <span className="hud-corner tl" />
        <span className="hud-corner tr" />
        <span className="hud-corner bl" />
        <span className="hud-corner br" />

        <TopBar />
        <Rail />

        <div className="stage" id="hud-stage">
          <AnimatePresence mode="wait">
            <View module={module} key={module} />
          </AnimatePresence>
          <AnimatePresence>
            {detail && (
              <Detail
                key="detail"
                entity={detail}
                accent={galaxyById(module)?.color}
              />
            )}
          </AnimatePresence>
        </div>

        <JarvisLine module={module} muted={muted} />

        <CommandPalette />
        <Toasts />
        <Reticle />
        {!booted && <Boot onDone={() => useJarvis.getState().setBooted(true)} />}
      </div>
    </MotionConfig>
  )
}

/* ───────── top bar ───────── */
function TopBar() {
  const [clock, setClock] = useState('')
  useEffect(() => {
    const f = () => {
      const d = new Date()
      const p = (n: number) => String(n).padStart(2, '0')
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
    }
    f()
    const t = setInterval(f, 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="hud-top">
      <div className="brand">
        <span className="led" />
        GABRIEL&nbsp;<span style={{ opacity: 0.5 }}>// J.A.R.V.I.S.</span>
      </div>
      <div className="top-stat">
        <button
          className="cmdk-trigger"
          onClick={() => window.dispatchEvent(new Event('jarvis:cmdk'))}
          aria-label="Open command palette"
        >
          <Ico name="command" size={13} />
          <span className="hide-sm">Command</span>
          <kbd>⌘K</kbd>
        </button>
        <span>REACTOR <b>100%</b></span>
        <span className="hide-sm">CORE <b>NOMINAL</b></span>
        <span>{clock}</span>
        <span className="hide-sm">KANYAKUMARI · IN</span>
      </div>
    </div>
  )
}

/* ───────── rail ───────── */
function Rail() {
  const module = useJarvis((s) => s.module)
  return (
    <nav className="rail">
      {MODULES.map((m) => (
        <button
          key={m.id}
          aria-label={m.label}
          aria-current={module === m.id ? 'page' : undefined}
          className={`rail-btn ${module === m.id ? 'active' : ''}`}
          onClick={() => {
            // module change fires nav() in AudioController; play a click only
            // when re-selecting the current module so there's always feedback
            if (useJarvis.getState().module === m.id) getAudio().click()
            useJarvis.getState().openModule(m.id)
          }}
          onMouseEnter={() => {
            try {
              getAudio().hover()
            } catch {
              /* audio idle */
            }
          }}
        >
          <span className="lock" aria-hidden="true" />
          <span className="ico">
            <Ico name={m.ico} size={20} />
          </span>
          {m.label}
        </button>
      ))}
    </nav>
  )
}

/* ───────── jarvis line ───────── */
function JarvisLine({ module, muted }: { module: ModuleId; muted: boolean }) {
  const text = JARVIS_LINES[module]
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const t = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(t)
    }, 18)
    return () => clearInterval(t)
  }, [text])
  return (
    <div className="jarvis-line">
      <span className="tag">JARVIS</span>
      <span>
        {shown}
        <span className="cursor" />
      </span>
      <button
        className={`snd ${muted ? '' : 'on'}`}
        onClick={() => {
          useJarvis.getState().toggleMute()
          const nowMuted = useJarvis.getState().muted
          toast(nowMuted ? 'Audio offline' : 'Audio online', nowMuted ? 'sound-off' : 'sound-on')
        }}
        aria-label={muted ? 'Sound off — click to enable' : 'Sound on — click to mute'}
        aria-pressed={!muted}
      >
        <Ico name={muted ? 'sound-off' : 'sound-on'} size={14} />
        {muted ? 'sound off' : 'sound on'}
      </button>
    </div>
  )
}

/* ───────── views ───────── */
function View({ module }: { module: ModuleId }) {
  if (module === 'home') return <Home />
  if (module === 'projects') return <Projects />
  if (module === 'skills') return <Skills />
  if (module === 'memory') return <Memories />
  if (module === 'contact') return <Contact />
  return <RowsView module={module} />
}

function Home() {
  return (
    <motion.div
      className="home"
      variants={stagger(0.16, 0.1)}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(6px)', transition: { duration: 0.3 } }}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.82 },
          show: { opacity: 1, scale: 1, transition: { ...spring, delay: 0.05 } },
        }}
      >
        <Reactor size={250} />
      </motion.div>
      <motion.div className="role" variants={fadeRise}>
        {IDENTITY.role}
      </motion.div>
      <motion.h1 variants={fadeRise}>
        <Scramble text={IDENTITY.name} delay={520} speed={26} />
      </motion.h1>
      <motion.div className="tagline" variants={fadeRise}>
        {IDENTITY.tagline}
      </motion.div>
      <motion.div className="chips" variants={fadeRise}>
        <span className="chip">◉ {IDENTITY.location}</span>
        {IDENTITY.available && (
          <span className="chip chip-live">
            <span className="pip" />
            Available for work
          </span>
        )}
      </motion.div>
      <motion.div className="chips" style={{ marginTop: 'var(--s-5)' }} variants={fadeRise}>
        <HudButton onClick={() => useJarvis.getState().openModule('projects')}>
          <Ico name="systems" /> View systems
        </HudButton>
        <HudButton gold onClick={() => useJarvis.getState().openModule('contact')}>
          <Ico name="comms" /> Initiate contact
        </HudButton>
      </motion.div>
    </motion.div>
  )
}

function ViewHead({ idx, title, sub }: { idx: string; title: string; sub: string }) {
  return (
    <>
      <motion.div className="view-title" variants={fadeRise}>
        <span className="idx">{idx}</span>
        <h2>
          <Scramble text={title} speed={22} delay={120} />
        </h2>
      </motion.div>
      <motion.div className="view-sub" variants={fadeRise}>
        {sub}
      </motion.div>
    </>
  )
}

function Projects() {
  const g = galaxyById('projects')!
  return (
    <motion.div className="view" variants={viewContainer} initial="hidden" animate="show" exit="exit">
      <ViewHead idx="01" title="SYSTEMS" sub={`${g.entities.length} projects · select for full diagnostics`} />
      <div className="grid">
        {g.entities.map((e) => (
          <motion.button
            key={e.id}
            className="card"
            variants={fadeRise}
            onMouseEnter={() => {
              try {
                getAudio().hover()
              } catch {
                /* idle */
              }
            }}
            onClick={() => useJarvis.getState().openDetail(e.id)}
          >
            <div className="cover" style={{ backgroundImage: `url(${coverArt(e.id, g.color)})` }} />
            <span className="card-scan" aria-hidden="true" />
            {e.status && <span className="status">{e.status}</span>}
            <div className="body">
              <div className="name">{e.name}</div>
              <div className="tag">{e.tagline}</div>
              <div className="tech">
                {(e.tech ?? []).slice(0, 4).map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function pct(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return 74 + (h % 22) // 74–95
}

function Skills() {
  const g = galaxyById('skills') ?? galaxyById('knowledge')!
  return (
    <motion.div className="view" variants={viewContainer} initial="hidden" animate="show" exit="exit">
      <ViewHead idx="02" title="CAPABILITY MATRIX" sub="real-time skill diagnostics" />
      <div className="diag">
        {g.entities.map((cluster) => (
          <motion.div className="diag-group" key={cluster.id} variants={fadeRise}>
            <h4>{cluster.name}</h4>
            {(cluster.tech ?? []).map((t) => (
              <SkillBar key={t} label={t} value={pct(t)} />
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bar">
      <div className="bl">
        <span>{label}</span>
        <span><CountUp to={value} suffix="%" /></span>
      </div>
      <div className="track">
        <motion.div
          className="fill"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: `${value}%`, transformOrigin: 'left' }}
        >
          <span className="fill-shine" />
        </motion.div>
      </div>
    </div>
  )
}

function RowsView({ module }: { module: ModuleId }) {
  const map: Record<string, { idx: string; title: string; sub: string }> = {
    experience: { idx: '03', title: 'CAREER LOG', sub: 'field deployment history' },
    education: { idx: '04', title: 'ACADEMY', sub: 'training & credentials' },
    achievements: { idx: '05', title: 'HONORS', sub: 'commendations on file' },
  }
  const g = galaxyById(module)!
  const meta = map[module] ?? { idx: '00', title: g.name.toUpperCase(), sub: g.essence }
  return (
    <motion.div className="view" variants={viewContainer} initial="hidden" animate="show" exit="exit">
      <ViewHead idx={meta.idx} title={meta.title} sub={meta.sub} />
      <div className="rows">
        {g.entities.map((e) => (
          <motion.div className="rowcard" key={e.id} variants={fadeRise}>
            <h3>{e.name}</h3>
            <div className="meta">
              {[e.year, e.status, e.tagline].filter(Boolean).join('  ·  ')}
            </div>
            <p>{e.body}</p>
            {e.tech && e.tech.length > 0 && (
              <div className="tech">
                {e.tech.map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
            )}
            {e.metrics && e.metrics.length > 0 && (
              <div className="detail-metrics" style={{ marginTop: '1rem' }}>
                {e.metrics.map((m) => (
                  <div className="m" key={m.label}>
                    <div className="v"><MetricValue value={m.value} /></div>
                    <div className="l">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function Memories() {
  return (
    <motion.div className="view" variants={viewContainer} initial="hidden" animate="show" exit="exit">
      <ViewHead idx="06" title="MEMORY REALMS" sub={`${MEMORIES.length} archived · moments you can step inside`} />
      {MEMORIES.length === 0 ? (
        <motion.div className="empty-realm" variants={fadeRise}>
          No memories archived yet. Add them in the Command Center.
        </motion.div>
      ) : (
        <div className="realms">
          {MEMORIES.map((m) => (
            <MemoryCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </motion.div>
  )
}

function MemoryCard({ m }: { m: MemoryItem }) {
  const cover = m.image || coverArt(m.id, m.color)
  return (
    <motion.div
      className="realm"
      variants={fadeRise}
      style={{ '--accent': m.color } as React.CSSProperties}
      onMouseEnter={() => {
        try {
          getAudio().hover()
        } catch {
          /* idle */
        }
      }}
    >
      <div className="realm-cover" style={{ backgroundImage: `url(${cover})` }}>
        <span className="card-scan" aria-hidden="true" />
        {m.year && <span className="realm-year">{m.year}</span>}
      </div>
      <div className="realm-body">
        <div className="realm-title">{m.title}</div>
        <p className="realm-caption">{m.caption}</p>
      </div>
    </motion.div>
  )
}

function Contact() {
  return (
    <motion.div className="view" variants={viewContainer} initial="hidden" animate="show" exit="exit">
      <div className="contact-wrap">
        <motion.div style={{ display: 'flex', justifyContent: 'center' }} variants={fadeRise}>
          <Reactor size={140} />
        </motion.div>
        <motion.div
          className="role"
          variants={fadeRise}
          style={{ color: 'var(--gold)', marginTop: '1.2rem', fontFamily: 'var(--mono)', letterSpacing: '0.24em' }}
        >
          <Scramble text="SECURE CHANNEL OPEN" speed={26} delay={200} />
        </motion.div>
        <motion.div className="big" variants={fadeRise}>Let's build something.</motion.div>
        <motion.a className="em" href={`mailto:${IDENTITY.email}`} variants={fadeRise}>
          {IDENTITY.email}
        </motion.a>
        <motion.div className="contact-links" variants={fadeRise}>
          {IDENTITY.socials.map((s) => (
            <HudButton key={s.label} href={s.url} target="_blank">
              {s.label} <Ico name="external" size={15} />
            </HudButton>
          ))}
          {IDENTITY.resumeUrl && (
            <HudButton
              solid
              href={IDENTITY.resumeUrl}
              target="_blank"
              onClick={() => toast('Résumé transmitted', 'download')}
            >
              <Ico name="download" size={15} /> Résumé
            </HudButton>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ───────── detail overlay (focus-trapped dialog) ───────── */
function Detail({ entity, accent }: { entity: Entity; accent?: string }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const close = () => {
    getAudio().close()
    useJarvis.getState().openDetail(null)
  }

  useEffect(() => {
    getAudio().open()
    const prevFocus = document.activeElement as HTMLElement | null
    // focus the panel for screen readers + keyboard
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
        return
      }
      if (e.key === 'Tab') {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prevFocus?.focus?.()
    }
  }, [entity.id])

  return (
    <motion.div
      className="detail"
      onClick={close}
      variants={backdrop}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div
        ref={panelRef}
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={entity.name}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        variants={dialogPanel}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <button className="hbtn detail-close" onClick={close} aria-label="Close">
          <Ico name="close" size={15} /> Close
        </button>
        <div
          className="detail-cover"
          style={{ backgroundImage: `url(${coverArt(entity.id, accent)})` }}
        />
        <div className="detail-body">
          <div className="kick">
            {entity.kind}
            {entity.year ? ` · ${entity.year}` : ''}
            {entity.status ? ` · ${entity.status}` : ''}
          </div>
          <h2>{entity.name}</h2>
          <div className="lead">{entity.tagline}</div>
          <p>{entity.body}</p>
          {entity.metrics && entity.metrics.length > 0 && (
            <div className="detail-metrics">
              {entity.metrics.map((m) => (
                <div className="m" key={m.label}>
                  <div className="v"><MetricValue value={m.value} /></div>
                  <div className="l">{m.label}</div>
                </div>
              ))}
            </div>
          )}
          {entity.tech && entity.tech.length > 0 && (
            <div className="tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.4rem' }}>
              {entity.tech.map((t) => (
                <span className="chip" key={t}>{t}</span>
              ))}
            </div>
          )}
          {entity.links && entity.links.length > 0 && (
            <div className="detail-links">
              {entity.links.map((l) => (
                <HudButton key={l.label} href={l.url} target="_blank">
                  {l.label} <Ico name="external" size={15} />
                </HudButton>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// reference UNIVERSE so tree-shaking keeps data side-effects (override loader)
void UNIVERSE
