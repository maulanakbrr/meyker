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

- **🧪 Unit Testing & Quality Assurance**:
  - Full Vitest test suite covering calculation utilities, export engine, Supabase integration, UI components, and routes.

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
├── src/
│   ├── components/       # Reusable UI & modular dashboard components
│   │   ├── auth/         # Login & registration components
│   │   ├── dashboard/    # Header, Controls, StatCards, Charts, TransactionList, Modals
│   │   └── ui/           # Basic layout primitives (Card, Button, Divider)
│   ├── db/               # Drizzle ORM database schema & default categories
│   ├── hooks/            # Custom React hooks (useDashboard state & CRUD handlers)
│   ├── lib/              # Utility functions, export engine, Supabase client
│   │   ├── dashboardUtils.ts   # Metric computations, aggregations & filtering
│   │   ├── export.ts           # ExcelJS & CSV generator logic
│   │   ├── mockData.ts         # Fallback preview dataset
│   │   ├── supabase.ts         # Supabase client & auth helpers
│   │   └── utils.ts            # Currency formatters & general helpers
│   ├── routes/           # TanStack file-based router entries (index, login, auth)
│   ├── test/             # Vitest test setup and global mocks
│   └── types/            # TypeScript interface definitions (Transaction, Category, etc.)
├── PRD.md                # Product Requirement Document
├── BACKLOG.md            # Roadmap scope guardrails
└── vite.config.ts        # Vite & Vitest configuration
```

---

## 🗺️ Product Roadmap

- **✅ Phase 1: Core Web MVP (Current)**:
  - Supabase Auth (Email & Google OAuth)
  - Category Management & Transaction Logging
  - Financial Dashboard (KPI Cards, Pie & Bar Charts)
  - Search, Filter, and Excel/CSV Export
  - Modular refactoring & unit testing suite

- **⏳ Phase 2: WhatsApp AI Automation (Upcoming)**:
  - Twilio WhatsApp webhook integration for instant text expense logging
  - Receipt image scanning & OCR parsing via OpenAI Vision (GPT-4o-mini)

- **⏳ Phase 3: Advanced Sync & Reports**:
  - Bank statement CSV/Excel bulk import UI
  - Automated PDF monthly financial statements
  - Live two-way sync with Google Sheets API

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
