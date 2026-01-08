# 🚀 Quick Deploy Guide - Fix Zero Scores Issue

**Time Required:** 5 minutes  
**Steps:** 3 simple commands

---

## Step 1: Set Vercel Environment Variables (Automated)

Run this script to set both environment variables automatically:

```bash
cd /Users/macbook/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe
bash scripts/setup-vercel-env.sh
```

**What it does:**
- Sets `NEXT_PUBLIC_GROQ_API_KEY` (primary, correct spelling)
- Sets `NEXT_PUBLIC_GROK_API_KEY` (legacy, backwards compat)
- Sets for all environments (Production, Preview, Development)
- Uses your Vercel token automatically

---

## Step 2: Deploy to Production

```bash
# Commit all changes
git add -A
git commit -m "fix: Resolve zero scores - Update Groq API key handling"

# Push to trigger deployment
git push origin main
```

**OR** trigger manual deployment:

```bash
vercel --prod --token=sFGpBCc64T0Qn5aGCOksY7zm
```

---

## Step 3: Verify Fix in Supabase

### Quick Check (30 seconds)

Copy-paste this into Supabase SQL Editor:

```sql
-- Quick health check
SELECT 
    '🏥 SYSTEM STATUS' as check_type,
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE metadata->'grok_evaluation_details'->>'raw_grok_response' IS NOT NULL) as has_groq_responses,
    COUNT(*) FILTER (WHERE (metadata->>'pod_score')::numeric > 0) as has_nonzero_scores,
    ROUND(AVG((metadata->>'pod_score')::numeric), 2) as avg_score
FROM contributions
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Expected after fix:**
- `has_groq_responses` > 0
- `has_nonzero_scores` > 0
- `avg_score` between 4000-8000

### Full Diagnostics (if needed)

For comprehensive diagnostics, run all queries in:
```
scripts/supabase-diagnostics.sql
```

---

## ✅ Success Criteria

Your fix is working when you see:

1. ✅ Vercel deployment completes successfully
2. ✅ Test submission shows non-zero scores (4000-10000 range)
3. ✅ Supabase query shows `has_groq_responses > 0`
4. ✅ No "API key not configured" errors in Vercel logs

---

## 🆘 If Something Goes Wrong

### Issue: Script fails with "env add" error

**Fix:** Environment variable may already exist. Remove and re-add:

```bash
# Remove existing
vercel env rm NEXT_PUBLIC_GROQ_API_KEY production --token=sFGpBCc64T0Qn5aGCOksY7zm --yes
vercel env rm NEXT_PUBLIC_GROQ_API_KEY preview --token=sFGpBCc64T0Qn5aGCOksY7zm --yes
vercel env rm NEXT_PUBLIC_GROQ_API_KEY development --token=sFGpBCc64T0Qn5aGCOksY7zm --yes

# Run setup script again
bash scripts/setup-vercel-env.sh
```

### Issue: Still seeing zero scores after deployment

**Checklist:**
1. Wait 2-3 minutes after deployment (Vercel needs time to rebuild)
2. Clear browser cache and reload
3. Verify env var is set: `vercel env ls --token=sFGpBCc64T0Qn5aGCOksY7zm`
4. Check Vercel function logs for errors
5. Run local test: `npx tsx scripts/test-groq-connection.ts`

### Issue: Submissions stuck in "evaluating"

**Fix:** Check webhook configuration:
1. Go to Stripe Dashboard → Webhooks
2. Verify webhook endpoint: `https://[your-app].vercel.app/api/webhook/stripe`
3. Check webhook secret is set in Vercel: `STRIPE_WEBHOOK_SECRET`

---

## 📊 Monitor After Deployment

Run this every hour for first 24 hours:

```sql
-- Copy-paste in Supabase SQL Editor
SELECT 
    NOW() as check_time,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as submissions_last_hour,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'qualified') as qualified_last_hour,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour' AND status = 'evaluation_failed') as failed_last_hour
FROM contributions;
```

**Healthy system:** 
- `qualified_last_hour` > 0 (if there are submissions)
- `failed_last_hour` = 0 (or very low)

---

## 📞 Support

If issues persist after following this guide:

1. Run full diagnostics: `scripts/supabase-diagnostics.sql`
2. Check Vercel logs: `vercel logs --token=sFGpBCc64T0Qn5aGCOksY7zm`
3. Test Groq API locally: `npx tsx scripts/test-groq-connection.ts`
4. Review detailed docs: `docs/TROUBLESHOOTING_COMPLETE_SUMMARY.md`

---

**Ready? Run the 3 steps above and you're done!** 🎉

