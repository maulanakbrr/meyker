import { serviceRoleSupabase } from './serviceRoleSupabase'
import {
  parseTwilioWebhookPayload,
  parseQiscusWebhookPayload,
  buildTwilioWhatsAppResponse,
  formatTransactionConfirmationReply,
  normalizePhoneNumber,
  IncomingWhatsAppPayload,
} from './whatsappAdapter'
import { parseWhatsAppText } from './whatsappParser'
import { processReceiptImageWithGemini } from './geminiOcr'
import { DEFAULT_CATEGORIES } from '../db/schema'

export async function handleWhatsAppWebhook(requestBody: any, headers: Record<string, string>): Promise<{ status: number; body: string; contentType: string }> {
  // 1. Determine provider & parse payload
  let payload: IncomingWhatsAppPayload
  const contentTypeHeader = (headers['content-type'] || headers['Content-Type'] || '').toLowerCase()

  if (contentTypeHeader.includes('application/x-www-form-urlencoded') || requestBody.From || requestBody.from) {
    payload = parseTwilioWebhookPayload(requestBody)
  } else {
    payload = parseQiscusWebhookPayload(requestBody)
  }

  const { senderPhoneNumber, textMessage, mediaUrl, provider } = payload

  if (!senderPhoneNumber) {
    const errorMsg = 'Invalid webhook payload: Missing sender phone number'
    return {
      status: 400,
      body: provider === 'TWILIO' ? buildTwilioWhatsAppResponse(errorMsg) : JSON.stringify({ error: errorMsg }),
      contentType: provider === 'TWILIO' ? 'text/xml' : 'application/json',
    }
  }

  // 2. Look up user by phone number variations (+62822..., 62822..., 0822...)
  const formattedPhone = normalizePhoneNumber(senderPhoneNumber)
  const digitsOnly = formattedPhone.replace(/^\+/, '')
  const localZeroPhone = digitsOnly.startsWith('62') ? '0' + digitsOnly.slice(2) : digitsOnly

  console.log('[WhatsApp Webhook] Incoming sender:', senderPhoneNumber)
  console.log('[WhatsApp Webhook] Query variants:', { formattedPhone, digitsOnly, localZeroPhone })

  const { data: profile, error: profileErr } = await serviceRoleSupabase
    .from('profiles')
    .select('id, full_name, email')
    .or(`phone_number.eq.${formattedPhone},phone_number.eq.${digitsOnly},phone_number.eq.${localZeroPhone}`)
    .maybeSingle()

  console.log('[WhatsApp Webhook] Database lookup result:', { profile, profileErr })

  if (profileErr) {
    console.error('Database error searching profile by phone number:', profileErr)
  }

  if (!profile) {
    const unregMessage = `⚠️ Phone number ${formattedPhone} is not registered with any Meyker account.\n\nPlease sign in at Meyker and add your WhatsApp phone number in Account Settings.`
    return {
      status: 200,
      body: provider === 'TWILIO' ? buildTwilioWhatsAppResponse(unregMessage) : JSON.stringify({ message: unregMessage }),
      contentType: provider === 'TWILIO' ? 'text/xml' : 'application/json',
    }
  }

  const userId = profile.id

  // 3. Process Transaction Payload (Image OCR or Text NL Parser)
  let amount = 0
  let type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
  let categoryHint: string | undefined = undefined
  let paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'E_WALLET' = 'CASH'
  let note = 'WhatsApp Entry'
  let engineNotice: string | undefined = undefined

  try {
    if (mediaUrl) {
      // Fetch image media
      const imgRes = await fetch(mediaUrl)
      const arrayBuffer = await imgRes.arrayBuffer()
      const imageBuffer = Buffer.from(arrayBuffer)
      const mimeType = imgRes.headers.get('content-type') || 'image/jpeg'

      const ocrResult = await processReceiptImageWithGemini(imageBuffer, mimeType)
      amount = ocrResult.amount
      type = ocrResult.type
      categoryHint = ocrResult.categoryHint
      paymentMethod = ocrResult.paymentMethod
      note = ocrResult.note || `Receipt at ${ocrResult.merchantName || 'Merchant'}`
      engineNotice = ocrResult.engineNotice
    } else if (textMessage) {
      const parsedText = parseWhatsAppText(textMessage)
      amount = parsedText.amount
      type = parsedText.type
      categoryHint = parsedText.categoryHint
      if (parsedText.paymentMethod) {
        paymentMethod = parsedText.paymentMethod
      }
      note = parsedText.note
    } else {
      throw new Error('Message payload contains neither text nor media attachment.')
    }
  } catch (err: any) {
    console.error('[WhatsApp Webhook Error] Failed to process message:', err?.message || err)
    const errorReply = `⚠️ *Meyker OCR Notice*\n\n${err.message || 'Unable to extract transaction details from receipt image.'}\n\n💡 *Tip*: You can log this transaction by sending text:\n• *"50k lunch #food"* \n• *"1.5m invoice #income"*`
    return {
      status: 200,
      body: provider === 'TWILIO' ? buildTwilioWhatsAppResponse(errorReply) : JSON.stringify({ message: errorReply }),
      contentType: provider === 'TWILIO' ? 'text/xml' : 'application/json',
    }
  }

  // 4. Match Category
  const categoryId = await matchCategory(userId, categoryHint, type)

  // 5. Insert Transaction
  const { error: insertErr } = await serviceRoleSupabase.from('transactions').insert({
    user_id: userId,
    category_id: categoryId,
    amount: amount.toString(),
    type,
    transaction_date: new Date().toISOString(),
    payment_method: paymentMethod,
    note,
    source: 'WHATSAPP',
  })

  if (insertErr) {
    console.error('Error inserting transaction from WhatsApp webhook:', insertErr)
    const errReply = '❌ Error saving transaction to database. Please try again.'
    return {
      status: 500,
      body: provider === 'TWILIO' ? buildTwilioWhatsAppResponse(errReply) : JSON.stringify({ error: errReply }),
      contentType: provider === 'TWILIO' ? 'text/xml' : 'application/json',
    }
  }

  // 6. Format Success Confirmation Reply
  const categoryName = categoryHint || (type === 'INCOME' ? 'Other Income' : 'Miscellaneous')
  const replyMessage = formatTransactionConfirmationReply({
    amount,
    type,
    categoryName,
    paymentMethod,
    note,
    source: engineNotice ? 'WhatsApp OCR (Fallback Engine)' : 'WhatsApp AI',
    engineNotice,
  })

  return {
    status: 200,
    body: provider === 'TWILIO' ? buildTwilioWhatsAppResponse(replyMessage) : JSON.stringify({ message: replyMessage }),
    contentType: provider === 'TWILIO' ? 'text/xml' : 'application/json',
  }
}

async function matchCategory(userId: string, hint: string | undefined, type: 'INCOME' | 'EXPENSE'): Promise<string | null> {
  // Query user categories + global defaults
  const { data: userCats } = await serviceRoleSupabase
    .from('categories')
    .select('id, name, type, is_default')
    .or(`user_id.eq.${userId},user_id.is.null`)

  if (!userCats || userCats.length === 0) {
    return null
  }

  // If hint provided, attempt name matching
  if (hint) {
    const cleanHint = hint.toLowerCase()
    const match = userCats.find(
      (c) => c.type === type && c.name.toLowerCase().includes(cleanHint)
    )
    if (match) return match.id
  }

  // Fallback to default category for type
  const fallback = userCats.find(
    (c) => c.type === type && (c.name.includes('Miscellaneous') || c.name.includes('Other Income') || c.is_default)
  )

  return fallback ? fallback.id : userCats[0].id
}
