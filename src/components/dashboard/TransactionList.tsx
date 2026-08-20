import { Search, Tag, Trash2, MessageSquare } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'
import type { Transaction, Category } from '../../types'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  searchQuery: string
  onSearchChange: (query: string) => void
  typeFilter: 'ALL' | 'INCOME' | 'EXPENSE' | string
  onTypeFilterChange: (type: 'ALL' | 'INCOME' | 'EXPENSE') => void
  categoryFilter: string
  onCategoryFilterChange: (catId: string) => void
  onDeleteTransaction: (id: string) => void
}

export function TransactionList({
  transactions,
  categories,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onDeleteTransaction,
}: TransactionListProps) {
  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white">Recent Transactions</h2>
          <p className="text-xs text-gray-400">View and manage logged entries</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search input */}
          <div className="w-44">
            <Input
              type="text"
              placeholder="Search note..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5 text-gray-400" />}
              className="bg-gray-900 border-gray-800 text-xs h-9"
            />
          </div>

          {/* Type Filter Tabs */}
          <Tabs value={typeFilter} onValueChange={(val) => onTypeFilterChange(val as any)}>
            <TabsList className="bg-gray-900 border border-gray-800 p-0.5 rounded-xl h-9">
              <TabsTrigger
                value="ALL"
                className="px-3 py-1 text-xs font-medium text-gray-400 data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg cursor-pointer"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="INCOME"
                className="px-3 py-1 text-xs font-medium text-gray-400 data-[state=active]:bg-emerald-600 data-[state=active]:text-white rounded-lg cursor-pointer"
              >
                Income
              </TabsTrigger>
              <TabsTrigger
                value="EXPENSE"
                className="px-3 py-1 text-xs font-medium text-gray-400 data-[state=active]:bg-rose-600 data-[state=active]:text-white rounded-lg cursor-pointer"
              >
                Expense
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Filter Select */}
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="bg-gray-900 border-gray-800 text-xs text-white h-9 w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 text-white">
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction Table / List */}
      <div className="overflow-x-auto">
        {transactions.length > 0 ? (
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Transaction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: tx.category?.color || '#6366f1' }}
                      >
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{tx.note || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 border border-gray-700/50 font-medium">
                      {tx.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {new Date(tx.transactionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-gray-400 capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    {tx.source === 'WHATSAPP' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <MessageSquare className="w-3 h-3" /> WHATSAPP
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {tx.source}
                      </span>
                    )}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-bold text-sm ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(tx.amount))}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 h-8 w-8 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-gray-500 text-xs">
            No matching transactions found for current filter.
          </div>
        )}
      </div>
    </div>
  )
}

