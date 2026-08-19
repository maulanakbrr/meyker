# Changelog

All notable changes to the **Meyker Financial Tracker** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-08-19

### ⚙️ Fixed & Improved
- **OCR Vision Resilience & Model Cascade**:
  - Added `gemini-1.5-flash-8b` to Gemini Vision model fallback sequence to bypass 15 RPM rate limits.
  - Safe Node `worker_threads` exception handling for Tesseract.js to prevent server crashes.
  - Formatted WhatsApp fallback notices guiding users to text transaction format (`"50k lunch #food"`).
- **Project Documentation Reorganization**:
  - Organized project spec files (`PRD.md`, `BACKLOG.md`, `CHANGELOG.md`) into dedicated `docs/` directory.
  - Added Phase 2 operational notes and Phase 3 requirements (direct web receipt upload, custom date pickers, shadcn/ui components) to `docs/BACKLOG.md`.

---

## [0.2.0] - 2026-08-19

### 🎉 Added (Phase 2: WhatsApp & AI Vision OCR)
- **WhatsApp Webhook Gateway & Adapter**:
  - Webhook handlers for Twilio (dev/sandbox TwiML XML) and Qiscus (IDR production JSON).
  - E.164 phone number normalization (`+628...`, `628...`, `08...`) and user profile lookup.
  - Automated WhatsApp confirmation response formatting (`formatTransactionConfirmationReply`).
- **Google Gemini Flash Vision AI OCR**:
  - Receipt image and bank transfer screenshot parsing using `@google/genai` with model fallback cascade (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`).
  - Google Cloud Vision API & offline Tesseract.js fallbacks for rate-limit resilience.
- **Natural Language WhatsApp Text Parser**:
  - Intelligent parsing of shorthand currency values (`50k`, `1.5m`, `50rb`), hashtags (`#food`), income/expense classification, and payment method mapping.
- **Popup OAuth Modal & Database Fetch Fallbacks**:
  - Refined Google OAuth popup window session exchange with `postMessage` cross-frame notification.
  - Automatic DB query fallbacks and explicit developer error logging for Supabase category joins.
- **WhatsApp Account Settings UI**:
  - Account WhatsApp phone number configuration modal (`WhatsAppSettingsModal.tsx`).
- **Extended Test Suite**:
  - Added unit test suites covering OCR vision fallbacks, WhatsApp NL parser, and webhook handler (53 passing unit tests across 15 test files).

---

## [0.1.0] - 2026-07-29

### 🎉 Added (Phase 1: Core Web MVP)
- **User Authentication**:
  - Supabase Auth integration supporting Email/Password and Google OAuth sign-in (`/login` and `/auth` routes).
  - Session persistence and auto-closing callback handler for OAuth popups.
- **Category Management**:
  - Pre-seeded default categories (Food, Housing, Salary, Transport, Utilities, Entertainment, Investment, Health, Miscellaneous).
  - Custom category creation with color picker hex badges and icon indicators.
- **Manual Transaction Logging**:
  - Income and Expense record creation supporting Amount, Category, Date, Payment Method (`CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `E_WALLET`), and Memo note.
- **Financial Dashboard & Visualizations**:
  - 3 Summary Stat KPI Cards (Total Balance, Total Income, Total Expenses).
  - Category Spending Breakdown Donut Chart powered by Recharts.
  - 6-Month Spending & Income Trend Bar Chart powered by Recharts.
- **Transaction Table & Multi-Criteria Filtering**:
  - Instant keyword search across notes and category names.
  - Month filter (`YYYY-MM`), Category filter, and Transaction Type filter (`ALL`, `INCOME`, `EXPENSE`).
  - Delete transaction entry capability with instant UI update.
- **Client-Side Data Export Engine**:
  - Excel (`.xlsx`) export using **ExcelJS** with custom headers, cell styling, and total formulas.
  - Clean CSV export for spreadsheet tools and raw data analysis.
- **Modular Code Architecture**:
  - Refactored `src/routes/index.tsx` from 1,084 lines down to ~128 lines.
  - Extracted pure calculation utility module `src/lib/dashboardUtils.ts`.
  - Extracted custom state hook `src/hooks/useDashboard.ts`.
  - Extracted single-responsibility UI widgets into `src/components/dashboard/`.
- **Comprehensive Vitest Test Suite**:
  - Added unit test suite covering calculation utilities, export engine, Supabase auth integration, UI components, and router entries (41 passing unit tests across 12 test files).
