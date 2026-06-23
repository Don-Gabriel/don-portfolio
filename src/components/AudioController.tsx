import { useEffect } from 'react'
import { useJarvis, type ModuleId } from '../state/useJarvis'
import { getAudio } from '../audio/AudioEngine'

/** Bridges HUD state to the generative music engine. */
const MOOD: Record<ModuleId, string> = {
  home: 'identity',
  projects: 'projects',
  skills: 'knowledge',
  experience: 'experience',
  education: 'education',
  achievements: 'achievements',
  contact: 'identity',
}

export function AudioController() {
  useEffect(() => {
    const audio = getAudio()

    const start = () => {
      audio.init()
      const s = useJarvis.getState()
      audio.setMuted(s.muted)
      audio.setMood(MOOD[s.module])
    }
    window.addEventListener('pointerdown', start, { once: true })

    let prevMuted = useJarvis.getState().muted
    let prevModule = useJarvis.getState().module
    const unsub = useJarvis.subscribe((s) => {
      if (s.muted !== prevMuted) {
        prevMuted = s.muted
        audio.setMuted(s.muted)
      }
      if (s.module !== prevModule) {
        prevModule = s.module
        audio.setMood(MOOD[s.module])
      }
    })

    return () => {
      window.removeEventListener('pointerdown', start)
      unsub()
    }
  }, [])

  return null
}
