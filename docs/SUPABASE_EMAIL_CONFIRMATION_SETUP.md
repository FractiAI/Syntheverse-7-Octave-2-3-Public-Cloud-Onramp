# Supabase Email Confirmation Setup

## Problem

Users are not receiving email confirmation emails after signing up.

## Root Cause

Supabase sends confirmation emails, not Resend. The email service needs to be configured in Supabase dashboard.

## Solution

### Option 1: Configure Supabase Email Service (Recommended for Production)

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/settings/auth

2. **Check Email Settings**
   - Scroll to "Email Auth" section
   - Verify "Enable email confirmations" is ON
   - Check "SMTP Settings" section

3. **Configure SMTP (If not using Supabase default)**
   - If you want to use your own SMTP server:
     - Go to: Settings → Auth → SMTP Settings
     - Enter your SMTP credentials
   - **OR** use Supabase's built-in email service (default)

4. **Verify Email Templates**
   - Go to: Authentication → Email Templates
   - Check "Confirm signup" template
   - Ensure it includes the confirmation link

5. **Check Site URL**
   - Go to: Authentication → URL Configuration
   - Verify "Site URL" is set to: `https://syntheverse-poc.vercel.app`
   - Add redirect URL: `https://syntheverse-poc.vercel.app/auth/callback`

### Option 2: Disable Email Confirmation (For Testing Only)

**⚠️ WARNING: Only for development/testing. Not recommended for production.**

1. Go to: https://app.supabase.io/project/jfbgdxeumzqzigptbmvp/settings/auth
2. Find "Enable email confirmations"
3. Turn it OFF
4. Save changes

**Note:** This allows users to sign up without email confirmation, but is less secure.

### Option 3: Use Custom SMTP with Resend

If you want to use Resend for confirmation emails:

1. **Set up Resend Domain**
   - Go to: https://resend.com/domains
   - Add and verify your domain (e.g., `syntheverse.ai`)

2. **Get SMTP Credentials from Resend**
   - Go to: Resend Dashboard → SMTP
   - Copy SMTP settings

3. **Configure in Supabase**
   - Go to: Supabase Dashboard → Settings → Auth → SMTP Settings
   - Enter Resend SMTP credentials:
     - Host: `smtp.resend.com`
     - Port: `587` or `465`
     - Username: `resend`
     - Password: Your Resend API key
     - Sender email: `noreply@your-domain.com` (must be verified in Resend)

## Troubleshooting

### Email Not Received

1. **Check Spam Folder**
   - Confirmation emails often go to spam

2. **Check Supabase Logs**
   - Go to: Supabase Dashboard → Logs → Auth Logs
   - Look for email sending errors

3. **Verify Email Address**
   - Make sure the email address is valid
   - Try a different email provider (Gmail, Outlook, etc.)

4. **Check Rate Limits**
   - Supabase has rate limits on emails
   - Wait a few minutes and try again

5. **Verify SMTP Configuration**
   - If using custom SMTP, verify credentials are correct
   - Test SMTP connection in Supabase dashboard

### Email Link Not Working

1. **Check Redirect URL**
   - Verify `NEXT_PUBLIC_WEBSITE_URL` is set correctly
   - Should be: `https://syntheverse-poc.vercel.app` (no trailing slash, no newline)

2. **Check Callback Route**
   - Verify `/auth/callback` route is working
   - Check Vercel function logs for errors

3. **Check Supabase Redirect URLs**
   - Go to: Authentication → URL Configuration
   - Ensure `https://syntheverse-poc.vercel.app/**` is in allowed redirect URLs

## Current Configuration

Based on code analysis:

- Email confirmations: **ENABLED** in production (`email_confirm: process.env.NODE_ENV !== 'production'` means `false` in production)
- Email service: Supabase default (unless custom SMTP is configured)
- Redirect URL: `${PUBLIC_URL}/auth/callback`

## Quick Fix for Testing

If you need to test signup immediately:

1. **Temporarily disable email confirmation** (see Option 2 above)
2. **OR** manually confirm user in Supabase:
   - Go to: Authentication → Users
   - Find the user
   - Click "Confirm" button

## Next Steps

1. Check Supabase email configuration
2. Verify SMTP settings (if using custom)
3. Test email delivery
4. Check spam folder
5. Review Supabase auth logs for errors
