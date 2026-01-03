/**
 * Automated Test Reporter
 * Generates comprehensive test reports in JSON and HTML formats
 */

import * as fs from 'fs'
import * as path from 'path'
import { getTestConfig } from './test-config'

export interface TestResult {
    testId: string
    suite: string
    name: string
    status: 'passed' | 'failed' | 'skipped' | 'error'
    duration: number
    inputs?: any
    expected?: any
    actual?: any
    error?: string
    stack?: string
    metadata?: Record<string, any>
}

export interface TestSuite {
    suiteId: string
    name: string
    status: 'passed' | 'failed' | 'partial'
    startTime: number
    endTime?: number
    duration?: number
    totalTests: number
    passed: number
    failed: number
    skipped: number
    results: TestResult[]
}

export interface TestReport {
    reportId: string
    timestamp: string
    config: any
    suites: TestSuite[]
    summary: {
        totalTests: number
        totalPassed: number
        totalFailed: number
        totalSkipped: number
        totalDuration: number
        passRate: number
    }
    security: {
        attacksAttempted: number
        attacksBlocked: number
        vulnerabilities: string[]
    }
    performance: {
        averageResponseTime: number
        maxResponseTime: number
        throughput: number
        errorRate: number
    }
    readiness: {
        verdict: 'ready' | 'not_ready' | 'conditional'
        issues: string[]
        recommendations: string[]
    }
}

export class TestReporter {
    private suites: Map<string, TestSuite> = new Map()
    private config = getTestConfig()
    
    startSuite(suiteId: string, name: string): void {
        const suite: TestSuite = {
            suiteId,
            name,
            status: 'passed',
            startTime: Date.now(),
            totalTests: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            results: [],
        }
        this.suites.set(suiteId, suite)
    }
    
    recordResult(suiteId: string, result: TestResult): void {
        const suite = this.suites.get(suiteId)
        if (!suite) {
            throw new Error(`Suite ${suiteId} not found`)
        }
        
        suite.results.push(result)
        suite.totalTests++
        
        if (result.status === 'passed') {
            suite.passed++
        } else if (result.status === 'failed' || result.status === 'error') {
            suite.failed++
            suite.status = 'failed'
        } else {
            suite.skipped++
        }
    }
    
    endSuite(suiteId: string): void {
        const suite = this.suites.get(suiteId)
        if (!suite) {
            throw new Error(`Suite ${suiteId} not found`)
        }
        
        suite.endTime = Date.now()
        suite.duration = suite.endTime - suite.startTime
        
        if (suite.failed > 0 && suite.passed > 0) {
            suite.status = 'partial'
        }
    }
    
    generateReport(metadata?: Record<string, any>): TestReport {
        const suites = Array.from(this.suites.values())
        const totalTests = suites.reduce((sum, s) => sum + s.totalTests, 0)
        const totalPassed = suites.reduce((sum, s) => sum + s.passed, 0)
        const totalFailed = suites.reduce((sum, s) => sum + s.failed, 0)
        const totalSkipped = suites.reduce((sum, s) => sum + s.skipped, 0)
        const totalDuration = suites.reduce((sum, s) => sum + (s.duration || 0), 0)
        const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
        
        const report: TestReport = {
            reportId: `report-${Date.now()}`,
            timestamp: new Date().toISOString(),
            config: this.config,
            suites,
            summary: {
                totalTests,
                totalPassed,
                totalFailed,
                totalSkipped,
                totalDuration,
                passRate,
            },
            security: metadata?.security || {
                attacksAttempted: 0,
                attacksBlocked: 0,
                vulnerabilities: [],
            },
            performance: metadata?.performance || {
                averageResponseTime: 0,
                maxResponseTime: 0,
                throughput: 0,
                errorRate: 0,
            },
            readiness: {
                verdict: totalFailed === 0 ? 'ready' : totalFailed < totalTests * 0.1 ? 'conditional' : 'not_ready',
                issues: [],
                recommendations: [],
            },
        }
        
        // Generate recommendations
        if (totalFailed > 0) {
            report.readiness.issues.push(`${totalFailed} test(s) failed`)
        }
        if (passRate < 100) {
            report.readiness.recommendations.push('Investigate and fix failing tests before production deployment')
        }
        if (totalSkipped > 0) {
            report.readiness.recommendations.push(`Review ${totalSkipped} skipped test(s)`)
        }
        
        return report
    }
    
    async saveReport(report: TestReport): Promise<string> {
        const outputDir = this.config.reporting.outputDir
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true })
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const reportPath = path.join(outputDir, `test-report-${timestamp}.json`)
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
        
        if (this.config.reporting.format === 'html' || this.config.reporting.format === 'both') {
            const htmlPath = path.join(outputDir, `test-report-${timestamp}.html`)
            const html = this.generateHTML(report)
            fs.writeFileSync(htmlPath, html)
        }
        
        return reportPath
    }
    
    private generateHTML(report: TestReport): string {
        const suitesHtml = report.suites.map(suite => `
            <div class="suite">
                <h3>${suite.name} (${suite.status})</h3>
                <p>Duration: ${(suite.duration || 0) / 1000}s | Tests: ${suite.totalTests} | Passed: ${suite.passed} | Failed: ${suite.failed}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Test</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${suite.results.map(r => `
                            <tr class="${r.status}">
                                <td>${r.name}</td>
                                <td>${r.status}</td>
                                <td>${r.duration}ms</td>
                                <td>${r.error || ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `).join('')
        
        return `<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${report.timestamp}</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        .suite { margin: 20px 0; border: 1px solid #ccc; padding: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        .summary { background: #f9f9f9; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${report.summary.totalTests}</p>
        <p>Passed: ${report.summary.totalPassed}</p>
        <p>Failed: ${report.summary.totalFailed}</p>
        <p>Pass Rate: ${report.summary.passRate.toFixed(2)}%</p>
        <p>Verdict: <strong>${report.readiness.verdict.toUpperCase()}</strong></p>
    </div>
    ${suitesHtml}
</body>
</html>`
    }
}

