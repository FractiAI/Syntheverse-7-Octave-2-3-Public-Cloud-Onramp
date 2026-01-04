# Syntheverse PoC Test Suite

Comprehensive test suite for the Syntheverse PoC Contributor Dashboard.

**⚠️ IMPORTANT: All tests run on Vercel server, not locally. Tests use actual Base Mainnet blockchain responses (not simulated).**

See [`VERCEL_TESTING_CONFIG.md`](./VERCEL_TESTING_CONFIG.md) for detailed configuration.

## Test Structure

```
tests/
├── hardhat/              # Blockchain and scoring tests
│   ├── 01-scoring-determinism.test.ts
│   └── 02-tokenomics-validation.test.ts
├── integration/          # End-to-end flow tests
│   ├── 01-poc-submission-flow.test.ts
│   ├── 02-evaluation-flow.test.ts
│   └── 03-registration-flow.test.ts
├── security/             # Security tests
│   ├── 01-auth-security.test.ts
│   └── 02-api-security.test.ts
├── load/                 # Performance and load tests
│   └── 01-api-load.test.ts
├── utils/                # Test utilities
│   ├── test-config.ts
│   ├── test-reporter.ts
│   └── hardhat-setup.ts
├── run-all.ts            # Test runner
└── README.md             # This file
```

## Running Tests

### Run All Tests

```bash
npm run test:all
```

### Run Specific Test Suites

```bash
# Hardhat/Blockchain tests
npm run test:hardhat

# Integration tests
npm run test:integration

# Security tests
npm run test:security

# Load tests
npm run test:load

# All tests
npm run test
```

### Run Individual Test Files

```bash
# Using mocha directly
npx mocha --require tsx/cjs --timeout 300000 tests/hardhat/01-scoring-determinism.test.ts
```

## Test Suites

### Hardhat Tests

- **Scoring Determinism**: Verifies that identical inputs produce identical scores
- **Tokenomics Validation**: Tests token allocation formulas, epoch balances, and supply constraints
- **Lens Consistency**: Tests HHF-AI lens scoring consistency, justifications, and edge cases
- **Sandbox Vector Mapping**: Tests 3D vector mapping, embeddings, and HHF geometry
- **Calibration (Peer-Reviewed Papers)**: Validates scoring against recognized peer-reviewed papers
- **Constants & Equations Validation**: Validates physical constants and equations against CODATA 2018

### Integration Tests

- **PoC Submission Flow**: Tests submission hash generation, database storage, validation
- **Evaluation Flow**: Tests Grok API integration, score calculation, qualification logic
- **Registration Flow**: Tests blockchain registration, transaction structure, status tracking

### Security Tests

- **Authentication Security**: Password strength, SQL injection prevention, XSS prevention
- **API Security**: Authentication requirements, rate limiting, input validation, CORS, authorization

### Load Tests

- **Concurrent Requests**: Tests handling of multiple simultaneous requests
- **Response Times**: Verifies acceptable response times under load
- **Error Rates**: Ensures low error rates under stress
- **Sustained Load**: Tests performance over extended periods
- **Throughput**: Measures requests per second

## Test Configuration

Test configuration is centralized in `tests/utils/test-config.ts`. Key settings:

- **Hardhat**: Network configuration for blockchain tests
- **Database**: Connection settings and reset options
- **Evaluation**: Grok API settings and retry configuration
- **Execution**: Parallel execution, timeouts, retries
- **Reporting**: Output directory, format (JSON/HTML)
- **Security**: Load test parameters

## Test Reports

Test reports are generated in `tests/reports/` directory:

- **JSON Reports**: Machine-readable test results
- **HTML Reports**: Human-readable test reports with visual summaries

Reports include:

- Test summary (passed/failed/skipped counts)
- Pass rate percentage
- Duration metrics
- Security and performance metrics
- Readiness verdict (ready/conditional/not_ready)

## Prerequisites

1. **Environment Variables**: Ensure all required environment variables are set
   - Database connection (`DATABASE_URL`)
   - Grok API key (`NEXT_PUBLIC_GROK_API_KEY`)
   - Blockchain configuration (Base mainnet/testnet)
   - Supabase credentials

2. **Dependencies**: Install all dependencies

   ```bash
   npm install
   ```

3. **Database**: Ensure database is accessible and migrations are run

   ```bash
   npm run db:migrate
   ```

4. **Hardhat Network** (for blockchain tests): Start Hardhat node if needed
   ```bash
   npx hardhat node
   ```

## Test Execution Flow

1. **Test Runner** (`run-all.ts`) orchestrates all test suites
2. **Test Reporter** collects results from all suites
3. **Test Config** provides centralized configuration
4. **Reports** are generated in JSON and HTML formats
5. **Readiness Verdict** determines if system is production-ready

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:all
```

## Troubleshooting

### Tests Timeout

- Increase timeout in test configuration
- Check network connectivity
- Verify API endpoints are accessible

### Database Connection Errors

- Verify `DATABASE_URL` is set correctly
- Check database is running and accessible
- Ensure migrations are up to date

### Grok API Errors

- Verify `NEXT_PUBLIC_GROK_API_KEY` is set
- Check API rate limits
- Verify network connectivity

### Hardhat Network Errors

- Ensure Hardhat node is running
- Check RPC URL configuration
- Verify network connection

## Contributing

When adding new tests:

1. Follow existing test structure and naming conventions
2. Use `TestReporter` to record results
3. Include comprehensive error handling
4. Add appropriate timeouts for async operations
5. Document test purpose and expected behavior
6. Update this README if adding new test suites

## Test Coverage Goals

- **Unit Tests**: Core business logic functions
- **Integration Tests**: End-to-end workflows
- **Security Tests**: All security-critical paths
- **Load Tests**: Performance-critical endpoints
- **Target Coverage**: 80%+ for critical paths

---

**Last Updated**: January 2025  
**Test Framework**: Mocha + Chai + TypeScript  
**Test Runner**: Custom test orchestrator with automated reporting
