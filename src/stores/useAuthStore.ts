import { create } from 'zustand'
import { signOut as supabaseSignOut } from '../lib/supabase'

export interface AuthState {
  user: any | null
  loadingAuth: boolean
  isDemoMode: boolean
  userPhoneNumber: string | null
  googleSheetsId: string | null

  setUser: (user: any | null) => void
  setLoadingAuth: (loading: boolean) => void
  setIsDemoMode: (isDemo: boolean) => void
  setUserPhoneNumber: (phone: string | null) => void
  setGoogleSheetsId: (sheetsId: string | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loadingAuth: true,
  isDemoMode: false,
  userPhoneNumber: null,
  googleSheetsId: null,

  setUser: (user) => set({ user }),
  setLoadingAuth: (loadingAuth) => set({ loadingAuth }),
  setIsDemoMode: (isDemoMode) => set({ isDemoMode }),
  setUserPhoneNumber: (userPhoneNumber) => set({ userPhoneNumber }),
  setGoogleSheetsId: (googleSheetsId) => set({ googleSheetsId }),

  signOut: async () => {
    try {
      await supabaseSignOut()
    } catch (e) {
      console.error('[AuthStore] Sign out error:', e)
    }
    localStorage.removeItem('meyker_demo_mode')
    set({
      user: null,
      isDemoMode: false,
      userPhoneNumber: null,
      googleSheetsId: null,
    })
  },
}))
