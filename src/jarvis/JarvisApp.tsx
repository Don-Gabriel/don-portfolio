import { useEffect, useState } from 'react'
import './jarvis.css'
import { Background } from './Background'
import { Reticle } from './Reticle'
import { Reactor } from './Reactor'
import { Boot } from './Boot'
import { useJarvis, type ModuleId } from '../state/useJarvis'
import { UNIVERSE, IDENTITY, galaxyById, type Entity } from '../data/universe'
import { coverArt } from '../art/cover'
import { getAudio } from '../audio/AudioEngine'

const MODULES: { id: ModuleId; label: string; ico: string }[] = [
  { id: 'home', label: 'Home', ico: '⌂' },
  { id: 'projects', label: 'Systems', ico: '◳' },
  { id: 'skills', label: 'Matrix', ico: '⊞' },
  { id: 'experience', label: 'Career', ico: '◈' },
  { id: 'education', label: 'Academy', ico: '⌬' },
  { id: 'achievements', label: 'Honors', ico: '★' },
  { id: 'contact', label: 'Comms', ico: '✦' },
]

const JARVIS_LINES: Record<ModuleId, string> = {
  home: `Welcome. I am JARVIS. This is the work of ${IDENTITY.name} — where shall we begin?`,
  projects: 'Systems catalogue. Each one is fully operational — select for diagnostics.',
  skills: 'Capability matrix calibrated across language, mobile, web, data and core systems.',
  experience: 'Field-deployment history. Currently active.',
  education: 'Training records and credentials on file.',
  achievements: 'Commendations logged. The 3LC victory is, I must say, rather impressive.',
  contact: 'Opening a secure channel. Mr. Gabriel is available for work.',
}

export default function JarvisApp() {
  const booted = useJarvis((s) => s.booted)
  const module = useJarvis((s) => s.module)
  const detailId = useJarvis((s) => s.detail)
  const muted = useJarvis((s) => s.muted)

  const detail =
    galaxyById(module)?.entities.find((e) => e.id === detailId) ?? undefined

  return (
    <div className="hud">
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

      <div className="stage">
        <View module={module} key={module} />
        {detail && <Detail entity={detail} accent={galaxyById(module)?.color} />}
      </div>

      <JarvisLine module={module} muted={muted} />

      <Reticle />
      {!booted && <Boot onDone={() => useJarvis.getState().setBooted(true)} />}
    </div>
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
          className={`rail-btn ${module === m.id ? 'active' : ''}`}
          onClick={() => {
            useJarvis.getState().openModule(m.id)
            getAudio().blip(2)
          }}
        >
          <span className="ico">{m.ico}</span>
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
        onClick={() => useJarvis.getState().toggleMute()}
      >
        {muted ? '♪ sound off' : '♪ sound on'}
      </button>
    </div>
  )
}

/* ───────── views ───────── */
function View({ module }: { module: ModuleId }) {
  if (module === 'home') return <Home />
  if (module === 'projects') return <Projects />
  if (module === 'skills') return <Skills />
  if (module === 'contact') return <Contact />
  return <RowsView module={module} />
}

function Home() {
  return (
    <div className="home">
      <Reactor size={250} />
      <div className="role">{IDENTITY.role}</div>
      <h1>{IDENTITY.name}</h1>
      <div className="tagline">{IDENTITY.tagline}</div>
      <div className="chips">
        <span className="chip">◉ {IDENTITY.location}</span>
        {IDENTITY.available && <span className="chip">● Available for work</span>}
      </div>
      <div className="chips" style={{ marginTop: '1.4rem' }}>
        <button className="hbtn" onClick={() => useJarvis.getState().openModule('projects')}>
          ◳ View systems
        </button>
        <button className="hbtn gold" onClick={() => useJarvis.getState().openModule('contact')}>
          ✦ Initiate contact
        </button>
      </div>
    </div>
  )
}

function ViewHead({ idx, title, sub }: { idx: string; title: string; sub: string }) {
  return (
    <>
      <div className="view-title">
        <span className="idx">{idx}</span>
        <h2>{title}</h2>
      </div>
      <div className="view-sub">{sub}</div>
    </>
  )
}

function Projects() {
  const g = galaxyById('projects')!
  return (
    <div className="view">
      <ViewHead idx="01" title="SYSTEMS" sub={`${g.entities.length} projects · select for full diagnostics`} />
      <div className="grid">
        {g.entities.map((e) => (
          <button key={e.id} className="card" onClick={() => useJarvis.getState().openDetail(e.id)}>
            <div className="cover" style={{ backgroundImage: `url(${coverArt(e.id, g.color)})` }} />
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
          </button>
        ))}
      </div>
    </div>
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
    <div className="view">
      <ViewHead idx="02" title="CAPABILITY MATRIX" sub="real-time skill diagnostics" />
      <div className="diag">
        {g.entities.map((cluster) => (
          <div className="diag-group" key={cluster.id}>
            <h4>{cluster.name}</h4>
            {(cluster.tech ?? []).map((t) => {
              const v = pct(t)
              return (
                <div className="bar" key={t}>
                  <div className="bl">
                    <span>{t}</span>
                    <span>{v}%</span>
                  </div>
                  <div className="track">
                    <div className="fill" style={{ width: `${v}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        ))}
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
    <div className="view">
      <ViewHead idx={meta.idx} title={meta.title} sub={meta.sub} />
      <div className="rows">
        {g.entities.map((e) => (
          <div className="rowcard" key={e.id}>
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
                    <div className="v">{m.value}</div>
                    <div className="l">{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Contact() {
  return (
    <div className="view">
      <div className="contact-wrap">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Reactor size={140} />
        </div>
        <div className="role" style={{ color: 'var(--gold)', marginTop: '1.2rem', fontFamily: 'var(--mono)', letterSpacing: '0.24em' }}>
          SECURE CHANNEL OPEN
        </div>
        <div className="big">Let's build something.</div>
        <a className="em" href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a>
        <div className="contact-links">
          {IDENTITY.socials.map((s) => (
            <a key={s.label} className="hbtn" href={s.url} target="_blank" rel="noreferrer">
              {s.label} ↗
            </a>
          ))}
          {IDENTITY.resumeUrl && (
            <a className="hbtn solid" href={IDENTITY.resumeUrl} target="_blank" rel="noreferrer">
              ⤓ Résumé
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ───────── detail overlay ───────── */
function Detail({ entity, accent }: { entity: Entity; accent?: string }) {
  return (
    <div className="detail" onClick={() => useJarvis.getState().openDetail(null)}>
      <button className="hbtn detail-close" onClick={() => useJarvis.getState().openDetail(null)}>
        ✕ Close
      </button>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
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
                  <div className="v">{m.value}</div>
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
                <a key={l.label} className="hbtn" href={l.url} target="_blank" rel="noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// reference UNIVERSE so tree-shaking keeps data side-effects (override loader)
void UNIVERSE
