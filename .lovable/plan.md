

# 💰 mzFinance — Financial Management SaaS

A premium fintech-style web application with a dark Nubank-inspired purple theme, multi-currency support, social login, and a full interactive dashboard. Logo featuring the initials **MZ** in a modern fintech style.

---

## 🎨 Design System & Theme

- App name: **mzFinance**
- **Custom MZ logo** — stylized "MZ" initials in vibrant purple, modern geometric/fintech style, used as favicon and in navigation
- **Dark theme** with Nubank-inspired palette: vibrant purple (#8B5CF6) on metallic black (#0A0A0F) background
- White and purple text for high contrast and readability
- Minimalistic, elegant UI with soft shadows, smooth animations, rounded corners
- Glassmorphism-style cards with subtle purple gradients
- Fully responsive, mobile-first layout

---

## 🔐 Authentication (Supabase Auth)

- **Google Login** via Supabase OAuth
- **Apple Login** via Supabase OAuth
- No manual email confirmation — email validated only at account creation
- Auto-create user profile on first sign-in
- Beautiful login page with MZ branding and purple gradient background

---

## 📊 Main Dashboard

- **Total Balance Summary** — large, prominent balance display with multi-currency support
- **Income & Expenses Overview** — cards showing monthly totals with trend indicators (up/down arrows)
- **Interactive Expense Charts** — pie chart by category + bar chart by month (Recharts)
- **Recent Transactions List** — scrollable list with category icons, amounts, dates
- **Date/Period Filters** — month selector, custom date range, presets (week, month, quarter, year)

---

## 💸 Transaction Management

- **Add Income & Expenses** — modal form with amount, category, date, description, currency
- **Edit & Delete Transactions** — full CRUD with confirmation dialogs
- **Automatic Balance Calculation** — real-time updates based on all transactions
- **Multi-currency support** — select currency per transaction

---

## 🏷️ Custom Categories

- Pre-built default categories (Food, Transport, Entertainment, Salary, etc.) with icons
- Create, edit, and delete custom categories
- Color-coded category badges
- Category-based spending breakdown on dashboard

---

## 📅 Monthly Financial Organization

- Monthly summary view — income vs. expenses comparison
- Period-over-period comparison (this month vs. last month)
- Visual indicators for spending trends

---

## 🗄️ Database (Supabase/PostgreSQL)

- **profiles** — user display name, avatar, preferred currency
- **transactions** — amount, type (income/expense), category, date, description, currency, user_id
- **categories** — name, icon, color, user_id (custom), is_default flag
- Row-Level Security on all tables — users only access their own data

---

## 📱 Pages & Navigation

1. **Login** — centered card with MZ logo, Google & Apple sign-in buttons
2. **Dashboard** — main financial overview with all widgets
3. **Transactions** — full list with search, filters, add/edit
4. **Categories** — manage custom categories
5. **Settings** — profile, preferred currency, account management

- Sidebar navigation on desktop with MZ logo at top
- Bottom tab bar on mobile

