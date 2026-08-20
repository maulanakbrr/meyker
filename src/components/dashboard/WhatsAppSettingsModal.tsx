import { useState } from 'react'
import { MessageSquare, Phone, CheckCircle, Bot } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { normalizePhoneNumber } from '../../lib/whatsappAdapter'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-950 text-white border-gray-800 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">WhatsApp AI Automation</DialogTitle>
              <p className="text-xs text-gray-400">Connect your WhatsApp number for instant AI logging</p>
            </div>
          </div>
        </DialogHeader>

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
          <Input
            name="phoneNumber"
            label="WhatsApp Phone Number (E.164 format)"
            type="text"
            placeholder="+628123456789"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
            className="bg-gray-900 border-gray-800 text-white"
          />
          <p className="text-[11px] text-gray-400 -mt-2">
            Include country code (e.g. +62 for Indonesia).
          </p>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
          >
            {loading ? 'Saving...' : 'Link WhatsApp Number'}
          </Button>
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
      </DialogContent>
    </Dialog>
  )
}

