/**
 * ETERNUM — Generative Music Engine
 * =================================
 * No audio files. A small ambient *score* is composed live with the Web Audio
 * API: a slow minor chord progression of warm pads, a gentle arpeggio, and a
 * sparse melody — all in scale, all evolving, washed through a generated
 * reverb. The mood (key transpose, brightness, tempo) glides per realm.
 *
 * Browsers block audio until a user gesture, so init() must run from a click.
 */

type Mood = { transpose: number; brightness: number; beat: number }

// one mood per context — transpose in semitones, filter Hz, seconds per beat
export const MOODS: Record<string, Mood> = {
  void: { transpose: -5, brightness: 500, beat: 0.62 },
  cosmos: { transpose: 0, brightness: 1100, beat: 0.5 },
  identity: { transpose: 3, brightness: 1500, beat: 0.46 },
  memory: { transpose: -7, brightness: 600, beat: 0.72 },
  projects: { transpose: 5, brightness: 1300, beat: 0.46 },
  knowledge: { transpose: 7, brightness: 1600, beat: 0.44 },
  achievements: { transpose: 8, brightness: 1500, beat: 0.46 },
  education: { transpose: 2, brightness: 1000, beat: 0.52 },
  experience: { transpose: 10, brightness: 1400, beat: 0.48 },
  research: { transpose: 12, brightness: 1800, beat: 0.42 },
  legacy: { transpose: -2, brightness: 800, beat: 0.56 },
  future: { transpose: 14, brightness: 2000, beat: 0.4 },
}

// A2 = 110Hz baseline. note(n) = semitones above A2.
const note = (n: number) => 110 * Math.pow(2, n / 12)

// minor pentatonic for melody/arp; minor triad voicing for pads
const SCALE = [0, 3, 5, 7, 10, 12, 15]
// chord roots of the progression (relative semitones): i – VI – III – VII
const PROGRESSION = [0, -4, 3, -2]
const CHORD = [0, 3, 7, 12]

class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private wet: GainNode | null = null
  private filter: BiquadFilterNode | null = null
  private started = false
  private muted = true

  private transpose = 0
  private beatLen = 0.5
  private nextNoteTime = 0
  private step = 0

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
    this.master.gain.value = this.muted ? 0 : 0.22
    this.master.connect(ctx.destination)

    // generated reverb
    const conv = ctx.createConvolver()
    conv.buffer = this.impulse(ctx, 3.2, 2.6)
    this.wet = ctx.createGain()
    this.wet.gain.value = 0.55
    conv.connect(this.wet)
    this.wet.connect(this.master)

    // shared warm lowpass with slow movement
    this.filter = ctx.createBiquadFilter()
    this.filter.type = 'lowpass'
    this.filter.frequency.value = 1100
    this.filter.Q.value = 1.5
    this.filter.connect(this.master)
    this.filter.connect(conv)

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.05
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 260
    lfo.connect(lfoGain)
    lfoGain.connect(this.filter.frequency)
    lfo.start()

    this.nextNoteTime = ctx.currentTime + 0.1
    this.step = 0
    window.setInterval(() => this.scheduler(), 25)
  }

  /** Look-ahead scheduler — queues notes ~0.2s before they sound. */
  private scheduler() {
    const ctx = this.ctx
    if (!ctx) return
    while (this.nextNoteTime < ctx.currentTime + 0.2) {
      this.composeStep(this.step, this.nextNoteTime)
      this.nextNoteTime += this.beatLen
      this.step++
    }
  }

  private composeStep(step: number, time: number) {
    const chordRoot = PROGRESSION[Math.floor(step / 8) % PROGRESSION.length]
    const base = this.transpose + chordRoot

    // pad swells on each chord change (every 8 beats)
    if (step % 8 === 0) {
      CHORD.forEach((c, i) =>
        this.pad(note(base + c - 12 + (i === 3 ? 0 : 0)), time, this.beatLen * 8),
      )
    }

    // arpeggio — a soft pluck every beat, climbing the chord
    const arpNote = CHORD[step % CHORD.length]
    this.pluck(note(base + arpNote), time, 0.18)

    // sparse melody — every ~8 beats, a held scale tone up high
    if (step % 8 === 4) {
      const deg = SCALE[(Math.floor(step / 8) * 2 + 3) % SCALE.length]
      this.lead(note(base + deg + 12), time, this.beatLen * 4)
    }
  }

  private pad(freq: number, time: number, dur: number) {
    const ctx = this.ctx!
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(0.12, time + dur * 0.4)
    g.gain.linearRampToValueAtTime(0, time + dur)
    g.connect(this.filter!)
    ;['sine', 'triangle'].forEach((type, i) => {
      const o = ctx.createOscillator()
      o.type = type as OscillatorType
      o.frequency.value = freq
      o.detune.value = i === 0 ? -5 : 6
      o.connect(g)
      o.start(time)
      o.stop(time + dur + 0.1)
    })
  }

  private pluck(freq: number, time: number, dur: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'triangle'
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(0.07, time + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur + 0.25)
    o.connect(g)
    g.connect(this.filter!)
    o.start(time)
    o.stop(time + dur + 0.3)
  }

  private lead(freq: number, time: number, dur: number) {
    const ctx = this.ctx!
    const o = ctx.createOscillator()
    o.type = 'sine'
    o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(0.1, time + 0.15)
    g.gain.linearRampToValueAtTime(0, time + dur)
    o.connect(g)
    g.connect(this.filter!)
    o.start(time)
    o.stop(time + dur + 0.2)
  }

  private impulse(ctx: AudioContext, seconds: number, decay: number) {
    const rate = ctx.sampleRate
    const len = rate * seconds
    const buf = ctx.createBuffer(2, len, rate)
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch)
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    return buf
  }

  setMuted(m: boolean) {
    this.muted = m
    if (this.ctx && this.master) {
      if (this.ctx.state === 'suspended') this.ctx.resume()
      const now = this.ctx.currentTime
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setTargetAtTime(m ? 0 : 0.22, now, 0.5)
    }
  }

  /** Glide to a realm's mood (key transpose + brightness + tempo). */
  setMood(key: string) {
    const mood = MOODS[key] ?? MOODS.cosmos
    this.transpose = mood.transpose
    this.beatLen = mood.beat
    if (this.ctx && this.filter) {
      this.filter.frequency.setTargetAtTime(
        mood.brightness,
        this.ctx.currentTime,
        1.5,
      )
    }
  }

  /** A soft bell on interaction (in key). */
  blip(degree = 0) {
    if (!this.ctx || !this.filter || this.muted) return
    const f = note(this.transpose + SCALE[degree % SCALE.length] + 24)
    this.lead(f, this.ctx.currentTime, 1.2)
  }
}

let engine: AudioEngine | null = null
export const getAudio = () => (engine ??= new AudioEngine())
