# Syntheverse PoC Contributor UI

A production-ready web application for the Syntheverse Proof of Contribution system, featuring a dark, minimal, futuristic UI. Built for deployment on Vercel (frontend + API routes) and Supabase (auth + database) using free tiers.

## ✨ Features

- **Hydrogen-Holographic Evaluation**: AI-powered contribution scoring across novelty, density, coherence, and alignment dimensions
- **Metallic Amplifications**: Gold (1.5×), Silver (1.2×), and Copper (1.15×) reward multipliers
- **SYNTH Token Rewards**: Blockchain-anchored token allocations with $200 registration fees
- **Secure Authentication**: Supabase-powered auth with Google/GitHub OAuth and email/password
- **Real-time Dashboard**: Live evaluation status and ecosystem impact visualization
- **Stripe Integration**: Subscription management and payment processing
- **Dark UI Theme**: Minimal, futuristic design inspired by Syntheverse aesthetics
- **Archive-First Storage**: All contributions stored immediately for redundancy detection

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, shadcn/ui
- **Authentication**: Supabase Auth (OAuth + email/password)
- **Database**: PostgreSQL with Drizzle ORM
- **Payments**: Stripe Checkout + Customer Portal
- **Deployment**: Vercel (free tier compatible)
- **Blockchain**: Base network integration for SYNTH token rewards

## 🚀 Deployment Instructions

### 1. Deploy to Vercel

1. **Connect Repository**: Import this GitHub repository to Vercel
2. **Environment Variables**: Add all required environment variables (see `.env.example`)
3. **Build Settings**: Vercel will automatically detect Next.js and configure appropriately
4. **Domain**: Vercel provides a free `.vercel.app` domain or connect your custom domain

### 2. Create Supabase Project

1. **New Project**: Create a new project at [Supabase](https://app.supabase.io/)
2. **Project Settings**: Note your Project URL and API keys
3. **Database**: Supabase provides PostgreSQL database automatically
4. **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret!)

### 3. Configure OAuth (Optional)

#### Google OAuth
1. Follow [Supabase Google OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
2. Add to environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

#### GitHub OAuth
1. Follow [Supabase GitHub OAuth setup](https://supabase.com/docs/guides/auth/social-login/auth-github)
2. Add to environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

### 4. Enable Stripe Test Mode

1. **Create Stripe Account**: Sign up at [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Test Mode**: Ensure you're in test mode (not live mode)
3. **API Keys**: Get your test keys from the dashboard
4. **Environment Variables**:
   - `STRIPE_SECRET_KEY`: Test secret key (starts with `sk_test_`)
   - `STRIPE_WEBHOOK_SECRET`: Webhook endpoint secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Test publishable key (starts with `pk_test_`)

### 5. Database Setup

The app uses Drizzle ORM with PostgreSQL. Supabase provides the database automatically.

```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate
```
### Setup OAuth with Social Providers

#### Setup redirect url
1. Go to Supabase dashboard
2. Go to Authentication > Url Configuration
3. Place production url into "Site URL".
<img width="1093" alt="image" src="https://github.com/user-attachments/assets/c10a5233-ad47-4005-b9ae-ad80fc626022">



### Setup Stripe

In order to collect payments and setup subscriptions for your users, we will be making use of [Stripe Checkout](https://stripe.com/payments/checkout) and [Stripe Pricing Tables](https://docs.stripe.com/payments/checkout/pricing-table) and [Stripe Webhooks](https://docs.stripe.com/webhooks)

1. [Register for Stripe](https://dashboard.stripe.com/register)
2. get your `STRIPE_SECRET_KEY` key and add it to `.env`. Stripe has both a Test and Production API key. Once you verify your business on Stripe, you will be able to get access to production mode in Stripe which would come with a production API key. But until then, we can use [Stripe's Test Mode](https://docs.stripe.com/test-mode) to build our app

![image](https://github.com/user-attachments/assets/01da4beb-ae1d-45df-9de8-ca5e2b2c3470)

4. Open up `stripeSetup.ts` and change your product information
5. run `npm run stripe:setup` to setup your Stripe product
6. [Create a new Pricing Table](https://dashboard.stripe.com/test/pricing-tables) and add your newly created products
7. When creating your new Pricing Table, set the *Confirmation Page* to *Don't show confirmation page*. Add [YOUR_PUBLIC_URL/subscribe/success](YOUR_PUBLIC_URL/subscribe/success) as the value(use [http://localhost:3000/subscribe/success](http://localhost:3000/subscribe/success) for local development). This will redirect the user to your main dashboard when they have completed their checkout. For prod, this will be your public url

![image](https://github.com/user-attachments/assets/af8e9dda-3297-4e04-baa0-de7eac2a1579)


8. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` to `.env` 
![image](https://github.com/user-attachments/assets/3b1a53d3-d2d4-4523-9e0e-87b63d9108a8)

Your pricing table should now be set up

### Setup Database
This boilerplate uses Drizzle ORM to interact with a PostgresDb. 

Before we start, please ensure that you have `DATABASE_URL` set.

To create the necessary tables to start, run `npm run db:migrate`

#### To alter or add a table
1. navigate to `/utils/db/schema.ts`
2. Edit/add a table
3. run `npm run db:generate` to generate migration files
4. run `npm run db:migrate` to apply migration

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Setup Stripe for Local Development
To receive webhook events from Stripe while developing locally, follow these steps:

1. **Install the Stripe CLI**  
Download and install the [Stripe CLI](https://docs.stripe.com/stripe-cli) if you haven’t already. This tool allows your local server to receive webhook events from Stripe.

2. **Start the webhook listener**  
Run the following command to forward Stripe events to your local server:

```bash
npm run stripe:listen
```

This command starts the Stripe CLI in listening mode and forwards incoming webhook events to `http://localhost:3000/webhook/stripe`. 

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Database setup
npm run db:migrate

# Start development server
npm run dev
```

### Local Stripe Testing

```bash
# Install Stripe CLI
# Start webhook listener
npm run stripe:listen
```

## 📋 Environment Variables

See `.env.example` for all required environment variables:

- **Supabase**: Project URL, anon key, service role key
- **Stripe**: Secret key, webhook secret, publishable key
- **OAuth**: Google/GitHub client IDs and secrets (optional)
- **Site**: Public site URL

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use Stripe test mode for development
- Keep Supabase service role key secret
- Regularly rotate API keys in production

---

Built with ❤️ for the Syntheverse ecosystem
