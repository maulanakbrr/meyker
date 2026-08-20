import { PieChart, AlertTriangle, CheckCircle2, AlertOctagon, Plus, Settings2 } from 'lucide-react'
import { Button } from '../ui/button'
import { formatIdrCurrency } from '../../lib/export'
import type { CategoryBudgetProgress } from '../../lib/dashboardUtils'

interface CategoryBudgetCardProps {
  budgets: CategoryBudgetProgress[]
  onOpenBudgetModal: () => void
}

export function CategoryBudgetCard({ budgets = [], onOpenBudgetModal }: CategoryBudgetCardProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Category Spending Budgets</h3>
            <p className="text-[11px] text-gray-400">Track monthly expense limits per category</p>
          </div>
        </div>

        <Button
          onClick={onOpenBudgetModal}
          variant="outline"
          size="sm"
          leftIcon={<Settings2 className="w-3.5 h-3.5 text-indigo-400" />}
          className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs h-8"
        >
          Manage Caps
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-900/40 rounded-xl border border-dashed border-gray-800 space-y-2">
          <PieChart className="w-8 h-8 text-gray-600" />
          <p className="text-xs text-gray-400 max-w-xs">
            No monthly budgets configured. Set spending caps for categories like Food, Rent, or Shopping to prevent overspending.
          </p>
          <Button
            onClick={onOpenBudgetModal}
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-400" />}
            className="bg-indigo-500/10 border-indigo-500/30 text-indigo-300 text-xs mt-2"
          >
            Set Category Budget Caps
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {budgets.map((b) => {
            const barWidth = Math.min(b.percentage, 100)

            return (
              <div key={b.categoryId} className="space-y-1.5 p-3 rounded-xl bg-gray-900/60 border border-gray-800/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="font-semibold text-gray-200">{b.categoryName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      <strong className="text-white">{formatIdrCurrency(b.spent)}</strong> / {formatIdrCurrency(b.limit)}
                    </span>

                    {b.status === 'EXCEEDED' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <AlertOctagon className="w-3 h-3" /> Exceeded ({b.percentage}%)
                      </span>
                    )}

                    {b.status === 'CAUTION' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" /> {b.percentage}%
                      </span>
                    )}

                    {b.status === 'HEALTHY' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> {b.percentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 rounded-full bg-gray-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.status === 'EXCEEDED'
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : b.status === 'CAUTION'
                        ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                        : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
