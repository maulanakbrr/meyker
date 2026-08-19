import { useState } from 'react'
import { MessageSquare, Phone, CheckCircle, X, Bot } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { normalizePhoneNumber } from '../../lib/whatsappAdapter'

interface WhatsAppSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentPhoneNumber?: string | null
  userId: string
  onPhoneUpdated: (newPhone: string) => void
}

export function WhatsAppSettingsModal({
  isOpen,
  onClose,
  currentPhoneNumber,
  userId,
  onPhoneUpdated,
}: WhatsAppSettingsModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber || '')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const cleanPhone = phoneNumber.trim() ? normalizePhoneNumber(phoneNumber.trim()) : null

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: cleanPhone })
        .eq('id', userId)

      if (error) throw error

      setSuccessMsg('WhatsApp phone number linked successfully!')
      onPhoneUpdated(cleanPhone || '')
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update WhatsApp phone number.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">WhatsApp AI Automation</h3>
            <p className="text-xs text-gray-400">Connect your WhatsApp number for instant AI logging</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSavePhone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              WhatsApp Phone Number (E.164 format)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="+628123456789"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Include country code (e.g. +62 for Indonesia).
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Link WhatsApp Number'}
          </button>
        </form>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <Bot className="w-4 h-4" />
            How to use WhatsApp AI:
          </div>
          <ul className="text-[11px] text-gray-300 space-y-2 list-disc list-inside bg-gray-900/60 p-3 rounded-xl border border-gray-800">
            <li>
              Send text messages: <code className="text-emerald-300 font-mono">50k lunch #food</code>
            </li>
            <li>
              Send income receipts: <code className="text-emerald-300 font-mono">1.5m salary #income</code>
            </li>
            <li>
              Send photos of paper receipts, QRIS payments, or transfer screenshots.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
