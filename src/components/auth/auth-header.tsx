import { Wallet } from 'lucide-react'

export interface AuthHeaderProps {
  title?: string
  subtitle?: string
}

export function AuthHeader({
  title = 'Meyker Financial',
  subtitle = 'Sign in to access your financial dashboard',
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3 glow-balance">
        <Wallet className="w-7 h-7 text-indigo-400" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}
