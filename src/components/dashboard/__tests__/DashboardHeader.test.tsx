import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardHeader } from '../DashboardHeader'

describe('DashboardHeader', () => {
  it('renders branding title and subtitle', () => {
    render(<DashboardHeader user={null} onSignOut={vi.fn()} onNavigateAuth={vi.fn()} />)
    expect(screen.getByText('Meyker')).toBeInTheDocument()
    expect(screen.getByText('Financial Dashboard & Expense Logger')).toBeInTheDocument()
  })

  it('renders login button when user is logged out', () => {
    const handleNavigateAuth = vi.fn()
    render(<DashboardHeader user={null} onSignOut={vi.fn()} onNavigateAuth={handleNavigateAuth} />)

    const loginBtn = screen.getByRole('button', { name: /log in \/ register/i })
    expect(loginBtn).toBeInTheDocument()

    fireEvent.click(loginBtn)
    expect(handleNavigateAuth).toHaveBeenCalledTimes(1)
  })

  it('renders user profile and sign out button when logged in', () => {
    const handleSignOut = vi.fn()
    const mockUser = { email: 'user@example.com' }

    render(<DashboardHeader user={mockUser} onSignOut={handleSignOut} onNavigateAuth={vi.fn()} />)

    expect(screen.getByText('user@example.com')).toBeInTheDocument()
    expect(screen.getByText('Pro Member')).toBeInTheDocument()

    const signOutBtn = screen.getByTitle('Sign Out')
    expect(signOutBtn).toBeInTheDocument()

    fireEvent.click(signOutBtn)
    expect(handleSignOut).toHaveBeenCalledTimes(1)
  })
})
