# Schema Verification - Registration Fields

## ✅ Migration Status: COMPLETE

The registration fields migration has been successfully applied to the `contributions` table.

## Added Columns

The following columns have been added to the `contributions` table:

1. **`registered`** (boolean, default: false)
   - Indicates if the PoC has been registered on the blockchain
   - Default: `false`

2. **`registration_date`** (timestamp, nullable)
   - Timestamp when the PoC was registered
   - Nullable (only set when registered)

3. **`registration_tx_hash`** (text, nullable)
   - Blockchain transaction hash for the registration
   - Nullable (only set when registered)

4. **`stripe_payment_id`** (text, nullable)
   - Stripe payment intent ID for the $500 registration fee
   - Nullable (only set when payment is processed)

## Created Indexes

1. **`contributions_registered_idx`**
   - Index on `registered` column
   - Partial index (WHERE registered = true)
   - Optimizes queries for registered PoCs

2. **`contributions_stripe_payment_id_idx`**
   - Index on `stripe_payment_id` column
   - Partial index (WHERE stripe_payment_id IS NOT NULL)
   - Optimizes Stripe payment lookups

## Verification Queries

### Check Columns
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contributions' 
AND table_schema = 'public'
AND (
    column_name LIKE 'registration%' 
    OR column_name = 'stripe_payment_id'
    OR column_name = 'registered'
)
ORDER BY column_name;
```

### Check Indexes
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'contributions'
AND schemaname = 'public'
AND (
    indexname LIKE '%registered%' 
    OR indexname LIKE '%stripe%'
)
ORDER BY indexname;
```

## Next Steps

1. ✅ Schema migration complete
2. ✅ Indexes created
3. 🔄 Test registration functionality:
   - Submit a PoC
   - Click "Register PoC" button
   - Complete Stripe checkout
   - Verify webhook updates the database
   - Check registration status in dashboard

## Related Files

- Migration: `supabase/migrations/add_registration_fields_complete.sql`
- Schema Definition: `utils/db/schema.ts`
- API Endpoints:
  - `app/api/poc/[hash]/register/route.ts` - Initiate registration
  - `app/api/poc/[hash]/registration-status/route.ts` - Check status
  - `app/webhook/stripe/route.ts` - Handle payment webhook

