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

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Payments**: Stripe Checkout + Customer Portal
- **Deployment**: Vercel
- **Language**: TypeScript

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free tier)
- Stripe account (test mode)
- Vercel account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe.git
cd Syntheverse_PoC_Contributer_UI_Vercel_Stripe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

# Site URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth (Optional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

See [docs/deployment/VERCEL_ENV_SETUP.md](docs/deployment/VERCEL_ENV_SETUP.md) for detailed setup instructions.

### Database Setup

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

### Development

```bash
# Start development server
npm run dev

# In another terminal, start Stripe webhook listener (for local testing)
npm run stripe:listen
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)** - Complete Vercel deployment walkthrough
- **[OAuth Setup](docs/oauth/OAUTH_QUICK_SETUP.md)** - Google and GitHub OAuth configuration
- **[Stripe Setup](docs/stripe/STRIPE_WEBHOOK_SETUP.md)** - Payment and webhook configuration
- **[Testing Guide](docs/testing/TESTING_PLAN.md)** - Testing strategies and debugging
- **[Supabase Setup](docs/supabase/)** - Database and authentication configuration

## 🗂️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/               # Authentication routes
│   ├── dashboard/          # Protected dashboard pages
│   └── ...
├── components/             # React components
│   └── ui/                 # shadcn/ui components
├── docs/                   # Documentation
│   ├── deployment/         # Deployment guides
│   ├── oauth/              # OAuth setup guides
│   ├── stripe/             # Stripe integration guides
│   ├── supabase/           # Supabase configuration
│   └── testing/            # Testing and debugging
├── scripts/                # Utility scripts
├── utils/                  # Utility functions
│   ├── db/                 # Database utilities
│   ├── stripe/             # Stripe API utilities
│   └── supabase/           # Supabase client utilities
└── public/                 # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate database migrations
npm run db:migrate       # Run database migrations

# Stripe
npm run stripe:setup     # Setup Stripe products
npm run stripe:listen    # Listen to Stripe webhooks locally

# Testing
npm run test             # Run tests (if configured)
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Import this GitHub repository to Vercel
2. **Environment Variables**: Add all required variables in Vercel dashboard
3. **Deploy**: Vercel will automatically deploy on push to main branch

See [docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

## 🔒 Security

- ✅ Environment variables are never committed to git
- ✅ Supabase service role key is kept secret
- ✅ Stripe webhook signatures are verified
- ✅ OAuth redirects are validated
- ✅ All API routes are protected

**Important**: Never commit `.env` files or expose API keys in the repository.

## 🐛 Troubleshooting

### Common Issues

- **Authentication not persisting**: Check [docs/testing/DEBUG_SESSION_ISSUE.md](docs/testing/DEBUG_SESSION_ISSUE.md)
- **OAuth not working**: See [docs/oauth/OAUTH_TROUBLESHOOTING.md](docs/oauth/OAUTH_TROUBLESHOOTING.md)
- **Database connection errors**: Check [docs/supabase/HOW_TO_GET_DATABASE_URL.md](docs/supabase/HOW_TO_GET_DATABASE_URL.md)
- **Stripe webhook issues**: See [docs/stripe/STRIPE_WEBHOOK_SETUP.md](docs/stripe/STRIPE_WEBHOOK_SETUP.md)

## 📝 License

[Add your license here]

## 🤝 Contributing

[Add contributing guidelines here]

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the Syntheverse ecosystem
