import type { Category, TransactionType } from '../../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-gray-950 text-white border-gray-800 space-y-4">
        <DialogHeader>
          <DialogTitle className="text-white text-base">Category Management</DialogTitle>
        </DialogHeader>

        {/* Create Custom Category Form */}
        <form onSubmit={onSubmit} className="space-y-3 bg-gray-900/60 p-4 rounded-xl border border-gray-800">
          <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Add Custom Category</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                type="text"
                required
                placeholder="Category Name"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white"
              />
            </div>
            <Select value={catType} onValueChange={(val) => setCatType(val as TransactionType)}>
              <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-400">Badge Color:</label>
            <input
              type="color"
              value={catColor}
              onChange={(e) => setCatColor(e.target.value)}
              className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
            />
            <Button
              type="submit"
              size="sm"
              className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2"
            >
              Create Category
            </Button>
          </div>
        </form>

        {/* Category List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Categories</h4>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900/40 border border-gray-800 text-xs"
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-white truncate">{cat.name}</span>
                <span className="ml-auto text-[10px] text-gray-500 uppercase font-mono">{cat.type[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

