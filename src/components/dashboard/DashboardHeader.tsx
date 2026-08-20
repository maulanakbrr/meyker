import { Wallet, LogOut } from 'lucide-react'
import { Button } from '../ui/button'

interface DashboardHeaderProps {
  user: any
  onSignOut: () => void
  onNavigateAuth: () => void
}

export function DashboardHeader({ user, onSignOut, onNavigateAuth }: DashboardHeaderProps) {
  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center glow-balance">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none">Meyker</h1>
            <p className="text-xs text-gray-400 mt-0.5">Financial Dashboard & Expense Logger</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">{user.email}</p>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Pro Member
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={onSignOut}
                className="bg-gray-800/80 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 border-gray-700/60 hover:border-rose-500/30 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onNavigateAuth}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 rotate-180" /> Log In / Register
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
