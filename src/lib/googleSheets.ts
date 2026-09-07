export interface GoogleSheetSyncResult {
  success: boolean
  error?: string
  isUnauthorized?: boolean
}

/**
 * Pushes all transactions to a specific Google Sheet, overwriting existing data.
 * This is a one-way backup sync.
 */
export async function syncTransactionsToSheet(
  spreadsheetId: string,
  providerToken: string,
  transactions: any[]
): Promise<GoogleSheetSyncResult> {
  if (!spreadsheetId || !providerToken) {
    return { success: false, error: 'Missing spreadsheet ID or Google access token' }
  }

  try {
    // 1. Format the data to match a specific structure
    const headers = ['Date', 'Category', 'Type', 'Amount', 'Payment Method', 'Source', 'Note']
    const rows = transactions.map((t) => [
      new Date(t.transactionDate).toISOString().split('T')[0], // format date as YYYY-MM-DD
      t.categories?.name || 'Uncategorized',
      t.type,
      t.amount,
      t.paymentMethod,
      t.source,
      t.note || '',
    ])

    const values = [headers, ...rows]
    const range = 'Sheet1!A1'

    // 2. Clear the sheet first to do a full "backup sync" (one-way overwrite)
    const clearResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (clearResponse.status === 401) {
      return { success: false, isUnauthorized: true, error: 'Session expired. Please re-connect Google.' }
    }
    
    if (!clearResponse.ok && clearResponse.status !== 400) {
      const errData = await clearResponse.json()
      console.warn('[Google Sheets Clear Warning]', errData)
    }

    // 3. Write the new data
    const updateResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${providerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: range,
          majorDimension: 'ROWS',
          values: values,
        }),
      }
    )

    if (updateResponse.status === 401) {
      return { success: false, isUnauthorized: true, error: 'Session expired. Please re-connect Google.' }
    }

    if (!updateResponse.ok) {
      const errData = await updateResponse.json()
      return { success: false, error: errData.error?.message || 'Failed to update Google Sheet' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('[Google Sheets Sync Error]', error)
    return { success: false, error: error.message || 'Unknown error occurred during sync.' }
  }
}
