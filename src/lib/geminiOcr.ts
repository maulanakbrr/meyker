import { GoogleGenAI } from '@google/genai'

export interface ExtractedReceiptData {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryHint: string
  merchantName?: string
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET'
  note: string
  transactionDate?: string
  rawJsonResponse?: string
  ocrEngine?: 'GEMINI' | 'GOOGLE_VISION' | 'TESSERACT'
  engineNotice?: string
}

const OCR_PROMPT = `You are an expert financial receipt and invoice OCR assistant. 
Analyze the provided image of a receipt, invoice, QRIS payment confirmation, or bank transfer screenshot.

CRITICAL CURRENCY RULES FOR INDONESIAN RUPIAH (IDR / Rp):
- Indonesian currency (Rp / IDR) uses dots (.) as thousands separators and commas (,) for decimal cents.
- Example: "Rp 280.000,00" or "RP 280.000,00" or "280.000,00" represents 280000 (280 thousand Rupiah), NOT 28000000 or 280.00.
- Ignore the trailing decimal cents ",00" or ",50" when parsing IDR amounts so the resulting "amount" number is the exact integer value (e.g. 280000).

Extract the following financial details and return ONLY a valid JSON object matching this exact schema:
{
  "amount": number (positive numeric value representing total transaction amount without cents, e.g. 280000 for Rp 280.000,00),
  "type": "EXPENSE" or "INCOME" ("INCOME" for received transfers/invoices, "EXPENSE" for purchases/payments),
  "categoryHint": string (one of: "Food & Dining", "Housing & Rent", "Transport & Fuel", "Utilities & Bills", "Shopping", "Entertainment", "Health & Medical", "Salary & Wages", "Freelance & Business", "Investments", "Miscellaneous"),
  "merchantName": string or null (e.g. store, restaurant, or counterparty name),
  "paymentMethod": "CASH", "BANK_TRANSFER", "CREDIT_CARD", or "E_WALLET",
  "note": string (concise summary of the receipt items or transaction purpose),
  "transactionDate": string or null (date in YYYY-MM-DD format if visible)
}

Do not include any explanation or markdown text other than the JSON object itself.`

const MODELS_TO_TRY = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
]

export async function processReceiptImageWithGemini(
  imageBufferOrBase64: any,
  mimeType: string = 'image/jpeg'
): Promise<ExtractedReceiptData> {
  let base64Data = ''

  if (typeof imageBufferOrBase64 === 'string') {
    base64Data = imageBufferOrBase64.startsWith('data:')
      ? imageBufferOrBase64.split(',')[1]
      : imageBufferOrBase64
  } else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(imageBufferOrBase64)) {
    base64Data = imageBufferOrBase64.toString('base64')
  } else if (imageBufferOrBase64 instanceof Uint8Array || imageBufferOrBase64 instanceof ArrayBuffer) {
    const bytes = new Uint8Array(imageBufferOrBase64 as ArrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    base64Data = btoa(binary)
  } else {
    throw new Error('Unsupported image data format for OCR processing.')
  }

  // 1. Try Gemini AI Vision Models
  try {
    const geminiResult = await runGeminiOcr(base64Data, mimeType)
    return geminiResult
  } catch (geminiErr: any) {
    console.warn('[OCR Pipeline] Gemini AI failed or quota hit:', geminiErr?.message || geminiErr)
  }

  // 2. Try Google Cloud Vision API (if configured in Node environment)
  if (typeof process !== 'undefined' && process.env?.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const visionResult = await runGoogleVisionOcr(base64Data)
      if (visionResult) {
        console.log('[OCR Pipeline] Successfully processed image using Google Cloud Vision API fallback.')
        return visionResult
      }
    } catch (visionErr: any) {
      console.warn('[OCR Pipeline] Google Cloud Vision API failed:', visionErr?.message || visionErr)
    }
  }

  // 3. Fallback to Local Tesseract.js (Offline CPU OCR)
  try {
    console.log('[OCR Pipeline] Gemini & Vision exhausted/unavailable. Running local Tesseract.js OCR fallback...')
    const tesseractResult = await runTesseractOcr(base64Data, mimeType)
    return tesseractResult
  } catch (tesseractErr: any) {
    console.error('[OCR Pipeline] Tesseract local OCR fallback failed:', tesseractErr?.message || tesseractErr)
  }

  throw new Error('Could not extract text or amount from receipt image across all OCR engines. Please send your transaction as text (e.g. "50k lunch").')
}

async function runGeminiOcr(base64Data: string, mimeType: string): Promise<ExtractedReceiptData> {
  const apiKey =
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '') ||
    (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : '')

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.')
  }

  const ai = new GoogleGenAI({ apiKey })
  let lastError: any = null

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[Gemini OCR] Attempting vision scan with model: ${modelName}`)
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: OCR_PROMPT },
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
            ],
          },
        ],
      })

      const responseText = response.text || ''
      const cleanJsonText = responseText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const parsed = JSON.parse(cleanJsonText)
      let parsedAmt = 0

      if (typeof parsed.amount === 'string') {
        parsedAmt = cleanIdrAmountString(parsed.amount)
      } else if (typeof parsed.amount === 'number') {
        parsedAmt = parsed.amount
        // If Gemini misread trailing IDR cents e.g. 280.000,00 as 28000000 (28M)
        if (parsedAmt >= 10000000 && String(parsedAmt).endsWith('00') && (cleanJsonText.includes(',00') || cleanJsonText.includes('.000,00'))) {
          parsedAmt = Math.round(parsedAmt / 100)
        }
      }

      return {
        amount: parsedAmt || 0,
        type: parsed.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        categoryHint: parsed.categoryHint || 'Miscellaneous',
        merchantName: parsed.merchantName || undefined,
        paymentMethod: sanitizePaymentMethod(parsed.paymentMethod),
        note: parsed.note || (parsed.merchantName ? `Purchase at ${parsed.merchantName}` : 'WhatsApp Receipt Entry'),
        transactionDate: parsed.transactionDate || undefined,
        rawJsonResponse: cleanJsonText,
        ocrEngine: 'GEMINI',
      }
    } catch (err: any) {
      const errMsg = err?.message || err?.statusText || (typeof err === 'object' ? JSON.stringify(err) : String(err))
      console.warn(`[Gemini OCR] Model ${modelName} failed or hit quota limit: ${errMsg}`)
      lastError = err
    }
  }

  throw new Error(`All Gemini models failed: ${lastError?.message || 'Quota limit reached'}`)
}

async function runGoogleVisionOcr(base64Data: string): Promise<ExtractedReceiptData | null> {
  const hasVisionCreds =
    typeof process !== 'undefined' &&
    process.env &&
    (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_VISION_CREDENTIALS || process.env.GOOGLE_VISION_KEY)

  if (!hasVisionCreds) {
    return null
  }

  const vision = await import('@google-cloud/vision')
  const client = new vision.ImageAnnotatorClient()
  const imageBuffer = Buffer.from(base64Data, 'base64')
  const [result] = await client.documentTextDetection(imageBuffer)
  const fullText = result.fullTextAnnotation?.text || result.textAnnotations?.[0]?.description || ''

  if (!fullText.trim()) {
    return null
  }

  const parsed = parseRawOcrText(fullText)
  return {
    ...parsed,
    ocrEngine: 'GOOGLE_VISION',
    engineNotice: 'ℹ️ _Notice: Processed via Google Cloud Vision API fallback._',
  }
}

async function runTesseractOcr(base64Data: string, mimeType: string): Promise<ExtractedReceiptData> {
  try {
    const { createWorker } = await import('tesseract.js')
    const worker = await createWorker(['ind', 'eng'], 1, {
      errorHandler: (err) => console.warn('[Tesseract Worker Warning]', err),
    })

    try {
      const imageUrl = `data:${mimeType};base64,${base64Data}`
      const { data } = await worker.recognize(imageUrl)
      const extractedText = data.text || ''

      if (!extractedText.trim()) {
        throw new Error('Tesseract local OCR produced no readable text.')
      }

      const parsed = parseRawOcrText(extractedText)

      return {
        ...parsed,
        ocrEngine: 'TESSERACT',
        engineNotice: 'ℹ️ _Notice: Gemini AI rate limit reached. Processed using local offline OCR engine (takes a bit more processing time)._',
      }
    } finally {
      await worker.terminate().catch(() => {})
    }
  } catch (err: any) {
    console.error('[OCR Pipeline] Local Tesseract OCR failed:', err?.message || err)
    throw new Error('Could not extract text or amount from receipt image across all OCR engines. Please send your transaction details as text (e.g. "50k lunch").')
  }
}

export function cleanIdrAmountString(rawStr: string | number): number {
  if (!rawStr) return 0
  let str = String(rawStr).trim()

  // 0. Strip trailing/leading mutasi & currency tags (e.g. "CR", "DB", "KREDIT", "DEBET", "IDR", "RP")
  str = str.replace(/(?:CR|DB|KREDIT|DEBET|IDR|RP|\+|\-)\s*$/gi, '').trim()
  str = str.replace(/^(?:IDR|RP)\s*/gi, '').trim()

  // 1. Strip trailing Indonesian cents (e.g. ",00", ",50", ",-")
  str = str.replace(/,[0-9]{2}$/, '').replace(/,-$/, '')

  // 2. Remove thousands separator dots
  str = str.replace(/\./g, '')

  // 3. Remove non-digit characters
  str = str.replace(/[^\d]/g, '')

  const num = parseInt(str, 10)
  return isNaN(num) ? 0 : num
}

export function parseRawOcrText(rawText: string): Omit<ExtractedReceiptData, 'ocrEngine' | 'engineNotice'> {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // 1. Extract Amount
  let amount = 0
  const amountPatterns = [
    /(?:total|jumlah|bayar|grand total|rp|idr|sebesar|nominal|transfer)\s*[:=]?\s*(?:rp\.?|idr)?\s*([\d\.,]+)/i,
    /(?:rp\.?|idr)\s*([\d\.,]+)/i,
  ]

  for (const line of lines) {
    for (const pattern of amountPatterns) {
      const match = line.match(pattern)
      if (match && match[1]) {
        const num = cleanIdrAmountString(match[1])
        if (num > 100 && num < 1000000000) {
          amount = num
          break
        }
      }
    }
    if (amount > 0) break
  }

  // Fallback: search lines from bottom up for numbers looking like prices
  if (amount === 0) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i]
      const numbers = line.match(/\b\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\b\d{4,9}\b/g)
      if (numbers) {
        for (const numStr of numbers) {
          const num = cleanIdrAmountString(numStr)
          if (num >= 1000 && num <= 100000000) {
            amount = num
            break
          }
        }
      }
      if (amount > 0) break
    }
  }

  // 2. Transaction Type
  const textUpper = rawText.toUpperCase()
  const isIncome =
    textUpper.includes('TRANSFER MASUK') ||
    textUpper.includes('TERIMA') ||
    textUpper.includes('INCOME') ||
    textUpper.includes('RECEIVED') ||
    textUpper.includes('SALDO MASUK')

  const type: 'INCOME' | 'EXPENSE' = isIncome ? 'INCOME' : 'EXPENSE'

  // 3. Payment Method
  let paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' = 'CASH'
  if (/qris|gopay|ovo|dana|shopeepay|linkaja|qr/i.test(rawText)) {
    paymentMethod = 'E_WALLET'
  } else if (/transfer|bca|mandiri|bri|bni|cimb|bank|rekening/i.test(rawText)) {
    paymentMethod = 'BANK_TRANSFER'
  } else if (/credit|debit|visa|mastercard|card/i.test(rawText)) {
    paymentMethod = 'CREDIT_CARD'
  }

  // 4. Category Hint
  let categoryHint = 'Miscellaneous'
  if (/kopi|coffee|resto|makan|food|bakmie|cafe|indomaret|alfamart|dapur/i.test(rawText)) {
    categoryHint = 'Food & Dining'
  } else if (/bensin|pertamina|shell|gojek|grab|pulsa|parkir|toll/i.test(rawText)) {
    categoryHint = 'Transport & Fuel'
  } else if (/pln|listrik|pdam|air|wifi|indihome|telkom|tokopedia/i.test(rawText)) {
    categoryHint = 'Utilities & Bills'
  }

  // 5. Merchant Name
  const merchantName = lines[0] ? lines[0].slice(0, 40) : 'Local OCR Entry'

  return {
    amount,
    type,
    categoryHint,
    merchantName,
    paymentMethod,
    note: `Receipt Scan (${merchantName})`,
    transactionDate: new Date().toISOString().split('T')[0],
    rawJsonResponse: JSON.stringify({ rawText: rawText.slice(0, 500) }),
  }
}

function sanitizePaymentMethod(pm: string): 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' {
  if (['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'E_WALLET'].includes(pm)) {
    return pm as 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET'
  }
  return 'E_WALLET'
}

export function generateFallbackMockReceiptData(): ExtractedReceiptData {
  return {
    amount: 85000,
    type: 'EXPENSE',
    categoryHint: 'Food & Dining',
    merchantName: 'Sample Receipt Merchant',
    paymentMethod: 'E_WALLET',
    note: 'Receipt Scan (Fallback Entry)',
    transactionDate: new Date().toISOString().split('T')[0],
    rawJsonResponse: '{"mock": true}',
    ocrEngine: 'TESSERACT',
  }
}
