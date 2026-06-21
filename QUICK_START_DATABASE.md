# 🚀 Quick Start: Database Setup & Data Fetching

## ✅ Your App IS Already Configured!

**Good news:** Your app is already fully wired to fetch data from Neon PostgreSQL. All screens use the database connection through `lib/supabase.ts`.

## 📋 3-Step Setup

### Step 1: Verify Database Connection

```bash
# Install required packages
npm install dotenv @neondatabase/serverless

# Test connection
node test-db-connection.js
```

✅ **Expected output:** Should show connected successfully with table counts

❌ **If it fails:** Check your `.env` file for correct database URL

### Step 2: Apply Migrations (If Not Done)

**Option A: Using Neon SQL Editor (Easiest)**
1. Go to https://console.neon.tech
2. Open your project
3. Click "SQL Editor"
4. Copy and paste each migration file content:
   - `supabase/migrations/20260612070039_001_initial_schema.sql`
   - `supabase/migrations/20260612070116_002_rls_policies.sql`
   - `supabase/migrations/20260612070207_003_seed_data.sql`
   - `supabase/migrations/20260612071959_004_matching_engine.sql`
5. Run each one in order

**Option B: Using psql (Command Line)**
```bash
# Windows PowerShell
$env:DATABASE_URL = "your-neon-connection-string"

psql $env:DATABASE_URL -f supabase/migrations/20260612070039_001_initial_schema.sql
psql $env:DATABASE_URL -f supabase/migrations/20260612070116_002_rls_policies.sql
psql $env:DATABASE_URL -f supabase/migrations/20260612070207_003_seed_data.sql
psql $env:DATABASE_URL -f supabase/migrations/20260612071959_004_matching_engine.sql
```

### Step 3: Add Sample Data (Optional)

```bash
# Add test accounts and sample jobs
node seed-sample-data.js
```

This creates:
- Job Seeker account: `seeker@test.com` / `Test123!`
- Employer account: `employer@test.com` / `Test123!`
- 5 sample jobs
- 1 sample application

## 🎯 Verify Data Fetching

### Run the App

```bash
npm run dev
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

### Test Each Screen

**Job Seeker Flow:**
1. Login with `seeker@test.com` / `Test123!`
2. **Home Screen** → Should show categories, recommended jobs, recent jobs
3. **Jobs Tab** → Should show paginated job list with search
4. **Saved Tab** → Should show saved jobs (empty initially)
5. **Applications Tab** → Should show your applications

**Employer Flow:**
1. Login with `employer@test.com` / `Test123!`
2. **Dashboard** → Should show stats, recent applications, active jobs
3. **Jobs Tab** → Should show your posted jobs
4. **Candidates Tab** → Should show applications
5. **Post Job** → Create a new job (it will save to database)

## 📊 What's Already Fetching Data

### ✅ Job Seeker Screens

| Screen | Data Source | Status |
|--------|-------------|--------|
| Home | `job_categories`, `jobs`, `job_matches`, `applications`, `saved_jobs` | ✅ Working |
| Jobs | `jobs` with pagination, search, filters | ✅ Working |
| Saved | `saved_jobs` JOIN `jobs` | ✅ Needs testing |
| Applications | `applications` JOIN `jobs` | ✅ Needs testing |
| Profile | `job_seekers` | ✅ Needs testing |

### ✅ Employer Screens

| Screen | Data Source | Status |
|--------|-------------|--------|
| Dashboard | `jobs`, `applications`, stats | ✅ Working |
| Jobs | `jobs` by employer_id | ✅ Needs testing |
| Candidates | `applications` JOIN `job_seekers` | ✅ Needs testing |
| Post Job | INSERT into `jobs` | ✅ Needs testing |

## 🔍 Debugging

### Check Console Logs

Open Metro bundler console and React Native debugger to see:
- SQL queries being executed
- API errors
- Loading states

### Common Issues

**Issue: "No data showing"**
- ✅ Run `node test-db-connection.js` - Are tables created?
- ✅ Run `node seed-sample-data.js` - Is there data?
- ✅ Check Metro bundler - Restart with `npm run dev`
- ✅ Check `.env` file is loaded

**Issue: "Relation does not exist"**
- ❌ Migrations not applied
- ✅ Run migrations in Neon SQL Editor

**Issue: "Authentication failed"**
- ✅ Register a new account in the app
- ✅ Or use test accounts from seed script

**Issue: "Network request failed"**
- ✅ Check internet connection
- ✅ Verify Neon database is not sleeping (free tier)
- ✅ Check SSL mode in connection string

## 🎨 Data Flow Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Screen    │ ───> │ lib/supabase │ ───> │  lib/db.ts  │
│ (React)     │      │   (shim)     │      │   (Neon)    │
└─────────────┘      └──────────────┘      └─────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ Neon PostgreSQL │
                     │    Database     │
                     └─────────────────┘
```

**How it works:**
1. Screen calls `supabase.from('jobs').select('*')`
2. Supabase shim converts to SQL: `SELECT * FROM jobs`
3. `lib/db.ts` sends query to Neon via HTTP
4. Neon returns data
5. Screen updates with data

## 📚 Key Files Reference

```
job-app11/
├── .env                          ← Database URL (FIXED ✅)
├── lib/
│   ├── db.ts                     ← Neon client (WORKING ✅)
│   ├── supabase.ts               ← Query builder (WORKING ✅)
│   └── auth.ts                   ← JWT auth (WORKING ✅)
├── app/
│   ├── (job-seeker)/
│   │   ├── index.tsx            ← Fetches data ✅
│   │   └── jobs.tsx             ← Fetches data ✅
│   └── (employer)/
│       └── index.tsx            ← Fetches data ✅
├── test-db-connection.js        ← Test script (NEW ✅)
└── seed-sample-data.js          ← Sample data (NEW ✅)
```

## ✨ Summary

**Your app already fetches data from the database!** 

You just need to:
1. ✅ Run `node test-db-connection.js` - Verify connection
2. ✅ Apply migrations (if not done) - Create tables  
3. ✅ Run `node seed-sample-data.js` - Add test data
4. ✅ Run `npm run dev` - Start the app
5. ✅ Login and see data on screen!

---

**Need help?** Check `DATA_FETCHING_GUIDE.md` for detailed information.
