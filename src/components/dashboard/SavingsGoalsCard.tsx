import { Target, Plus, Trophy, ArrowUpRight, Pencil } from 'lucide-react'
import { Button } from '../ui/button'
import { formatIdrCurrency } from '../../lib/export'
import { calculateSavingsGoalProgress } from '../../lib/dashboardUtils'
import type { SavingsGoal } from '../../types'

interface SavingsGoalsCardProps {
  goals: SavingsGoal[]
  onOpenCreateGoalModal: () => void
  onOpenDepositModal: (goal: SavingsGoal) => void
  onOpenEditModal?: (goal: SavingsGoal) => void
}

export function SavingsGoalsCard({
  goals = [],
  onOpenCreateGoalModal,
  onOpenDepositModal,
  onOpenEditModal,
}: SavingsGoalsCardProps) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Savings Goals Tracker</h3>
            <p className="text-[11px] text-gray-400">Build wealth & track savings targets</p>
          </div>
        </div>

        <Button
          onClick={onOpenCreateGoalModal}
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
          className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:text-white text-xs h-8"
        >
          New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-900/40 rounded-xl border border-dashed border-gray-800 space-y-2">
          <Target className="w-8 h-8 text-gray-600" />
          <p className="text-xs text-gray-400 max-w-xs">
            No savings goals created yet. Set targets like Emergency Fund, New Gadget, or Vacation to stay motivated!
          </p>
          <Button
            onClick={onOpenCreateGoalModal}
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
            className="bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs mt-2"
          >
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {goals.map((g) => {
            const { percentage, remainingAmount, isCompleted } = calculateSavingsGoalProgress(
              g.targetAmount,
              g.currentAmount
            )

            return (
              <div key={g.id} className="space-y-2 p-3.5 rounded-xl bg-gray-900/60 border border-gray-800/80">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: g.color }}
                    />
                    <span className="font-bold text-white">{g.name}</span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <Trophy className="w-3 h-3" /> Reached!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {onOpenEditModal && (
                      <Button
                        onClick={() => onOpenEditModal(g)}
                        variant="ghost"
                        size="sm"
                        className="text-[11px] h-6 px-2 text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Pencil className="w-3 h-3 mr-1" /> Edit
                      </Button>
                    )}
                    <Button
                      onClick={() => onOpenDepositModal(g)}
                      variant="ghost"
                      size="sm"
                      className="text-[11px] h-6 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    >
                      Deposit <ArrowUpRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">
                    Saved <strong className="text-emerald-400">{formatIdrCurrency(g.currentAmount)}</strong> of{' '}
                    {formatIdrCurrency(g.targetAmount)}
                  </span>
                  <span className="font-mono font-bold text-gray-300">{percentage}%</span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full h-2 rounded-full bg-gray-950 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 shadow-sm shadow-emerald-500/40"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {!isCompleted && remainingAmount > 0 && (
                  <p className="text-[10px] text-gray-500 text-right font-mono">
                    {formatIdrCurrency(remainingAmount)} remaining
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
