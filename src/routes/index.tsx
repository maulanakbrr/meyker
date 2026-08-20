import { createFileRoute } from '@tanstack/react-router'
import { Wallet } from 'lucide-react'
import { LoginPage } from './login'
import { exportToExcel, exportToCSV } from '../lib/export'
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
          selectedMonth={dashboard.selectedMonth}
          onMonthChange={dashboard.setSelectedMonth}
          onOpenCategoryModal={() => dashboard.setShowCatModal(true)}
          onOpenExportModal={() => dashboard.setShowExportModal(true)}
          onOpenAddTxModal={() => dashboard.setShowAddTxModal(true)}
          onOpenWhatsAppModal={() => dashboard.setShowWhatsAppModal(true)}
          onOpenReceiptModal={() => dashboard.setShowReceiptModal(true)}
        />

        {/* 3 Summary Stat Cards */}
        <StatCards stats={dashboard.stats} />

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
      />

      <WhatsAppSettingsModal
        isOpen={dashboard.showWhatsAppModal}
        onClose={() => dashboard.setShowWhatsAppModal(false)}
        currentPhoneNumber={dashboard.userPhoneNumber}
        userId={dashboard.user.id}
        onPhoneUpdated={(newPhone) => dashboard.setUserPhoneNumber(newPhone)}
      />
    </div>
  )
}