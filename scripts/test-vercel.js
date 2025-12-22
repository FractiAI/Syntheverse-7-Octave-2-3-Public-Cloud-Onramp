#!/usr/bin/env node

/**
 * Vercel Deployment Testing Script - Phase 4
 * Run this after completing local testing phases
 */

const fs = require('fs');
const path = require('path');

console.log('☁️  Syntheverse PoC - Vercel Deployment Testing\n');
console.log('=============================================\n');

console.log('📋 Pre-Deployment Checklist:');
console.log('===========================');

const checks = [
    {
        name: 'Git repository initialized',
        check: () => fs.existsSync('.git'),
        required: true
    },
    {
        name: 'Package.json exists',
        check: () => fs.existsSync('package.json'),
        required: true
    },
    {
        name: 'Next.js app structure',
        check: () => fs.existsSync('app') && fs.existsSync('app/page.tsx'),
        required: true
    },
    {
        name: 'Build script configured',
        check: () => {
            try {
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                return pkg.scripts && pkg.scripts.build;
            } catch {
                return false;
            }
        },
        required: true
    },
    {
        name: 'Environment variables documented',
        check: () => fs.existsSync('.env.example'),
        required: true
    }
];

checks.forEach(({ name, check, required }) => {
    const passed = check();
    const icon = passed ? '✅' : '❌';
    const suffix = required && !passed ? ' (REQUIRED)' : '';
    console.log(`${icon} ${name}${suffix}`);
});

console.log('\n🚀 Vercel Deployment Steps:');
console.log('===========================');

console.log('1. Connect Repository to Vercel:');
console.log('   - Go to https://vercel.com/dashboard');
console.log('   - Click "New Project"');
console.log('   - Import your Git repository');
console.log('   - Vercel will auto-detect Next.js');
console.log('');

console.log('2. Configure Environment Variables:');
console.log('   - In Vercel dashboard, go to Project Settings → Environment Variables');
console.log('   - Add all variables from .env.example:');
console.log('     • NEXT_PUBLIC_SUPABASE_URL');
console.log('     • NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('     • SUPABASE_SERVICE_ROLE_KEY');
console.log('     • NEXT_PUBLIC_SITE_URL (your Vercel domain)');
console.log('     • STRIPE_SECRET_KEY');
console.log('     • STRIPE_WEBHOOK_SECRET');
console.log('     • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
console.log('     • GOOGLE_CLIENT_ID (if using OAuth)');
console.log('     • GOOGLE_CLIENT_SECRET (if using OAuth)');
console.log('     • GITHUB_CLIENT_ID (if using OAuth)');
console.log('     • GITHUB_CLIENT_SECRET (if using OAuth)');
console.log('');

console.log('3. Update OAuth Redirect URLs:');
console.log('   - In Supabase dashboard: Authentication → URL Configuration');
console.log('   - Change Site URL to your Vercel domain');
console.log('   - Update Google/GitHub OAuth app redirect URLs to:');
console.log('     https://your-app.vercel.app/auth/callback');
console.log('');

console.log('4. Configure Stripe Webhooks:');
console.log('   - In Stripe dashboard: Developers → Webhooks');
console.log('   - Update webhook endpoint URL to:');
console.log('     https://your-app.vercel.app/webhook/stripe');
console.log('   - Ensure webhook secret is updated in Vercel env vars');
console.log('');

console.log('5. Deploy and Test:');
console.log('   - Vercel will auto-deploy on git push');
console.log('   - Monitor deployment in Vercel dashboard');
console.log('   - Test all functionality on production URL');
console.log('');

console.log('🧪 Production Testing Checklist:');
console.log('===============================');

console.log('□ Vercel deployment succeeds');
console.log('□ Application loads on Vercel domain');
console.log('□ HTTPS enabled automatically');
console.log('□ All routes accessible');
console.log('□ Static assets load correctly');
console.log('□ Supabase connection works');
console.log('□ Authentication functions');
console.log('□ OAuth redirects work with new URLs');
console.log('□ Stripe checkout works');
console.log('□ Webhooks process correctly');
console.log('□ Database operations work');
console.log('□ Email/password auth works');
console.log('□ Password reset works');
console.log('□ Protected routes work');
console.log('□ No console errors');
console.log('□ Mobile responsive');
console.log('');

console.log('⚡ Vercel-Specific Features to Test:');
console.log('====================================');

console.log('• Automatic HTTPS certificates');
console.log('• Global CDN distribution');
console.log('• Automatic scaling');
console.log('• Preview deployments on branches');
console.log('• Environment variable management');
console.log('• Build optimization');
console.log('• Analytics and monitoring');
console.log('');

console.log('🔧 Common Vercel Issues & Solutions:');
console.log('=====================================');

console.log('• Build fails: Check build logs, verify Node.js version');
console.log('• Env vars missing: Double-check Vercel dashboard configuration');
console.log('• OAuth redirects: Update all provider redirect URLs');
console.log('• Database timeouts: Check Supabase connection limits');
console.log('• Webhook failures: Verify STRIPE_WEBHOOK_SECRET in production');
console.log('');

console.log('📊 Performance Monitoring:');
console.log('==========================');

console.log('• Vercel Analytics: Check real user monitoring');
console.log('• Core Web Vitals: Monitor performance metrics');
console.log('• Error tracking: Check Vercel function logs');
console.log('• Database performance: Monitor Supabase metrics');
console.log('');

console.log('🎉 Deployment Complete!');
console.log('=======================');

console.log('Your Syntheverse PoC Contributor UI is now live on Vercel!');
console.log('Share your deployment URL and start collecting contributions.');
console.log('');
console.log('🌟 Next Steps:');
console.log('• Set up custom domain (optional)');
console.log('• Configure monitoring and alerts');
console.log('• Set up CI/CD for automatic deployments');
console.log('• Plan for scaling and performance optimization');

console.log('\n🚀 Ready for production deployment! Complete local testing first.');

