# Valentine Message Generator - Complete Setup Guide

A modern, full-stack Valentine's Day message generator with email notifications and admin dashboard.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Deployment**: Vercel (recommended)

## Features

- 💌 Generate personalized Valentine message links
- 🎯 Interactive "No" button that dodges the cursor
- 💖 Growing "Yes" button
- 🎉 Hearts & confetti celebration animation
- 📧 Email notifications via Resend
- 👑 Admin dashboard with analytics
- 📊 Real-time statistics (total messages, clicks, conversion rate)
- 🔐 Password-protected admin access
- 📱 Fully responsive mobile design

---

## Prerequisites

Before you begin, you'll need:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **A Supabase account** (free) - [Sign up here](https://supabase.com/)
3. **A Resend account** (free) - [Sign up here](https://resend.com/)
4. **A Vercel account** (optional, for deployment) - [Sign up here](https://vercel.com/)

---

## Step 1: Supabase Setup

### 1.1 Create a New Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - Project name: `valentine-app` (or any name)
   - Database password: (save this securely)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (~2 minutes)

### 1.2 Get Your API Keys

1. In your Supabase project dashboard, click on "Settings" (gear icon)
2. Go to "API" section
3. You'll see:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
4. Copy both of these - you'll need them soon!

### 1.3 Set Up Database Tables

1. In your Supabase dashboard, click on "SQL Editor" (database icon)
2. Click "New Query"
3. Copy the entire contents of the `supabase-schema.sql` file
4. Paste it into the SQL editor
5. Click "Run" or press Cmd/Ctrl + Enter
6. You should see "Success. No rows returned"

This creates:
- `messages` table - stores all generated links
- `clicks` table - tracks when someone clicks "Yes"
- Indexes for performance
- Row Level Security policies

---

## Step 2: Resend Setup

### 2.1 Get Your API Key

You already have your Resend API key:
```
re_LS9UYz4m_Bz4Zd3VrfESSHLwgPsyZ4HAz
```

### 2.2 Verify Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. Go to [https://resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually 5-10 minutes)

**For testing**, you can use `onboarding@resend.dev` (already configured in the code).

### 2.3 Update "From" Email (Optional)

If you verified your domain, update the email sender in:

`app/api/click/route.ts` (line ~86):
```typescript
from: 'Valentine App <noreply@yourdomain.com>',
```

---

## Step 3: Local Development Setup

### 3.1 Navigate to Project Directory

```bash
cd valentine-app
```

### 3.2 Configure Environment Variables

Edit the `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here

# Resend Email API Key
RESEND_API_KEY=re_LS9UYz4m_Bz4Zd3VrfESSHLwgPsyZ4HAz

# Admin Authentication
ADMIN_PASSWORD=your_secure_password_here
```

**Important**:
- Replace `NEXT_PUBLIC_SUPABASE_URL` with your Project URL from Step 1.2
- Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key from Step 1.2
- Change `ADMIN_PASSWORD` to a strong, secure password

### 3.3 Install Dependencies

```bash
npm install
```

### 3.4 Run Development Server

```bash
npm run dev
```

The app will start at [http://localhost:3000](http://localhost:3000)

---

## Step 4: Testing Locally

### 4.1 Test Message Generation

1. Open [http://localhost:3000](http://localhost:3000)
2. Fill in:
   - Recipient name: "Sarah"
   - Your email: your real email address
   - Your name: "John" (optional)
3. Click "Generate Link"
4. Copy the generated link

### 4.2 Test Valentine Page

1. Open the generated link in a new tab
2. Verify the recipient name appears correctly
3. Move your cursor near the "No" button - it should run away!
4. Watch the "Yes" button grow bigger
5. Click "Yes"
6. You should see:
   - Hearts floating up
   - Confetti falling
   - Celebration message

### 4.3 Test Email Notification

1. Check your email inbox
2. You should receive an email with subject: "💖 Someone said YES to your Valentine!"
3. The email contains the recipient's name and timestamp

**Note**: If you don't receive the email:
- Check your spam folder
- Verify your Resend API key is correct
- Check Resend dashboard for logs: [https://resend.com/emails](https://resend.com/emails)

### 4.4 Test Admin Dashboard

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. It should redirect you to the login page
3. Enter your admin password from `.env.local`
4. Click "Login"
5. You should see:
   - Total messages count
   - Total clicks count
   - Conversion rate
   - Unique senders count
   - Table with all messages and their status

---

## Step 5: Deploy to Vercel

### 5.1 Push to GitHub

1. Create a new repository on GitHub
2. Initialize git in your project:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/valentine-app.git
git push -u origin main
```

### 5.2 Deploy to Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click on "Environment Variables"
5. Add all variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_PASSWORD`
6. Click "Deploy"
7. Wait for deployment (~2 minutes)

### 5.3 Access Your Live Site

Once deployed, you'll get a URL like: `https://valentine-app-xxxxx.vercel.app`

Test everything again on the live site!

---

## Step 6: Customization

### 6.1 Change Colors

Edit the gradient backgrounds in:
- `app/page.tsx` - Line 49
- `app/valentine/page.tsx` - Line 144
- `app/admin/login/page.tsx` - Line 26

Example:
```tsx
style={{
  background: 'linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%)'
}}
```

### 6.2 Change Admin Password

Update `ADMIN_PASSWORD` in:
- `.env.local` (local development)
- Vercel Environment Variables (production)

After changing, redeploy on Vercel.

### 6.3 Customize Email Template

Edit `app/api/click/route.ts` around line 81-110 to customize the email HTML.

### 6.4 Adjust "No" Button Sensitivity

In `app/valentine/page.tsx`, line 45:
```typescript
if (distance < 120) {  // Change 120 to make it more/less sensitive
```

Lower number = button moves when cursor is closer
Higher number = button moves when cursor is farther away

---

## Troubleshooting

### Email Not Sending

**Problem**: No email arrives after clicking "Yes"

**Solutions**:
1. Check Resend dashboard logs: [https://resend.com/emails](https://resend.com/emails)
2. Verify `RESEND_API_KEY` is correct in `.env.local`
3. Check spam/junk folder
4. Ensure email is not blocked by your provider
5. Try sending from verified domain instead of `onboarding@resend.dev`

### Database Errors

**Problem**: "Database error" when generating links

**Solutions**:
1. Verify Supabase credentials in `.env.local`
2. Check SQL schema was run correctly
3. Go to Supabase Dashboard → Table Editor → verify `messages` and `clicks` tables exist
4. Check Row Level Security policies are enabled

### Admin Login Not Working

**Problem**: "Invalid password" even with correct password

**Solutions**:
1. Check `ADMIN_PASSWORD` in `.env.local` matches what you're typing
2. No spaces before/after password in `.env.local`
3. Restart dev server after changing `.env.local`
4. Clear browser cache and session storage

### "No" Button Not Moving

**Problem**: Button doesn't dodge cursor

**Solutions**:
1. Check JavaScript console for errors
2. Ensure you're testing in a modern browser (Chrome, Firefox, Safari, Edge)
3. Try on desktop (touch behavior on mobile is different)
4. Check `handleMouseMove` function in `app/valentine/page.tsx`

### Build Errors on Vercel

**Problem**: Deployment fails with TypeScript errors

**Solutions**:
1. Run `npm run build` locally first
2. Fix any TypeScript errors shown
3. Ensure all environment variables are set in Vercel
4. Check Node.js version (should be 18+)

---

## Database Schema Reference

### messages table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| recipient_name | TEXT | Name of person receiving the message |
| sender_email | TEXT | Email to notify when clicked |
| sender_name | TEXT | Optional sender name |
| created_at | TIMESTAMP | When link was created |
| clicked | BOOLEAN | Whether "Yes" was clicked |
| clicked_at | TIMESTAMP | When "Yes" was clicked |

### clicks table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| message_id | UUID | Foreign key to messages |
| recipient_name | TEXT | Copy of recipient name |
| sender_email | TEXT | Copy of sender email |
| clicked_at | TIMESTAMP | When click occurred |

---

## API Routes Reference

### POST /api/generate

Generate a new Valentine message link.

**Request Body**:
```json
{
  "recipientName": "Sarah",
  "senderEmail": "john@example.com",
  "senderName": "John"
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "uuid-here"
}
```

### GET /api/message?id={messageId}

Fetch message details by ID.

**Response**:
```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "recipient_name": "Sarah",
    "sender_email": "john@example.com",
    "sender_name": "John",
    "created_at": "2024-02-06T...",
    "clicked": false,
    "clicked_at": null
  }
}
```

### POST /api/click

Record a "Yes" click and send email notification.

**Request Body**:
```json
{
  "messageId": "uuid-here"
}
```

**Response**:
```json
{
  "success": true,
  "alreadyClicked": false
}
```

---

## Security Considerations

### Admin Authentication

The current implementation uses a simple password stored in environment variables. For production with multiple admins, consider:

1. Implementing proper authentication with NextAuth.js
2. Using Supabase Auth for admin users
3. Adding 2FA (two-factor authentication)

### Environment Variables

Never commit `.env.local` to git (it's in `.gitignore`).

For team collaboration:
1. Share `.env.example` (without real values)
2. Use a password manager for real credentials
3. Rotate API keys regularly

### Rate Limiting

Consider adding rate limiting to prevent abuse:

1. Use Vercel's built-in rate limiting
2. Add rate limiting middleware to API routes
3. Implement CAPTCHA on the generator form

---

## Performance Optimization

### Database Indexes

Already included in schema:
- `idx_messages_sender_email` - Fast sender lookups
- `idx_messages_created_at` - Fast sorting by date
- `idx_clicks_message_id` - Fast click lookups

### Caching

Consider adding caching for admin dashboard:
```typescript
// In app/admin/page.tsx
const { data, error } = await supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100) // Limit results for better performance
```

### Images

The celebration GIF is loaded from Giphy. For better performance:
1. Download the GIF
2. Place in `public/celebration.gif`
3. Update image src to `/celebration.gif`

---

## Monitoring & Analytics

### Supabase Dashboard

Monitor your database:
1. Go to Supabase Dashboard → Database
2. Check table sizes and row counts
3. Monitor API usage in "Settings" → "API"

### Resend Dashboard

Monitor email delivery:
1. Go to [https://resend.com/emails](https://resend.com/emails)
2. Check delivery status
3. View bounce/complaint rates

### Vercel Analytics

Add Vercel Analytics (free):

```bash
npm install @vercel/analytics
```

In `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Cost Breakdown

All services offer generous free tiers:

### Supabase (Free Tier)
- ✅ 500 MB database storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth
- **Cost**: $0/month

### Resend (Free Tier)
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- **Cost**: $0/month

### Vercel (Hobby Tier)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- **Cost**: $0/month

**Total**: $0/month for thousands of users!

---

## Support & Resources

- **Next.js Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Resend Docs**: [https://resend.com/docs](https://resend.com/docs)
- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)

---

## License

Free to use and modify for personal projects. Share the love! 💕

---

Made with ❤️ for spreading love and smiles!
