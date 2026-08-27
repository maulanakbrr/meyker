import React from 'react'
import type { RecurringTransaction } from '../../types'
import { formatFrequencyLabel } from '../../lib/recurringUtils'
import { formatIdrCurrency } from '../../lib/export'
import { Repeat, Plus, Trash2, Calendar, ArrowUpRight, ArrowDownRight, Power, Edit3 } from 'lucide-react'
import { Button } from '../ui/button'

interface RecurringTransactionCardProps {
  recurringRules: RecurringTransaction[]
  onOpenModal: () => void
  onEditRule: (rule: RecurringTransaction) => void
  onToggleActive: (id: string, currentActive: boolean) => void
  onDeleteRule: (id: string) => void
}

export const RecurringTransactionCard: React.FC<RecurringTransactionCardProps> = ({
  recurringRules = [],
  onOpenModal,
  onEditRule,
  onToggleActive,
  onDeleteRule,
}) => {
  const activeCount = recurringRules.filter((r) => r.isActive).length

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 flex flex-col justify-start">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Repeat className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">Recurring Transactions</h3>
            <p className="text-[11px] text-gray-400">
              {activeCount} active subscription{activeCount !== 1 ? 's' : ''} & bills
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenModal}
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5 text-purple-400" />}
          className="bg-gray-900 border-gray-800 text-gray-300 hover:text-white text-xs h-8 shrink-0"
        >
          Add Rule
        </Button>
      </div>

      {recurringRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-900/40 rounded-xl border border-dashed border-gray-800 space-y-2">
          <Repeat className="w-8 h-8 text-gray-600" />
          <p className="text-xs text-gray-400 max-w-xs">
            No recurring rules configured yet. Set up automatic entries for rent, subscriptions, or salary.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {recurringRules.map((rule) => {
            const isExpense = rule.type === 'EXPENSE'
            const dueDateFormatted = rule.nextDueDate
              ? new Date(rule.nextDueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A'

            return (
              <div
                key={rule.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                  rule.isActive
                    ? 'bg-gray-900/60 border-gray-800/80 hover:border-purple-500/40'
                    : 'bg-gray-900/20 border-gray-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isExpense
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-gray-200 text-xs truncate max-w-[130px]" title={rule.title}>
                        {rule.title}
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                        {formatFrequencyLabel(rule.frequency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500 shrink-0" />
                        Next: {dueDateFormatted}
                      </span>
                      <span>•</span>
                      <span className="capitalize truncate max-w-[90px]">{rule.paymentMethod.replace('_', ' ').toLowerCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span
                      className={`font-semibold text-xs whitespace-nowrap block ${
                        isExpense ? 'text-gray-200' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatIdrCurrency(rule.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => onEditRule(rule)}
                      title="Edit recurring rule"
                      className="p-1 rounded-lg text-gray-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleActive(rule.id, rule.isActive)}
                      title={rule.isActive ? 'Pause recurring rule' : 'Activate recurring rule'}
                      className={`p-1 rounded-lg transition-colors cursor-pointer ${
                        rule.isActive
                          ? 'text-emerald-400 hover:bg-emerald-500/10'
                          : 'text-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRule(rule.id)}
                      title="Delete recurring rule"
                      className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
