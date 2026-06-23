import { useEffect } from 'react'
import { useJarvis } from '../state/useJarvis'
import { getAudio } from '../audio/AudioEngine'

/**
 * Bridges HUD state to the SFX engine: boots the audio context on the first
 * user gesture, keeps it in sync with the mute toggle, and fires a navigation
 * sweep whenever the active module changes.
 */
export function AudioController() {
  useEffect(() => {
    const audio = getAudio()

    const start = () => {
      audio.init()
      audio.setMuted(useJarvis.getState().muted)
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
        audio.nav()
      }
    })

    return () => {
      window.removeEventListener('pointerdown', start)
      unsub()
    }
  }, [])

  return null
}
