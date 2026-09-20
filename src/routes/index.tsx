import { createFileRoute } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import { LoginPage } from './login'
import { exportToExcel, exportToCSV, exportToPdf } from '../lib/export'
import { getDateFilterPeriodLabel } from '../lib/dateUtils'
import { useDashboard } from '../hooks/useDashboard'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DashboardControls } from '../components/dashboard/DashboardControls'
import { StatCards } from '../components/dashboard/StatCards'
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart'
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart'
import { TransactionList } from '../components/dashboard/TransactionList'
import { AddTransactionModal } from '../components/dashboard/AddTransactionModal'
import { CategoryManagementModal } from '../components/dashboard/CategoryManagementModal'
import { ExportModal } from '../components/dashboard/ExportModal'
import { WhatsAppSettingsModal } from '../components/dashboard/WhatsAppSettingsModal'
import { ReceiptUploadModal } from '../components/dashboard/ReceiptUploadModal'
import { BankStatementImportModal } from '../components/dashboard/BankStatementImportModal'
import { CategoryBudgetCard } from '../components/dashboard/CategoryBudgetCard'
import { SavingsGoalsCard } from '../components/dashboard/SavingsGoalsCard'
import { CategoryBudgetModal } from '../components/dashboard/CategoryBudgetModal'
import { SavingsGoalModal } from '../components/dashboard/SavingsGoalModal'
import { GoogleSheetsSyncModal } from '../components/dashboard/GoogleSheetsSyncModal'
import { supabase } from '../lib/supabase'
import { RecurringTransactionCard } from '../components/dashboard/RecurringTransactionCard'
import { RecurringTransactionModal } from '../components/dashboard/RecurringTransactionModal'

import { useModalStore } from '../stores'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

export function DashboardPage() {
  const dashboard = useDashboard()
  const modalStore = useModalStore()

  if (dashboard.loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs text-gray-400">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!dashboard.user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col pb-16">
      {/* Top Navbar */}
      <DashboardHeader
        user={dashboard.user}
        onSignOut={dashboard.signOut}
        onNavigateAuth={() => dashboard.navigate({ to: '/auth' })}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-8 space-y-8 flex-1">
        {/* Controls Header */}
        <DashboardControls
          dateRange={dashboard.dateRange}
          onDateRangeChange={dashboard.setDateRange}
        />

        {/* 3 Summary Stat Cards */}
        <StatCards stats={dashboard.stats} />

        {/* Category Budgets, Savings Goals & Recurring Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CategoryBudgetCard budgets={dashboard.categoryBudgetsData} />
          <SavingsGoalsCard goals={dashboard.savingsGoals} />
          <RecurringTransactionCard
            recurringRules={dashboard.recurringRules}
            onToggleActive={dashboard.handleToggleRecurringRule}
            onDeleteRule={dashboard.handleDeleteRecurringRule}
          />
        </div>

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdownChart data={dashboard.categoryBreakdownData} />
          <MonthlyTrendChart data={dashboard.monthlyTrendData} />
        </div>

        {/* Recent Transaction List */}
        <TransactionList
          transactions={dashboard.filteredTransactions}
          categories={dashboard.categories}
          searchQuery={dashboard.searchQuery}
          onSearchChange={dashboard.setSearchQuery}
          typeFilter={dashboard.typeFilter}
          onTypeFilterChange={dashboard.setTypeFilter}
          categoryFilter={dashboard.categoryFilter}
          onCategoryFilterChange={dashboard.setCategoryFilter}
          onDeleteTransaction={dashboard.handleDeleteTransaction}
        />
      </main>

      {/* Modals */}
      <ReceiptUploadModal
        isOpen={modalStore.activeModal === 'RECEIPT_UPLOAD' || dashboard.showReceiptModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowReceiptModal(false)
        }}
        onReceiptExtracted={dashboard.handleReceiptExtracted}
      />

      <AddTransactionModal
        isOpen={modalStore.activeModal === 'ADD_TRANSACTION' || dashboard.showAddTxModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowAddTxModal(false)
        }}
        onSubmit={dashboard.handleCreateTransaction}
        categories={dashboard.categories}
      />

      <CategoryManagementModal
        isOpen={modalStore.activeModal === 'CATEGORY_MANAGEMENT' || dashboard.showCatModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowCatModal(false)
        }}
        onSubmit={dashboard.handleCreateCategory}
        categories={dashboard.categories}
      />

      <ExportModal
        isOpen={modalStore.activeModal === 'EXPORT' || dashboard.showExportModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowExportModal(false)
        }}
        recordCount={dashboard.filteredTransactions.length}
        onExportExcel={() => {
          exportToExcel(dashboard.filteredTransactions)
          modalStore.closeModal()
          dashboard.setShowExportModal(false)
        }}
        onExportCSV={() => {
          exportToCSV(dashboard.filteredTransactions)
          modalStore.closeModal()
          dashboard.setShowExportModal(false)
        }}
        onExportPDF={() => {
          const label = getDateFilterPeriodLabel(dashboard.dateRange)
          exportToPdf(
            dashboard.filteredTransactions,
            dashboard.stats,
            dashboard.categoryBreakdownData,
            label
          )
          modalStore.closeModal()
          dashboard.setShowExportModal(false)
        }}
      />

      <WhatsAppSettingsModal
        isOpen={modalStore.activeModal === 'WHATSAPP_SETTINGS' || dashboard.showWhatsAppModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowWhatsAppModal(false)
        }}
        currentPhoneNumber={dashboard.userPhoneNumber}
        userId={dashboard.user.id}
        onPhoneUpdated={(newPhone) => dashboard.setUserPhoneNumber(newPhone)}
      />

      <BankStatementImportModal
        isOpen={modalStore.activeModal === 'BANK_IMPORT' || dashboard.showBankImportModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowBankImportModal(false)
        }}
        categories={dashboard.categories}
        onImportTransactions={dashboard.handleImportBankTransactions}
      />

      <CategoryBudgetModal
        isOpen={modalStore.activeModal === 'CATEGORY_BUDGET' || dashboard.showBudgetModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowBudgetModal(false)
        }}
        categories={dashboard.categories}
        onSaveBudgets={dashboard.handleSaveCategoryBudgets}
      />

      <SavingsGoalModal
        isOpen={modalStore.activeModal === 'SAVINGS_GOAL' || dashboard.showSavingsGoalModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowSavingsGoalModal(false)
        }}
        mode={modalStore.activeModal === 'SAVINGS_GOAL' ? modalStore.savingsGoalMode : dashboard.savingsGoalModalMode}
        targetGoal={modalStore.activeModal === 'SAVINGS_GOAL' ? modalStore.targetGoal : dashboard.targetDepositGoal}
        onCreateGoal={dashboard.handleCreateSavingsGoal}
        onUpdateGoal={dashboard.handleUpdateSavingsGoal}
        onDeleteGoal={dashboard.handleDeleteSavingsGoal}
        onDepositGoal={dashboard.handleDepositSavingsGoal}
      />
      <GoogleSheetsSyncModal
        isOpen={modalStore.activeModal === 'GOOGLE_SHEETS' || dashboard.showGoogleSheetsModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowGoogleSheetsModal(false)
        }}
        googleSheetsId={dashboard.googleSheetsId}
        transactions={dashboard.transactions}
        onSaveSheetId={async (newId) => {
          dashboard.setGoogleSheetsId(newId)
          await supabase.from('profiles').update({ google_sheets_id: newId }).eq('id', dashboard.user.id)
        }}
      />

      <RecurringTransactionModal
        isOpen={modalStore.activeModal === 'RECURRING_TRANSACTION' || dashboard.showRecurringModal}
        onClose={() => {
          modalStore.closeModal()
          dashboard.setShowRecurringModal(false)
          dashboard.setTargetEditRule(null)
        }}
        categories={dashboard.categories}
        targetRule={modalStore.activeModal === 'RECURRING_TRANSACTION' ? modalStore.targetRule : dashboard.targetEditRule}
        onSubmit={dashboard.handleCreateRecurringRule}
        onUpdate={dashboard.handleUpdateRecurringRule}
      />
    </div>
  )
}