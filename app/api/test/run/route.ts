/**
 * Test Execution API Route
 * Triggers test suite execution on Vercel server
 * 
 * GET /api/test/run - Run all tests
 * GET /api/test/run?suite=hardhat - Run specific test suite
 */

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

// Maximum execution time: 10 minutes (Vercel serverless function limit)
export const maxDuration = 600

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const suite = searchParams.get('suite') || 'all'
        
        // Validate suite parameter
        const validSuites = ['all', 'hardhat', 'integration', 'security', 'load']
        if (!validSuites.includes(suite)) {
            return NextResponse.json(
                { error: `Invalid suite. Must be one of: ${validSuites.join(', ')}` },
                { status: 400 }
            )
        }

        // Determine test command
        let testCommand = ''
        switch (suite) {
            case 'hardhat':
                testCommand = 'npm run test:hardhat'
                break
            case 'integration':
                testCommand = 'npm run test:integration'
                break
            case 'security':
                testCommand = 'npm run test:security'
                break
            case 'load':
                testCommand = 'npm run test:load'
                break
            case 'all':
            default:
                testCommand = 'npm run test:all'
                break
        }

        console.log(`🧪 Starting test suite: ${suite}`)
        console.log(`📝 Command: ${testCommand}`)

        // Run tests with timeout
        const timeout = 9 * 60 * 1000 // 9 minutes (leave 1 minute buffer)
        const startTime = Date.now()

        try {
            const { stdout, stderr } = await Promise.race([
                execAsync(testCommand, {
                    cwd: process.cwd(),
                    env: process.env,
                    timeout,
                }),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Test execution timeout')), timeout)
                ),
            ])

            const duration = Date.now() - startTime

            // Check for test report
            const reportDir = process.env.VERCEL ? '/tmp/tests/reports' : './tests/reports'
            let reportPath = null
            let reportExists = false

            try {
                const files = fs.readdirSync(reportDir)
                const jsonReports = files.filter(f => f.endsWith('.json'))
                if (jsonReports.length > 0) {
                    // Get most recent report
                    const reports = jsonReports
                        .map(f => ({
                            name: f,
                            path: path.join(reportDir, f),
                            mtime: fs.statSync(path.join(reportDir, f)).mtime,
                        }))
                        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
                    
                    reportPath = reports[0].path
                    reportExists = true
                }
            } catch (error) {
                console.warn('Could not read test reports directory:', error)
            }

            // Parse output to determine success
            const output = stdout + stderr
            const passed = !output.includes('failing') && 
                          !output.includes('Error:') && 
                          (output.includes('passing') || output.includes('✓'))

            return NextResponse.json({
                success: true,
                suite,
                duration: `${Math.round(duration / 1000)}s`,
                passed,
                output: output.slice(-5000), // Last 5000 chars
                report: reportExists ? {
                    path: reportPath,
                    url: `/api/test-report/latest`,
                } : null,
            })
        } catch (error: any) {
            const duration = Date.now() - startTime
            
            return NextResponse.json({
                success: false,
                suite,
                duration: `${Math.round(duration / 1000)}s`,
                error: error.message || 'Test execution failed',
                output: error.stdout || error.stderr || '',
            }, { status: 500 })
        }
    } catch (error: any) {
        console.error('Test execution error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to execute tests' },
            { status: 500 }
        )
    }
}

