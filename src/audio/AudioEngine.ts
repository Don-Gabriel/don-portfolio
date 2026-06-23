/**
 * ETERNUM — HUD Sound-Effects Engine
 * ==================================
 * No audio files, no background music. A small bank of synthesised, high-tech
 * UI sound effects — clicks, hover ticks, navigation sweeps, open/close
 * whooshes — composed live with the Web Audio API. The goal is the "reactive
 * machine" feel of a Stark-lab interface: short, crisp, metallic transients.
 *
 * Browsers block audio until a user gesture, so init() must run from a click.
 */
class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuf: AudioBuffer | null = null
  private started = false
  private muted = false
  private lastHover = 0

  init() {
    if (this.started) return
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    this.ctx = ctx
    this.started = true

    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : 0.9
    // gentle limiter so layered transients never clip
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -10
    comp.ratio.value = 12
    this.master.connect(comp)
    comp.connect(ctx.destination)

    // one shared white-noise buffer for percussive/air transients
    const len = ctx.sampleRate * 0.4
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    this.noiseBuf = buf
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx && this.master) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setTargetAtTime(m ? 0 : 0.9, now, 0.05)
    }
  }

  private get ready() {
    return !!this.ctx && !!this.master && !this.muted
  }

  /* ───────── low-level voices ───────── */

  /** A pitched oscillator blip with a fast percussive envelope. */
  private tone(
    opts: {
      type?: OscillatorType
      from: number
      to?: number
      dur: number
      gain: number
      delay?: number
      bp?: number // optional band-pass centre
      q?: number
    },
  ) {
    const ctx = this.ctx!
    const t = ctx.currentTime + (opts.delay ?? 0)
    const o = ctx.createOscillator()
    o.type = opts.type ?? 'square'
    o.frequency.setValueAtTime(opts.from, t)
    if (opts.to !== undefined) o.frequency.exponentialRampToValueAtTime(Math.max(1, opts.to), t + opts.dur)

    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(opts.gain, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)

    let node: AudioNode = o
    if (opts.bp) {
      const f = ctx.createBiquadFilter()
      f.type = 'bandpass'
      f.frequency.value = opts.bp
      f.Q.value = opts.q ?? 6
      o.connect(f)
      f.connect(g)
      node = g
    } else {
      o.connect(g)
      node = g
    }
    node.connect(this.master!)
    o.start(t)
    o.stop(t + opts.dur + 0.02)
  }

  /** A filtered noise burst — "air" / mechanical texture. */
  private noise(opts: { dur: number; gain: number; bp: number; q?: number; sweepTo?: number; delay?: number }) {
    const ctx = this.ctx!
    const t = ctx.currentTime + (opts.delay ?? 0)
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuf
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.setValueAtTime(opts.bp, t)
    if (opts.sweepTo) f.frequency.exponentialRampToValueAtTime(opts.sweepTo, t + opts.dur)
    f.Q.value = opts.q ?? 4
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(opts.gain, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur)
    src.connect(f)
    f.connect(g)
    g.connect(this.master!)
    src.start(t)
    src.stop(t + opts.dur + 0.02)
  }

  /* ───────── public SFX ───────── */

  /** Subtle high tick on hover. Throttled so rapid traversal never spams. */
  hover(high = false) {
    if (!this.ready) return
    const now = performance.now()
    if (now - this.lastHover < 45) return
    this.lastHover = now
    this.tone({ type: 'triangle', from: high ? 2600 : 2100, to: high ? 3000 : 2400, dur: 0.05, gain: 0.05, bp: high ? 2800 : 2300, q: 8 })
  }

  /** Crisp confirm on click/select — metallic two-layer transient. */
  click() {
    if (!this.ready) return
    this.tone({ type: 'square', from: 1700, to: 700, dur: 0.07, gain: 0.09, bp: 1400, q: 5 })
    this.tone({ type: 'sine', from: 880, to: 520, dur: 0.12, gain: 0.06, delay: 0.005 })
    this.noise({ dur: 0.05, gain: 0.05, bp: 3200, q: 2 })
  }

  /** Module navigation — a quick servo-like sweep. */
  nav() {
    if (!this.ready) return
    this.tone({ type: 'sawtooth', from: 420, to: 1300, dur: 0.14, gain: 0.05, bp: 900, q: 3 })
    this.noise({ dur: 0.16, gain: 0.04, bp: 700, sweepTo: 2400, q: 1.5 })
    this.tone({ type: 'sine', from: 1300, to: 1500, dur: 0.08, gain: 0.04, delay: 0.1 })
  }

  /** Panel / palette opening — rising charge. */
  open() {
    if (!this.ready) return
    this.tone({ type: 'sawtooth', from: 300, to: 1600, dur: 0.2, gain: 0.05, bp: 1100, q: 2 })
    this.noise({ dur: 0.22, gain: 0.05, bp: 500, sweepTo: 3000, q: 1.2 })
  }

  /** Panel / palette closing — falling power-down. */
  close() {
    if (!this.ready) return
    this.tone({ type: 'sawtooth', from: 1400, to: 320, dur: 0.18, gain: 0.05, bp: 900, q: 2 })
    this.noise({ dur: 0.18, gain: 0.04, bp: 2600, sweepTo: 400, q: 1.2 })
  }

  /** Deep power-up swell — for the boot hand-off. */
  power() {
    if (!this.ready) return
    this.tone({ type: 'sine', from: 90, to: 320, dur: 0.7, gain: 0.12 })
    this.tone({ type: 'sawtooth', from: 180, to: 900, dur: 0.6, gain: 0.04, bp: 600, q: 2, delay: 0.05 })
    this.noise({ dur: 0.7, gain: 0.05, bp: 400, sweepTo: 2200, q: 0.8 })
  }

  /**
   * Back-compat shim for existing call sites that used the old musical
   * `blip(degree)`. Maps the old "degree" hints onto the new SFX bank.
   */
  blip(degree = 0) {
    switch (degree) {
      case 1:
        return this.hover(false)
      case 3:
        return this.hover(true)
      case 4:
        return this.open()
      default:
        return this.click()
    }
  }
}

let engine: AudioEngine | null = null
export const getAudio = () => (engine ??= new AudioEngine())
