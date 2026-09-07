import type { RecurringFrequency, RecurringTransaction } from '../types'

/**
 * Calculates the next due date based on the current due date and frequency.
 */
export function calculateNextDueDate(currentDueDateStr: string, frequency: RecurringFrequency): string {
  const date = new Date(currentDueDateStr)
  if (isNaN(date.getTime())) {
    return new Date().toISOString()
  }

  switch (frequency) {
    case 'DAILY':
      date.setDate(date.getDate() + 1)
      break
    case 'WEEKLY':
      date.setDate(date.getDate() + 7)
      break
    case 'MONTHLY': {
      const currentMonth = date.getMonth()
      date.setMonth(currentMonth + 1)
      // Handle edge cases where advancing month overflows (e.g. Jan 31 -> Feb 28)
      if (date.getMonth() > (currentMonth + 1) % 12) {
        date.setDate(0) // Last day of previous month
      }
      break
    }
    case 'YEARLY':
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date.toISOString()
}

/**
 * Returns active recurring rules that are due on or before referenceDate (defaults to today).
 */
export function getDueRecurringRules(
  rules: RecurringTransaction[],
  referenceDate: Date = new Date()
): RecurringTransaction[] {
  const refTime = referenceDate.getTime()
  return rules.filter((rule) => {
    if (!rule.isActive) return false
    const dueTime = new Date(rule.nextDueDate).getTime()
    return dueTime <= refTime
  })
}

/**
 * Formats RecurringFrequency into human readable label.
 */
export function formatFrequencyLabel(frequency: RecurringFrequency): string {
  switch (frequency) {
    case 'DAILY':
      return 'Daily'
    case 'WEEKLY':
      return 'Weekly'
    case 'MONTHLY':
      return 'Monthly'
    case 'YEARLY':
      return 'Yearly'
    default:
      return frequency
  }
}
