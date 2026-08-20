# Meyker Feature Backlog & Scope Guardrails

This document tracks future feature ideas, operational notes, and roadmap items.

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

## 📊 Phase 3: Imports, Reports & Advanced Sync
- [ ] **Web App Receipt Image Upload**: Direct drag-and-drop image upload inside the web dashboard (extending OCR beyond WhatsApp).
- [ ] **Enhanced Date & Year Filtering**: Expand dashboard filtering beyond monthly (`YYYY-MM`) to support exact date ranges, custom date pickers, and multi-year views.
- [ ] **shadcn/ui Component Upgrade**: Upgrade native select dropdowns and UI components to official `shadcn/ui` patterns.
- [x] **Bank Statement CSV/Excel Import**: Interactive UI with auto-preset detection (BCA, Mandiri, BRI, CIMB, Generic) and intelligent category keyword matching.
- [ ] **Monthly PDF Statement Generator**: Export formatted monthly statements and category breakdowns.
- [ ] **Google Sheets API Live Sync**: Two-way sync to specified Google Sheet spreadsheets via OAuth2.
- [ ] **Savings Goals & Category Budgets**: Set spending limits per category and track progress toward savings targets.
- [ ] **Recurring Transactions**: Auto-schedule monthly rent, subscription payments, or salary receipts.

---

## 💡 Future Backlog Ideas (Unscheduled)
- [ ] Multi-currency support with automatic exchange rate conversion.
- [ ] Shared household / joint budget accounts with multi-user permissions.
- [ ] Custom tags & hash labels per transaction for granular search.
