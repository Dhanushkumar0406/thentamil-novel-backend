# Novel Publishing Platform - Backend API

A complete backend API for a novel publishing platform built with NestJS, Prisma ORM, and PostgreSQL. Features include user authentication, novel/chapter management, subscriptions, and notifications.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation on New PC](#installation-on-new-pc)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)

---

## ✨ Features

### Authentication & Authorization
- ✅ User signup/login with JWT tokens
- ✅ Password reset functionality
- ✅ Role-based access control (ADMIN, EDITOR, USER)
- ✅ Protected routes with JWT guards

### Novel Management
- ✅ Create, read, update, delete novels
- ✅ Pagination, sorting, and search
- ✅ Category-based filtering
- ✅ View count tracking
- ✅ Novel statistics and analytics

### Chapter Management
- ✅ Create, read, update, delete chapters
- ✅ Ordered chapter navigation (next/previous)
- ✅ Unique chapter numbering per novel
- ✅ View count tracking
- ✅ Automatic novel chapter count updates

### Subscription System
- ✅ Subscribe/unsubscribe to novels
- ✅ Get user subscriptions with pagination
- ✅ Check subscription status
- ✅ View novel subscribers

### Notification System
- ✅ Automatic notifications on new chapter publish
- ✅ Unread notification count
- ✅ Mark notifications as read
- ✅ Filter by read status

---

## 🛠️ Tech Stack

- **Framework**: NestJS v11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma v7 with PostgreSQL adapter
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **Password Hashing**: bcrypt

---

## 📦 Prerequisites

Before installing on a new PC, ensure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18.x.x or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version  # Should be v9.x.x or higher
   ```

3. **PostgreSQL** (v14 or higher)
   ```bash
   psql --version  # Should be PostgreSQL 14.x or higher
   ```

4. **Git** (for version control)
   ```bash
   git --version
   ```

### Installing Prerequisites

**Windows:**
- Node.js: Download from https://nodejs.org/
- PostgreSQL: Download from https://www.postgresql.org/download/windows/
- Git: Download from https://git-scm.com/download/win

**macOS:**
```bash
brew install node
brew install postgresql@14
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
sudo apt install postgresql postgresql-contrib
sudo apt install git
```

---

## 🚀 Installation on New PC

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>
cd novel-backend-main

# Or if you have the zip file
unzip novel-backend-main.zip
cd novel-backend-main
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### Step 3: Set Up PostgreSQL Database

1. **Start PostgreSQL service**

   **Windows:**
   - PostgreSQL should auto-start. Check services or start manually.

   **macOS:**
   ```bash
   brew services start postgresql@14
   ```

   **Linux:**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database**

   ```bash
   # Access PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE novel_db;

   # Exit
   \q
   ```

3. **Note your PostgreSQL credentials:**
   - Host: `localhost`
   - Port: `5432` (default)
   - User: `postgres` (or your username)
   - Password: (your PostgreSQL password)
   - Database: `novel_db`

---

## ⚙️ Environment Setup

### Create `.env` file

Create a `.env` file in the project root:

```bash
# .env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/novel_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password.

**Example:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/novel_db?schema=public"
JWT_SECRET="my-super-secret-jwt-key-2025"
PORT=3000
```

---

## 💾 Database Setup

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

This generates the Prisma client based on your schema.

### Step 2: Push Database Schema

```bash
npx prisma db push
```

This creates all tables in your PostgreSQL database.

### Step 3: Seed Database (Optional)

```bash
npx prisma db seed
```

This creates sample data including:
- Test users (admin, editor, user)
- Sample novels

**Default Users After Seeding:**
- Admin: `admin@example.com` / `password123`
- Editor: `editor@example.com` / `password123`
- User: `user@example.com` / `password123`

---

## ▶️ Running the Application

### Development Mode (with hot reload)

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Check if Server is Running

Open browser or use curl:
```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "Welcome to Novel Platform API"
}
```

---

## 📚 API Documentation

### Quick API Overview

**Base URL:** `http://localhost:3000`

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new user |
| POST | `/auth/login` | Login and get JWT token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### Novel Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/novels` | Yes | ADMIN/EDITOR | Create novel |
| GET | `/novels` | No | - | List novels |
| GET | `/novels/:id` | No | - | Get single novel |
| GET | `/novels/:id/stats` | No | - | Get statistics |
| PATCH | `/novels/:id` | Yes | ADMIN/EDITOR | Update novel |
| DELETE | `/novels/:id` | Yes | ADMIN/EDITOR | Delete novel |

### Chapter Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/chapters` | Yes | ADMIN/EDITOR | Create chapter |
| GET | `/chapters` | No | - | List chapters |
| GET | `/chapters/:id` | No | - | Get chapter |
| GET | `/chapters/:id/navigation` | No | - | Get next/prev |
| PATCH | `/chapters/:id` | Yes | ADMIN/EDITOR | Update chapter |
| DELETE | `/chapters/:id` | Yes | ADMIN/EDITOR | Delete chapter |

### Subscription Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/subscriptions` | Yes | Subscribe to novel |
| DELETE | `/subscriptions/:novelId` | Yes | Unsubscribe |
| GET | `/subscriptions/my-subscriptions` | Yes | Get subscriptions |
| GET | `/subscriptions/check/:novelId` | Yes | Check status |

### Notification Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | Get notifications |
| GET | `/notifications/unread-count` | Yes | Get unread count |
| PATCH | `/notifications/mark-read` | Yes | Mark as read |
| PATCH | `/notifications/mark-all-read` | Yes | Mark all read |
| DELETE | `/notifications/:id` | Yes | Delete notification |

**📖 Full API Documentation:** See `FRONTEND_DEVELOPER_GUIDE.md` for detailed request/response examples.

---

## 📁 Project Structure

```
novel-backend-main/
├── src/
│   ├── auth/                 # Authentication module
│   ├── novels/               # Novels module
│   ├── chapters/             # Chapters module
│   ├── subscriptions/        # Subscriptions module
│   ├── notifications/        # Notifications module
│   ├── prisma/               # Database service
│   ├── common/               # Shared utilities
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding
├── .env                      # Environment variables (create this)
├── .gitignore
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

### Essential Files for New PC

**Required to run:**
- ✅ `src/` - All source code
- ✅ `prisma/` - Database schema and migrations
- ✅ `package.json` - Dependencies
- ✅ `package-lock.json` - Locked dependency versions
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `nest-cli.json` - NestJS CLI configuration
- ✅ `.env` - Environment variables (create manually)
- ✅ `.gitignore` - Git ignore rules

**Optional documentation:**
- 📄 `README.md` - This file
- 📄 `FRONTEND_DEVELOPER_GUIDE.md` - Frontend integration guide

**Can be deleted (auto-generated):**
- ❌ `dist/` - Built files (regenerated with `npm run build`)
- ❌ `node_modules/` - Dependencies (reinstalled with `npm install`)

---

## 🧪 Testing

### Manual Testing with cURL

**Test login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Test getting novels:**
```bash
curl http://localhost:3000/novels
```

### Database Inspection

View database with Prisma Studio:
```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to view/edit database data.

---

## 🚀 Deployment

### Production Checklist

Before deploying to production:

1. **Update Environment Variables**
   ```env
   DATABASE_URL="postgresql://user:pass@production-host:5432/novel_db"
   JWT_SECRET="use-a-very-strong-random-secret-here"
   PORT=3000
   NODE_ENV=production
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start Application**
   ```bash
   npm run start:prod
   ```

### Deployment Platforms

**Recommended platforms:**
- **Railway** - Easy Node.js + PostgreSQL deployment
- **Render** - Free tier available
- **Heroku** - Classic PaaS
- **DigitalOcean** - VPS with more control
- **AWS EC2** - Enterprise-grade

---

## 🔧 Troubleshooting

### Common Issues

**1. "Cannot connect to database"**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env` is correct
- Test connection: `psql -U postgres -d novel_db`

**2. "Port 3000 already in use"**
- Kill existing process or change PORT in `.env`
- Windows: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`
- macOS/Linux: `lsof -ti:3000 | xargs kill`

**3. "Prisma client not generated"**
- Run: `npx prisma generate`

**4. "Module not found"**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**5. "JWT token invalid"**
- Token expired (24 hours default)
- Get new token by logging in again

---

## 📄 License

This project is private/proprietary. All rights reserved.

---

**Last Updated:** December 2025
**Version:** 1.0.0
**Node.js:** v18+
**PostgreSQL:** v14+
**NestJS:** v11
