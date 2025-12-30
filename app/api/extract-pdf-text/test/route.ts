import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify node-poppler is working
 * GET /api/extract-pdf-text/test
 */
export async function GET() {
    try {
        // Test importing node-poppler
        const { Poppler } = await import('node-poppler')

        // Check if Poppler class is available
        const moduleInfo = {
            popplerAvailable: typeof Poppler === 'function',
            popplerPrototype: Poppler.prototype ? Object.getOwnPropertyNames(Poppler.prototype).slice(0, 5) : []
        }

        return NextResponse.json({
            success: true,
            nodePopplerAvailable: true,
            moduleInfo,
            message: 'node-poppler module loaded successfully'
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            nodePopplerAvailable: false,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

