import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } from '../supabase'

vi.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  }
  return {
    createClient: vi.fn(() => ({
      auth: mockAuth,
    })),
  }
})

describe('Supabase Client & Auth Helpers Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports a valid Supabase client instance', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
  })

  describe('signInWithGoogle', () => {
    it('calls signInWithOAuth with google provider and current location origin', async () => {
      const mockResult = { provider: 'google', url: 'https://accounts.google.com' }
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      } as any)

      const result = await signInWithGoogle()

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      expect(result).toEqual(mockResult)
    })
  })

  describe('signInWithEmail', () => {
    it('calls signInWithPassword with correct arguments and returns data on success', async () => {
      const mockResult = { user: { id: 'usr-1' }, session: { access_token: 'token-123' } }
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      } as any)

      const result = await signInWithEmail('test@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual(mockResult)
    })

    it('throws error when Supabase auth fails', async () => {
      const authError = new Error('Invalid login credentials')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: authError,
      } as any)

      await expect(signInWithEmail('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid login credentials'
      )
    })
  })

  describe('signUpWithEmail', () => {
    it('calls signUp with full name metadata', async () => {
      const mockResult = { user: { id: 'usr-2' }, session: null }
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
        data: mockResult,
        error: null,
      } as any)

      const result = await signUpWithEmail('new@example.com', 'securepass', 'Jane Doe')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'securepass',
        options: {
          data: {
            full_name: 'Jane Doe',
          },
        },
      })
      expect(result).toEqual(mockResult)
    })
  })

  describe('signOut', () => {
    it('calls auth.signOut successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null } as any)

      await signOut()

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    })
  })
})
