# 🔗 Stripe Webhook Setup

## Current Configuration

### Webhook Endpoint URL

**Correct URL:** `https://syntheverse-poc.vercel.app/webhook/stripe`

## How to Update Webhook URL

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/test/webhooks
   - Or: Dashboard → Developers → Webhooks

2. **Edit Your Webhook**
   - Click on your webhook endpoint
   - Click "Edit" or the settings icon

3. **Update Endpoint URL**
   - Change to: `https://syntheverse-poc.vercel.app/webhook/stripe`
   - Click "Save"

4. **Verify Events**
   Make sure these events are selected:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `subscription_schedule.aborted`
   - ✅ `subscription_schedule.canceled`
   - ✅ `subscription_schedule.created`
   - ✅ `subscription_schedule.updated`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

## Environment Variables

All Stripe keys should be configured in Vercel:

✅ **STRIPE_SECRET_KEY** - Get from Stripe Dashboard → Developers → API keys  
✅ **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Get from Stripe Dashboard → Developers → API keys  
✅ **STRIPE_WEBHOOK_SECRET** - Get from Stripe Dashboard → Webhooks → [Your webhook] → Signing secret  
✅ **NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID** - Get from Stripe Dashboard → Products → Pricing Tables

## Testing Webhook

After updating the webhook URL:

1. **Test in Stripe Dashboard**
   - Go to your webhook
   - Click "Send test webhook"
   - Select an event type (e.g., `checkout.session.completed`)
   - Click "Send test webhook"

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check `/webhook/stripe` function logs
   - Should see successful webhook processing

3. **Test Endpoint**
   - Visit: `https://syntheverse-poc.vercel.app/api/test-stripe`
   - Should show successful Stripe connection

## Troubleshooting

### Webhook Not Receiving Events

- Verify endpoint URL is correct
- Check that webhook secret matches in Vercel
- Ensure events are selected in Stripe Dashboard
- Check Vercel function logs for errors

### Connection Errors

- Verify API keys are correct in Vercel
- Check that keys match Stripe Dashboard
- Ensure deployment has latest environment variables
- Try redeploying after updating keys
