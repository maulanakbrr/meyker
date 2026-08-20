import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronDown, Check, CalendarDays, Clock, BarChart3, Sliders } from 'lucide-react'
import {
  type DateFilterRange,
  type DatePreset,
  type FilterCategory,
  getDateRangeForPreset,
  formatShortDate,
  formatDateISO,
} from '../../lib/dateUtils'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { Button } from '../ui/button'
import type { DateRange } from 'react-day-picker'

interface DateFilterPickerProps {
  dateRange: DateFilterRange
  onDateRangeChange: (range: DateFilterRange) => void
}

const CATEGORY_TABS: { id: FilterCategory; label: string; icon: any }[] = [
  { id: 'DAILY', label: 'Daily', icon: Clock },
  { id: 'MONTHLY', label: 'Monthly', icon: CalendarDays },
  { id: 'YEARLY', label: 'Yearly', icon: BarChart3 },
  { id: 'CUSTOM', label: 'Custom', icon: Sliders },
]

const CATEGORY_PRESETS: Record<FilterCategory, { key: DatePreset; label: string }[]> = {
  DAILY: [
    { key: 'TODAY', label: 'Today' },
    { key: 'YESTERDAY', label: 'Yesterday' },
    { key: 'THIS_WEEK', label: 'This Week' },
  ],
  MONTHLY: [
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'LAST_MONTH', label: 'Last Month' },
    { key: 'LAST_3_MONTHS', label: 'Last 3 Months' },
  ],
  YEARLY: [
    { key: 'THIS_YEAR', label: 'This Year' },
    { key: 'LAST_YEAR', label: 'Last Year' },
    { key: 'ALL_TIME', label: 'All Time' },
  ],
  CUSTOM: [{ key: 'CUSTOM', label: 'Custom Range' }],
}

export function DateFilterPicker({ dateRange, onDateRangeChange }: DateFilterPickerProps) {
  const currentRange = dateRange || getDateRangeForPreset('THIS_MONTH')
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterCategory>(currentRange.category || 'MONTHLY')

  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(() => {
    if (currentRange.startDate && currentRange.endDate) {
      return {
        from: new Date(currentRange.startDate),
        to: new Date(currentRange.endDate),
      }
    }
    return undefined
  })

  const handleSelectPreset = (preset: DatePreset) => {
    if (preset === 'CUSTOM') {
      setActiveTab('CUSTOM')
      return
    }
    const newRange = getDateRangeForPreset(preset)
    onDateRangeChange(newRange)
    setIsOpen(false)
  }

  const handleCustomRangeSelect = (range: DateRange | undefined) => {
    setSelectedRange(range)
    if (range?.from) {
      const startStr = formatDateISO(range.from)
      const endStr = range.to ? formatDateISO(range.to) : startStr
      const newRange = getDateRangeForPreset('CUSTOM', startStr, endStr)
      onDateRangeChange(newRange)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<CalendarIcon className="w-4 h-4 text-indigo-400" />}
          rightIcon={<ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
          className="bg-gray-900 border-gray-800 text-xs text-white hover:bg-gray-850 hover:border-gray-700 min-w-[170px] justify-between shadow-sm cursor-pointer"
        >
          <span className="font-semibold text-gray-200">{currentRange.label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-4 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl space-y-3.5">
        {/* Category Tabs (Daily, Monthly, Yearly, Custom) */}
        <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Category Preset Options */}
        {activeTab !== 'CUSTOM' && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-gray-400 px-1 uppercase tracking-wider">
              {activeTab} Presets
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {CATEGORY_PRESETS[activeTab]?.map((opt) => {
                const isActive = currentRange.preset === opt.key
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectPreset(opt.key)}
                    className={`flex items-center justify-between px-3.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/50 font-bold'
                        : 'bg-gray-900/80 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800/80'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom Range Picker */}
        {activeTab === 'CUSTOM' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-gray-300 bg-gray-900 p-2.5 rounded-xl border border-gray-800">
              <span className="text-gray-400 font-medium">Selected Range:</span>
              <span className="font-bold text-indigo-400">
                {selectedRange?.from ? formatShortDate(selectedRange.from.toISOString()) : 'Start'} –{' '}
                {selectedRange?.to ? formatShortDate(selectedRange.to.toISOString()) : 'End'}
              </span>
            </div>

            <Calendar
              initialFocus
              mode="range"
              defaultMonth={selectedRange?.from}
              selected={selectedRange}
              onSelect={handleCustomRangeSelect}
              numberOfMonths={1}
            />

            {selectedRange?.from && selectedRange?.to && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  className="text-xs px-4 py-1.5"
                  onClick={() => setIsOpen(false)}
                >
                  Apply Date Range
                </Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
