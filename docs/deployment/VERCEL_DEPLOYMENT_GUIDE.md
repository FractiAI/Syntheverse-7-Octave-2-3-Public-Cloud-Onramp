# 🚀 Vercel Deployment Guide - Syntheverse PoC Contributor UI

## 📋 Pre-Deployment Checklist

- [x] Vercel account created
- [ ] Project repository connected to Vercel
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Supabase OAuth redirect URLs updated
- [ ] Stripe webhooks configured for production

---

## Step 1: Connect Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click **"New Project"** or **"Add New..." → Project**

2. **Import Git Repository**
   - If your code is on GitHub/GitLab/Bitbucket, connect your Git provider
   - Select your repository: `Syntheverse_PoC_Contributer_UI_Vercel_Stripe`
   - Vercel will auto-detect Next.js framework

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (root of repository)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Deploy** (you can skip environment variables for now and add them later, or add them in the next step)

---

## Step 2: Configure Environment Variables

Go to **Project Settings → Environment Variables** in your Vercel project dashboard and add the following:

### Required Environment Variables

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres
```

**How to get these:**
- Go to your Supabase project dashboard
- Settings → API → Copy Project URL and anon key
- Settings → API → Copy service_role key (keep secret!)
- Settings → Database → Connection string → Copy URI connection string

#### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_WEBSITE_URL=https://your-app.vercel.app
```
**Note**: Replace `your-app.vercel.app` with your actual Vercel deployment URL (you'll get this after first deployment)

#### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID=prctbl_your_pricing_table_id
```

**How to get these:**
- Go to Stripe Dashboard → Developers → API keys
- Copy Test mode Secret key (starts with `sk_test_`)
- Copy Test mode Publishable key (starts with `pk_test_`)
- For Pricing Table ID: Dashboard → Products → Pricing Tables → Copy table ID

### Optional Environment Variables (if using OAuth)

#### Google OAuth
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### GitHub OAuth
```
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Environment Variable Settings

For each variable, select which environments it applies to:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

**Important**: 
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` in client-side code
- `STRIPE_WEBHOOK_SECRET` will be different for production (see Step 4)

---

## Step 3: Update Supabase Configuration

### Update Site URL in Supabase

1. **Go to Supabase Dashboard**
   - Your project → Authentication → URL Configuration

2. **Update Site URL**
   - Change from `http://localhost:3000` to your Vercel URL: `https://your-app.vercel.app`

3. **Update Redirect URLs** (if using OAuth)
   - Add to **Redirect URLs**:
     ```
     https://your-app.vercel.app/auth/callback
     https://your-app.vercel.app/**
     ```

### Update OAuth Provider Redirect URIs

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

#### GitHub OAuth
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Edit your OAuth App
3. Add to **Authorization callback URL**:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

---

## Step 4: Configure Stripe Webhooks for Production

1. **Go to Stripe Dashboard**
   - Developers → Webhooks

2. **Add Endpoint**
   - Click **"Add endpoint"**
   - Endpoint URL: `https://your-app.vercel.app/webhook/stripe`
   - Description: "Production webhook for Syntheverse PoC"

3. **Select Events to Listen To**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Copy Webhook Signing Secret**
   - After creating the endpoint, click on it
   - Copy the **Signing secret** (starts with `whsec_`)
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables

---

## Step 5: Run Database Migrations

After your first deployment, you need to run database migrations. You have two options:

### Option A: Run migrations via Vercel (Recommended)

1. **Add a migration script to package.json** (if not already there):
   ```json
   "scripts": {
     "postbuild": "drizzle-kit migrate"
   }
   ```
   This runs migrations automatically after build.

2. **Or run migrations manually:**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on a deployment → Functions tab
   - You can trigger a migration via an API route if you create one

### Option B: Run migrations locally with production DATABASE_URL

```bash
# Temporarily set production DATABASE_URL
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Run migrations
npm run db:migrate
```

**Note**: Make sure your local IP is allowed in Supabase → Settings → Database → Connection Pooling

---

## Step 6: Redeploy with Updated Configuration

1. **Trigger a new deployment**
   - Go to Vercel Dashboard → Your Project
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger automatic deployment

2. **Monitor the build**
   - Check build logs for any errors
   - Ensure all environment variables are set correctly
   - Verify database connection

---

## Step 7: Verify Deployment

### Test Checklist

- [ ] **Homepage loads**: Visit `https://your-app.vercel.app`
- [ ] **Authentication works**: Test sign up/login
- [ ] **OAuth works** (if enabled): Test Google/GitHub login
- [ ] **Database connection**: Verify user can be created/retrieved
- [ ] **Stripe checkout**: Test subscription flow
- [ ] **Webhooks**: Verify Stripe events are received (check Stripe Dashboard)
- [ ] **Protected routes**: Test dashboard access
- [ ] **Password reset**: Test forgot password flow

### Common Issues

**Build fails:**
- Check build logs in Vercel
- Verify all environment variables are set
- Ensure Node.js version is compatible (18+)

**Database connection fails:**
- Verify `DATABASE_URL` is correct
- Check Supabase database is running
- Verify IP restrictions in Supabase settings

**OAuth redirects fail:**
- Verify Site URL in Supabase matches Vercel URL
- Check redirect URLs in OAuth provider settings
- Ensure callback route exists: `/auth/callback`

**Stripe webhooks fail:**
- Verify webhook URL is correct in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` matches production webhook secret
- Test webhook events in Stripe Dashboard → Webhooks → Send test webhook

---

## Step 8: Set Up Custom Domain (Optional)

1. **Go to Vercel Project Settings**
   - Settings → Domains

2. **Add Domain**
   - Enter your custom domain (e.g., `app.yourdomain.com`)
   - Follow Vercel's DNS configuration instructions

3. **Update Environment Variables**
   - Update `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_WEBSITE_URL` to your custom domain
   - Update Supabase Site URL to match
   - Update Stripe webhook URL to match

---

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Enable Vercel Analytics in Project Settings
- Monitor performance metrics and Core Web Vitals

### Error Tracking
- Check Function Logs in Vercel Dashboard
- Monitor Supabase logs for database issues
- Check Stripe Dashboard for webhook failures

### Performance Optimization
- Monitor build times
- Check function execution times
- Optimize bundle size if needed

---

## 🔄 Continuous Deployment

Vercel automatically deploys on:
- Push to main/master branch → Production
- Push to other branches → Preview deployment
- Pull requests → Preview deployment with unique URL

To disable auto-deployment:
- Project Settings → Git → Configure Git Integration

---

## 🆘 Troubleshooting

### Build Errors
```bash
# Check build logs in Vercel Dashboard
# Common issues:
# - Missing dependencies in package.json
# - TypeScript errors
# - Missing environment variables
```

### Runtime Errors
```bash
# Check Function Logs in Vercel Dashboard
# Check browser console for client-side errors
# Verify all environment variables are set correctly
```

### Database Issues
```bash
# Verify DATABASE_URL is correct
# Check Supabase connection pooling settings
# Ensure migrations have run successfully
```

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Application loads without errors
- ✅ Users can sign up and log in
- ✅ Database operations work correctly
- ✅ Stripe checkout completes successfully
- ✅ Webhooks are received and processed
- ✅ All protected routes are accessible
- ✅ No console errors in browser
- ✅ Mobile responsive design works

---

## 📝 Next Steps After Deployment

1. **Set up monitoring alerts**
2. **Configure custom domain** (if desired)
3. **Set up production Stripe account** (move from test to live mode)
4. **Review security settings**
5. **Set up backup strategies**
6. **Document deployment process for team**

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Dashboard](https://app.supabase.io/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Congratulations! 🎉 Your Syntheverse PoC Contributor UI is now live on Vercel!**

