import type { Category, TransactionType, PaymentMethod } from '../../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

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
  const categoryOptions = categories.filter((c) => c.type === txType)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <Tabs value={txType} onValueChange={(val) => setTxType(val as TransactionType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
              <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
              <TabsTrigger value="INCOME">Income</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={txAmount}
              onChange={(e) => setTxAmount(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">Category</label>
            <Select value={txCategory} onValueChange={setTxCategory}>
              <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Date</label>
              <Input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Payment Method</label>
              <Select value={txPaymentMethod} onValueChange={(val) => setTxPaymentMethod(val as PaymentMethod)}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                  <SelectValue placeholder="Select Payment Method" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">Note / Memo</label>
            <Input
              type="text"
              placeholder="e.g. Grocery shopping at Supermarket"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white"
            />
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium mt-2">
            Save Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


