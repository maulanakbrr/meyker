import { useState, useEffect } from 'react'
import { Target, Plus, ArrowUpRight, Save, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { formatIdrCurrency } from '../../lib/export'
import type { SavingsGoal } from '../../types'

export type SavingsGoalModalMode = 'CREATE' | 'EDIT' | 'DEPOSIT'

interface SavingsGoalModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: SavingsGoalModalMode
  targetGoal?: SavingsGoal | null
  onCreateGoal: (goal: {
    name: string
    targetAmount: number
    initialDeposit: number
    color: string
    targetDate?: string | null
  }) => Promise<void>
  onUpdateGoal?: (
    goalId: string,
    goal: { name: string; targetAmount: number; currentAmount: number; color: string }
  ) => Promise<void>
  onDeleteGoal?: (goalId: string) => Promise<void>
  onDepositGoal: (goalId: string, depositAmount: number) => Promise<void>
}

const PRESET_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4']

export function SavingsGoalModal({
  isOpen,
  onClose,
  mode = 'CREATE',
  targetGoal,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositGoal,
}: SavingsGoalModalProps) {
  const activeMode = mode === 'DEPOSIT' || (targetGoal && mode !== 'EDIT') ? 'DEPOSIT' : mode

  // Form State
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [initialDeposit, setInitialDeposit] = useState('')
  const [color, setColor] = useState('#10b981')
  const [targetDate, setTargetDate] = useState('')
  const [depositAmount, setDepositAmount] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Sync form inputs when modal opens or targetGoal changes
  useEffect(() => {
    if (isOpen && targetGoal) {
      setName(targetGoal.name)
      setTargetAmount(String(targetGoal.targetAmount))
      setCurrentAmount(String(targetGoal.currentAmount))
      setColor(targetGoal.color || '#10b981')
    } else if (isOpen && !targetGoal) {
      setName('')
      setTargetAmount('')
      setCurrentAmount('')
      setInitialDeposit('')
      setColor('#10b981')
      setTargetDate('')
      setDepositAmount('')
    }
  }, [isOpen, targetGoal, activeMode])

  const handleClose = () => {
    setErrorMsg(null)
    onClose()
  }

  const handleDelete = async () => {
    if (!targetGoal || !onDeleteGoal) return
    if (window.confirm(`Are you sure you want to delete goal "${targetGoal.name}"?`)) {
      setIsSubmitting(true)
      try {
        await onDeleteGoal(targetGoal.id)
        handleClose()
      } catch (err: any) {
        console.error('[SavingsGoalModal Delete Error]', err)
        setErrorMsg(err?.message || 'Failed to delete savings goal.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      if (activeMode === 'DEPOSIT' && targetGoal) {
        const amt = Number(depositAmount)
        if (isNaN(amt) || amt <= 0) {
          setErrorMsg('Please enter a valid deposit amount greater than 0.')
          setIsSubmitting(false)
          return
        }
        await onDepositGoal(targetGoal.id, amt)
      } else if (activeMode === 'EDIT' && targetGoal && onUpdateGoal) {
        const targetNum = Number(targetAmount)
        const currentNum = Number(currentAmount) || 0

        if (!name.trim()) {
          setErrorMsg('Please enter a goal name.')
          setIsSubmitting(false)
          return
        }
        if (isNaN(targetNum) || targetNum <= 0) {
          setErrorMsg('Please enter a valid target amount greater than 0.')
          setIsSubmitting(false)
          return
        }

        await onUpdateGoal(targetGoal.id, {
          name: name.trim(),
          targetAmount: targetNum,
          currentAmount: currentNum,
          color,
        })
      } else {
        const targetNum = Number(targetAmount)
        const initNum = Number(initialDeposit) || 0

        if (!name.trim()) {
          setErrorMsg('Please enter a goal name.')
          setIsSubmitting(false)
          return
        }
        if (isNaN(targetNum) || targetNum <= 0) {
          setErrorMsg('Please enter a valid target amount greater than 0.')
          setIsSubmitting(false)
          return
        }

        await onCreateGoal({
          name: name.trim(),
          targetAmount: targetNum,
          initialDeposit: initNum,
          color,
          targetDate: targetDate || null,
        })
      }

      handleClose()
    } catch (err: any) {
      console.error('[SavingsGoalModal Error]', err)
      setErrorMsg(err?.message || 'Failed to save savings goal.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950 text-white border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold">
                {activeMode === 'DEPOSIT'
                  ? `Add Deposit: ${targetGoal?.name}`
                  : activeMode === 'EDIT'
                  ? `Edit Savings Goal: ${targetGoal?.name}`
                  : 'Create New Savings Goal'}
              </DialogTitle>
              <p className="text-xs text-gray-400">
                {activeMode === 'DEPOSIT'
                  ? `Currently saved ${formatIdrCurrency(targetGoal?.currentAmount || 0)} of ${formatIdrCurrency(targetGoal?.targetAmount || 0)}`
                  : activeMode === 'EDIT'
                  ? 'Update goal target, current saved balance, or color'
                  : 'Set a savings target to build wealth toward your personal milestones'}
              </p>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeMode === 'DEPOSIT' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-300">Deposit Amount (Rp)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  Rp
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 500000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, New Laptop, Holiday Trip"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">Target Amount (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 20000000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-300">
                    {activeMode === 'EDIT' ? 'Current Saved Amount (Rp)' : 'Initial Deposit (Optional)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={activeMode === 'EDIT' ? currentAmount : initialDeposit}
                      onChange={(e) =>
                        activeMode === 'EDIT'
                          ? setCurrentAmount(e.target.value)
                          : setInitialDeposit(e.target.value)
                      }
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-300">Accent Color</label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-800">
            {activeMode === 'EDIT' && onDeleteGoal ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs"
              >
                Delete
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-800 bg-gray-900 text-gray-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                leftIcon={
                  activeMode === 'DEPOSIT' ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : activeMode === 'EDIT' ? (
                    <Save className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/20"
              >
                {isSubmitting
                  ? 'Processing...'
                  : activeMode === 'DEPOSIT'
                  ? 'Add Deposit'
                  : activeMode === 'EDIT'
                  ? 'Save Changes'
                  : 'Create Goal'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
