import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthHeader } from '../components/auth/auth-header'
import { LoginForm } from '../components/auth/login-form'
import { SocialAuthButtons } from '../components/auth/social-auth-buttons'
import { Card } from '../components/ui/card'
import { Divider } from '../components/ui/divider'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

export function LoginPage() {
  const navigate = useNavigate()
  const isPopup = typeof window !== 'undefined' && Boolean(window.opener && window.opener !== window)

  if (isPopup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f19] text-gray-200 gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-sm text-gray-400 font-medium">Completing Google Authentication...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b0f19] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <Card>
          <AuthHeader />
          <LoginForm onSuccess={() => navigate({ to: '/' })} />
          <Divider label="OR CONTINUE WITH" />
          <SocialAuthButtons />
        </Card>
      </div>
    </div>
  )
}
