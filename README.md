# Meyker 💼📊

**Meyker** is an intelligent, modern personal financial dashboard and expense logging web application built with **React**, **TanStack Start**, **Tailwind CSS**, **Supabase**, **Drizzle ORM**, and **ExcelJS**.

It empowers individuals, freelancers, and small business owners to track income and expenses effortlessly, analyze financial health with dynamic visual metrics, and export data with one click.

---

## ✨ Features

- **🔐 User Authentication**:
  - Secure authentication powered by Supabase Auth (Email/Password & Google OAuth).
  - Session persistence and protected routes.

- **📊 Financial Dashboard & Metrics**:
  - **3 KPI Summary Cards**: Total Balance, Total Income, and Total Expenses dynamically calculated per month.
  - **Category Spending Breakdown**: Interactive Donut Chart built with Recharts.
  - **6-Month Spending Trend**: Dual-bar chart comparing monthly Income vs Expenses.

- **🏷️ Category Management**:
  - Pre-seeded default categories (Food, Housing, Salary, Transport, Utilities, Entertainment, Investment, etc.).
  - Custom user category creation with hex color badges and icons.

- **💸 Transaction Logging**:
  - Quick entry for Income and Expense transactions (Amount, Type, Date, Category, Payment Method, Memo).
  - Supported Payment Methods: Cash, Bank Transfer, Credit Card, E-Wallet.

- **🔍 Search & Multi-Criteria Filtering**:
  - Filter transactions by Month (`YYYY-MM`), Category, and Type (`INCOME`, `EXPENSE`, `ALL`).
  - Instant live keyword search across notes and category names.

- **📥 Data Export Engine**:
  - **Excel (`.xlsx`) Export**: Professionally formatted spreadsheets using **ExcelJS** complete with headers, number formatting, and formula totals.
  - **CSV Export**: Clean CSV download for spreadsheet tools and raw data analysis.

- **🤖 WhatsApp AI & Vision OCR Automation**:
  - Instant transaction logging via WhatsApp text messages (e.g. `"50k lunch #food"` or `"1.5m invoice #income"`).
  - Multi-tier OCR Vision Pipeline for receipt images & bank transfer screenshots:
    1. **Primary**: Google Gemini 1.5/2.0 Flash Vision AI (`@google/genai`).
    2. **Fallback #1**: Google Cloud Vision API (`@google-cloud/vision`).
    3. **Fallback #2**: Local offline Tesseract.js engine (`ind.traineddata` & `eng.traineddata`).
  - Automated WhatsApp confirmation replies with transaction summaries and fallback tips.

- **🧪 Unit Testing & Quality Assurance**:
  - Full Vitest test suite covering calculation utilities, export engine, Supabase integration, OCR vision fallbacks, WhatsApp NL parser, UI components, and routes (53 passing tests).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TanStack Start
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth)
- **ORM**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Visualizations**: Recharts
- **Export Engine**: ExcelJS
- **Testing**: Vitest + React Testing Library + jsdom

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or pnpm / yarn
- Supabase project credentials

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/maulanakbrr/meyker.git
   cd meyker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the production bundle |
| `npm run check` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Runs the full Vitest unit test suite |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:coverage` | Generates test coverage report |
| `npm run db:push` | Pushes Drizzle schema updates to PostgreSQL |
| `npm run db:studio` | Opens Drizzle Studio GUI for database management |

---

## 📁 Project Structure

```text
meyker/
├── docs/                 # Project documentation & specs
│   ├── PRD.md            # Product Requirement Document
│   ├── BACKLOG.md        # Feature backlog & scope guardrails
│   └── CHANGELOG.md      # Version release history
├── src/                  # Application source code
│   ├── components/       # Reusable UI & modular dashboard components
│   │   ├── auth/         # Login & registration components
│   │   ├── dashboard/    # Header, Controls, StatCards, Charts, TransactionList, Modals
│   │   └── ui/           # Basic layout primitives (Card, Button, Divider)
│   ├── db/               # Drizzle ORM database schema & default categories
│   ├── hooks/            # Custom React hooks (useDashboard state & CRUD handlers)
│   ├── lib/              # Utility functions, OCR vision, export engine, Supabase client
│   │   ├── dashboardUtils.ts   # Metric computations, aggregations & filtering
│   │   ├── export.ts           # ExcelJS & CSV generator logic
│   │   ├── geminiOcr.ts        # Gemini Flash Vision AI OCR & Tesseract fallback
│   │   ├── supabase.ts         # Supabase client & auth helpers
│   │   ├── whatsappAdapter.ts  # Twilio & Qiscus WhatsApp payload parser
│   │   └── whatsappWebhookService.ts # WhatsApp transaction webhook handler
│   ├── routes/           # TanStack file-based router entries (index, login, auth)
│   └── types/            # TypeScript interface definitions (Transaction, Category, etc.)
├── README.md             # Repository overview & setup instructions
└── vite.config.ts        # Vite, Vitest & WhatsApp webhook middleware config
```

---

## 🗺️ Product Roadmap

- **✅ Phase 1: Core Web MVP (Completed)**:
  - Supabase Auth (Email & Google OAuth)
  - Category Management & Transaction Logging
  - Financial Dashboard (KPI Cards, Pie & Bar Charts)
  - Search, Filter, and Excel/CSV Export
  - Modular refactoring & unit testing suite

- **✅ Phase 2: WhatsApp AI & Vision OCR (Completed)**:
  - Twilio & Qiscus WhatsApp webhook adapters
  - Google Gemini Flash Vision AI OCR (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-flash-8b`)
  - Multi-engine OCR fallback (Google Cloud Vision & local Tesseract.js)
  - Natural Language text expense parser (`"50k lunch #food"`)

- **⏳ Phase 3: Advanced Sync & Reports (Upcoming)**:
  - Bank statement CSV/Excel bulk import UI
  - Automated PDF monthly financial statements
  - Live two-way sync with Google Sheets API

---

## 💡 Technical Notes: OCR Pipeline & Rate Limits

1. **Gemini Free-Tier Rate Limits (15 RPM)**:
   * Google AI Studio free tier limits requests to 15 per minute.
   * `runGeminiOcr` automatically cascades through `MODELS_TO_TRY` (`gemini-2.0-flash`, `gemini-2.0-flash-lite`, `gemini-1.5-flash`, `gemini-1.5-flash-8b`, `gemini-1.5-pro`). If Gemini hits quota, wait 60 seconds for rate limits to reset.

2. **Offline Tesseract.js Trade-Offs**:
   * Tesseract.js runs offline CPU pattern matching (`ind.traineddata` & `eng.traineddata`).
   * Unlike Gemini AI Vision, Tesseract lacks visual layout intelligence and may fail to extract numeric amounts from blurry thermal paper receipts or compressed WhatsApp JPEGs.

3. **Fallback Text Prompt**:
   * If all OCR engines fail, WhatsApp sends an actionable prompt guiding users to log the transaction via shorthand text (e.g. `50k lunch #food`).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
