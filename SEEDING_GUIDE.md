# 🌱 Seeding Database - Step by Step Guide

## Quick Start (3 Commands)

```bash
# 1. Install dependencies (if not already done)
npm install dotenv @neondatabase/serverless

# 2. Test database connection
npm run db:test

# 3. Seed comprehensive data
npm run db:seed
```

That's it! Your database now has realistic test data.

---

## What Gets Created

### 👥 Users (21 total)
- **1 Admin**: `admin@joblink.com`
- **10 Employers**: `employer1@joblink.com` to `employer10@joblink.com`
- **10 Job Seekers**: `jobseeker1@joblink.com` to `jobseeker10@joblink.com`
- **All passwords**: `Test123!`

### 🏢 Companies (10)
- TechCorp Africa (IT)
- HealthPlus Nigeria (Healthcare)
- FinServe Solutions (Fintech)
- EduLearn Africa (Education)
- BuildRight Construction
- AgroTech Farms
- LogiMove Express (Logistics)
- CreativeHub Studio (Media)
- RetailMart Nigeria
- EnergyTech Solutions

### 💼 Jobs (20)
Across multiple categories:
- Technology & IT (7 jobs)
- Healthcare (1 job)
- Finance & Accounting (2 jobs)
- Education (1 job)
- Engineering (2 jobs)
- Marketing & Sales (2 jobs)
- Human Resources (1 job)
- Creative & Design (2 jobs)
- Legal (1 job)
- Administrative (1 job)

Salary ranges: ₦70,000 - ₦800,000/month

### 📋 Applications
- 30-50 applications from job seekers to various jobs
- Different statuses: pending, under_review, shortlisted, accepted, rejected

### ⭐ Saved Jobs
- 20-40 jobs saved by job seekers

---

## Detailed Steps

### Step 1: Verify Database Connection

```bash
npm run db:test
```

**Expected output:**
```
🔍 Testing Neon Database Connection...

Test 1: Basic Connection
✅ Connected successfully!
   PostgreSQL Version: PostgreSQL 15.x
   Server Time: 2024-01-15 10:30:00

Test 2: Table Schema Check
✅ Found 15 tables:
   - users
   - job_seekers
   - employers
   - jobs
   - applications
   - saved_jobs
   - skills
   - job_categories
   ...

Test 3: Record Counts
✅ users: 0 records
✅ job_categories: 14 records
✅ jobs: 0 records
✅ applications: 0 records

🎉 Database connection test completed successfully!
```

If this fails, check your `.env` file.

---

### Step 2: Seed Database

```bash
npm run db:seed
```

**Expected output:**
```
🌱 Starting comprehensive database seeding...

📋 Fetching job categories...
✅ Found 14 categories
✅ Found 70 skills

Step 1: Creating employers and companies...
✅ Created 10 employers
   Login: employer1@joblink.com to employer10@joblink.com
   Password: Test123!

Step 2: Creating job seekers...
✅ Created 10 job seekers
   Login: jobseeker1@joblink.com to jobseeker10@joblink.com
   Password: Test123!

Step 3: Creating jobs...
✅ Created 20 jobs

Step 4: Creating applications...
✅ Created 45 applications

Step 5: Creating saved jobs...
✅ Created 28 saved jobs

Step 6: Creating admin user...
✅ Created admin user
   Login: admin@joblink.com
   Password: Test123!

═══════════════════════════════════════════════════════════
🎉 DATABASE SEEDED SUCCESSFULLY!
═══════════════════════════════════════════════════════════

📊 Summary:
   ✅ 10 employers (companies)
   ✅ 10 job seekers
   ✅ 20 active jobs
   ✅ 45 applications
   ✅ 28 saved jobs
   ✅ 1 admin user

🔐 Test Accounts (Password: Test123!):
   Admin:       admin@joblink.com
   Employers:   employer1@joblink.com - employer10@joblink.com
   Job Seekers: jobseeker1@joblink.com - jobseeker10@joblink.com

🚀 Next Steps:
   1. Run: npm run dev
   2. Login with any test account above
   3. Explore the app with real data!
```

---

### Step 3: Run the App

```bash
npm run dev
```

Then press:
- `a` for Android
- `i` for iOS  
- `w` for Web

---

## Testing Different User Roles

### As Job Seeker
Login: `jobseeker1@joblink.com` / `Test123!`

**What to test:**
1. ✅ Home screen shows categories and recommended jobs
2. ✅ Jobs tab shows 20+ jobs with search
3. ✅ Can view job details
4. ✅ Can apply to jobs
5. ✅ Can save jobs
6. ✅ Applications tab shows applied jobs
7. ✅ Saved tab shows bookmarked jobs
8. ✅ Profile shows completion score

### As Employer
Login: `employer1@joblink.com` / `Test123!`

**What to test:**
1. ✅ Dashboard shows stats (active jobs, applications)
2. ✅ Jobs tab shows your posted jobs
3. ✅ Can create new jobs
4. ✅ Can edit/delete jobs
5. ✅ Candidates tab shows applications
6. ✅ Can view candidate profiles
7. ✅ Can shortlist/accept/reject candidates
8. ✅ Notifications for new applications

### As Admin
Login: `admin@joblink.com` / `Test123!`

**What to test:**
1. ✅ Dashboard shows platform-wide stats
2. ✅ Users tab shows all job seekers
3. ✅ Employers tab shows all companies
4. ✅ Jobs tab shows all posted jobs
5. ✅ Can verify/reject employers
6. ✅ Can suspend users

---

## Alternative: Basic Seed (Minimal Data)

If you want just a few records for quick testing:

```bash
npm run db:seed-basic
```

This creates:
- 1 job seeker: `seeker@test.com`
- 1 employer: `employer@test.com`
- 5 sample jobs
- 1 application

---

## Troubleshooting

### Issue: "Database already contains data"
**Solution:** The script will ask if you want to continue. Type `yes` to add more data.

To start fresh:
1. Go to Neon Console: https://console.neon.tech
2. Delete all rows from tables (or drop/recreate database)
3. Re-run migrations
4. Run seed script

### Issue: "relation does not exist"
**Solution:** Migrations not applied. Run migrations first:
1. Go to Neon SQL Editor
2. Copy/paste each migration file (001, 002, 003, 004)
3. Execute in order

### Issue: "Cannot find module 'dotenv'"
**Solution:** Install dependencies:
```bash
npm install dotenv @neondatabase/serverless
```

### Issue: Script hangs at "Starting comprehensive database seeding"
**Solution:** 
- Check internet connection
- Verify Neon database is active (not sleeping)
- Check `.env` file has correct URL

---

## Verify Seeded Data

After seeding, verify with:

```bash
npm run db:test
```

Should show:
- users: 21 records ✅
- job_categories: 14 records ✅
- jobs: 20 records ✅
- applications: 30-50 records ✅

---

## Sample Data Details

### Job Seekers Profiles
1. **Adewale Johnson** - Software Developer (5 years) - Lagos
2. **Chidinma Okonkwo** - Registered Nurse (3 years) - Abuja
3. **Emeka Nwankwo** - Financial Analyst (4 years) - Lagos
4. **Fatima Abubakar** - Teacher (7 years) - Kano
5. **Blessing Eze** - Civil Engineer (6 years) - Port Harcourt
6. **Ibrahim Mohammed** - Digital Marketer (3 years) - Lagos
7. **Ngozi Okafor** - Accountant (5 years) - Enugu
8. **Yusuf Bello** - Mechanical Engineer (8 years) - Kaduna
9. **Amaka Obi** - HR Manager (6 years) - Lagos
10. **Tunde Bakare** - Data Analyst (4 years) - Ibadan

### Sample Jobs
- Senior Full Stack Developer (₦300k-500k) - Remote
- Registered Nurse (₦150k-250k) - Lagos
- Financial Analyst (₦200k-350k) - Abuja
- Secondary School Teacher (₦100k-180k) - Kano
- Civil Engineer (₦350k-600k) - Port Harcourt
- Digital Marketing Specialist (₦180k-300k) - Remote
- Accountant (₦180k-280k) - Lagos
- Mechanical Engineer (₦400k-650k) - Kaduna
- HR Manager (₦300k-500k) - Lagos
- Data Analyst (₦250k-400k) - Remote
- ... and 10 more jobs

---

## Next Steps After Seeding

1. ✅ **Run the app**: `npm run dev`
2. ✅ **Login** with any test account
3. ✅ **Test features**:
   - Browse jobs
   - Apply to jobs
   - Save jobs
   - Post jobs (as employer)
   - Review applications (as employer)
4. ✅ **Check console** for any errors
5. ✅ **Test different user roles**

---

## Need More Data?

You can run the seed script multiple times. It will add more data each time.

Or modify `seed-comprehensive-data.js` to add:
- More companies
- More job seekers
- More jobs
- Different locations
- Different industries

---

**Happy Testing! 🎉**

Your database is now fully populated with realistic African job market data!
