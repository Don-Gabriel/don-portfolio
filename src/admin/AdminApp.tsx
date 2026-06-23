import { useState } from 'react'
import './admin.css'
import {
  snapshot,
  saveSnapshot,
  clearOverrides,
  type UniverseSnapshot,
  type EntityKind,
} from '../data/universe'

type Section = 'dashboard' | 'identity' | 'galaxies' | 'memories' | 'data'

const KINDS: EntityKind[] = [
  'project',
  'skill',
  'milestone',
  'chapter',
  'experiment',
  'future',
]

export default function AdminApp() {
  const [snap, setSnap] = useState<UniverseSnapshot>(() =>
    structuredClone(snapshot()),
  )
  const [section, setSection] = useState<Section>('dashboard')
  const [selGalaxy, setSelGalaxy] = useState<string | null>(null)
  const [selEntity, setSelEntity] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const edit = (fn: (d: UniverseSnapshot) => void) =>
    setSnap((prev) => {
      const d = structuredClone(prev)
      fn(d)
      return d
    })

  const save = () => {
    saveSnapshot(snap)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const totalEntities = snap.galaxies.reduce(
    (n, g) => n + g.entities.length,
    0,
  )

  const NAV: { id: Section; label: string }[] = [
    { id: 'dashboard', label: '◧  Dashboard' },
    { id: 'identity', label: '◉  Identity' },
    { id: 'galaxies', label: '✦  Galaxies & Projects' },
    { id: 'memories', label: '⬢  Memory Realms' },
    { id: 'data', label: '⤓  Data & Backup' },
  ]

  return (
    <div className="admin">
      <div className="a-logo">
        <span className="dot" />
        <b>GABRIEL</b>&nbsp;· COMMAND
      </div>

      <div className="a-top">
        <span className="crumb">J.A.R.V.I.S. — control deck</span>
        <div className="a-actions">
          <a className="a-btn" href="/" target="_blank" rel="noreferrer">
            View universe ↗
          </a>
          <button className="a-btn primary" onClick={save}>
            Save changes
          </button>
        </div>
      </div>

      <nav className="a-side">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={`a-nav ${section === n.id ? 'active' : ''}`}
            onClick={() => {
              setSection(n.id)
              setSelGalaxy(null)
              setSelEntity(null)
            }}
          >
            {n.label}
          </button>
        ))}
      </nav>

      <main className="a-main">
        {section === 'dashboard' && (
          <Dashboard
            snap={snap}
            totalEntities={totalEntities}
            go={(s) => setSection(s)}
          />
        )}
        {section === 'identity' && <IdentityEditor snap={snap} edit={edit} />}
        {section === 'galaxies' && (
          <GalaxyEditor
            snap={snap}
            edit={edit}
            sel={selGalaxy}
            setSel={setSelGalaxy}
            selEntity={selEntity}
            setSelEntity={setSelEntity}
          />
        )}
        {section === 'memories' && <MemoryEditor snap={snap} edit={edit} />}
        {section === 'data' && <DataPanel snap={snap} setSnap={setSnap} />}
      </main>

      {saved && <div className="a-toast">✓ Saved &amp; applied</div>}
    </div>
  )
}

/* ───────────── shared fields ───────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <div className="a-color">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  )
}

/** Editor for an array of {a,b} pairs (metrics, links, socials). */
function PairList({
  label,
  items,
  ka,
  kb,
  onChange,
}: {
  label: string
  items: Record<string, string>[]
  ka: string
  kb: string
  onChange: (items: Record<string, string>[]) => void
}) {
  return (
    <div className="a-field">
      <label>{label}</label>
      <div className="a-list">
        {items.map((it, i) => (
          <div className="a-row" key={i} style={{ gridTemplateColumns: '1fr 1fr 36px' }}>
            <input
              value={it[ka] ?? ''}
              placeholder={ka}
              onChange={(e) => {
                const next = items.map((x, j) =>
                  j === i ? { ...x, [ka]: e.target.value } : x,
                )
                onChange(next)
              }}
            />
            <input
              value={it[kb] ?? ''}
              placeholder={kb}
              onChange={(e) => {
                const next = items.map((x, j) =>
                  j === i ? { ...x, [kb]: e.target.value } : x,
                )
                onChange(next)
              }}
            />
            <button
              className="a-btn danger"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        className="a-btn"
        style={{ marginTop: '0.5rem' }}
        onClick={() => onChange([...items, { [ka]: '', [kb]: '' }])}
      >
        ＋ Add
      </button>
    </div>
  )
}

/* ───────────── Dashboard ───────────── */

function Dashboard({
  snap,
  totalEntities,
  go,
}: {
  snap: UniverseSnapshot
  totalEntities: number
  go: (s: Section) => void
}) {
  return (
    <>
      <h1>Universe Health</h1>
      <p className="sub">
        Everything here writes to your browser and updates the live universe
        instantly. Use <b>Data &amp; Backup</b> to export a permanent copy.
      </p>
      <div className="a-cards">
        <div className="a-card">
          <div className="num">{snap.galaxies.length}</div>
          <div className="lbl">Galaxies</div>
        </div>
        <div className="a-card">
          <div className="num">{totalEntities}</div>
          <div className="lbl">Worlds / Projects</div>
        </div>
        <div className="a-card">
          <div className="num">{snap.memories.length}</div>
          <div className="lbl">Memory Realms</div>
        </div>
        <div className="a-card">
          <div className="num">{snap.identity.socials.length}</div>
          <div className="lbl">Social Links</div>
        </div>
      </div>
      <div className="a-section">
        <h3>Identity</h3>
        <p className="a-hint">
          <b>{snap.identity.name}</b> — {snap.identity.role}
          <br />
          {snap.identity.email} · {snap.identity.location}
        </p>
        <div className="a-toolbar" style={{ marginTop: '1rem' }}>
          <button className="a-btn" onClick={() => go('identity')}>
            Edit identity
          </button>
          <button className="a-btn" onClick={() => go('galaxies')}>
            Edit projects
          </button>
        </div>
      </div>
    </>
  )
}

/* ───────────── Identity ───────────── */

function IdentityEditor({
  snap,
  edit,
}: {
  snap: UniverseSnapshot
  edit: (fn: (d: UniverseSnapshot) => void) => void
}) {
  const id = snap.identity
  const set = (k: keyof typeof id, v: string | boolean) =>
    edit((d) => {
      ;(d.identity as unknown as Record<string, unknown>)[k] = v
    })
  return (
    <>
      <h1>Identity — the Core</h1>
      <p className="sub">Who stands at the centre of the universe.</p>
      <div className="a-section">
        <div className="a-row">
          <Field label="Name" value={id.name} onChange={(v) => set('name', v)} />
          <Field label="Handle" value={id.handle} onChange={(v) => set('handle', v)} />
        </div>
        <Field label="Role" value={id.role} onChange={(v) => set('role', v)} />
        <Field label="Tagline" value={id.tagline} onChange={(v) => set('tagline', v)} />
        <div className="a-row">
          <Field label="Location" value={id.location} onChange={(v) => set('location', v)} />
          <Field label="Email" value={id.email} onChange={(v) => set('email', v)} />
        </div>
        <div className="a-row">
          <Field label="Résumé URL" value={id.resumeUrl ?? ''} onChange={(v) => set('resumeUrl', v)} />
          <ColorField label="Accent colour" value={id.color} onChange={(v) => set('color', v)} />
        </div>
        <Area label="Bio" value={id.bio} onChange={(v) => set('bio', v)} />
        <Field label="Creed" value={id.creed} onChange={(v) => set('creed', v)} />
        <PairList
          label="Social links"
          items={id.socials as unknown as Record<string, string>[]}
          ka="label"
          kb="url"
          onChange={(items) =>
            edit((d) => {
              d.identity.socials = items as { label: string; url: string }[]
            })
          }
        />
      </div>
    </>
  )
}

/* ───────────── Galaxies & entities ───────────── */

function GalaxyEditor({
  snap,
  edit,
  sel,
  setSel,
  selEntity,
  setSelEntity,
}: {
  snap: UniverseSnapshot
  edit: (fn: (d: UniverseSnapshot) => void) => void
  sel: string | null
  setSel: (id: string | null) => void
  selEntity: string | null
  setSelEntity: (id: string | null) => void
}) {
  const galaxy = snap.galaxies.find((g) => g.id === sel)
  const entity = galaxy?.entities.find((e) => e.id === selEntity)

  if (entity && galaxy) {
    const set = (k: string, v: unknown) =>
      edit((d) => {
        const g = d.galaxies.find((x) => x.id === galaxy.id)!
        const e = g.entities.find((x) => x.id === entity.id)! as unknown as Record<
          string,
          unknown
        >
        e[k] = v
      })
    return (
      <>
        <button className="a-back" onClick={() => setSelEntity(null)}>
          ← {galaxy.name} worlds
        </button>
        <h1>{entity.name || 'Untitled world'}</h1>
        <p className="sub">A world inside {galaxy.name}.</p>
        <div className="a-section">
          <div className="a-row">
            <Field label="Name" value={entity.name} onChange={(v) => set('name', v)} />
            <div className="a-field">
              <label>Kind</label>
              <select value={entity.kind} onChange={(e) => set('kind', e.target.value)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Field label="Tagline" value={entity.tagline} onChange={(v) => set('tagline', v)} />
          <Area label="Body" value={entity.body} onChange={(v) => set('body', v)} />
          <div className="a-row">
            <Field label="Year" value={entity.year ?? ''} onChange={(v) => set('year', v)} />
            <Field label="Status" value={entity.status ?? ''} onChange={(v) => set('status', v)} />
          </div>
          <Field
            label="Tech (comma separated)"
            value={(entity.tech ?? []).join(', ')}
            onChange={(v) =>
              set(
                'tech',
                v.split(',').map((s) => s.trim()).filter(Boolean),
              )
            }
          />
          <PairList
            label="Metrics"
            items={(entity.metrics ?? []) as unknown as Record<string, string>[]}
            ka="label"
            kb="value"
            onChange={(items) => set('metrics', items)}
          />
          <PairList
            label="Links"
            items={(entity.links ?? []) as unknown as Record<string, string>[]}
            ka="label"
            kb="url"
            onChange={(items) => set('links', items)}
          />
          <button
            className="a-btn danger"
            onClick={() => {
              edit((d) => {
                const g = d.galaxies.find((x) => x.id === galaxy.id)!
                g.entities = g.entities.filter((x) => x.id !== entity.id)
              })
              setSelEntity(null)
            }}
          >
            Delete this world
          </button>
        </div>
      </>
    )
  }

  if (galaxy) {
    const set = (k: string, v: unknown) =>
      edit((d) => {
        const g = d.galaxies.find((x) => x.id === galaxy.id)! as unknown as Record<
          string,
          unknown
        >
        g[k] = v
      })
    return (
      <>
        <button className="a-back" onClick={() => setSel(null)}>
          ← All galaxies
        </button>
        <h1>{galaxy.name}</h1>
        <p className="sub">{galaxy.essence}</p>
        <div className="a-section">
          <h3>Galaxy</h3>
          <div className="a-row">
            <Field label="Name" value={galaxy.name} onChange={(v) => set('name', v)} />
            <Field label="Essence" value={galaxy.essence} onChange={(v) => set('essence', v)} />
          </div>
          <Area label="Lore" value={galaxy.lore} onChange={(v) => set('lore', v)} />
          <div className="a-row">
            <ColorField label="Colour" value={galaxy.color} onChange={(v) => set('color', v)} />
            <Field
              label="Tags (comma separated)"
              value={galaxy.tags.join(', ')}
              onChange={(v) =>
                set('tags', v.split(',').map((s) => s.trim()).filter(Boolean))
              }
            />
          </div>
        </div>

        <div className="a-section">
          <h3>Worlds inside ({galaxy.entities.length})</h3>
          <div className="a-list">
            {galaxy.entities.map((e) => (
              <div className="a-item" key={e.id} onClick={() => setSelEntity(e.id)}>
                <span className="swatch" style={{ background: galaxy.color }} />
                <span className="grow">{e.name}</span>
                <span className="meta">{e.kind}</span>
              </div>
            ))}
          </div>
          <button
            className="a-btn good"
            style={{ marginTop: '0.9rem' }}
            onClick={() => {
              const id = `w-${Math.round(performance.now())}`
              edit((d) => {
                const g = d.galaxies.find((x) => x.id === galaxy.id)!
                g.entities.push({
                  id,
                  name: 'New world',
                  kind: 'project',
                  tagline: '',
                  body: '',
                })
              })
              setSelEntity(id)
            }}
          >
            ＋ Add a world
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <h1>Galaxies &amp; Projects</h1>
      <p className="sub">Each galaxy is a life domain. Click to edit its worlds.</p>
      <div className="a-section">
        <div className="a-list">
          {snap.galaxies.map((g) => (
            <div className="a-item" key={g.id} onClick={() => setSel(g.id)}>
              <span className="swatch" style={{ background: g.color }} />
              <span className="grow">{g.name}</span>
              <span className="meta">{g.entities.length} worlds</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

/* ───────────── Memories ───────────── */

function MemoryEditor({
  snap,
  edit,
}: {
  snap: UniverseSnapshot
  edit: (fn: (d: UniverseSnapshot) => void) => void
}) {
  const upload = (i: number, file: File) => {
    const reader = new FileReader()
    reader.onload = () =>
      edit((d) => {
        d.memories[i].image = String(reader.result)
      })
    reader.readAsDataURL(file)
  }
  return (
    <>
      <h1>Memory Realms</h1>
      <p className="sub">Memories visitors can step inside. Add an image to make one real.</p>
      {snap.memories.map((m, i) => (
        <div className="a-section" key={m.id}>
          <div className="a-row">
            <Field
              label="Title"
              value={m.title}
              onChange={(v) =>
                edit((d) => {
                  d.memories[i].title = v
                })
              }
            />
            <Field
              label="Year / era"
              value={m.year ?? ''}
              onChange={(v) =>
                edit((d) => {
                  d.memories[i].year = v
                })
              }
            />
          </div>
          <Area
            label="Caption"
            value={m.caption}
            onChange={(v) =>
              edit((d) => {
                d.memories[i].caption = v
              })
            }
          />
          <div className="a-row">
            <ColorField
              label="Colour"
              value={m.color}
              onChange={(v) =>
                edit((d) => {
                  d.memories[i].color = v
                })
              }
            />
            <div className="a-field">
              <label>Image {m.image ? '✓' : '(generated)'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) upload(i, f)
                }}
              />
            </div>
          </div>
          <button
            className="a-btn danger"
            onClick={() =>
              edit((d) => {
                d.memories = d.memories.filter((_, j) => j !== i)
              })
            }
          >
            Delete memory
          </button>
        </div>
      ))}
      <button
        className="a-btn good"
        onClick={() =>
          edit((d) => {
            d.memories.push({
              id: `mem-${Math.round(performance.now())}`,
              title: 'New memory',
              caption: '',
              year: '',
              color: '#c9a0ff',
            })
          })
        }
      >
        ＋ Add a memory
      </button>
    </>
  )
}

/* ───────────── Data & backup ───────────── */

function DataPanel({
  snap,
  setSnap,
}: {
  snap: UniverseSnapshot
  setSnap: (s: UniverseSnapshot) => void
}) {
  const [imported, setImported] = useState('')
  const download = () => {
    const blob = new Blob([JSON.stringify(snap, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'eternum-universe.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const importJson = () => {
    try {
      const parsed = JSON.parse(imported) as UniverseSnapshot
      setSnap(parsed)
      setImported('')
      alert('Imported into the editor. Click “Save changes” to apply.')
    } catch {
      alert('That is not valid JSON.')
    }
  }
  return (
    <>
      <h1>Data &amp; Backup</h1>
      <p className="sub">
        Export a permanent copy, restore one, or reset to the built-in defaults.
      </p>
      <div className="a-section">
        <h3>Export</h3>
        <p className="a-hint">
          Download the whole universe as JSON. Keep it as a backup, or paste its
          contents into <code>src/data/universe.ts</code> to bake it in.
        </p>
        <button className="a-btn primary" style={{ marginTop: '1rem' }} onClick={download}>
          ⤓ Download universe.json
        </button>
      </div>
      <div className="a-section">
        <h3>Import</h3>
        <div className="a-field">
          <label>Paste a previously exported JSON</label>
          <textarea
            value={imported}
            onChange={(e) => setImported(e.target.value)}
            placeholder="{ ... }"
            style={{ minHeight: 140 }}
          />
        </div>
        <button className="a-btn" onClick={importJson} disabled={!imported.trim()}>
          Load into editor
        </button>
      </div>
      <div className="a-section">
        <h3>Reset</h3>
        <p className="a-hint">
          Remove your saved overrides and return to the built-in universe.
        </p>
        <button
          className="a-btn danger"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            if (confirm('Reset to defaults? Your saved edits will be cleared.')) {
              clearOverrides()
              location.reload()
            }
          }}
        >
          Reset to defaults
        </button>
      </div>
    </>
  )
}
