import { create } from 'zustand'

/** UI state for the JARVIS HUD. Pure, light, no 3D. */
export type ModuleId =
  | 'home'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'achievements'
  | 'memory'
  | 'contact'

interface JarvisState {
  booted: boolean
  module: ModuleId
  /** open entity (project/etc.) id within a module, or null */
  detail: string | null
  muted: boolean

  setBooted: (b: boolean) => void
  openModule: (m: ModuleId) => void
  openDetail: (id: string | null) => void
  toggleMute: () => void
}

export const useJarvis = create<JarvisState>((set) => ({
  booted: false,
  module: 'home',
  detail: null,
  muted: false,

  setBooted: (booted) => set({ booted }),
  openModule: (module) => set({ module, detail: null }),
  openDetail: (detail) => set({ detail }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}))

if (import.meta.env.DEV) {
  ;(window as unknown as { __jarvis: typeof useJarvis }).__jarvis = useJarvis
}
