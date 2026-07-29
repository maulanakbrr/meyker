import { X } from 'lucide-react'
import type { Category, TransactionType } from '../../types'

interface CategoryManagementModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  categories: Category[]
  catName: string
  setCatName: (name: string) => void
  catType: TransactionType
  setCatType: (type: TransactionType) => void
  catColor: string
  setCatColor: (color: string) => void
}

export function CategoryManagementModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  catName,
  setCatName,
  catType,
  setCatType,
  catColor,
  setCatColor,
}: CategoryManagementModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-modal w-full max-w-lg rounded-2xl p-6 border border-white/10 space-y-5 animate-fade-in max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <h3 className="font-bold text-white text-base">Category Management</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create Custom Category Form */}
        <form onSubmit={onSubmit} className="space-y-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Add Custom Category</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Category Name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 col-span-2"
            />
            <select
              value={catType}
              onChange={(e) => setCatType(e.target.value as TransactionType)}
              className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">Badge Color:</label>
            <input
              type="color"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
            />
            <button
              type="submit"
              className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all"
            >
              Create Category
            </button>
          </div>
        </form>

        {/* Category List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Categories</h4>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900/40 border border-gray-800 text-xs"
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-white truncate">{cat.name}</span>
                <span className="ml-auto text-[10px] text-gray-500 uppercase">{cat.type[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
