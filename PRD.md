# Product Requirement Document (PRD): Meyker Financial Tracker

## 1. Executive Summary & Vision
**Meyker** is an intelligent, high-performance personal financial manager web app built with **TanStack Start**, **Tailwind CSS / shadcn UI**, **Supabase**, and **Drizzle ORM**. The platform empowers users to track income and expenses effortlessly, analyze financial health with dynamic visual dashboards, and seamlessly scale towards AI-driven multi-channel input (WhatsApp, Receipt Scanning, Sheets live sync).

---

## 2. Target Audience & Core Use Cases
- **Primary Users**: Freelancers, small business owners, and individuals seeking structured expense logging and quick financial reporting.
- **Primary Workflows**:
  - Daily expense/income logging with categories and payment methods.
  - Monthly budget tracking via stat metrics and graphical summaries (donut & bar charts).
  - One-click client-side export to Excel (`.xlsx`) and CSV for tax or personal record-keeping.

---

## 3. Product Roadmap

### Phase 1: Core Web MVP (Current Scope)
- **User Authentication & Session Management**:
  - Supabase Auth integration (Email/Password & Google OAuth).
  - Protected routes and persistent session handling.
- **Category Management**:
  - Pre-seeded sensible defaults (Food & Dining, Rent & Housing, Salary, Transport, Utilities, Entertainment, Shopping, Investment, Health, Miscellaneous).
  - Custom user category creation with custom color hex tags and icon identifiers.
- **Manual Transaction Logging**:
  - Income and Expense record creation (Amount, Type: `INCOME` | `EXPENSE`, Date, Category ID, Payment Method: `CASH` | `BANK_TRANSFER` | `CREDIT_CARD` | `E_WALLET`, Note).
- **Financial Dashboard**:
  - 3 Summary Stat Cards: Total Balance, Total Income, Total Expenses (calculated dynamically for the selected month/year filter).
  - Category Spending Breakdown (Donut Chart).
  - Monthly Spending Trend (Bar Chart).
- **Recent Transaction List & Filtering**:
  - Quick-search text filter.
  - Category and Transaction Type filters (`INCOME`, `EXPENSE`, `ALL`).
  - Edit & delete transaction support.
- **Client-side Data Export**:
  - Professional formatted Excel file (`.xlsx`) generated using **ExcelJS** with custom headers, column formatting, and formulas.
  - Clean CSV export generation for raw data analysis.

### Phase 2: WhatsApp AI Automation (Future Roadmap)
- **WhatsApp Gateway & Adapter**:
  - Twilio WhatsApp Messaging API integration for development/sandbox testing.
  - Qiscus Multichannel API support as local IDR production gateway option.
- **OCR Vision AI Scanning**:
  - Receipt images, QRIS receipts, and bank transfer screenshots scanning using **Google Gemini 1.5 / 2.0 Flash Vision AI** (`@google/genai`).
  - Automatic merchant, date, amount, payment method, and category JSON extraction.
- **Real-time DB Synchronization**:
  - Instant Supabase DB entry logging (`source = 'WHATSAPP'`) and WhatsApp TwiML/Qiscus confirmation reply.

### Phase 3: Imports, Advanced Sync & Reports (Future Roadmap)
- **File Import Engine**:
  - Bulk import from external bank statement CSV/Excel files with interactive column mapping UI.
- **Monthly PDF Reports**:
  - Automated PDF export for monthly financial statements and tax summaries.
- **Live Sync with Google Sheets API**:
  - Two-way live synchronization using Google Sheets API (OAuth2).
- **Savings Goals & Category Budgets**:
  - Target budgets per category and savings goal tracker.

---

## 4. Scope Guardrails & Backlog Management
- All feature ideas outside Phase 1 scope are maintained in [`BACKLOG.md`](file:///d:/projs/apps/meyker/BACKLOG.md) to prevent scope creep during Phase 1 development.

---

## 5. Technical Architecture & Database Schema

### Tech Stack
- **Frontend**: React + TanStack Start (SSR / routing), Tailwind CSS, shadcn UI / modern component patterns.
- **Database / Backend**: PostgreSQL via Supabase (Auth, Row Level Security, DB Host).
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
- **Export Engine**: ExcelJS for `.xlsx` and CSV generation.
- **Icons & Visualization**: Lucide React & Recharts / Custom SVG Charts.
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`).

### Database Schema Definition (PostgreSQL / Drizzle ORM)
- `profiles`: User account details mapped to `auth.users(id)`.
- `categories`: Global default categories (`user_id IS NULL`) and user-custom categories (`user_id = auth.uid()`).
- `transactions`: Core financial entries with source indicator (`WEB`, `WHATSAPP`, `IMPORT`).

```sql
-- Indexes & RLS Policy Requirements
CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX idx_categories_user ON categories (user_id);

-- Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

---

## 6. CI/CD & IDE Workflow
- `.github/workflows/ci.yml`:
  - Triggers on Pull Requests and pushes to `main`.
  - Runs TypeScript type-checking (`tsc --noEmit`), linting, and build verification.
- **IDE Context**: PRD and schema definitions are stored locally in the workspace so Antigravity agents can pick up tasks across sessions seamlessly.
