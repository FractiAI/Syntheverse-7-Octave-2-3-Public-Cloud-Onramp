# 🚀 Local Testing Guide - Syntheverse PoC

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (for cloning if needed)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (Required for billing features)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# OAuth (Optional - remove if not using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Set Up Database

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## Detailed Setup Instructions

### Setting up Supabase

1. **Create a new project** at [Supabase](https://app.supabase.io/)

2. **Get your project credentials**:
   - Go to Settings → API
   - Copy the Project URL and anon/public key
   - Copy the service_role key (keep this secret!)

3. **Configure Site URL**:
   - Go to Authentication → URL Configuration
   - Set Site URL to: `http://localhost:3000`

4. **Enable OAuth providers** (optional):
   - Google: Follow [Supabase Google OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
   - GitHub: Follow [Supabase GitHub OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-github)

### Setting up Stripe

1. **Create a Stripe account** at [Stripe Dashboard](https://dashboard.stripe.com/)

2. **Enable test mode** (stay in test mode for development)

3. **Get your API keys**:
   - Go to Developers → API keys
   - Copy the "Publishable key" (starts with `pk_test_`)
   - Copy the "Secret key" (starts with `sk_test_`)

4. **Create a webhook endpoint** (for subscription events):

   ```bash
   # Install Stripe CLI
   # Login to your Stripe account
   stripe login

   # Start webhook listener
   npm run stripe:listen
   ```

   This will forward webhooks to `http://localhost:3000/webhook/stripe`

5. **Create products** (optional - for testing pricing):
   ```bash
   npm run stripe:setup
   ```

## Testing Features

### Core Functionality

✅ **Landing Page**: Visit http://localhost:3000

- View Syntheverse branding and features
- See pricing tiers (Copper, Silver, Gold)

✅ **Authentication**:

- Sign up with email/password
- Sign in with existing account
- Google/GitHub OAuth (if configured)

✅ **Protected Routes**:

- Dashboard at `/dashboard`
- Account page at `/account`
- Billing page at `/subscribe`

### Expected Behavior

1. **Without API keys**: Basic UI will load but auth/database features will fail gracefully
2. **With Supabase**: Full authentication and user management
3. **With Stripe**: Subscription management and payment processing
4. **With OAuth**: Social login options

### Common Issues & Solutions

#### Database Connection Issues

```bash
# Reset database
npm run db:push

# Or drop and recreate
npm run db:migrate
```

#### Stripe Webhook Testing

```bash
# Start webhook listener in one terminal
npm run stripe:listen

# Trigger test webhooks from Stripe Dashboard
# Go to Developers → Webhooks → Test
```

#### OAuth Redirect Issues

- Make sure Site URL in Supabase matches exactly: `http://localhost:3000`
- For production, update to your deployment URL

## Development Workflow

### Making Changes

1. **UI Changes**: Edit components in `/components` or pages in `/app`
2. **Database Changes**: Update schema in `/utils/db/schema.ts`
3. **API Routes**: Modify routes in `/app/api` or `/app/webhook`

### Testing Commands

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run build

# Database operations
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open database UI
```

## Production Deployment

When ready for production:

1. **Deploy to Vercel** following the README instructions
2. **Update environment variables** in Vercel dashboard
3. **Configure production Supabase project**
4. **Set up production Stripe account**
5. **Update OAuth redirect URLs**

## Troubleshooting

### Build Errors

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Database Issues

- Check DATABASE_URL in environment variables
- Verify Supabase project is active
- Run migrations: `npm run db:migrate`

### Authentication Issues

- Verify Supabase URL and keys
- Check Site URL configuration in Supabase
- Ensure OAuth providers are properly configured

### Stripe Issues

- Confirm you're using test keys (not live)
- Check webhook endpoint URL
- Verify webhook signing secret

## Need Help?

- Check the [README.md](README.md) for detailed deployment instructions
- Review Supabase and Stripe documentation
- Check browser console for detailed error messages

Happy testing! 🎉
