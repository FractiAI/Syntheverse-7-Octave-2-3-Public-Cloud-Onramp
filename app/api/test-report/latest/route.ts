import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    try {
        const reportsDir = path.join(process.cwd(), 'tests', 'reports')
        
        // Check if reports directory exists
        if (!fs.existsSync(reportsDir)) {
            return NextResponse.json({ 
                report: null,
                message: 'No test reports directory found'
            })
        }

        // Find all JSON report files
        const files = fs.readdirSync(reportsDir)
            .filter(file => file.startsWith('test-report-') && file.endsWith('.json'))
            .sort()
            .reverse() // Most recent first

        if (files.length === 0) {
            return NextResponse.json({ 
                report: null,
                message: 'No test reports found'
            })
        }

        // Read the latest report
        const latestReportPath = path.join(reportsDir, files[0])
        const reportContent = fs.readFileSync(latestReportPath, 'utf-8')
        const report = JSON.parse(reportContent)

        return NextResponse.json({ 
            report,
            reportId: files[0],
            timestamp: report.timestamp
        })
    } catch (error: any) {
        console.error('Error reading test report:', error)
        return NextResponse.json(
            { 
                error: 'Failed to read test report',
                message: error.message 
            },
            { status: 500 }
        )
    }
}

