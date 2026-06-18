# JobLink Africa - Location-Based Job Marketplace Platform

A comprehensive React Native/Expo mobile application connecting job seekers, employers, and administrators through intelligent matching based on skills, experience, location, and availability.

## Features

### For Job Seekers
- Professional profile management with skills, experience, and certificates
- Job discovery with advanced filters (category, location, employment type)
- Location-based job search with distance filtering
- Application tracking with status updates
- Resume and document upload
- Match score algorithm for job recommendations

### For Employers
- Company profile management and verification
- Job posting with detailed requirements
- Candidate management with shortlisting
- Application review with match analysis
- Real-time notifications

### For Admins
- Platform statistics dashboard
- User management and moderation
- Employer verification review
- Job moderation
- Application monitoring

## Tech Stack

- **Frontend:** React Native, Expo SDK 54, TypeScript
- **Navigation:** Expo Router (file-based)
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Backend:** Supabase (PostgreSQL, Auth)
- **UI:** Custom components with Linear Gradients

## Database Schema

- **17 Tables** with proper RLS policies
- Users, Job Seekers, Employers, Jobs, Applications
- Skills, Certificates, Experiences
- Notifications, Activity Logs
- Matching engine with automatic scoring

## Installation

```bash
npm install
```

## Running the App

```bash
# Start development server
npm run dev

# Build for web
npm run build:web

# Type check
npm run typecheck
```

## Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=optional_maps_key
```

## Project Structure

```
app/
  (auth)/           - Authentication screens
  (job-seeker)/     - Job seeker tab navigation
  (employer)/       - Employer tab navigation
  (admin)/           - Admin dashboard
components/          - Reusable UI components
lib/                 - Utilities and hooks
stores/              - Zustand state management
types/               - TypeScript definitions
supabase/migrations/ - Database migrations
```

## Matching Algorithm

The matching engine calculates scores based on:
- **40%** - Skills match
- **30%** - Location proximity
- **20%** - Experience level
- **10%** - Availability

Match scores are calculated automatically when jobs are created or profiles are updated.

## License

MIT
