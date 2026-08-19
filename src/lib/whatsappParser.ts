export interface ParsedWhatsAppMessage {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryHint?: string
  paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET'
  note: string
  rawText: string
}

const INCOME_KEYWORDS = [
  'income',
  'salary',
  'gaji',
  'terima',
  'dapat',
  'invoice',
  'masuk',
  'bonus',
  'freelance',
  'investasi',
  'dividend',
  'omset',
  'penjualan',
]

const PAYMENT_METHOD_MAP: Array<{ keywords: string[]; method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' }> = [
  { keywords: ['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'ewallet', 'e-wallet', 'qris'], method: 'E_WALLET' },
  { keywords: ['transfer', 'bank', 'bca', 'mandiri', 'bri', 'bni', 'cimb', 'rek', 'rekening'], method: 'BANK_TRANSFER' },
  { keywords: ['cc', 'credit', 'kartu kredit', 'credit card'], method: 'CREDIT_CARD' },
  { keywords: ['cash', 'tunai'], method: 'CASH' },
]

export function parseWhatsAppText(text: string): ParsedWhatsAppMessage {
  const cleanText = text.trim()
  if (!cleanText) {
    throw new Error('Empty WhatsApp message text')
  }

  let amount = 0
  let matchedAmountString = ''

  // 1. Regex patterns for currency & amounts
  // Pattern 1: 50k, 50rb, 50.5k, 1.5m, 1,5jt, 2 juta, 50 ribu
  const multiplierRegex = /(\b\d+(?:[.,]\d+)?)\s*(k|rb|ribu|m|jt|juta)\b/i
  // Pattern 2: Rp 50.000, IDR 50,000, Rp50000
  const currencyPrefixRegex = /(?:rp|idr)\.?\s*([\d.,]+)/i
  // Pattern 3: Standalone numbers (e.g. 5, 50, 50000, 150.000)
  const standaloneNumberRegex = /\b(\d{1,3}(?:[.,]\d{3})+|\d{1,10})\b/

  const multMatch = cleanText.match(multiplierRegex)
  if (multMatch) {
    matchedAmountString = multMatch[0]
    const rawVal = parseFloat(multMatch[1].replace(',', '.'))
    const unit = multMatch[2].toLowerCase()
    if (['k', 'rb', 'ribu'].includes(unit)) {
      amount = rawVal * 1000
    } else if (['m', 'jt', 'juta'].includes(unit)) {
      amount = rawVal * 1000000
    }
  } else {
    const currMatch = cleanText.match(currencyPrefixRegex)
    if (currMatch) {
      matchedAmountString = currMatch[0]
      const numStr = currMatch[1].replace(/\./g, '').replace(',', '.')
      amount = parseFloat(numStr)
    } else {
      const standMatch = cleanText.match(standaloneNumberRegex)
      if (standMatch) {
        matchedAmountString = standMatch[0]
        const numStr = standMatch[1].replace(/\./g, '').replace(',', '.')
        amount = parseFloat(numStr)
      }
    }
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error(`Unable to extract valid transaction amount from message: "${text}"`)
  }

  // 2. Extract Hashtags for Category Hints
  const hashtagMatch = cleanText.match(/#(\w+)/)
  let categoryHint = hashtagMatch ? hashtagMatch[1] : undefined

  // 3. Determine Type (INCOME vs EXPENSE)
  const lowerText = cleanText.toLowerCase()
  let type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
  if (
    INCOME_KEYWORDS.some((kw) => lowerText.includes(kw)) ||
    (categoryHint && INCOME_KEYWORDS.some((kw) => categoryHint!.toLowerCase().includes(kw)))
  ) {
    type = 'INCOME'
  }

  // 4. Payment Method Hint
  let paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' | undefined
  for (const item of PAYMENT_METHOD_MAP) {
    if (item.keywords.some((kw) => lowerText.includes(kw))) {
      paymentMethod = item.method
      break
    }
  }

  // 5. Clean Note extraction (remove matched amount string and hashtags)
  let note = cleanText
  if (matchedAmountString) {
    note = note.replace(matchedAmountString, '')
  }
  note = note.replace(/#\w+/g, '').replace(/^(rp|idr)\.?\s*/i, '').trim()
  // Collapse multiple spaces to single space and remove leading/trailing punctuation/spaces
  note = note.replace(/\s+/g, ' ').replace(/^[-:\s]+|[-:\s]+$/g, '').trim()

  if (!note) {
    note = type === 'INCOME' ? 'WhatsApp Income Entry' : 'WhatsApp Expense Entry'
  }

  return {
    amount,
    type,
    categoryHint,
    paymentMethod,
    note,
    rawText: text,
  }
}
