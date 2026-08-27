import * as React from 'react'
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Calendar } from './calendar'
import { Button } from './button'
import { cn } from '../../lib/utils'

export interface DatePickerProps {
  value?: string | Date
  onChange?: (dateISO: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined
    const parsed = typeof value === 'string' ? new Date(value) : value
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [value])

  const formattedLabel = React.useMemo(() => {
    if (!selectedDate) return placeholder
    return selectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [selectedDate, placeholder])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const isoStr = `${year}-${month}-${day}`
      onChange?.(isoStr)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          disabled={disabled}
          variant="outline"
          className={cn(
            'w-full justify-between bg-gray-900 border-gray-800 text-sm font-normal text-left text-gray-200 hover:bg-gray-850 hover:border-gray-700 h-10 px-3 rounded-xl cursor-pointer',
            !selectedDate && 'text-gray-500',
            className
          )}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{formattedLabel}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0 bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl z-[60]" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
