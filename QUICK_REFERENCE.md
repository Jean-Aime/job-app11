# 🚀 Quick Reference Card

## One-Liner Setup

```bash
npm install dotenv @neondatabase/serverless && npm run db:test && npm run db:seed && npm run dev
```

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run db:test` | Test database connection |
| `npm run db:seed` | Seed comprehensive data (20 jobs, 10 seekers, 10 employers) |
| `npm run db:seed-basic` | Seed minimal data (5 jobs, 1 seeker, 1 employer) |
| `npm run dev` | Start Expo development server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run on Web browser |

---

## Test Accounts (Password: Test123!)

### 👤 Admin
```
Email: admin@joblink.com
Role: Platform Administrator
```

### 👔 Employers (10 accounts)
```
employer1@joblink.com  → TechCorp Africa
employer2@joblink.com  → HealthPlus Nigeria
employer3@joblink.com  → FinServe Solutions
employer4@joblink.com  → EduLearn Africa
employer5@joblink.com  → BuildRight Construction
employer6@joblink.com  → AgroTech Farms
employer7@joblink.com  → LogiMove Express
employer8@joblink.com  → CreativeHub Studio
employer9@joblink.com  → RetailMart Nigeria
employer10@joblink.com → EnergyTech Solutions
```

### 👨‍💼 Job Seekers (10 accounts)
```
jobseeker1@joblink.com  → Adewale Johnson (Software Developer)
jobseeker2@joblink.com  → Chidinma Okonkwo (Nurse)
jobseeker3@joblink.com  → Emeka Nwankwo (Financial Analyst)
jobseeker4@joblink.com  → Fatima Abubakar (Teacher)
jobseeker5@joblink.com  → Blessing Eze (Civil Engineer)
jobseeker6@joblink.com  → Ibrahim Mohammed (Digital Marketer)
jobseeker7@joblink.com  → Ngozi Okafor (Accountant)
jobseeker8@joblink.com  → Yusuf Bello (Mechanical Engineer)
jobseeker9@joblink.com  → Amaka Obi (HR Manager)
jobseeker10@joblink.com → Tunde Bakare (Data Analyst)
```

---

## Sample Jobs Created (20 total)

| Title | Category | Salary Range | Location |
|-------|----------|--------------|----------|
| Senior Full Stack Developer | Tech | ₦300k-500k | Remote |
| Registered Nurse | Healthcare | ₦150k-250k | Hospitals |
| Financial Analyst | Finance | ₦200k-350k | Lagos |
| Civil Engineer | Engineering | ₦350k-600k | Nationwide |
| Digital Marketing Specialist | Marketing | ₦180k-300k | Remote |
| DevOps Engineer | Tech | ₦450k-800k | Remote |
| Mobile App Developer | Tech | ₦300k-500k | Remote |
| Project Manager | Tech | ₦400k-700k | Remote |
| HR Manager | HR | ₦300k-500k | Lagos |
| Data Analyst | Tech | ₦250k-400k | Remote |
| ... and 10 more jobs |

---

## Database Stats After Seeding

```
Users:          21 (1 admin + 10 employers + 10 seekers)
Companies:      10
Jobs:           20 (all active)
Applications:   30-50 (various statuses)
Saved Jobs:     20-40
Skills:         70+
Categories:     14
```

---

## File Structure

```
job-app11/
├── .env                              ← Database connection
├── test-db-connection.js             ← Test script
├── seed-comprehensive-data.js        ← Main seed script (USE THIS)
├── seed-sample-data.js               ← Basic seed script
├── SEEDING_GUIDE.md                  ← Detailed guide
├── QUICK_START_DATABASE.md           ← Setup guide
├── DATA_FETCHING_GUIDE.md            ← Data fetching docs
└── package.json                      ← Scripts defined here
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module 'dotenv'" | Run: `npm install dotenv @neondatabase/serverless` |
| "relation does not exist" | Apply migrations in Neon SQL Editor |
| "Database already has data" | Type `yes` to add more, or clear database first |
| No data showing in app | Restart Metro: Kill terminal, run `npm run dev` again |
| Authentication failed | Use test accounts above with password: `Test123!` |

---

## Quick Test Flow

### 1️⃣ As Job Seeker
```
Login: jobseeker1@joblink.com / Test123!

→ Home: See recommended jobs
→ Jobs: Browse all 20 jobs
→ Job Detail: View and apply
→ Applications: See your applications
→ Saved: View saved jobs
→ Profile: Complete your profile
```

### 2️⃣ As Employer
```
Login: employer1@joblink.com / Test123!

→ Dashboard: See stats
→ Jobs: View your posted jobs
→ Post Job: Create new job
→ Candidates: Review applications
→ Approve/Reject: Manage candidates
```

### 3️⃣ As Admin
```
Login: admin@joblink.com / Test123!

→ Dashboard: Platform overview
→ Users: Manage job seekers
→ Employers: Verify companies
→ Jobs: Monitor all jobs
```

---

## Environment Variables

```env
# Required in .env file:
EXPO_PUBLIC_NEON_DATABASE_URL=postgresql://...
EXPO_PUBLIC_JWT_SECRET=your-secret-key
```

---

## Common npm Scripts

```bash
# Development
npm run dev              # Start dev server
npm run android          # Android emulator
npm run ios              # iOS simulator
npm run web              # Web browser

# Database
npm run db:test          # Test connection
npm run db:seed          # Comprehensive seed
npm run db:seed-basic    # Basic seed

# Code Quality
npm run lint             # Lint code
npm run typecheck        # Type checking
```

---

## Support

📚 **Detailed Guides:**
- `SEEDING_GUIDE.md` - Complete seeding documentation
- `QUICK_START_DATABASE.md` - Database setup guide
- `DATA_FETCHING_GUIDE.md` - Data fetching patterns
- `README.md` - App architecture and flow

---

## Quick Links

- 🗄️ Neon Console: https://console.neon.tech
- 📱 Expo Go App: Download from App Store/Play Store
- 🔧 Troubleshooting: See SEEDING_GUIDE.md

---

**Last Updated:** 2024
**Version:** 1.0.0
**Status:** ✅ Ready for testing
