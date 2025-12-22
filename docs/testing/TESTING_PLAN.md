# 🔬 Syntheverse PoC Testing Plan

## Phase 1: Authentication Testing

### Prerequisites
- Supabase project created
- Environment variables configured
- Local development server running

### Test Cases

#### ✅ Basic Authentication
- [ ] Email/password signup works
- [ ] Email confirmation (if enabled)
- [ ] Email/password login works
- [ ] Password reset flow works
- [ ] Logout functionality works
- [ ] Protected routes redirect correctly

#### ✅ OAuth Authentication
- [ ] Google OAuth configured in Supabase
- [ ] GitHub OAuth configured in Supabase
- [ ] Google sign-in redirects correctly
- [ ] GitHub sign-in redirects correctly
- [ ] OAuth users created in database
- [ ] OAuth users have Stripe customers created

#### ✅ User Management
- [ ] User profile accessible
- [ ] User data stored correctly
- [ ] Session persistence works
- [ ] Cross-device login works

## Phase 2: Stripe Billing Testing

### Prerequisites
- Stripe test account created
- Stripe products/prices created
- Webhook endpoint configured
- Environment variables configured

### Test Cases

#### ✅ Subscription Management
- [ ] Pricing page loads correctly
- [ ] Stripe checkout redirects work
- [ ] Subscription creation succeeds
- [ ] Database plan field updates
- [ ] Customer portal access works

#### ✅ Webhook Processing
- [ ] Webhook endpoint receives events
- [ ] Subscription updates processed
- [ ] Plan changes reflected in database
- [ ] Error handling works

#### ✅ Billing Features
- [ ] Subscription status displays correctly
- [ ] Plan upgrades/downgrades work
- [ ] Billing history accessible
- [ ] Payment method management works

## Phase 3: PoC API Integration Testing

### Prerequisites
- PoC API server running (if available)
- API endpoints configured
- Database migrations completed

### Test Cases

#### ✅ PoC Submission
- [ ] Submission form accepts input
- [ ] File upload works (if implemented)
- [ ] API calls succeed
- [ ] Progress indicators work
- [ ] Success/error handling works

#### ✅ Evaluation System
- [ ] Evaluation status updates
- [ ] Results display correctly
- [ ] Metallic amplifications calculated
- [ ] Token rewards processed

#### ✅ Archive Integration
- [ ] Contribution storage works
- [ ] Archive browsing functions
- [ ] Redundancy detection works
- [ ] Search/filtering works

## Phase 4: Vercel Deployment Testing

### Prerequisites
- Vercel account created
- Repository connected to Vercel
- Environment variables configured in Vercel

### Test Cases

#### ✅ Deployment Success
- [ ] Vercel build completes successfully
- [ ] Application loads on Vercel domain
- [ ] All routes accessible
- [ ] Static assets load correctly

#### ✅ Production Environment
- [ ] Supabase production connection works
- [ ] Stripe production keys work
- [ ] OAuth redirect URLs updated
- [ ] Database connections stable

#### ✅ Performance & Security
- [ ] Page load times acceptable
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Error boundaries work

---

## 🧪 Testing Commands

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:migrate

# Start Stripe webhook listener (in separate terminal)
npm run stripe:listen

# Build for production
npm run build

# Start production server locally
npm start

# Run testing scripts
node test-auth.js      # Phase 1: Authentication testing
node test-stripe.js    # Phase 2: Stripe billing testing
node test-poc-api.js   # Phase 3: PoC API integration testing
node test-vercel.js    # Phase 4: Vercel deployment testing
node test-basic.js     # Basic setup verification
```

## 📊 Test Results Tracking

Use this checklist to track your testing progress:

### Phase 1 Results
- [ ] All auth tests passed: ____/____
- [ ] OAuth tests passed: ____/____
- [ ] Issues found: ____________________
- [ ] Notes: __________________________

### Phase 2 Results
- [ ] Stripe tests passed: ____/____
- [ ] Webhook tests passed: ____/____
- [ ] Issues found: ____________________
- [ ] Notes: __________________________

### Phase 3 Results
- [ ] PoC API tests passed: ____/____
- [ ] Evaluation tests passed: ____/____
- [ ] Issues found: ____________________
- [ ] Notes: __________________________

### Phase 4 Results
- [ ] Vercel deployment: SUCCESS/FAILED
- [ ] Production tests passed: ____/____
- [ ] Issues found: ____________________
- [ ] Notes: __________________________

## 🚨 Common Issues & Solutions

### Authentication Issues
- **"Invalid login credentials"**: Check email confirmation settings in Supabase
- **OAuth redirect errors**: Verify callback URLs in Supabase and OAuth provider settings
- **Session not persisting**: Check NEXT_PUBLIC_SITE_URL environment variable

### Stripe Issues
- **Webhook signature verification fails**: Ensure STRIPE_WEBHOOK_SECRET is correct
- **Checkout redirects not working**: Check NEXT_PUBLIC_SITE_URL and success URLs
- **Customer portal not loading**: Verify Stripe dashboard configuration

### Database Issues
- **Migration errors**: Check DATABASE_URL and Supabase database permissions
- **Connection timeouts**: Verify Supabase project is active and accessible

### Vercel Issues
- **Build failures**: Check environment variables are set in Vercel dashboard
- **Runtime errors**: Compare local vs production environment configurations
- **OAuth redirects**: Update redirect URLs for production domain

## 📞 Support

If you encounter issues during testing:
1. Check browser developer console for errors
2. Verify environment variables are correct
3. Check Supabase/Stripe dashboards for error logs
4. Review server logs for detailed error messages
5. Test with minimal configuration first, then add features

---

**Ready to start testing? Begin with Phase 1: Authentication! 🚀**
