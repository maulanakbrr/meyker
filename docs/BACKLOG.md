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

## 🎨 Phase 4: Advanced UX, Insights & Optimization
- [x] **Dashboard Toolbar UX Refactoring & Action Consolidation**: Consolidate 10 scattered multi-color action buttons into unified Radix Popover menus (`Data & Sync` and `More`), sleek dark aesthetic, and clean hierarchy.
- [ ] **Demo Mode / Mock Data Showcase**: Instant live preview mode on login and dashboard with pre-populated sample transactions, visual metrics, categories, budgets, and savings goals without requiring Supabase credentials.

---

## 💡 Future Backlog Ideas (Unscheduled)
- [ ] **AI Spending Advisor & Cashflow Forecast**: Google Gemini-powered financial review and budget suggestions.
- [ ] **Google Sheets Two-Way Sync**: Bi-directional sync pulling remote sheet rows back into Supabase.
- [ ] **Transaction Tags & Granular Labels**: `#tag` support in manual entry, WhatsApp parser, and dashboard filters.
- [ ] **Multi-Currency Support**: Per-transaction currency selector with automatic exchange rate conversion.
- [ ] **Shared Household / Joint Budget Accounts**: Multi-user permissions and shared family/partner expense tracking.
