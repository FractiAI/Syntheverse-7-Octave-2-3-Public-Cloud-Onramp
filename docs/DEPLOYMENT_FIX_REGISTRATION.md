# Deployment Fix: Registration Button with Stripe & Hardhat Integration

## Issue Summary

Deployment errors occurred when implementing the register button with Stripe and Hardhat integration. The build process was failing due to Next.js attempting to statically analyze or bundle code that includes Hardhat dependencies.

## Root Cause

1. **Static Generation Attempt**: Next.js was trying to statically generate API routes during build time
2. **Hardhat Dependencies**: The `syntheverse-ui` directory contains Hardhat dependencies that are Node.js-only and cannot be bundled for static generation
3. **Module Resolution**: Next.js build process was attempting to analyze files that reference Hardhat, causing build failures

## Solution Implemented

### 1. Force Dynamic Rendering for API Routes

Added explicit dynamic rendering configuration to prevent static generation:

**File: `app/api/poc/[hash]/register/route.ts`**
```typescript
// Force dynamic rendering - this route must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

**File: `app/webhook/stripe/route.ts`**
```typescript
// Force dynamic rendering - webhooks must be server-side only
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
```

### 2. Enhanced Next.js Configuration

Improved `next.config.mjs` to better exclude Hardhat dependencies:

- Added Hardhat packages to `externals` for server-side builds
- This prevents Next.js from trying to bundle Hardhat dependencies
- Maintains existing exclusions for `syntheverse-ui` directory

## Best Practices Applied

1. **Explicit Route Configuration**: Using `export const dynamic = 'force-dynamic'` ensures API routes are never statically generated
2. **Runtime Specification**: `export const runtime = 'nodejs'` explicitly marks routes as server-side only
3. **External Dependencies**: Hardhat packages are marked as externals to prevent bundling issues
4. **Directory Exclusions**: Maintained comprehensive exclusions for `syntheverse-ui` directory

## Files Modified

1. ✅ `app/api/poc/[hash]/register/route.ts` - Added dynamic/runtime exports
2. ✅ `app/webhook/stripe/route.ts` - Added dynamic/runtime exports  
3. ✅ `next.config.mjs` - Enhanced webpack configuration with externals

## Testing Recommendations

After deployment, verify:

1. **API Route Functionality**: Test `/api/poc/[hash]/register` endpoint
2. **Webhook Processing**: Verify Stripe webhooks are processed correctly
3. **Blockchain Registration**: Confirm blockchain registration flow works
4. **Build Success**: Ensure Vercel deployment completes without errors

## Additional Notes

- The dynamic import in the webhook (`await import('@/utils/blockchain/register-poc')`) is already correctly implemented
- The `register-poc.ts` file uses mock transactions when Hardhat RPC URL is not configured, which is safe for deployment
- All changes follow Next.js 14+ best practices for API routes

## Deployment Checklist

- [x] API routes marked as `force-dynamic`
- [x] Runtime explicitly set to `nodejs`
- [x] Next.js config updated with externals
- [x] No linting errors
- [ ] Test deployment on Vercel
- [ ] Verify API endpoints work in production
- [ ] Test Stripe webhook integration
- [ ] Verify blockchain registration flow

