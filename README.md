# Valentine Message Generator 💕

A modern, full-stack Valentine's Day message generator with playful animations, email notifications, and an admin dashboard.

![Valentine App](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![Resend](https://img.shields.io/badge/Resend-Email-orange?style=flat-square)

## Features

- 💌 **Generate Shareable Links** - Create personalized Valentine messages
- 🎯 **Moving "No" Button** - Button playfully dodges the cursor
- 💖 **Growing "Yes" Button** - Gets bigger each time they try to click "No"
- 🎉 **Celebration Animation** - Hearts and confetti when they click "Yes"
- 📧 **Email Notifications** - Get notified via email when someone says yes
- 👑 **Admin Dashboard** - View analytics, track all messages and clicks
- 📊 **Real-time Stats** - Total messages, clicks, conversion rate
- 🔐 **Password Protected** - Secure admin access
- 📱 **Fully Responsive** - Works beautifully on mobile and desktop

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase account (free)
- A Resend account (free)

### Installation

1. **Clone and install**

```bash
cd valentine-app
npm install
```

2. **Set up Supabase**

- Create a project at [supabase.com](https://supabase.com)
- Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor
- Copy your Project URL and anon key

3. **Configure environment variables**

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=re_LS9UYz4m_Bz4Zd3VrfESSHLwgPsyZ4HAz
ADMIN_PASSWORD=your_secure_password
```

4. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Full Setup Guide

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## How It Works

### For Senders

1. Visit the homepage
2. Enter recipient's name and your email
3. Generate and share the link via WhatsApp, text, etc.
4. Get an email when they click "Yes"!

### For Recipients

1. Click the link
2. See the personalized Valentine message
3. Try to click "No" (it runs away!)
4. Watch "Yes" button grow bigger
5. Click "Yes" to trigger celebration

### For Admins

1. Visit `/admin` and login
2. See real-time analytics:
   - Total messages generated
   - Total "Yes" clicks
   - Conversion rate
   - All message details

## Project Structure

```
valentine-app/
├── app/
│   ├── page.tsx              # Homepage (generator)
│   ├── valentine/
│   │   └── page.tsx          # Valentine proposal page
│   ├── admin/
│   │   ├── page.tsx          # Admin dashboard
│   │   └── login/
│   │       └── page.tsx      # Admin login
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts      # Generate link API
│   │   ├── message/
│   │   │   └── route.ts      # Fetch message API
│   │   └── click/
│   │       └── route.ts      # Record click + send email
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   └── supabase.ts           # Supabase client
├── supabase-schema.sql       # Database schema
├── SETUP.md                  # Detailed setup guide
└── README.md                 # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `RESEND_API_KEY` | Your Resend API key for emails | Yes |
| `ADMIN_PASSWORD` | Password for admin dashboard | Yes |

## Database Schema

### `messages` table
- Stores all generated Valentine messages
- Tracks if/when someone clicked "Yes"

### `clicks` table
- Records each "Yes" click
- Used for analytics and tracking

See `supabase-schema.sql` for full schema.

## API Routes

### `POST /api/generate`
Generate a new Valentine message link

### `GET /api/message?id={id}`
Fetch message details

### `POST /api/click`
Record a click and send email notification

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Customization

- **Colors**: Edit gradients in each page component
- **Admin Password**: Change `ADMIN_PASSWORD` in `.env.local`
- **Email Template**: Customize in `app/api/click/route.ts`
- **Button Sensitivity**: Adjust distance value in `app/valentine/page.tsx`

## Troubleshooting

**Email not sending?**
- Check Resend dashboard logs
- Verify API key is correct
- Check spam folder

**Database errors?**
- Verify Supabase credentials
- Ensure schema was run correctly
- Check Row Level Security policies

See [SETUP.md](./SETUP.md) for more troubleshooting help.

## Free Tier Limits

- **Supabase**: 500 MB database, 50K MAU
- **Resend**: 3,000 emails/month
- **Vercel**: Unlimited deployments, 100 GB bandwidth

**Total Cost**: $0/month 🎉

## Screenshots

### Generator Page
![Generator](https://via.placeholder.com/800x400/ff6b9d/ffffff?text=Generator+Page)

### Valentine Page
![Valentine](https://via.placeholder.com/800x400/ff9a9e/ffffff?text=Valentine+Proposal)

### Admin Dashboard
![Admin](https://via.placeholder.com/800x400/667eea/ffffff?text=Admin+Dashboard)

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT License - Free to use and modify

## Support

For detailed setup help, see [SETUP.md](./SETUP.md)

---

Made with ❤️ for spreading love and smiles!

Happy Valentine's Day! 💕
