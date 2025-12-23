# Scripts

Utility scripts for development, testing, and deployment.

## Available Scripts

### Testing Scripts

- `test-auth.js` - Test authentication flows
- `test-auth-detailed.sh` - Detailed authentication testing
- `test-basic.js` - Basic functionality tests
- `test-functionality.sh` - Comprehensive functionality testing
- `test-poc-api.js` - Test POC API endpoints
- `test-stripe.js` - Test Stripe integration
- `test-vercel.js` - Test Vercel deployment
- `run-all-tests.js` - Run all test suites

### Development Scripts

- `debug-oauth.sh` - Debug OAuth configuration
- `prepare-vercel-env.js` - Prepare environment variables for Vercel

## Usage

Most scripts can be run directly:

```bash
# Run a test script
node scripts/test-auth.js

# Run a shell script
bash scripts/test-functionality.sh

# Run all tests
node scripts/run-all-tests.js
```

## Notes

- Some scripts require environment variables to be set
- Check individual script files for specific requirements
- Test scripts are for development/testing purposes only



