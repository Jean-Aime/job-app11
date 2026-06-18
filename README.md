# JobLink Africa — Mobile Application

React Native / Expo mobile job platform for the African market.  
Stack: **Expo SDK 54 · Expo Router v6 · Neon PostgreSQL · Zustand · Zod · react-hook-form**

---

## Application Flow Diagram

```
╔══════════════════════════════════════════════════════════════════╗
║                         APP LAUNCH                               ║
║                    RootLayout (_layout.tsx)                      ║
║              refreshUser() ── AsyncStorage session?              ║
╚══════════════════════════════════════════════════════════════════╝
                              │
           ┌──────────────────┴──────────────────┐
           │ NO session                           │ YES session
           ▼                                      ▼
   ┌───────────────┐                   role from JWT token
   │  (auth)/index │                              │
   │  WelcomeScreen│         ┌───────────────────┬┴──────────────────┐
   └───────┬───────┘         ▼                   ▼                   ▼
           │             job_seeker           employer             admin
           │            /(job-seeker)       /(employer)          /(admin)
    ┌──────┴──────┐
    │             │
    ▼             ▼
 Login        Role Select
    │             │
    │        ┌────┴────┐
    │        ▼         ▼
    │   Job Seeker  Employer
    │    Register   Register
    │        │         │
    └────────┴────┬────┘
                  ▼
             Auth Store
           signIn/signUp
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
  job_seeker   employer     admin
  /(job-seeker) /(employer) /(admin)

════════════════════════════════════════════════════════════════
 ROLE: JOB SEEKER  /(job-seeker)   [Blue #2563EB]
════════════════════════════════════════════════════════════════

  Tab Bar: Home │ Jobs │ Map │ Saved │ Applications │ Profile

  Home (index.tsx)
  ├── Real match scores from job_matches table
  ├── Live stats: Applications / Matches / Saved
  ├── Category carousel → Jobs screen (filtered)
  ├── Recommended for You (top matches by score)
  └── Recent Jobs

  Jobs (jobs.tsx)
  ├── Search + Employment Type filter
  ├── Infinite scroll pagination (10/page)
  └── → Job Detail [id].tsx
        ├── Apply (inserts to applications table)
        ├── Save / Unsave (saved_jobs table)
        └── Company info

  Map (map.tsx)
  ├── Distance filter: 5 / 10 / 20 / 50 km
  ├── List / Map toggle
  └── → Job Detail

  Saved (saved.tsx)
  └── → Job Detail

  Applications (applications.tsx)
  ├── Status filter tabs
  └── → Application Detail [id].tsx
        ├── Match score breakdown
        ├── Timeline
        └── Withdraw (sets status = withdrawn)

  Profile (profile.tsx)
  ├── Edit personal info
  ├── Profile completion progress bar
  ├── Skills → profile/skills/index.tsx
  ├── Experience → profile/experience/new.tsx
  ├── Certificates → profile/certificates/new.tsx
  └── Sign Out → /(auth)

════════════════════════════════════════════════════════════════
 ROLE: EMPLOYER  /(employer)   [Green #059669]
════════════════════════════════════════════════════════════════

  Tab Bar: Dashboard │ Jobs │ Candidates │ Alerts │ Company

  Dashboard (index.tsx)
  ├── Live stats: Active Jobs / Applications / Shortlisted
  ├── Quick Actions: Post Job / View Candidates
  ├── Recent Applications list
  └── Active Jobs list

  Jobs (jobs.tsx)
  ├── Status filter: All / Active / Closed / Draft
  ├── Edit / Pause / Delete actions
  └── → Job Detail [id]/index.tsx
        ├── Applications list
        └── → Edit [id]/edit.tsx

  New Job (jobs/new.tsx)
  ├── Title, type, description, experience
  ├── Salary range, location, remote flag
  └── Category picker

  Candidates (candidates.tsx)
  ├── Status filter
  └── → Candidate Detail candidates/[id].tsx
        ├── Match score breakdown (skills/location/experience)
        ├── Contact info
        └── Status actions: Shortlist / Accept / Reject / Reset

  Alerts (notifications.tsx)
  ├── Mark as read / Mark all read
  └── 15-second polling interval

  Company (profile.tsx)
  ├── Edit company info
  ├── Verification status badge
  └── Sign Out → /(auth)

════════════════════════════════════════════════════════════════
 ROLE: ADMIN  /(admin)   [Purple #8B5CF6]
════════════════════════════════════════════════════════════════

  Tab Bar: Dashboard │ Users │ Employers │ Jobs │ Reviews

  Dashboard (index.tsx)
  ├── Platform stats: Users / Employers / Active Jobs / Applications
  ├── Pending Verifications alert banner
  ├── Quick action grid
  └── Sign Out (top-right button)

  Users (users.tsx)
  ├── Job seekers list with filter
  └── Suspend / Activate toggle

  Employers (employers.tsx)
  ├── Filter: All / Pending / Approved / Rejected
  └── Approve / Reject verification inline

  Jobs (jobs.tsx)
  ├── Filter: All / Active / Closed / Draft
  └── Delete job

  Reviews/Applications (applications.tsx)
  └── Platform-wide application list with status filter

════════════════════════════════════════════════════════════════
 AUTHENTICATION GUARDS
════════════════════════════════════════════════════════════════

  hooks/useAuthGuard.ts
  ├── Called in every role layout (_layout.tsx)
  ├── If NOT authenticated → redirect /(auth)
  └── If WRONG role → redirect to correct role area

  Session lifecycle
  ├── JWT stored in AsyncStorage (7-day TTL)
  ├── Verified on app boot via refreshUser()
  ├── Cleared on signOut()
  └── Auto-redirect on expiry
```

---

## Project Structure

```
job-app11/
├── app/
│   ├── _layout.tsx              Root layout + session bootstrap
│   ├── +not-found.tsx           Role-aware 404 screen
│   ├── (auth)/                  Public screens (no guard)
│   │   ├── _layout.tsx
│   │   ├── index.tsx            Welcome / auto-redirect if authed
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── role-selection.tsx
│   │   └── forgot-password.tsx
│   ├── (job-seeker)/            Guard: role === 'job_seeker'
│   │   ├── _layout.tsx          useAuthGuard('job_seeker')
│   │   ├── index.tsx            Home dashboard
│   │   ├── jobs.tsx             Browse + search
│   │   ├── jobs/[id].tsx        Detail + apply
│   │   ├── map.tsx              Nearby jobs
│   │   ├── saved.tsx            Bookmarked jobs
│   │   ├── applications.tsx     My applications
│   │   ├── applications/[id].tsx Application detail
│   │   └── profile/             Profile sub-routes
│   ├── (employer)/              Guard: role === 'employer'
│   │   ├── _layout.tsx          useAuthGuard('employer')
│   │   ├── index.tsx            Dashboard
│   │   ├── jobs.tsx             Manage jobs
│   │   ├── jobs/new.tsx         Post a job
│   │   ├── jobs/[id]/index.tsx  Job detail + applicants
│   │   ├── jobs/[id]/edit.tsx   Edit job
│   │   ├── candidates.tsx       All applications
│   │   ├── candidates/[id].tsx  Candidate detail
│   │   ├── notifications.tsx    Alerts
│   │   └── profile.tsx          Company profile
│   └── (admin)/                 Guard: role === 'admin'
│       ├── _layout.tsx          useAuthGuard('admin')
│       ├── index.tsx            Platform dashboard
│       ├── users.tsx            Manage job seekers
│       ├── employers.tsx        Verify employers
│       ├── jobs.tsx             Platform jobs
│       └── applications.tsx    All applications
│
├── hooks/
│   ├── useAuthGuard.ts          Auth + role protection
│   ├── useSignOut.ts            Shared sign-out + redirect
│   └── useFrameworkReady.ts
│
├── lib/
│   ├── auth.ts                  JWT auth (signIn/signUp/session)
│   ├── db.ts                    Neon PostgreSQL client
│   ├── supabase.ts              Supabase-compatible query shim
│   └── hooks/
│       └── useNotifications.ts  15s polling hook
│
├── stores/
│   └── authStore.ts             Zustand auth store (persisted)
│
├── types/
│   ├── database.ts              All entity types
│   └── env.d.ts                 Env var declarations
│
├── utils/
│   ├── formatters.ts            formatTimeAgo, formatSalary, formatDate…
│   └── colors.ts                Brand palette + status color maps
│
└── supabase/migrations/
    ├── 001_initial_schema.sql   All tables + indexes
    ├── 002_rls_policies.sql     Row-level security
    ├── 003_seed_data.sql        Categories + sample data
    └── 004_matching_engine.sql  Match score functions + triggers
```

---

## Environment Setup

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_NEON_DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
EXPO_PUBLIC_JWT_SECRET=your-strong-secret-min-32-chars
```

## Running the App

```bash
npm install
npm run dev          # Expo dev server
npm run android      # Android
npm run ios          # iOS
npm run web          # Web browser
```

## Database Setup

Run migrations in order against your Neon PostgreSQL instance:

```bash
psql $DATABASE_URL -f supabase/migrations/20260612070039_001_initial_schema.sql
psql $DATABASE_URL -f supabase/migrations/20260612070116_002_rls_policies.sql
psql $DATABASE_URL -f supabase/migrations/20260612070207_003_seed_data.sql
psql $DATABASE_URL -f supabase/migrations/20260612071959_004_matching_engine.sql
```

## Architecture Decisions

| Decision | Rationale |
|---|---|
| Neon PostgreSQL over Supabase Auth | Direct DB control, no vendor auth lock-in |
| Custom JWT (HS256) | Works offline-first with AsyncStorage |
| Zustand + persist | Lightweight, survives app restarts |
| Expo Router file-based routing | No manual navigation stack config |
| Role-based layouts with `useAuthGuard` | Single source of truth for RBAC |
| Shared `utils/formatters.ts` | Eliminates duplicated helpers across 10+ screens |
| 15s notification polling | No WebSocket infra needed for MVP |
| Matching engine in PostgreSQL | Server-side triggers keep scores fresh automatically |

## Known Limitations & Roadmap

- **Password hashing**: Currently SHA-256. Upgrade to bcrypt/argon2 via a server-side API for production.
- **JWT secret**: `EXPO_PUBLIC_` prefix exposes it to the client bundle. Move signing to a backend edge function.
- **Map view**: Placeholder — integrate `react-native-maps` with a Google Maps API key.
- **Push notifications**: Polling every 15s → replace with Expo Push Notifications for real-time.
- **File uploads**: Profile photos and resume upload require Cloudflare R2 / Supabase Storage integration.
- **Admin RLS**: Database-level admin bypass policies need adding to `002_rls_policies.sql`.
