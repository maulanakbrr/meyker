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
