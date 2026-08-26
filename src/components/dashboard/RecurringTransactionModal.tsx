import React, { useState, useEffect } from 'react'
import type { Category, PaymentMethod, RecurringFrequency, RecurringTransaction, TransactionType } from '../../types'
import { Repeat, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { DatePicker } from '../ui/date-picker'

interface RecurringTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  targetRule?: RecurringTransaction | null
  onSubmit: (rule: {
    title: string
    amount: number
    type: TransactionType
    categoryId: string
    paymentMethod: PaymentMethod
    frequency: RecurringFrequency
    startDate: string
  }) => void
  onUpdate?: (
    ruleId: string,
    fields: {
      amount: number
      frequency: RecurringFrequency
      paymentMethod: PaymentMethod
      startDate: string
    }
  ) => void
}

export const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  targetRule,
  onSubmit,
  onUpdate,
}) => {
  const isEditing = Boolean(targetRule)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('EXPENSE')
  const [categoryId, setCategoryId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [frequency, setFrequency] = useState<RecurringFrequency>('MONTHLY')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (targetRule) {
        setTitle(targetRule.title)
        setAmount(String(targetRule.amount))
        setType(targetRule.type)
        setCategoryId(targetRule.categoryId || '')
        setPaymentMethod(targetRule.paymentMethod)
        setFrequency(targetRule.frequency)
        setStartDate(
          targetRule.nextDueDate
            ? targetRule.nextDueDate.slice(0, 10)
            : new Date().toISOString().slice(0, 10)
        )
      } else {
        setTitle('')
        setAmount('')
        setType('EXPENSE')
        setCategoryId('')
        setPaymentMethod('CASH')
        setFrequency('MONTHLY')
        setStartDate(new Date().toISOString().slice(0, 10))
      }
    }
  }, [isOpen, targetRule])

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return

    setIsSubmitting(true)

    try {
      if (isEditing && targetRule && onUpdate) {
        await onUpdate(targetRule.id, {
          amount: Math.abs(Number(amount)),
          frequency,
          paymentMethod,
          startDate: new Date(startDate).toISOString(),
        })
      } else {
        if (!title.trim()) return
        await onSubmit({
          title: title.trim(),
          amount: Math.abs(Number(amount)),
          type,
          categoryId: categoryId || (filteredCategories[0]?.id || ''),
          paymentMethod,
          frequency,
          startDate: new Date(startDate).toISOString(),
        })
      }
      onClose()
    } catch (err) {
      console.error('[RecurringTransactionModal Error]', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950 text-white border border-gray-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold">
                {isEditing ? 'Edit Recurring Rule' : 'Add Recurring Rule'}
              </DialogTitle>
              <p className="text-xs text-gray-400">
                {isEditing ? 'Modify amount, frequency, payment method & due date' : 'Auto-log subscription or recurring income'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Tabs
            value={type}
            onValueChange={(val) => {
              if (!isEditing) {
                setType(val as TransactionType)
                setCategoryId('')
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800 p-1 rounded-xl">
              <TabsTrigger
                value="EXPENSE"
                disabled={isEditing}
                className="cursor-pointer font-semibold py-2 text-xs text-gray-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Expense Rule
              </TabsTrigger>
              <TabsTrigger
                value="INCOME"
                disabled={isEditing}
                className="cursor-pointer font-semibold py-2 text-xs text-gray-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Income Rule
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-300">
              Title / Name {!isEditing && <span className="text-rose-400">*</span>}
            </label>
            <Input
              name="title"
              type="text"
              required
              disabled={isEditing}
              placeholder="e.g. Spotify Subscription, House Rent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-900 border-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">
                Amount (Rp) <span className="text-rose-400">*</span>
              </label>
              <Input
                name="amount"
                type="number"
                required
                min="1"
                placeholder="54900"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Frequency</label>
              <Select value={frequency} onValueChange={(val) => setFrequency(val as RecurringFrequency)}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isEditing}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-300">Payment Method</label>
              <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
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
            <label className="block text-xs font-medium text-gray-300">Start / Due Date</label>
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Select start / due date" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              leftIcon={<Save className="w-3.5 h-3.5 text-purple-300" />}
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-600/20"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Rule' : 'Save Recurring Rule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
