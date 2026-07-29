import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock global URL object methods for Blob downloads
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  window.URL.revokeObjectURL = vi.fn()

  // Mock HTMLAnchorElement click method if needed
  HTMLAnchorElement.prototype.click = vi.fn()
}
