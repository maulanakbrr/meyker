import { useState } from 'react'
import type { Category, TransactionType, PaymentMethod } from '../../types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { DatePicker } from '../ui/date-picker'
import { useTransactionFormStore, useFinanceStore } from '../../stores'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  categories: Category[]
  txType?: TransactionType
  setTxType?: (type: TransactionType) => void
  txAmount?: string
  setTxAmount?: (val: string) => void
  txCategory?: string
  setTxCategory?: (catId: string) => void
  txDate?: string
  setTxDate?: (date: string) => void
  txPaymentMethod?: PaymentMethod
  setTxPaymentMethod?: (method: PaymentMethod) => void
  txNote?: string
  setTxNote?: (note: string) => void
  txTags?: string[]
  setTxTags?: (tags: string[]) => void
  allAvailableTags?: string[]
}

export function AddTransactionModal(props: AddTransactionModalProps) {
  const formStore = useTransactionFormStore()

  const {
    isOpen,
    onClose,
    onSubmit,
    categories,
    txType = formStore.type,
    setTxType = formStore.setType,
    txAmount = formStore.amount,
    setTxAmount = formStore.setAmount,
    txCategory = formStore.categoryId,
    setTxCategory = formStore.setCategory,
    txDate = formStore.date,
    setTxDate = formStore.setDate,
    txPaymentMethod = formStore.paymentMethod,
    setTxPaymentMethod = formStore.setPaymentMethod,
    txNote = formStore.note,
    setTxNote = formStore.setNote,
    txTags = formStore.tags,
    setTxTags,
    allAvailableTags,
  } = props

  const [tagInput, setTagInput] = useState('')
  const financeStore = useFinanceStore()
  const availableTags = allAvailableTags || (financeStore.getAllTags ? financeStore.getAllTags() : [])

  const handleAddTag = (tag: string) => {
    const clean = tag.trim().replace(/^#/, '').toLowerCase()
    if (!clean) return
    if (setTxTags) {
      if (!txTags.includes(clean)) setTxTags([...txTags, clean])
    } else {
      formStore.addTag(clean)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const clean = tagToRemove.trim().replace(/^#/, '').toLowerCase()
    if (setTxTags) {
      setTxTags(txTags.filter((t) => t.toLowerCase() !== clean))
    } else {
      formStore.removeTag(clean)
    }
  }

  const suggestedTags = availableTags.filter(
    (st) =>
      !txTags.map((t) => t.toLowerCase()).includes(st.toLowerCase()) &&
      (!tagInput.trim() || st.toLowerCase().includes(tagInput.trim().replace(/^#/, '').toLowerCase()))
  )

  const categoryOptions = categories.filter((c) => c.type === txType)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <Tabs
            value={txType}
            onValueChange={(val) => {
              setTxType(val as TransactionType)
              setTxCategory('')
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 p-1 rounded-xl">
              <TabsTrigger
                value="EXPENSE"
                className="cursor-pointer font-semibold py-2 text-xs text-gray-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all"
              >
                Expense
              </TabsTrigger>
              <TabsTrigger
                value="INCOME"
                className="cursor-pointer font-semibold py-2 text-xs text-gray-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
              >
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">Amount ($)</label>
            <Input
              name="amount"
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
            <Select name="category" value={txCategory} onValueChange={setTxCategory}>
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
              <DatePicker value={txDate} onChange={setTxDate} />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Payment Method</label>
              <Select name="paymentMethod" value={txPaymentMethod} onValueChange={(val) => setTxPaymentMethod(val as PaymentMethod)}>
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
              name="note"
              type="text"
              placeholder="e.g. Grocery shopping at Supermarket"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white"
            />
          </div>

          {/* Tags Input with Autocomplete */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-300">
              Tags <span className="text-gray-500 font-normal">(press Enter or comma to add)</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-900 border border-gray-800 rounded-xl min-h-[42px] items-center">
              {txTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 text-indigo-400 cursor-pointer font-bold leading-none ml-0.5"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={txTags.length === 0 ? 'e.g. dinner, client, trip...' : 'Add more...'}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    if (tagInput.trim()) {
                      handleAddTag(tagInput)
                      setTagInput('')
                    }
                  }
                }}
                className="bg-transparent text-xs text-white placeholder-gray-500 outline-none flex-1 min-w-[120px]"
              />
            </div>

            {/* Tag Autocomplete Suggestions */}
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="text-[10px] text-gray-500">Suggested:</span>
                {suggestedTags.slice(0, 5).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      handleAddTag(st)
                      setTagInput('')
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-800/80 hover:bg-indigo-600/30 hover:text-indigo-300 text-gray-400 border border-gray-700/40 cursor-pointer transition-colors"
                  >
                    #{st}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium mt-2">
            Save Transaction
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}


