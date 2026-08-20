export type DatePreset =
  | 'TODAY'
  | 'YESTERDAY'
  | 'THIS_WEEK'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'LAST_3_MONTHS'
  | 'THIS_YEAR'
  | 'LAST_YEAR'
  | 'ALL_TIME'
  | 'CUSTOM'

export type FilterCategory = 'DAILY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM'

export interface DateFilterRange {
  startDate: string | null // YYYY-MM-DD format
  endDate: string | null   // YYYY-MM-DD format
  preset: DatePreset
  category: FilterCategory
  label: string
}

export function formatDateISO(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getDateRangeForPreset(preset: DatePreset, customStart?: string | null, customEnd?: string | null): DateFilterRange {
  const now = new Date()

  switch (preset) {
    case 'TODAY': {
      const todayStr = formatDateISO(now)
      return {
        startDate: todayStr,
        endDate: todayStr,
        preset,
        category: 'DAILY',
        label: 'Today',
      }
    }

    case 'YESTERDAY': {
      const yest = new Date(now)
      yest.setDate(now.getDate() - 1)
      const yestStr = formatDateISO(yest)
      return {
        startDate: yestStr,
        endDate: yestStr,
        preset,
        category: 'DAILY',
        label: 'Yesterday',
      }
    }

    case 'THIS_WEEK': {
      const dayOfWeek = now.getDay()
      // Monday as start of week
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek
      const monday = new Date(now)
      monday.setDate(now.getDate() + diffToMonday)

      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      return {
        startDate: formatDateISO(monday),
        endDate: formatDateISO(sunday),
        preset,
        category: 'DAILY',
        label: 'This Week',
      }
    }

    case 'THIS_MONTH': {
      const year = now.getFullYear()
      const month = now.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      return {
        startDate: formatDateISO(firstDay),
        endDate: formatDateISO(lastDay),
        preset,
        category: 'MONTHLY',
        label: 'This Month',
      }
    }

    case 'LAST_MONTH': {
      const year = now.getFullYear()
      const month = now.getMonth() - 1
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      return {
        startDate: formatDateISO(firstDay),
        endDate: formatDateISO(lastDay),
        preset,
        category: 'MONTHLY',
        label: 'Last Month',
      }
    }

    case 'LAST_3_MONTHS': {
      const year = now.getFullYear()
      const month = now.getMonth()
      const firstDay = new Date(year, month - 2, 1)
      const lastDay = new Date(year, month + 1, 0)

      return {
        startDate: formatDateISO(firstDay),
        endDate: formatDateISO(lastDay),
        preset,
        category: 'MONTHLY',
        label: 'Last 3 Months',
      }
    }

    case 'THIS_YEAR': {
      const year = now.getFullYear()
      const firstDay = new Date(year, 0, 1)
      const lastDay = new Date(year, 11, 31)

      return {
        startDate: formatDateISO(firstDay),
        endDate: formatDateISO(lastDay),
        preset,
        category: 'YEARLY',
        label: 'This Year',
      }
    }

    case 'LAST_YEAR': {
      const year = now.getFullYear() - 1
      const firstDay = new Date(year, 0, 1)
      const lastDay = new Date(year, 11, 31)

      return {
        startDate: formatDateISO(firstDay),
        endDate: formatDateISO(lastDay),
        preset,
        category: 'YEARLY',
        label: 'Last Year',
      }
    }

    case 'ALL_TIME': {
      return {
        startDate: null,
        endDate: null,
        preset,
        category: 'YEARLY',
        label: 'All Time',
      }
    }

    case 'CUSTOM': {
      const start = customStart || formatDateISO(now)
      const end = customEnd || formatDateISO(now)
      return {
        startDate: start,
        endDate: end,
        preset,
        category: 'CUSTOM',
        label: `${formatShortDate(start)} - ${formatShortDate(end)}`,
      }
    }

    default:
      return getDateRangeForPreset('THIS_MONTH')
  }
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function isDateInRange(txDateStr: string, range: DateFilterRange): boolean {
  if (!range.startDate && !range.endDate) return true

  const txDate = new Date(txDateStr.slice(0, 10)).getTime()
  if (isNaN(txDate)) return true

  if (range.startDate) {
    const start = new Date(range.startDate).getTime()
    if (txDate < start) return false
  }

  if (range.endDate) {
    const end = new Date(range.endDate).getTime()
    // end of the day 23:59:59
    if (txDate > end + 24 * 60 * 60 * 1000 - 1) return false
  }

  return true
}

/**
 * Format a human-readable period label for PDF reports and headers based on DateFilterRange
 */
export function getDateFilterPeriodLabel(range: DateFilterRange): string {
  if (!range || range.preset === 'ALL_TIME') return 'All Time'

  if (range.startDate && range.endDate) {
    if (range.startDate === range.endDate) {
      if (range.preset === 'TODAY') {
        return `Today (${formatShortDate(range.startDate)})`
      }
      if (range.preset === 'YESTERDAY') {
        return `Yesterday (${formatShortDate(range.startDate)})`
      }
      return formatShortDate(range.startDate)
    }
    return `${formatShortDate(range.startDate)} to ${formatShortDate(range.endDate)}`
  }

  return range.label || 'All Time'
}
