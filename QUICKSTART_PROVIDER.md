# 🚀 Quick Start: Service Provider Workspace

## Installation (One-Time Setup)

1. **Run the seed script**:
   ```bash
   seed-provider.bat
   ```
   
   OR manually:
   ```bash
   psql "YOUR_DATABASE_URL" -f supabase/migrations/20260620000000_010_service_provider_complete_seed.sql
   ```

2. **Start the app**:
   ```bash
   npm run dev
   ```

3. **Login**:
   - Email: `provider@test.com`
   - Password: `password123`

## What You'll See

### 📊 Dashboard Tab
- **Active Jobs**: 2 ongoing projects
- **Pending Requests**: 3 new opportunities
- **Stats**: Rating 4.6/5, 47 jobs completed, 92.5% response rate
- **Recent Activity**: Latest service requests

### 📋 Requests Tab
- **8 Total Requests** across different statuses:
  - ⏳ **Pending** (3): New job opportunities
  - ⚡ **Accepted** (1): Job you accepted
  - 🔄 **In Progress** (1): Currently working on
  - ✅ **Completed** (3): Past jobs with customer reviews

### 👤 Profile Tab
- **Personal Info**: Name, phone, address, hourly rate
- **Skills** (4): Plumbing, Electrical, Carpentry, Painting
- **Stats Display**: Rating, completed jobs, response rate
- **Availability Toggle**: Control whether you receive requests

### 🔔 Notifications
- 3 new job request notifications
- Real-time updates when customers post new jobs

## Test Features

✅ View and filter service requests by status
✅ Accept or decline job requests  
✅ Update job status (in progress → completed)
✅ View customer information and job details
✅ Edit profile information
✅ Manage service skills
✅ Toggle availability status
✅ View job history with reviews

## Sample Data Included

**Service Requests by Category**:
- 🔧 **Plumbing** (3): Sink leak, pipe replacement, toilet installation
- ⚡ **Electrical** (2): Ceiling lights, outlet repairs
- 🪚 **Carpentry** (2): Kitchen cabinet, door repair
- 🎨 **Painting** (1): Living room painting

**Customer Reviews**:
- 3-5 star ratings
- Realistic review comments
- Linked to completed jobs

**Locations**: All requests in different Kigali neighborhoods

## Quick Links

- 📖 [Full Documentation](./SEED_PROVIDER_README.md)
- 🗃️ [Seed SQL File](./supabase/migrations/20260620000000_010_service_provider_complete_seed.sql)
- 🛠️ [Seed Script](./seed-provider.bat)

## Need Help?

**Issue**: No data showing after login?
- Restart the app: `npm run dev -- --clear`
- Check console for errors
- Verify you ran the seed script successfully

**Issue**: Can't run seed script?
- Install PostgreSQL client (psql)
- Check your `.env` file has correct database URL
- See [Full Documentation](./SEED_PROVIDER_README.md) for troubleshooting

---

**Ready to start?** Run `seed-provider.bat` and login! 🎉
