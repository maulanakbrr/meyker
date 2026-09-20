import { describe, it, expect, beforeEach } from 'vitest'
import { useCategoryFormStore } from '../useCategoryFormStore'

describe('useCategoryFormStore', () => {
  beforeEach(() => {
    useCategoryFormStore.getState().resetForm()
  })

  it('initializes with default category form state', () => {
    const state = useCategoryFormStore.getState()
    expect(state.name).toBe('')
    expect(state.type).toBe('EXPENSE')
    expect(state.color).toBe('#6366f1')
  })

  it('updates form fields correctly', () => {
    const store = useCategoryFormStore.getState()
    store.setName('Investment')
    store.setType('INCOME')
    store.setColor('#10b981')

    const updated = useCategoryFormStore.getState()
    expect(updated.name).toBe('Investment')
    expect(updated.type).toBe('INCOME')
    expect(updated.color).toBe('#10b981')
  })

  it('resets form back to default state', () => {
    const store = useCategoryFormStore.getState()
    store.setName('Temp Category')
    store.resetForm()

    const state = useCategoryFormStore.getState()
    expect(state.name).toBe('')
  })
})
