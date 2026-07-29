import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import type { DashboardStats } from '../../lib/dashboardUtils'

interface StatCardsProps {
  stats: DashboardStats
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Balance */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glow-balance border border-indigo-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total Balance
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-white tracking-tight">
          {formatCurrency(stats.totalBalance)}
        </p>
        <p className="text-xs text-indigo-300/70 mt-2">Net financial standing for selected month</p>
      </div>

      {/* Card 2: Total Income */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glow-income border border-emerald-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total Income
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-emerald-400 tracking-tight">
          {formatCurrency(stats.totalIncome)}
        </p>
        <p className="text-xs text-emerald-300/70 mt-2">Sum of logged earnings</p>
      </div>

      {/* Card 3: Total Expenses */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden glow-expense border border-rose-500/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
        </div>
        <p className="text-3xl font-bold text-rose-400 tracking-tight">
          {formatCurrency(stats.totalExpenses)}
        </p>
        <p className="text-xs text-rose-300/70 mt-2">Sum of logged outgoings</p>
      </div>
    </div>
  )
}
