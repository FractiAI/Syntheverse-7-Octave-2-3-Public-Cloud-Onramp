# 🔗 Stripe Webhook Setup Guide

## ⚠️ Important: Do This AFTER First Deployment

You need your Vercel deployment URL before creating the webhook. The webhook URL will be:

```
https://your-app-name.vercel.app/webhook/stripe
```

---

## Step-by-Step: Create Stripe Webhook

### Step 1: Get Your Vercel URL

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click on your project
   - Go to **Deployments** tab
   - Find your latest deployment
   - Copy the URL (e.g., `https://syntheverse-poc.vercel.app`)

2. **Your Webhook URL will be:**
   ```
   https://your-app-name.vercel.app/webhook/stripe
   ```
   (Replace `your-app-name` with your actual Vercel project name)

---

### Step 2: Create Webhook Endpoint in Stripe

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/
   - Make sure you're in **Test mode** (toggle switch in top right should say "Test mode")

2. **Navigate to Webhooks**
   - Click **"Developers"** in the left sidebar
   - Click **"Webhooks"** (or go directly: https://dashboard.stripe.com/test/webhooks)

3. **Add New Endpoint**
   - Click the **"+ Add endpoint"** button (top right)

4. **Configure Endpoint**
   - **Endpoint URL**: Enter your webhook URL
     ```
     https://your-app-name.vercel.app/webhook/stripe
     ```
     (Replace with your actual Vercel URL)
   - **Description** (optional):
     ```
     Production webhook for Syntheverse PoC
     ```

5. **Select Events to Listen To**
   Click **"Select events"** or **"Add events"** and select these events:

   ✅ **checkout.session.completed**
   - Triggered when a customer successfully completes a checkout session

   ✅ **customer.subscription.created**
   - Triggered when a new subscription is created

   ✅ **customer.subscription.updated**
   - Triggered when a subscription is updated (plan change, status change, etc.)

   ✅ **customer.subscription.deleted**
   - Triggered when a subscription is canceled or deleted

   ✅ **invoice.payment_succeeded**
   - Triggered when an invoice payment succeeds

   ✅ **invoice.payment_failed**
   - Triggered when an invoice payment fails

6. **Add Events**
   - After selecting all the events, click **"Add events"** or **"Add endpoint"**
   - Stripe will create the webhook endpoint

---

### Step 3: Get Webhook Signing Secret

1. **Click on Your Webhook Endpoint**
   - After creating, you'll see it in the webhooks list
   - Click on the endpoint you just created

2. **Find Signing Secret**
   - Scroll down to the **"Signing secret"** section
   - You'll see something like: `whsec_...` (starts with `whsec_`)
   - Click **"Reveal"** or **"Click to reveal"** button
   - The secret will be shown (format: `whsec_` followed by a long string)
   - **Example format only** (not a real secret): `whsec_XXXXXXXXXXXXXXXXXXXXXXXX`

3. **Copy the Secret**
   - Click the copy icon or select and copy the entire secret
   - **Important:** Keep this secret secure! It's used to verify webhook requests

---

### Step 4: Add Secret to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click on your project

2. **Navigate to Environment Variables**
   - Go to **Settings** → **Environment Variables**

3. **Add or Update STRIPE_WEBHOOK_SECRET**
   - If you already added it as a placeholder:
     - Find `STRIPE_WEBHOOK_SECRET` in the list
     - Click **Edit**
     - Paste the `whsec_...` value you copied from Stripe
     - Click **Save**
   - If you haven't added it yet:
     - Click **"Add New"**
     - **Key**: `STRIPE_WEBHOOK_SECRET`
     - **Value**: Paste the `whsec_...` secret you copied
     - **Environments**: Select all three:
       - ✅ Production
       - ✅ Preview
       - ✅ Development
     - Click **"Save"**

---

### Step 5: Redeploy Your Application

1. **Trigger a New Deployment**
   - Go to **Deployments** tab in Vercel
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger automatic deployment

2. **Wait for Deployment**
   - Wait for the build to complete
   - This ensures the new webhook secret is available to your application

---

### Step 6: Test the Webhook (Optional)

1. **Test in Stripe Dashboard**
   - Go back to Stripe Dashboard → Developers → Webhooks
   - Click on your webhook endpoint
   - Click **"Send test webhook"** button
   - Select an event type (e.g., `checkout.session.completed`)
   - Click **"Send test webhook"**

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check the logs for `/webhook/stripe` function
   - You should see the webhook being processed

3. **Check Webhook Status**
   - In Stripe Dashboard → Webhooks
   - Look at your endpoint
   - You should see recent webhook attempts and their status (success/failure)

---

## Quick Checklist

- [ ] Got Vercel deployment URL
- [ ] Created webhook endpoint in Stripe Dashboard
- [ ] Added endpoint URL: `https://your-app.vercel.app/webhook/stripe`
- [ ] Selected all required events (6 events listed above)
- [ ] Copied webhook signing secret (`whsec_...`)
- [ ] Added `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
- [ ] Selected all three environments (Production, Preview, Development)
- [ ] Redeployed application in Vercel
- [ ] Tested webhook (optional)

---

## Troubleshooting

### Webhook Not Receiving Events

**Check:**

- Is the webhook URL correct? (must be `https://your-app.vercel.app/webhook/stripe`)
- Is your Vercel deployment live and accessible?
- Did you add the webhook secret to Vercel environment variables?
- Did you redeploy after adding the secret?

### Webhook Returns 404 Error

**Solution:**

- Verify the route exists: `/app/webhook/stripe/route.ts`
- Check that the deployment was successful
- Make sure the URL path is exactly `/webhook/stripe` (case-sensitive)

### Webhook Returns 401/403 Error

**Solution:**

- Verify `STRIPE_WEBHOOK_SECRET` is set correctly in Vercel
- Make sure you copied the entire secret (starts with `whsec_`)
- Ensure you redeployed after adding the secret

### Webhook Secret Not Working

**Solution:**

- Make sure you're using the correct secret for the correct environment
- Test mode webhook secrets work with test mode Stripe keys
- Production mode webhook secrets work with live mode Stripe keys
- Don't mix test and production secrets

---

## Important Notes

1. **Test vs Production**
   - In **Test mode**, webhook secrets start with `whsec_test_...`
   - In **Live mode**, webhook secrets start with `whsec_live_...`
   - Make sure you're using the correct mode

2. **Multiple Environments**
   - You can create separate webhooks for production and test
   - Use different Vercel environment variables if needed
   - Or use the same webhook secret for all environments (if using test mode)

3. **Security**
   - Never commit webhook secrets to Git
   - Always use environment variables
   - Keep secrets secure and rotate them if compromised

---

## Example: Complete Webhook URL

If your Vercel project is named `syntheverse-poc`, your webhook URL would be:

```
https://syntheverse-poc.vercel.app/webhook/stripe
```

If you have a custom domain, it would be:

```
https://yourdomain.com/webhook/stripe
```

---

## Next Steps After Webhook Setup

1. ✅ Test webhook with test events
2. ✅ Monitor webhook logs in Stripe Dashboard
3. ✅ Check Vercel function logs for any errors
4. ✅ Test actual subscription flow end-to-end
5. ✅ Verify webhook events are being processed correctly

---

## Need Help?

If you encounter issues:

- Check Stripe Dashboard → Webhooks → Your endpoint → Recent attempts
- Check Vercel Dashboard → Your Project → Functions → Logs
- Review your webhook handler code: `/app/webhook/stripe/route.ts`

---

**Once you complete these steps, your Stripe webhook will be fully configured!** 🎉
