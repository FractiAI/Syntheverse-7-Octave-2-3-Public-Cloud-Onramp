# 🚀 Quick Start Testing Guide

## 4-Phase Testing Approach

### Phase 1: Authentication (Start Here)
**Goal:** Verify user registration, login, and OAuth work
**Time:** 15-30 minutes
**Requirements:** Supabase project

```bash
# 1. Set up environment
cp .env.example .env.local
# Edit with your Supabase credentials

# 2. Install and run
npm install
npm run db:migrate
npm run dev

# 3. Test authentication
node test-auth.js
```

### Phase 2: Stripe Billing
**Goal:** Verify subscriptions, payments, and webhooks
**Time:** 20-45 minutes
**Requirements:** Stripe test account

```bash
# 1. Configure Stripe
# Edit .env.local with Stripe keys

# 2. Set up products
npm run stripe:setup

# 3. Start webhook listener (separate terminal)
npm run stripe:listen

# 4. Test billing
node test-stripe.js
```

### Phase 3: PoC API Integration
**Goal:** Verify contribution submission interface
**Time:** 10-15 minutes
**Requirements:** None (demo mode)

```bash
# Test the UI (demo implementation)
node test-poc-api.js
```

### Phase 4: Vercel Deployment
**Goal:** Deploy to production and verify
**Time:** 15-30 minutes
**Requirements:** Vercel account

```bash
# 1. Deploy to Vercel
# Import repo, configure env vars

# 2. Test deployment
node test-vercel.js
```

## 🏃‍♂️ Express Testing (All Phases)

```bash
# Run complete testing suite
node run-all-tests.js
```

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase project created
- [ ] Stripe test account created
- [ ] Git repository set up
- [ ] Vercel account (for Phase 4)

## 🔧 Quick Fixes

### Environment Issues
```bash
# Copy example environment
cp .env.example .env.local

# Edit with your actual keys
nano .env.local
```

### Database Issues
```bash
# Run migrations
npm run db:migrate

# Reset if needed
npm run db:push
```

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

## 🎯 Success Criteria

- ✅ **Phase 1:** Can register, login, and access dashboard
- ✅ **Phase 2:** Can subscribe to plans and manage billing
- ✅ **Phase 3:** Submission interface loads and functions
- ✅ **Phase 4:** App works perfectly on Vercel production

## 📞 Need Help?

1. **Check console errors** in browser dev tools
2. **Verify environment variables** are correct
3. **Check Supabase/Stripe dashboards** for issues
4. **Run individual test scripts** for detailed guidance
5. **Review TESTING_PLAN.md** for comprehensive instructions

---

**Ready to start? Run `node test-auth.js` and begin Phase 1! 🎉**

