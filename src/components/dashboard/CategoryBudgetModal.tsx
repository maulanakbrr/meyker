import { useState } from 'react'
import { PieChart, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { formatIdrCurrency } from '../../lib/export'
import type { Category } from '../../types'

interface CategoryBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  onSaveBudgets: (updatedBudgets: Record<string, number | null>) => Promise<void>
}

export function CategoryBudgetModal({
  isOpen,
  onClose,
  categories,
  onSaveBudgets,
}: CategoryBudgetModalProps) {
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    expenseCategories.forEach((cat) => {
      initial[cat.id] = cat.monthlyBudget ? String(cat.monthlyBudget) : ''
    })
    return initial
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (categoryId: string, val: string) => {
    setBudgetInputs((prev) => ({ ...prev, [categoryId]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedMap: Record<string, number | null> = {}
      expenseCategories.forEach((cat) => {
        const rawVal = budgetInputs[cat.id]
        if (rawVal && !isNaN(Number(rawVal)) && Number(rawVal) > 0) {
          updatedMap[cat.id] = Number(rawVal)
        } else {
          updatedMap[cat.id] = null
        }
      })

      await onSaveBudgets(updatedMap)
      onClose()
    } catch (err) {
      console.error('[CategoryBudgetModal Error]', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gray-950 text-white border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold">
                Configure Category Spending Caps
              </DialogTitle>
              <p className="text-xs text-gray-400">
                Set target monthly spending limits for each expense category
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {expenseCategories.map((cat) => {
              const currentInput = budgetInputs[cat.id] ?? ''
              const numericVal = Number(currentInput)

              return (
                <div
                  key={cat.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-gray-900 border border-gray-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs font-semibold text-gray-200">{cat.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Unlimited"
                        value={currentInput}
                        onChange={(e) => handleInputChange(cat.id, e.target.value)}
                        className="w-36 bg-gray-950 border border-gray-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {numericVal > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono shrink-0 hidden md:inline">
                        {formatIdrCurrency(numericVal)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-800 bg-gray-900 text-gray-300 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Budget Caps'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
