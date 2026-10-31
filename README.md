# Backend_-ledger

A secure banking system backend built with **Node.js**, **Express**, and **MongoDB**. Features user authentication, account management, money transfers with idempotency, immutable ledger entries, and email notifications.

## 🚀 Features

- **User Authentication** — Register and login with JWT (expires in 1 hour), password hashed with bcrypt
- **Account Management** — Create accounts, view user accounts, check account balances
- **Money Transfers** — Transfer funds between accounts with full validation (sufficient funds, active status, account existence)
- **Idempotency** — Idempotency key support to prevent duplicate transactions
- **Immutable Ledger** — Credit/debit ledger entries that cannot be modified or deleted after creation (audit-safe)
- **Email Notifications** — Registration and transaction emails via Nodemailer (Gmail SMTP / OAuth2)
- **MongoDB Transactions** — Atomic fund transfers using MongoDB sessions

## 📁 Project Structure

```
fifth_project/
├── server.js                 # Entry point, connects DB and starts server on port 3000
├── .env                      # Environment variables (MONGO_URI, JWT_SECRET, email config)
├── package.json
├── .gitignore
├── check-account-owner.js
├── check-all-accounts.js
├── fix-orphaned-account.js
├── reset-password.js
├── verify-password.js
└── src/
    ├── app.js                # Express app setup with routes
    ├── controllers/
    │   ├── auth.controller.js    # Register, login
    │   ├── account.controller.js # Create account, get accounts, get balance
    │   └── transaction.controller.js # Create transaction, initial funds
    ├── middleware/
    │   └── auth.middleware.js    # JWT authentication middleware
    ├── models/
    │   ├── user.model.js         # User schema (username, email, password, systemUser)
    │   ├── account.model.js      # Account schema (user ref, status, currency, getBalance)
    │   ├── transaction.model.js  # Transaction schema (fromAccount, toAccount, amount, status, idempotencyKey)
    │   └── ledger.model.js       # Ledger schema (immutable credit/debit entries)
    ├── routes/
    │   ├── auth.route.js         # POST /api/auth/register, /api/auth/login
    │   ├── account.route.js      # Account CRUD routes
    │   └── transaction.route.js  # Transaction routes
    ├── db/
    │   └── db.js                 # MongoDB connection
    └── services/
        └── email.service.js      # Nodemailer email service
```

## 🛠️ API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and receive JWT token | No |

### Accounts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/accounts` | Create a new account | Yes |
| GET | `/api/accounts` | Get all accounts for logged-in user | Yes |
| GET | `/api/accounts/balance/:accountId` | Get balance of a specific account | Yes |

### Transactions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/transactions` | Transfer money between accounts | Yes |
| POST | `/api/transactions/system/initial-funds` | System initial funds transaction | Yes (system user) |

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/anubh7/Backend_-ledger.git
cd Backend_-ledger

# Install dependencies
npm install

# Create .env file with the following variables
cp .env.example .env  # or create manually
```

### .env Variables

```env
MONGO_URI=mongodb+srv://<your-mongodb-uri>
JWT_SECRET=<your-secret-key>
CLIENT_ID=<google-client-id>
CLIENT_SECRET=<google-client-secret>
REFRESH_TOKEN=<gmail-oauth-refresh-token>
EMAIL_USER=<your-gmail-address>
EMAIL_PASS=<gmail-app-password>  # Recommended over OAuth2
```

### Run the Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on **http://localhost:3000**

## 🔐 Authentication

All protected routes require a JWT token. Obtain a token via `/api/auth/login` and send it as:

```
Authorization: Bearer <your-jwt-token>
```

Or as a cookie named `token`.

## 🧱 Data Models

### User
- `username` (String, unique, 3-20 chars)
- `email` (String, unique, validated)
- `password` (String, min 6 chars, hashed with bcrypt)
- `systemUser` (Boolean, default false, immutable)

### Account
- `user` (ObjectId ref to User, unique)
- `status` (enum: active, inactive, closed; default: active)
- `currency` (enum: USD, EUR, GBP, INR; default: INR)

### Transaction
- `fromAccount` (ObjectId ref to Account)
- `toAccount` (ObjectId ref to Account)
- `amount` (Number, min 0.01)
- `status` (enum: pending, completed, failed, reversed; default: pending)
- `idempotencyKey` (String, unique)

### Ledger
- `account` (ObjectId ref to Account)
- `amount` (Number)
- `type` (enum: credit, debit)
- Immutable — cannot be modified or deleted after creation

## 📧 Email Service

Supports two methods:
1. **Gmail App Password** (recommended) — Set `EMAIL_PASS` in `.env`
2. **Gmail OAuth2** — Set `CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN` in `.env`

## 📜 Scripts

```bash
npm run dev   # Start with nodemon (auto-restart on changes)
npm start     # Start production server
npm test      # Run tests (not configured)
```

## 👨‍💻 Author

**anubh7** — https://github.com/anubh7

## 📄 License

ISC