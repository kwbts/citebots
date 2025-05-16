# Supabase Setup Guide

## Step 1: Create Supabase Account

1. Go to https://app.supabase.com/
2. Sign up with GitHub or email
3. Verify your email if needed

## Step 2: Create New Project

1. Click "New Project"
2. Fill in:
   - **Name**: citebots-prod
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait ~2 minutes for provisioning

## Step 3: Get Your API Keys

Once project is created:

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: Long string starting with `eyJ...`
   - **service_role**: Different long string (KEEP SECRET!)

## Step 4: Update Your .env File

Open `.env` file and replace with your actual values:

```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_KEY=your-actual-service-key
```

## Step 5: Run Database Setup

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Open `/scripts/supabase-setup.sql` from your project
4. Copy ALL the content
5. Paste into SQL editor
6. Click "Run" button
7. You should see "Success" message

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under "Auth Providers" → **Email** should be enabled
3. Under "Email Settings":
   - Toggle OFF "Enable email confirmations" (for testing)
   - Toggle OFF "Enable email signup"
4. Click "Save"

## Step 7: Test Your Setup

1. Run `npm run dev`
2. Check browser console for errors
3. Try the Request Access form

## Verification Checklist

- [ ] Project created and running
- [ ] API keys copied to .env
- [ ] Database tables created
- [ ] RLS policies active
- [ ] Email auth configured

## Troubleshooting

### Can't find API keys?
- Settings → API → Look for "Project URL" and "Project API keys"

### SQL errors?
- Make sure you copied the entire SQL file
- Check for syntax errors in error message

### Auth errors?
- Verify your .env variables match exactly
- Check if email auth is enabled
- Make sure service key is in SUPABASE_SERVICE_KEY

### Connection errors?
- Check if project is fully provisioned (green status)
- Verify URL has correct format (https://xxxxx.supabase.co)
- Ensure no typos in .env file

## Security Notes

1. NEVER commit .env file to git
2. Keep service_role key secret
3. anon key is safe for frontend use
4. Use RLS for data security