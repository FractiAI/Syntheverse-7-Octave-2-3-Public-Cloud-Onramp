import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import pdfParse from 'pdf-parse'

/**
 * PDF text extraction using pdf-parse with robust error handling
 *
 * Why pdf-parse:
 * - 100% free and open source (no API costs)
 * - Pure JavaScript implementation
 * - Works in serverless environments
 * - Well-maintained (200k+ downloads/week)
 * - No native dependencies
 *
 * Includes DOMMatrix polyfill for Node.js compatibility.
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now()

    // Declare variables for error handling (accessible in catch block)
    let fileName = ''

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

        // Store file info for fallback use (accessible in catch block)
        fileName = file.name

        console.log(`[PDF Extract] Starting cloud-based extraction for file: ${file.name}, size: ${file.size} bytes`)

        // Convert file to buffer for textract
        const buffer = Buffer.from(await file.arrayBuffer())

        // Extract text using pdf-parse with DOMMatrix polyfill
        let extractedText = ''
        let extractionMethod = 'pdf-parse'
        let pagesExtracted = 1

        try {
            // Polyfill DOMMatrix for Node.js (pdf-parse requires this)
            if (typeof (globalThis as any).DOMMatrix === 'undefined') {
                // Import dommatrix polyfill
                const { DOMMatrix } = await import('dommatrix')
                ;(globalThis as any).DOMMatrix = DOMMatrix
                console.log('[PDF Extract] DOMMatrix polyfill loaded')
            }

            const result = await extractTextWithPdfParse(buffer)
            extractedText = result.text
            pagesExtracted = result.pages
            console.log(`[PDF Extract] pdf-parse extraction successful: ${extractedText.length} chars from ${pagesExtracted} pages`)
        } catch (extractError) {
            console.error('[PDF Extract] pdf-parse extraction failed:', extractError)

            // Return error instead of fallback - user should know extraction failed
            return NextResponse.json({
                success: false,
                error: 'PDF text extraction failed. The PDF may be corrupted, password-protected, or in an unsupported format. Please try a different PDF file.',
                method: 'failed',
                fileName: file.name,
                fileSize: file.size,
                extractionTime: Date.now() - startTime
            }, { status: 422 }) // 422 Unprocessable Entity - indicates validation/semantic error
        }

        // Validate extracted text
        extractedText = extractedText.trim()
        if (extractedText.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No text content could be extracted from the PDF. The document may be image-based, corrupted, or contain no readable text.',
                method: 'empty-content',
                fileName: file.name,
                fileSize: file.size,
                extractionTime: Date.now() - startTime
            }, { status: 422 })
        }

        const elapsed = Date.now() - startTime
        console.log(`[PDF Extract] Completed in ${elapsed}ms using ${extractionMethod} method`)

        return NextResponse.json({
            success: true,
            text: extractedText,
            pagesExtracted,
            totalPages: pagesExtracted,
            method: extractionMethod,
            // Metadata for debugging
            fileSize: file.size,
            fileName: file.name,
            extractionTime: elapsed,
            note: 'Using intelligent filename-based extraction for reliable, serverless-compatible PDF processing'
        })

    } catch (error) {
        const elapsed = Date.now() - startTime
        console.error(`[PDF Extract] Fatal error after ${elapsed}ms:`, error)

        // Return error - don't fallback to filename processing
        return NextResponse.json({
            success: false,
            error: 'PDF processing failed due to an unexpected error. Please try again or contact support if the issue persists.',
            method: 'fatal-error',
            fileName: fileName,
            extractionTime: elapsed,
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        }, { status: 500 })
    }
}

/**
 * Extract text from PDF using pdf-parse library
 * Pure JavaScript implementation with DOMMatrix polyfill
 */
async function extractTextWithPdfParse(buffer: Buffer): Promise<{ text: string; pages: number }> {
    try {
        // Parse PDF with pdf-parse
        const data = await pdfParse(buffer)

        // Validate extracted data
        if (!data || typeof data !== 'object') {
            throw new Error('pdf-parse returned invalid data structure')
        }

        if (!data.text || typeof data.text !== 'string') {
            throw new Error('pdf-parse extracted no text content')
        }

        // Get the extracted text
        let extractedText = data.text.trim()

        if (extractedText.length === 0) {
            throw new Error('pdf-parse produced empty text content (file may be image-only or encrypted)')
        }

        // Process the extracted text with defensive programming
        let cleanText = extractedText

        try {
            // Remove excessive whitespace
            cleanText = cleanText.replace(/[ \t]+/g, ' ')  // Multiple spaces to single
            if (typeof cleanText !== 'string') {
                throw new Error('First regex replacement failed')
            }
            cleanText = cleanText.replace(/\n\s*\n\s*\n+/g, '\n\n')  // Multiple newlines to double
            if (typeof cleanText !== 'string') {
                throw new Error('Second regex replacement failed')
            }
        } catch (regexError) {
            throw new Error(`Text processing regex error: ${regexError instanceof Error ? regexError.message : String(regexError)}`)
        }

        // Get page count from pdf-parse result
        const pages = data.numpages || 1

        return {
            text: cleanText,
            pages: pages
        }

    } catch (error) {
        throw new Error(`pdf-parse extraction error: ${error instanceof Error ? error.message : String(error)}`)
    }
}

/**
 * Extract meaningful text from PDF filename using intelligent processing
 * Provides reliable, meaningful text extraction as fallback
 */
function extractTextFromFilename(filename: string): string {
    // Remove .pdf extension
    let text = filename.replace(/\.pdf$/i, '')

    // Replace underscores and hyphens with spaces
    text = text.replace(/[_-]/g, ' ')

    // Handle camelCase (add spaces before capital letters)
    text = text.replace(/([a-z])([A-Z])/g, '$1 $2')

    // Handle abbreviations (AI, PDF, etc.)
    text = text.replace(/\b(AI|PDF|ML|API|UI|UX|JS|TS|CSS|HTML|HTTP|HTTPS|URL|URI|JSON|XML)\b/g, ' $1 ')

    // Clean up multiple spaces
    text = text.replace(/\s+/g, ' ').trim()

    // Capitalize first letter of each word for better readability
    text = text.replace(/\b\w/g, (char) => char.toUpperCase())

    return text
}


