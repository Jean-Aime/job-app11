# Service Provider Workspace - Seed Data Setup

This guide will help you populate the database with sample data for testing the service provider workspace.

## What Gets Created

The seed script creates:

### Service Provider Profile
- **Name**: John Mukamazimpaka
- **Login**: provider@test.com / password123
- **Rating**: 4.6/5.0 (23 reviews)
- **Completed Jobs**: 47
- **Skills**: Plumbing (5 years), Electrical (4 years), Carpentry (3 years), Painting (2 years)

### Sample Customers
- 5 job seekers who post service requests in Kigali

### Service Requests
1. **Pending Requests (3)** - New opportunities
   - Fix Leaking Kitchen Sink (Plumbing)
   - Install New Ceiling Lights (Electrical)
   - Custom Kitchen Cabinet (Carpentry)

2. **Active Jobs (2)** - Currently in progress
   - Replace Bathroom Pipes (In Progress)
   - Fix Power Outlets (Accepted)

3. **Completed Jobs (3)** - Past work with reviews
   - Paint Living Room
   - Install New Toilet
   - Fix Wooden Door

### Additional Data
- Service provider interests/bids on pending requests
- Customer reviews on completed jobs
- Notifications for new job requests

## How to Run

### Option 1: Using the Batch Script (Windows)

1. Make sure you have PostgreSQL client (`psql`) installed
2. Ensure your `.env` file has the database URL set
3. Run the seed script:
   ```bash
   seed-provider.bat
   ```

### Option 2: Manual SQL Execution

Run the migration file directly:
```bash
psql $DATABASE_URL -f supabase/migrations/20260620000000_010_service_provider_complete_seed.sql
```

Replace `$DATABASE_URL` with your actual database connection string from `.env`

### Option 3: Using Database GUI

1. Open your database management tool (pgAdmin, DBeaver, etc.)
2. Connect to your Neon PostgreSQL database
3. Open and execute: `supabase/migrations/20260620000000_010_service_provider_complete_seed.sql`

## Verify the Data

After running the seed script, you should see:

1. **Dashboard Tab**
   - Active Jobs: 2
   - Pending Requests: 3
   - Recent activity

2. **Requests Tab**
   - Filter by status: Pending, Accepted, In Progress, Completed
   - See all 8 service requests

3. **Profile Tab**
   - Complete provider information
   - 4 service skills
   - Stats: Rating, Jobs Completed, Response Rate

4. **Notifications**
   - 3 unread notifications for new job requests

## Testing Scenarios

### Test 1: View Dashboard
- Login as provider@test.com
- See stats and recent activity
- Check active jobs count

### Test 2: Manage Requests
- Go to Requests tab
- Filter by "Pending" to see new opportunities
- Click on a request to view details
- Express interest or accept a job

### Test 3: Update Profile
- Go to Profile tab
- Edit personal information
- Add/remove skills
- Toggle availability

### Test 4: Check Notifications
- View notification badge count
- Click on notifications
- Mark as read

## Troubleshooting

### Error: "psql command not found"
Install PostgreSQL client tools:
- Windows: Download from https://www.postgresql.org/download/windows/
- Add `C:\Program Files\PostgreSQL\XX\bin` to your PATH

### Error: "Database connection failed"
- Check your `.env` file has correct `EXPO_PUBLIC_NEON_DATABASE_URL`
- Ensure your database is accessible
- Verify SSL mode is set correctly: `?sslmode=require`

### Error: "Duplicate key violation"
The seed data may already exist. To reset:
1. Delete existing service requests: 
   ```sql
   DELETE FROM service_requests;
   ```
2. Run the seed script again

### Data Not Showing in App
1. Clear app cache and restart: `npm run dev -- --clear`
2. Check browser console for errors
3. Verify login with correct credentials: provider@test.com / password123

## Next Steps

After seeding the data:

1. **Test the Dashboard** - View stats and active jobs
2. **Respond to Requests** - Accept or decline job requests
3. **Update Status** - Mark jobs as in progress or completed
4. **Manage Profile** - Edit provider information and skills
5. **Test Notifications** - Check notification system

## Need More Data?

To add more service requests, modify the seed SQL file:
- `supabase/migrations/20260620000000_010_service_provider_complete_seed.sql`
- Copy the INSERT statements and change values
- Run the script again

## Support

If you encounter issues:
1. Check the error message in console
2. Verify all previous migrations have been run
3. Ensure service categories are seeded (migration 008)
4. Check that the service provider user exists
