# FinanceFlow — Production Personal Finance Tracker

A production-style, full-stack Personal Finance Tracker web application built with **React 18 + Vite**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Express.js**, **Mongoose**, and **MongoDB Atlas**.

---

## 🚀 Features

- **Authentication & Security**
  - Secure sign up & login with **JWT** Bearer tokens
  - Password hashing with **bcryptjs** (10 salt rounds)
  - Protected API routes and client-side route guards
  - Strict input validation with **Zod**
  - Strict user-isolation (users can only access their own financial records)
- **Interactive Dashboard**
  - **Summary Cards**: Real-time Net Balance, Monthly Income, Monthly Spending, Monthly Budget, Remaining Budget
  - **Income vs. Expense Chart**: 6-month monthly cashflow comparison (Recharts)
  - **Expense by Category Chart**: Donut chart with percentages and interactive tooltip (Recharts)
  - **Monthly Spending Trend**: Daily trajectory area chart (Recharts)
  - **Recent Transactions**: Quick glance at latest transactions with category badges and icons
- **Transaction Management**
  - Record Income & Expenses in **₹ INR** (Indian Rupee)
  - Categorization: Food, Transport, Education, Shopping, Bills, Entertainment, Healthcare, Salary, Investment, Freelance, Other
  - Search by description and notes
  - Multi-filtering: Category, Type (Income/Expense), Date Range
  - Sorting: By date (newest/oldest) or amount (highest/lowest)
  - Pagination for transaction history
  - Edit and Delete with confirmation
- **Budget Management**
  - Set total monthly spending limit
  - Allocate category-specific budget quotas
  - Visual progress bar indicator
  - **Automated Warning System**:
    - **Caution (Warning)** when spending reaches ≥ 80% of budget
    - **Danger Alert** when spending exceeds 100% of budget
  - Historical month-by-month budget review
- **Financial Goals**
  - Create milestone targets (e.g. *"Save ₹1,80,000 for MacBook Pro"*, *"Emergency Reserve"*)
  - Track current amount saved, target amount, target date, and progress percentage
  - Quick "+ Add Savings" deposit action
  - Status management: *In Progress*, *Completed*, *Paused*
- **Smart Spending Insights (Rule-Based)**
  - Detects category expense surges vs previous month (e.g. *"Your food expenses increased by 25% compared with last month"*)
  - Alerts when approaching or exceeding monthly budget
  - Highlights top spending category of the month
  - Calculates net monthly savings and savings rate (% of income)
- **Settings & Profile**
  - Update full name & preferred currency (INR ₹, USD $, EUR €, GBP £)
  - Change password with current password verification
  - Secure session termination (Logout)

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Node.js, Express.js, TypeScript, tsx, Zod, JWT, bcryptjs, CORS |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Deployment** | Frontend on **Vercel**, Backend on **Render** |

---

## 📂 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # MongoDB connection & development fallback
│   │   ├── controllers/
│   │   │   ├── authController.ts       # Register, Login, Profile, Password
│   │   │   ├── transactionController.ts# Transaction CRUD & Category aggregation
│   │   │   ├── budgetController.ts     # Monthly & category budgets + warnings
│   │   │   ├── goalController.ts       # Goals & progress deposits
│   │   │   └── analyticsController.ts  # Dashboard summaries & time-series analytics
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts       # JWT verification & user attachment
│   │   │   ├── errorMiddleware.ts      # Centralized error handler
│   │   │   └── validateMiddleware.ts   # Zod request validation
│   │   ├── models/
│   │   │   ├── User.ts                 # User schema & password hashing
│   │   │   ├── Transaction.ts          # Transaction schema with indexes
│   │   │   ├── Budget.ts               # Monthly & category budget schema
│   │   │   └── FinancialGoal.ts        # Financial goal schema
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── transactionRoutes.ts
│   │   │   ├── budgetRoutes.ts
│   │   │   ├── goalRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── services/
│   │   │   └── insightsService.ts      # Rule-based spending insights engine
│   │   ├── validators/                 # Zod validation schemas
│   │   ├── utils/
│   │   │   └── generateToken.ts
│   │   ├── app.ts                      # Express app setup & route mounting
│   │   └── server.ts                   # Server entrypoint
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # Button, Card, Input, Select, Progress, Modal, Badge
│   │   │   ├── layout/                 # Sidebar, Navbar, AppLayout
│   │   │   ├── dashboard/              # SummaryCards, Charts, RecentTransactions, InsightsCard
│   │   │   ├── transactions/           # TransactionModal
│   │   │   ├── budgets/                # SetBudgetModal
│   │   │   ├── goals/                  # GoalModal, AddProgressModal
│   │   │   └── common/                 # EmptyState, LoadingSpinner
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx         # User authentication & token state
│   │   │   └── ToastContext.tsx        # Toast notification system
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   ├── BudgetsPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── services/                   # Typed API service clients
│   │   ├── types/                      # TypeScript data definitions
│   │   ├── utils/                      # Currency (₹ INR), date, percentage formatters
│   │   ├── App.tsx                     # React Router routes & guards
│   │   ├── index.css                   # Tailwind theme directives
│   │   └── main.tsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── vercel.json                     # Vercel SPA rewrite rule
│   └── package.json
└── README.md
```

---

## ⚙️ Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ installed
- npm or pnpm

### 2. Backend Setup
1. Open a terminal in `./backend`:
   ```bash
   cd backend
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with your values (see MongoDB Atlas setup below):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/financetracker?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_finance_tracker_2025
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
   *(Note: In local development, if you don't configure an Atlas URI yet, the backend will automatically spin up an in-memory MongoDB instance for instant testing!)*

4. Start development server:
   ```bash
   npm run dev
   ```
   Backend will start on `http://localhost:5000`.

### 3. Frontend Setup
1. In another terminal window:
   ```bash
   cd frontend
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
   *(By default in dev, `VITE_API_BASE_URL=/api` and Vite proxies `/api` to `http://localhost:5000`)*
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🍃 Connecting MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free account.
2. Create a new Project and deploy a **M0 Free Cluster**.
3. Under **Security → Database Access**:
   - Create a database user (e.g., `finance_admin`) with password authentication.
   - Assign the **Read and write to any database** privilege.
4. Under **Security → Network Access**:
   - Add IP Address `0.0.0.0/0` (Allow access from anywhere) so Render or local dev can connect.
5. Under **Deployment → Database**:
   - Click **Connect** → **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/financetracker?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials.
6. Paste this URI into `backend/.env` under `MONGODB_URI`.

---

## 🌐 Deployment Instructions

### A. Deploy Backend to Render

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New → Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string (at least 32 characters)*
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://financeflow.vercel.app`)*
6. Click **Deploy Web Service**.
7. Note down your Render service URL (e.g. `https://finance-tracker-api.onrender.com`).

---

### B. Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New → Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-render-app.onrender.com/api`
5. Click **Deploy**.
6. The app will build and serve with full SPA routing enabled by `vercel.json`.

---

## 🧪 Automated Testing

An automated integration test suite is included in the backend:
```bash
cd backend
npm run test:api
```
This tests:
1. Healthcheck (`GET /api/health`)
2. Account registration with Zod validation (`POST /api/auth/register`)
3. Login & JWT generation (`POST /api/auth/login`)
4. Income recording (`POST /api/transactions`)
5. Expense recording (`POST /api/transactions`)
6. Transaction retrieval with pagination & filters (`GET /api/transactions`)
7. Monthly & category budget creation (`POST /api/budgets`)
8. Budget calculation & warning detection (`GET /api/budgets`)
9. Financial goal creation (`POST /api/goals`)
10. Savings contribution toward goal (`PATCH /api/goals/:id/progress`)
11. Dashboard summary calculation (`GET /api/analytics/dashboard`)
12. Smart rule-based insights generation (`generateSmartInsights`)
13. Filtered time-series analytics (`GET /api/analytics`)

---

## 🛡️ License

This project is licensed under the MIT License.

