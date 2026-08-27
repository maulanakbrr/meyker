import { useState, useEffect } from 'react'
import { FileSpreadsheet, RefreshCw, CheckCircle2, AlertCircle, Link as LinkIcon, LogIn } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { supabase, signInWithGoogle } from '../../lib/supabase'
import { syncTransactionsToSheet } from '../../lib/googleSheets'
import type { Transaction } from '../../types'

interface GoogleSheetsSyncModalProps {
  isOpen: boolean
  onClose: () => void
  googleSheetsId: string | null
  onSaveSheetId: (id: string) => Promise<void>
  transactions: Transaction[]
}

export function GoogleSheetsSyncModal({
  isOpen,
  onClose,
  googleSheetsId,
  onSaveSheetId,
  transactions,
}: GoogleSheetsSyncModalProps) {
  const [sheetIdInput, setSheetIdInput] = useState(googleSheetsId || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [providerToken, setProviderToken] = useState<string | null>(null)
  const [isSessionExpired, setIsSessionExpired] = useState(false)

  // Initialize form when opened
  useEffect(() => {
    if (isOpen) {
      setSheetIdInput(googleSheetsId || '')
      setSyncSuccess(null)
      setErrorMsg(null)
      setIsSessionExpired(false)
      
      const checkSession = () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.provider_token) {
            setProviderToken(session.provider_token)
            setIsSessionExpired(false)
          } else {
            setIsSessionExpired(true)
          }
        })
      }

      checkSession()

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.provider_token) {
          setProviderToken(session.provider_token)
          setIsSessionExpired(false)
        } else if (event === 'SIGNED_OUT') {
          setIsSessionExpired(true)
        }
      })

      // Also listen for the custom message from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'MEYKER_OAUTH_SUCCESS') {
          checkSession()
        }
      }
      window.addEventListener('message', handleMessage)

      return () => {
        authListener.subscription.unsubscribe()
        window.removeEventListener('message', handleMessage)
      }
    }
  }, [isOpen, googleSheetsId])

  const extractSpreadsheetId = (input: string) => {
    // If it's a full URL, extract the ID
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (match && match[1]) {
      return match[1]
    }
    // Otherwise assume the input IS the ID
    return input.trim()
  }

  const handleSaveSettings = async () => {
    setErrorMsg(null)
    setSyncSuccess(null)
    const cleanId = extractSpreadsheetId(sheetIdInput)
    if (!cleanId) {
      setErrorMsg('Please enter a valid Spreadsheet ID or URL.')
      return
    }

    setIsSaving(true)
    try {
      await onSaveSheetId(cleanId)
      setSheetIdInput(cleanId) // Update input to clean ID
      setSyncSuccess('Spreadsheet linked successfully!')
    } catch (err: any) {
      setErrorMsg('Failed to save settings: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSyncNow = async () => {
    setErrorMsg(null)
    setSyncSuccess(null)
    
    if (!googleSheetsId) {
      setErrorMsg('Please link a spreadsheet first.')
      return
    }
    
    if (!providerToken) {
      setIsSessionExpired(true)
      return
    }

    setIsSyncing(true)
    const result = await syncTransactionsToSheet(googleSheetsId, providerToken, transactions)
    setIsSyncing(false)

    if (result.success) {
      setSyncSuccess(`Successfully synced ${transactions.length} transactions to Google Sheets!`)
    } else if (result.isUnauthorized) {
      setIsSessionExpired(true)
    } else {
      setErrorMsg(result.error || 'Failed to sync to Google Sheets.')
    }
  }

  const handleReauth = async () => {
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setErrorMsg('Authentication failed: ' + err.message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg w-full bg-gray-950 border border-gray-800 text-white rounded-2xl p-6 shadow-2xl space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-white text-base font-bold">
                Google Sheets Live Sync
              </DialogTitle>
              <p className="text-xs text-gray-400">
                Backup and sync your transactions to a Google Spreadsheet.
              </p>
            </div>
          </div>
        </DialogHeader>

        {isSessionExpired ? (
          <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col items-center text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mb-1" />
            <h4 className="font-bold text-rose-300">Session Expired or Missing Scope</h4>
            <p className="text-xs text-rose-200/70">
              Your Google access token has expired or is missing permissions. You must re-authenticate with Google to allow Meyker to update your spreadsheet.
            </p>
            <Button
              type="button"
              variant="primary"
              onClick={handleReauth}
              className="w-full mt-2 bg-rose-600 hover:bg-rose-700 text-white"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Re-Authenticate with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 ml-1 block">
                Google Spreadsheet ID or URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    placeholder="e.g. 1BxiMVs0XRYFgPN... or full URL"
                    value={sheetIdInput}
                    onChange={(e) => setSheetIdInput(e.target.value)}
                    className="pl-9 bg-gray-900 border-gray-800 text-sm h-10"
                  />
                </div>
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving || !sheetIdInput.trim() || sheetIdInput === googleSheetsId}
                  isLoading={isSaving}
                  variant="outline"
                  className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-10"
                >
                  Save
                </Button>
              </div>
              <p className="text-[11px] text-gray-500 ml-1">
                Make sure the Google Account you signed in with has editor access to this sheet.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {syncSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{syncSuccess}</span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
              >
                Close
              </Button>

              <Button
                variant="primary"
                onClick={handleSyncNow}
                disabled={!googleSheetsId || isSyncing}
                isLoading={isSyncing}
                leftIcon={!isSyncing ? <RefreshCw className="w-4 h-4" /> : undefined}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {isSyncing ? 'Syncing to Sheets...' : 'Sync Now (One-Way Backup)'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
