/**
 * Procedural cover art. Each entity gets a unique, deterministic abstract
 * "world" rendered to a canvas — no stock images, no asset files. Seeded by
 * the entity id so it is stable across reloads, themed by the galaxy colour.
 */

const cache = new Map<string, string>()

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function lighten(hex: string, amt: number): string {
  const c = hex.replace('#', '')
  const n = parseInt(c, 16)
  const r = Math.min(255, ((n >> 16) & 255) + amt)
  const g = Math.min(255, ((n >> 8) & 255) + amt)
  const b = Math.min(255, (n & 255) + amt)
  return `rgb(${r},${g},${b})`
}

/** Returns a data-URL cover for the given id + accent colour. */
export function coverArt(id: string, color = '#7d8bff'): string {
  const key = `${id}|${color}`
  const hit = cache.get(key)
  if (hit) return hit

  const W = 880
  const H = 480
  const cv = document.createElement('canvas')
  cv.width = W
  cv.height = H
  const ctx = cv.getContext('2d')!
  const rnd = mulberry32(hash(key))

  // base gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#070512')
  bg.addColorStop(1, '#0b0a1f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // nebula glow blobs
  for (let i = 0; i < 5; i++) {
    const x = rnd() * W
    const y = rnd() * H
    const r = 120 + rnd() * 260
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, hexA(color, 0.18 + rnd() * 0.15))
    g.addColorStop(1, hexA(color, 0))
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  // starfield
  for (let i = 0; i < 160; i++) {
    ctx.globalAlpha = 0.2 + rnd() * 0.7
    ctx.fillStyle = rnd() > 0.85 ? color : '#ffffff'
    const s = rnd() * 1.8
    ctx.beginPath()
    ctx.arc(rnd() * W, rnd() * H, s, 0, 7)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // a focal celestial body, offset
  const px = W * (0.55 + rnd() * 0.3)
  const py = H * (0.4 + rnd() * 0.3)
  const pr = 60 + rnd() * 90
  const body = ctx.createRadialGradient(
    px - pr * 0.3,
    py - pr * 0.3,
    pr * 0.1,
    px,
    py,
    pr,
  )
  body.addColorStop(0, lighten(color, 80))
  body.addColorStop(0.6, color)
  body.addColorStop(1, '#05030f')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(px, py, pr, 0, 7)
  ctx.fill()

  // glow halo
  ctx.globalCompositeOperation = 'lighter'
  const halo = ctx.createRadialGradient(px, py, pr * 0.6, px, py, pr * 2.1)
  halo.addColorStop(0, hexA(color, 0.5))
  halo.addColorStop(1, hexA(color, 0))
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(px, py, pr * 2.1, 0, 7)
  ctx.fill()

  // orbital arcs
  ctx.lineWidth = 1.2
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = hexA('#ffffff', 0.1 + rnd() * 0.15)
    ctx.beginPath()
    ctx.ellipse(
      px,
      py,
      pr * (1.6 + i * 0.6),
      pr * (0.5 + i * 0.25),
      rnd() * Math.PI,
      0,
      Math.PI * 2,
    )
    ctx.stroke()
  }
  ctx.globalCompositeOperation = 'source-over'

  // subtle vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H)
  vg.addColorStop(0, 'rgba(0,0,0,0)')
  vg.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vg
  ctx.fillRect(0, 0, W, H)

  const url = cv.toDataURL('image/jpeg', 0.82)
  cache.set(key, url)
  return url
}

function hexA(hex: string, a: number): string {
  const c = hex.replace('#', '')
  const n = parseInt(c, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
