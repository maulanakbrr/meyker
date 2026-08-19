import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleWhatsAppWebhook } from '../whatsappWebhookService'
import { serviceRoleSupabase } from '../serviceRoleSupabase'

vi.mock('../serviceRoleSupabase', () => ({
  serviceRoleSupabase: {
    from: vi.fn(),
  },
}))

describe('whatsappWebhookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns unregistered notification if sender phone is not found in database', async () => {
    const mockSelect = vi.fn().mockReturnThis()
    const mockOr = vi.fn().mockReturnThis()
    const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })

    vi.mocked(serviceRoleSupabase.from).mockReturnValue({
      select: mockSelect,
      or: mockOr,
      maybeSingle: mockMaybeSingle,
    } as any)

    const result = await handleWhatsAppWebhook(
      { From: 'whatsapp:+62899999999', Body: '50k lunch #food' },
      { 'content-type': 'application/x-www-form-urlencoded' }
    )

    expect(result.status).toBe(200)
    expect(result.body).toContain('is not registered with any Meyker account')
    expect(result.contentType).toBe('text/xml')
  })

  it('successfully parses text message and logs transaction for registered user', async () => {
    const mockProfile = { id: 'user-uuid-123', full_name: 'Test User', email: 'test@example.com' }
    const mockCategory = { id: 'cat-uuid-456', name: 'Food & Dining', type: 'EXPENSE', is_default: true }

    vi.mocked(serviceRoleSupabase.from).mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          or: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        } as any
      }
      if (table === 'categories') {
        return {
          select: vi.fn().mockReturnThis(),
          or: vi.fn().mockResolvedValue({ data: [mockCategory], error: null }),
        } as any
      }
      if (table === 'transactions') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any
      }
      return {} as any
    })

    const result = await handleWhatsAppWebhook(
      { From: 'whatsapp:+628123456789', Body: '50k lunch #food' },
      { 'content-type': 'application/x-www-form-urlencoded' }
    )

    expect(result.status).toBe(200)
    expect(result.body).toContain('Meyker Transaction Logged')
    expect(result.body).toContain('Rp')
    expect(result.body).toContain('50.000')
  })
})
