import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Server-side PDF text extraction API using pdf-parse
 * pdf-parse is designed for Node.js and handles server-side PDF parsing better than pdfjs-dist
 * Uses the same approach as the pdf-parse library with proper text extraction
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now()

    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Validate PDF
        if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'File must be a PDF' },
                { status: 400 }
            )
        }

        console.log(`[PDF Extract] Starting extraction for file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)

        // Read file as buffer for pdf-parse
        let buffer: Buffer
        try {
            const arrayBuffer = await file.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
            console.log(`[PDF Extract] File read successfully, buffer size: ${buffer.length} bytes`)
        } catch (readError) {
            console.error('[PDF Extract] Failed to read file:', readError)
            throw new Error(`Failed to read file: ${readError instanceof Error ? readError.message : String(readError)}`)
        }

        // Verify it looks like a PDF (starts with %PDF)
        try {
            const pdfHeader = buffer.toString('ascii', 0, 4)
            if (!pdfHeader.startsWith('%PDF')) {
                console.warn(`[PDF Extract] Warning: File does not start with PDF header. Got: ${pdfHeader}`)
            } else {
                console.log(`[PDF Extract] PDF header verified: ${pdfHeader}`)
            }
        } catch (headerError) {
            console.warn('[PDF Extract] Could not verify PDF header:', headerError)
        }

        // Use pdf-parse for server-side PDF processing
        console.log('[PDF Extract] Using pdf-parse for text extraction')
        const { PDFParse } = await import('pdf-parse')

        // Extract text using pdf-parse
        let pdfData: any
        try {
            const pdfParser = new PDFParse({
                data: new Uint8Array(buffer),
                verbosity: 0 // Minimal logging
            })

            pdfData = await pdfParser.getText()
            console.log(`[PDF Extract] PDF parsed successfully, pages: ${pdfData.total}`)
        } catch (parseError) {
            console.error('[PDF Extract] Error parsing PDF:', parseError)
            throw new Error(`Failed to parse PDF: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
        }

        // Get extracted text from TextResult
        let extractedText = pdfData.text || ''
        console.log(`[PDF Extract] Extracted ${extractedText.length} characters from ${pdfData.total} pages`)

        // Clean up the text (similar to Python scraper's text cleaning)
        // Normalize excessive whitespace but preserve intentional line breaks
        extractedText = extractedText.replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
        extractedText = extractedText.replace(/\n\s*\n\s*\n+/g, '\n\n') // Normalize multiple newlines to double

        // Limit to reasonable length (equivalent to 50 pages)
        const maxLength = 500000 // ~50 pages of text
        if (extractedText.length > maxLength) {
            extractedText = extractedText.substring(0, maxLength) + '\n\n[Content truncated - PDF text exceeds maximum length]'
        }

        const elapsed = Date.now() - startTime
        console.log(`[PDF Extract] Extraction completed in ${elapsed}ms`)

        return NextResponse.json({
            success: true,
            text: extractedText,
            pagesExtracted: pdfData.total,
            totalPages: pdfData.total,
            // Include page details from TextResult
            pages: pdfData.pages || []
        })

    } catch (error) {
        const elapsed = Date.now() - startTime
        console.error(`[PDF Extract] Error after ${elapsed}ms:`, error)

        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined

        // Log full error details for debugging
        console.error('[PDF Extract] Full error details:', {
            message: errorMessage,
            stack: errorStack,
            name: error instanceof Error ? error.name : undefined,
            elapsed
        })

        // Return detailed error for debugging (even in production for now)
        return NextResponse.json(
            {
                error: 'Failed to extract PDF text',
                message: errorMessage,
                // Include detailed error info to help debug
                details: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview' ? {
                    stack: errorStack,
                    name: error instanceof Error ? error.name : undefined,
                    elapsed: Date.now() - startTime
                } : {
                    elapsed: Date.now() - startTime
                }
            },
            { status: 500 }
        )
    }
}


