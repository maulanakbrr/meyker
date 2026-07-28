import { createFileRoute } from '@tanstack/react-router'
import { LoginPage } from './login'

export const Route = createFileRoute('/auth')({
  component: AuthRoute,
})

function AuthRoute() {
  return <LoginPage />
}
