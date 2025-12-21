# ✅ Environment Variables - Ready to Add to Vercel

Great! You now have all the values you need. Here's your complete list:

---

## 📋 Complete Environment Variables List

### 1. NEXT_PUBLIC_SUPABASE_URL
**Value:** `https://jfbgdxeumzqzigptbmvp.supabase.co`

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwODczODgsImV4cCI6MjA4MTY2MzM4OH0.PTv7kmbbz8k35blN2pONnK8Msi6mn8O1ok546BPz1gQ`

---

### 3. SUPABASE_SERVICE_ROLE_KEY
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmYmdkeGV1bXpxemlncHRibXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA4NzM4OCwiZXhwIjoyMDgxNjYzMzg4fQ.-2HxO5TMcWFv21Ax4GZMqjTuJz-okIujHQx-R2xrTnY`

---

### 4. DATABASE_URL
**Value:** `[GET FROM SUPABASE - You're working on this]`
**Instructions:** 
- Go to Supabase Dashboard → Settings → Database → Connection string → URI
- Copy the connection string
- Replace `[YOUR-PASSWORD]` with your database password

---

### 5. NEXT_PUBLIC_SITE_URL
**Value:** `https://YOUR-APP-NAME.vercel.app`
⚠️ **Update after first deployment** with your actual Vercel URL

---

### 6. NEXT_PUBLIC_WEBSITE_URL
**Value:** `https://YOUR-APP-NAME.vercel.app`
⚠️ **Update after first deployment** with your actual Vercel URL (same as above)

---

### 7. STRIPE_SECRET_KEY
**Value:** `ssk_test_51R7L8z09dcGq3dt0venHR8ZuByT8Q4LvHC8pqiMyjPqM6ZB7SUECwSTqSvuZIBGYHmGFSuGTp7eBtVCXlT8qE4YM00lfUcoQMh`

---

### 8. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
**Value:** `pk_test_51R7L8z09dcGq3dt09zHxvGW3kq410jcg5w9vCE6hMrwt3pjr3O7VvP9H5rHyzeS7ywIZnqxXfozHfVbT2uU7LZ5W00vG3fr6L8`

---

### 9. NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID ✅
**Value:** `prctbl_1Sgbe509dcGq3dt0CgPQ4MFg`
✅ **You just got this!**

---

### 10. STRIPE_WEBHOOK_SECRET
**Value:** `[Leave blank for now - add after creating webhook]`
⚠️ **Get after:** Creating webhook in Stripe (after first deployment)

---

## 🚀 How to Add These to Vercel

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Navigate to Environment Variables**
   - Click **Settings** → **Environment Variables**

3. **Add Each Variable**
   - Click **"Add New"** for each variable above
   - Copy the **Key** and **Value**
   - **IMPORTANT:** Select all three environments:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **"Save"**

---

## 📝 Notes About Your Stripe Pricing Table

Stripe gave you this code:
```html
<script async src="https://js.stripe.com/v3/pricing-table.js"></script>
<stripe-pricing-table 
  pricing-table-id="prctbl_1Sgbe509dcGq3dt0CgPQ4MFg"
  publishable-key="pk_test_51R7L8z09dcGq3dt09zHxvGW3kq410jcg5w9vCE6hMrwt3pjr3O7VvP9H5rHyzeS7ywIZnqxXfozHfVbT2uU7LZ5W00vG3fr6L8">
</stripe-pricing-table>
```

✅ **Good news:** Your code already handles this! The `StripePricingTable.tsx` component uses:
- `process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID` ✅
- `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✅

So you just need to add these environment variables and it will work!

**Note:** You'll also need to add the script tag. Check if your `app/layout.tsx` or where you use the pricing table includes:
```html
<script async src="https://js.stripe.com/v3/pricing-table.js"></script>
```

---

## ✅ Current Status

- [x] Supabase URL and keys
- [ ] DATABASE_URL (in progress)
- [x] Stripe keys
- [x] Stripe Pricing Table ID ✅ (just got it!)
- [ ] Site URLs (update after deployment)
- [ ] Webhook secret (add after deployment)

---

## Next Steps

1. ✅ Get DATABASE_URL from Supabase
2. ✅ Add all variables to Vercel
3. ✅ Deploy to Vercel
4. ✅ Update Site URLs after deployment
5. ✅ Create Stripe webhook and add secret

You're almost there! 🎉

