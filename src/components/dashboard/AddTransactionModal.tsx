import { X } from 'lucide-react'
import type { Category, TransactionType, PaymentMethod } from '../../types'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  categories: Category[]
  txType: TransactionType
  setTxType: (type: TransactionType) => void
  txAmount: string
  setTxAmount: (val: string) => void
  txCategory: string
  setTxCategory: (catId: string) => void
  txDate: string
  setTxDate: (date: string) => void
  txPaymentMethod: PaymentMethod
  setTxPaymentMethod: (method: PaymentMethod) => void
  txNote: string
  setTxNote: (note: string) => void
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  txType,
  setTxType,
  txAmount,
  setTxAmount,
  txCategory,
  setTxCategory,
  txDate,
  setTxDate,
  txPaymentMethod,
  setTxPaymentMethod,
  txNote,
  setTxNote,
}: AddTransactionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-modal w-full max-w-md rounded-2xl p-6 border border-white/10 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="font-bold text-white text-base">Add New Transaction</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
            <button
              type="button"
              onClick={() => setTxType('EXPENSE')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                txType === 'EXPENSE' ? 'bg-rose-600 text-white' : 'text-gray-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setTxType('INCOME')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                txType === 'INCOME' ? 'bg-emerald-600 text-white' : 'text-gray-400'
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Category</label>
            <select
              value={txCategory}
              onChange={(e) => setTxCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Category</option>
              {categories
                .filter((c) => c.type === txType)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Payment Method</label>
              <select
                value={txPaymentMethod}
                onChange={(e) => setTxPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="E_WALLET">E-Wallet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Note / Memo</label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping at Supermarket"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all text-sm mt-2"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  )
}
