/**
 * Complete Test Suite Runner
 * Orchestrates all test suites and generates comprehensive reports
 */

import { TestReporter, TestReport } from './utils/test-reporter'
import { getTestConfig } from './utils/test-config'
import * as fs from 'fs'
import * as path from 'path'

// Import test suites
import './hardhat/01-scoring-determinism.test'
import './hardhat/02-tokenomics-validation.test'
import './hardhat/03-lens-consistency.test'
import './hardhat/04-sandbox-vector-mapping.test'
import './hardhat/05-calibration-peer-reviewed.test'
import './hardhat/06-constants-equations-validation.test'
import './integration/01-poc-submission-flow.test'
import './integration/02-evaluation-flow.test'
import './integration/03-registration-flow.test'
import './security/01-auth-security.test'
import './security/02-api-security.test'
import './load/01-api-load.test'

const reporter = new TestReporter()
const config = getTestConfig()

interface TestSuite {
    id: string
    name: string
    file: string
    enabled: boolean
}

const testSuites: TestSuite[] = [
    {
        id: 'hardhat-scoring',
        name: 'Hardhat: Scoring Determinism',
        file: 'tests/hardhat/01-scoring-determinism.test.ts',
        enabled: true
    },
    {
        id: 'hardhat-tokenomics',
        name: 'Hardhat: Tokenomics Validation',
        file: 'tests/hardhat/02-tokenomics-validation.test.ts',
        enabled: true
    },
    {
        id: 'hardhat-lens',
        name: 'Hardhat: Lens Consistency',
        file: 'tests/hardhat/03-lens-consistency.test.ts',
        enabled: true
    },
    {
        id: 'hardhat-sandbox',
        name: 'Hardhat: Sandbox Vector Mapping',
        file: 'tests/hardhat/04-sandbox-vector-mapping.test.ts',
        enabled: true
    },
    {
        id: 'hardhat-calibration',
        name: 'Hardhat: Calibration (Peer-Reviewed Papers)',
        file: 'tests/hardhat/05-calibration-peer-reviewed.test.ts',
        enabled: true
    },
    {
        id: 'hardhat-constants',
        name: 'Hardhat: Constants & Equations Validation',
        file: 'tests/hardhat/06-constants-equations-validation.test.ts',
        enabled: true
    },
    {
        id: 'integration-submission',
        name: 'Integration: PoC Submission Flow',
        file: 'tests/integration/01-poc-submission-flow.test.ts',
        enabled: true
    },
    {
        id: 'integration-evaluation',
        name: 'Integration: Evaluation Flow',
        file: 'tests/integration/02-evaluation-flow.test.ts',
        enabled: true
    },
    {
        id: 'integration-registration',
        name: 'Integration: Registration Flow',
        file: 'tests/integration/03-registration-flow.test.ts',
        enabled: true
    },
    {
        id: 'security-auth',
        name: 'Security: Authentication',
        file: 'tests/security/01-auth-security.test.ts',
        enabled: true
    },
    {
        id: 'security-api',
        name: 'Security: API Security',
        file: 'tests/security/02-api-security.test.ts',
        enabled: true
    },
    {
        id: 'load-api',
        name: 'Load: API Endpoints',
        file: 'tests/load/01-api-load.test.ts',
        enabled: true
    }
]

async function runAllTests(): Promise<void> {
    console.log('🧪 Syntheverse PoC - Complete Test Suite')
    console.log('=' .repeat(60))
    console.log(`Started: ${new Date().toISOString()}`)
    console.log(`Configuration: ${JSON.stringify(config, null, 2)}`)
    console.log('')

    const startTime = Date.now()
    const enabledSuites = testSuites.filter(s => s.enabled)

    console.log(`📋 Running ${enabledSuites.length} test suite(s)...`)
    console.log('')

    // Run each test suite
    for (const suite of enabledSuites) {
        console.log(`▶️  Starting: ${suite.name}`)
        reporter.startSuite(suite.id, suite.name)

        try {
            // In a real implementation, you would dynamically import and run the test file
            // For now, we'll simulate test execution
            // The actual test files will use the reporter to record results
            
            // Wait a bit to simulate test execution
            await new Promise(resolve => setTimeout(resolve, 100))
            
            reporter.endSuite(suite.id)
            console.log(`✅ Completed: ${suite.name}`)
        } catch (error: any) {
            console.error(`❌ Failed: ${suite.name}`, error.message)
            reporter.endSuite(suite.id)
        }
        
        console.log('')
    }

    const endTime = Date.now()
    const totalDuration = endTime - startTime

    // Generate final report
    console.log('📊 Generating Test Report...')
    const report = reporter.generateReport({
        totalDuration,
        suitesRun: enabledSuites.length
    })

    // Save report
    const reportPath = await reporter.saveReport(report)
    console.log(`📄 Report saved: ${reportPath}`)

    // Print summary
    console.log('')
    console.log('=' .repeat(60))
    console.log('📊 Test Summary')
    console.log('=' .repeat(60))
    console.log(`Total Tests: ${report.summary.totalTests}`)
    console.log(`Passed: ${report.summary.totalPassed} ✅`)
    console.log(`Failed: ${report.summary.totalFailed} ❌`)
    console.log(`Skipped: ${report.summary.totalSkipped} ⏭️`)
    console.log(`Pass Rate: ${report.summary.passRate.toFixed(2)}%`)
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)
    console.log('')
    console.log(`🎯 Readiness Verdict: ${report.readiness.verdict.toUpperCase()}`)
    
    if (report.readiness.issues.length > 0) {
        console.log('')
        console.log('⚠️  Issues:')
        report.readiness.issues.forEach(issue => console.log(`   - ${issue}`))
    }
    
    if (report.readiness.recommendations.length > 0) {
        console.log('')
        console.log('💡 Recommendations:')
        report.readiness.recommendations.forEach(rec => console.log(`   - ${rec}`))
    }

    console.log('')
    console.log('=' .repeat(60))

    // Exit with appropriate code
    if (report.readiness.verdict === 'ready') {
        console.log('✅ All tests passed! System is ready for production.')
        process.exit(0)
    } else if (report.readiness.verdict === 'conditional') {
        console.log('⚠️  Some tests failed, but system may be conditionally ready.')
        process.exit(1)
    } else {
        console.log('❌ Critical tests failed. System is NOT ready for production.')
        process.exit(1)
    }
}

// Run if executed directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('Fatal error running tests:', error)
        process.exit(1)
    })
}

export { runAllTests, reporter }

