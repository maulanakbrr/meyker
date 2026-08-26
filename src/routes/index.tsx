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
import { RecurringTransactionCard } from '../components/dashboard/RecurringTransactionCard'
import { RecurringTransactionModal } from '../components/dashboard/RecurringTransactionModal'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function DashboardPage() {
  const dashboard = useDashboard()

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
          onOpenCategoryModal={() => dashboard.setShowCatModal(true)}
          onOpenExportModal={() => dashboard.setShowExportModal(true)}
          onOpenAddTxModal={() => dashboard.setShowAddTxModal(true)}
          onOpenWhatsAppModal={() => dashboard.setShowWhatsAppModal(true)}
          onOpenReceiptModal={() => dashboard.setShowReceiptModal(true)}
          onOpenBankImportModal={() => dashboard.setShowBankImportModal(true)}
          onOpenBudgetModal={() => dashboard.setShowBudgetModal(true)}
          onOpenSavingsGoalModal={() => {
            dashboard.setTargetDepositGoal(null)
            dashboard.setShowSavingsGoalModal(true)
          }}
          onOpenRecurringModal={() => {
            dashboard.setTargetEditRule(null)
            dashboard.setShowRecurringModal(true)
          }}
        />

        {/* 3 Summary Stat Cards */}
        <StatCards stats={dashboard.stats} />

        {/* Category Budgets, Savings Goals & Recurring Transactions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CategoryBudgetCard
            budgets={dashboard.categoryBudgetsData}
            onOpenBudgetModal={() => dashboard.setShowBudgetModal(true)}
          />
          <SavingsGoalsCard
            goals={dashboard.savingsGoals}
            onOpenCreateGoalModal={() => {
              dashboard.setSavingsGoalModalMode('CREATE')
              dashboard.setTargetDepositGoal(null)
              dashboard.setShowSavingsGoalModal(true)
            }}
            onOpenDepositModal={(goal) => {
              dashboard.setSavingsGoalModalMode('DEPOSIT')
              dashboard.setTargetDepositGoal(goal)
              dashboard.setShowSavingsGoalModal(true)
            }}
            onOpenEditModal={(goal) => {
              dashboard.setSavingsGoalModalMode('EDIT')
              dashboard.setTargetDepositGoal(goal)
              dashboard.setShowSavingsGoalModal(true)
            }}
          />
          <RecurringTransactionCard
            recurringRules={dashboard.recurringRules}
            onOpenModal={() => {
              dashboard.setTargetEditRule(null)
              dashboard.setShowRecurringModal(true)
            }}
            onEditRule={(rule) => {
              dashboard.setTargetEditRule(rule)
              dashboard.setShowRecurringModal(true)
            }}
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
        isOpen={dashboard.showReceiptModal}
        onClose={() => dashboard.setShowReceiptModal(false)}
        onReceiptExtracted={dashboard.handleReceiptExtracted}
      />

      <AddTransactionModal
        isOpen={dashboard.showAddTxModal}
        onClose={() => dashboard.setShowAddTxModal(false)}
        onSubmit={dashboard.handleCreateTransaction}
        categories={dashboard.categories}
        txType={dashboard.txType}
        setTxType={dashboard.setTxType}
        txAmount={dashboard.txAmount}
        setTxAmount={dashboard.setTxAmount}
        txCategory={dashboard.txCategory}
        setTxCategory={dashboard.setTxCategory}
        txDate={dashboard.txDate}
        setTxDate={dashboard.setTxDate}
        txPaymentMethod={dashboard.txPaymentMethod}
        setTxPaymentMethod={dashboard.setTxPaymentMethod}
        txNote={dashboard.txNote}
        setTxNote={dashboard.setTxNote}
      />

      <CategoryManagementModal
        isOpen={dashboard.showCatModal}
        onClose={() => dashboard.setShowCatModal(false)}
        onSubmit={dashboard.handleCreateCategory}
        categories={dashboard.categories}
        catName={dashboard.catName}
        setCatName={dashboard.setCatName}
        catType={dashboard.catType}
        setCatType={dashboard.setCatType}
        catColor={dashboard.catColor}
        setCatColor={dashboard.setCatColor}
      />

      <ExportModal
        isOpen={dashboard.showExportModal}
        onClose={() => dashboard.setShowExportModal(false)}
        recordCount={dashboard.filteredTransactions.length}
        onExportExcel={() => {
          exportToExcel(dashboard.filteredTransactions)
          dashboard.setShowExportModal(false)
        }}
        onExportCSV={() => {
          exportToCSV(dashboard.filteredTransactions)
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
          dashboard.setShowExportModal(false)
        }}
      />

      <WhatsAppSettingsModal
        isOpen={dashboard.showWhatsAppModal}
        onClose={() => dashboard.setShowWhatsAppModal(false)}
        currentPhoneNumber={dashboard.userPhoneNumber}
        userId={dashboard.user.id}
        onPhoneUpdated={(newPhone) => dashboard.setUserPhoneNumber(newPhone)}
      />

      <BankStatementImportModal
        isOpen={dashboard.showBankImportModal}
        onClose={() => dashboard.setShowBankImportModal(false)}
        categories={dashboard.categories}
        onImportTransactions={dashboard.handleImportBankTransactions}
      />

      <CategoryBudgetModal
        isOpen={dashboard.showBudgetModal}
        onClose={() => dashboard.setShowBudgetModal(false)}
        categories={dashboard.categories}
        onSaveBudgets={dashboard.handleSaveCategoryBudgets}
      />

      <SavingsGoalModal
        isOpen={dashboard.showSavingsGoalModal}
        onClose={() => dashboard.setShowSavingsGoalModal(false)}
        mode={dashboard.savingsGoalModalMode}
        targetGoal={dashboard.targetDepositGoal}
        onCreateGoal={dashboard.handleCreateSavingsGoal}
        onUpdateGoal={dashboard.handleUpdateSavingsGoal}
        onDeleteGoal={dashboard.handleDeleteSavingsGoal}
        onDepositGoal={dashboard.handleDepositSavingsGoal}
      />

      <RecurringTransactionModal
        isOpen={dashboard.showRecurringModal}
        onClose={() => {
          dashboard.setShowRecurringModal(false)
          dashboard.setTargetEditRule(null)
        }}
        categories={dashboard.categories}
        targetRule={dashboard.targetEditRule}
        onSubmit={dashboard.handleCreateRecurringRule}
        onUpdate={dashboard.handleUpdateRecurringRule}
      />
    </div>
  )
}