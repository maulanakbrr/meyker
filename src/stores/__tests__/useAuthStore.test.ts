import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      loadingAuth: true,
      isDemoMode: false,
      userPhoneNumber: null,
      googleSheetsId: null,
    })
  })

  it('initializes with default auth state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.loadingAuth).toBe(true)
    expect(state.isDemoMode).toBe(false)
  })

  it('updates user and profile states', () => {
    useAuthStore.getState().setUser({ id: 'test-user-1', email: 'test@example.com' })
    useAuthStore.getState().setLoadingAuth(false)
    useAuthStore.getState().setIsDemoMode(true)
    useAuthStore.getState().setUserPhoneNumber('+62812345678')
    useAuthStore.getState().setGoogleSheetsId('sheet-id-xyz')

    const state = useAuthStore.getState()
    expect(state.user?.id).toBe('test-user-1')
    expect(state.loadingAuth).toBe(false)
    expect(state.isDemoMode).toBe(true)
    expect(state.userPhoneNumber).toBe('+62812345678')
    expect(state.googleSheetsId).toBe('sheet-id-xyz')
  })

  it('handles signOut by resetting state and removing demo localStorage', async () => {
    localStorage.setItem('meyker_demo_mode', 'true')
    useAuthStore.getState().setUser({ id: 'user-1' })
    useAuthStore.getState().setIsDemoMode(true)

    await useAuthStore.getState().signOut()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isDemoMode).toBe(false)
    expect(localStorage.getItem('meyker_demo_mode')).toBeNull()
  })
})
