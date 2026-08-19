export interface IncomingWhatsAppPayload {
  provider: 'TWILIO' | 'QISCUS'
  senderPhoneNumber: string // normalized E.164 string e.g. "+628123456789"
  textMessage?: string
  mediaUrl?: string
  mediaMimeType?: string
  rawPayload: any
}

export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, '').trim()
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.slice(1)
  } else if (cleaned.startsWith('62')) {
    cleaned = '+' + cleaned
  } else if (!cleaned.startsWith('+') && cleaned.length > 0) {
    cleaned = '+' + cleaned
  }
  return cleaned
}

export function parseTwilioWebhookPayload(bodyParams: Record<string, any>): IncomingWhatsAppPayload {
  const rawFrom = bodyParams.From || bodyParams.from || ''
  // Normalize "whatsapp:+62812345678" -> "+62812345678"
  const senderPhoneNumber = rawFrom.replace(/^whatsapp:/i, '').trim()
  const textMessage = bodyParams.Body || bodyParams.body || undefined
  const mediaUrl = bodyParams.MediaUrl0 || bodyParams.media_url || undefined
  const mediaMimeType = bodyParams.MediaContentType0 || bodyParams.media_mime_type || 'image/jpeg'

  return {
    provider: 'TWILIO',
    senderPhoneNumber,
    textMessage,
    mediaUrl,
    mediaMimeType,
    rawPayload: bodyParams,
  }
}

export function parseQiscusWebhookPayload(jsonBody: Record<string, any>): IncomingWhatsAppPayload {
  const senderPhoneNumber =
    jsonBody.from?.phone_number ||
    jsonBody.customer?.phone_number ||
    jsonBody.sender?.phone_number ||
    ''
  const textMessage = jsonBody.message?.text || jsonBody.text || undefined
  const mediaUrl = jsonBody.message?.payload?.url || jsonBody.media_url || undefined
  const mediaMimeType = jsonBody.message?.payload?.type || 'image/jpeg'

  return {
    provider: 'QISCUS',
    senderPhoneNumber,
    textMessage,
    mediaUrl,
    mediaMimeType,
    rawPayload: jsonBody,
  }
}

export function buildTwilioWhatsAppResponse(message: string): string {
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`
}

export function formatTransactionConfirmationReply(params: {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryName: string
  paymentMethod: string
  note: string
  source: string
  engineNotice?: string
}): string {
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(params.amount)

  const emoji = params.type === 'INCOME' ? '💵' : '💸'
  const typeText = params.type === 'INCOME' ? 'Income' : 'Expense'

  let reply = `${emoji} *Meyker Transaction Logged!*

• *Type*: ${typeText}
• *Amount*: ${formattedAmount}
• *Category*: ${params.categoryName}
• *Payment*: ${params.paymentMethod}
• *Note*: ${params.note}

_Logged via ${params.source}_`

  if (params.engineNotice) {
    reply += `\n\n${params.engineNotice}`
  }

  return reply
}
