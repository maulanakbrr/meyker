# Meyker Feature Backlog & Scope Guardrails

This document tracks future feature ideas, operational notes, and roadmap items.

---

## 🏛️ Phase 1: Core Web MVP (Completed)
- [x] **User Authentication & Session Management**: Supabase Auth integration (Email/Password & Google OAuth popup with `postMessage` session sync).
- [x] **Category Management**: Pre-seeded default categories and custom user category creator with color badges and icons.
- [x] **Transaction Logging**: Income and Expense record creation with payment methods (`CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `E_WALLET`) and notes.
- [x] **Financial Dashboard & Visualizations**: 3 Summary Stat Cards (Balance, Income, Expenses), Recharts Category Donut Breakdown, and 6-Month Income vs Expense Bar Chart.
- [x] **Recent Transaction List & Multi-Criteria Filtering**: Keyword search, month filter, category filter, and transaction type filter (`ALL`, `INCOME`, `EXPENSE`).
- [x] **Client-Side Data Export Engine**: Professionally styled Excel (`.xlsx`) export via ExcelJS and clean CSV download.

---

## 🚀 Phase 2: WhatsApp & AI Automation (Completed)
- [x] **WhatsApp Webhook Gateway (Twilio Dev / Qiscus Prod)**: Receive incoming webhook text and media payloads.
- [x] **Text Natural Language Parser**: Parse expense messages such as `"50k lunch #food"` or `"1.5m invoice #income"`.
- [x] **Google Gemini Flash Vision OCR**: Process uploaded receipt images and bank transfer screenshots with `gemini-1.5-flash` / `gemini-2.0-flash`.
- [x] **WhatsApp Confirmation Replies**: Send automated WhatsApp response confirming entry logged.

### 📝 Phase 2 Operational Notes & System Trade-offs
- **Gemini API Key Quota Upgrade**: Free-tier rate limits (15 RPM) can trigger OCR fallbacks during peak usage. Future update will configure paid tier / key rotation.
- **WhatsApp Image Receipt Notice**: Image OCR sensitivity requires proper lighting and uncompressed photos. Users are advised to send formatted text messages (e.g., `"50k lunch #food"`) for 100% instant reliability.

---

## 📊 Phase 3: Imports, Reports & Advanced Sync (Completed)
- [x] **Web App Receipt Image Upload**: Direct drag-and-drop image upload inside the web dashboard (extending OCR beyond WhatsApp).
- [x] **Enhanced Date & Year Filtering**: Expand dashboard filtering beyond monthly (`YYYY-MM`) to support exact date ranges, custom date pickers, and multi-year views.
- [x] **shadcn/ui Component Upgrade**: Upgrade native select dropdowns, inputs, tabs, popovers, date pickers, and dialogs across dashboard modals.
- [x] **Bank Statement CSV/Excel Import**: Interactive UI with auto-preset detection (BCA, Mandiri, BRI, CIMB, Generic) and intelligent category keyword matching.
- [x] **Monthly PDF Statement Generator**: Export formatted monthly statements and category breakdowns using jsPDF & jspdf-autotable.
- [x] **Google Sheets Live Sync**: One-way backup sync pushing transactions directly into specified Google Sheet spreadsheet via Google Sheets API (OAuth2).
- [x] **Savings Goals & Category Budgets**: Set spending limits per category and track progress toward savings targets.
- [x] **Recurring Transactions & Subscriptions**: Auto-schedule monthly rent, subscription payments, or salary receipts with editable fields, Radix Dialog modals, and reusable DatePicker.

---

## 🎨 Phase 4: Advanced UX, Insights & Optimization (Completed)
- [x] **Dashboard Toolbar UX Refactoring & Action Consolidation**: Consolidate 10 scattered multi-color action buttons into unified Radix Popover menus (`Data & Sync` and `More`), sleek dark aesthetic, and clean hierarchy.
- [x] **Demo Mode / Mock Data Showcase**: Instant live preview mode on login and dashboard with pre-populated sample transactions, visual metrics, categories, budgets, and savings goals without requiring Supabase credentials.
- [x] **Zustand State Architecture Migration & Prop Drilling Elimination**:
  - [x] **Step 1: Form Stores (`src/stores/forms/`)**: Isolate form draft states (`useTransactionFormStore`, `useCategoryFormStore`) to stop keystrokes from re-rendering the entire dashboard and charts.
  - [x] **Step 2: Centralized Modal Store (`useModalStore.ts`)**: Consolidate 10 separate boolean flags into a single active modal manager, eliminating 12 drilled callbacks in `DashboardControls` and cards.
  - [x] **Step 3: Domain Stores Decomposition**: Split the ~1,100-line `useDashboard.ts` hook into `useAuthStore`, `useFilterStore`, and `useFinanceStore`.
  - [x] **Step 4: Quality & Test Coverage**: Update Vitest tests for modals, controls, and dashboard page to ensure 100% test passing across the new stores.

---

## 🚀 Phase 5: Telegram Automation, Granular Tagging & AI Financial Advisor (Planned Scope)
- [ ] **Telegram Bot Automation Engine (Clean WhatsApp Replacement)**:
  - [ ] Deprecate and remove WhatsApp modules (`whatsappAdapter`, `whatsappWebhookService`, Twilio/Qiscus dependencies).
  - [ ] Implement `grammY` Telegram bot integration via webhook endpoint (`/api/telegram`).
  - [ ] One-click account pairing via deep link (`https://t.me/MeykerBot?start=bind_<TOKEN>`).
  - [ ] Natural language transaction logging with hashtag support (e.g., `"45k kopi susu #nongkrong"`).
  - [ ] Instant receipt scanning (Google Gemini Vision OCR) with interactive Inline Keyboard confirmation (`[Simpan]`, `[Ubah Kategori]`, `[Batal]`).
  - [ ] Quick command suite: `/saldo` (current balance & monthly summary), `/budget` (category spending health), `/rekap` (weekly/monthly digest), and `/batal` (undo last entry).
- [ ] **Transaction Tags & Granular Labels (`#tag`)**:
  - [ ] Database migration: Add `tags: text[]` column with PostgreSQL GIN index on `transactions` table.
  - [ ] Smart tag input with autocomplete from user's transaction history in `AddTransactionModal`.
  - [ ] Tag badges display in transaction list table.
  - [ ] Multi-tag filtering support in `DashboardControls` and `useFilterStore`.
- [ ] **On-Demand AI Spending Advisor & Cashflow Forecast (Google Gemini)**:
  - [ ] Data synthesis engine aggregating 30–90 days of transactions, category budgets, and recurring rules.
  - [ ] Google Gemini Flash structured output generator delivering financial health score (1–100), anomaly detection, actionable savings advice, and 30-day cashflow forecast.
  - [ ] Web dashboard "AI Financial Advisor" interactive card/modal.
  - [ ] Telegram bot on-demand command `/advisor` delivering formatted advice directly to chat.

---

## 💡 Future Backlog Ideas (Unscheduled)
- [ ] **Google Sheets Two-Way Sync**: Bi-directional sync pulling remote sheet rows back into Supabase.
- [ ] **Multi-Currency Support**: Per-transaction currency selector with automatic exchange rate conversion.
- [ ] **Shared Household / Joint Budget Accounts**: Multi-user permissions and shared family/partner expense tracking.
