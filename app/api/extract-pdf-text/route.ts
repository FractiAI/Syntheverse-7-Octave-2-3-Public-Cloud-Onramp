import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Server-side PDF text extraction API
 * Similar to the Python scraper's extract_text_from_pdf function
 * Uses pdf-parse (similar to Python's pypdf) - simpler and more reliable
 */
export async function POST(request: NextRequest) {
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

        // Read file as buffer (pdf-parse needs Buffer)
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Use pdf-parse (similar to Python's pypdf.PdfReader)
        // Much simpler and more reliable than pdfjs-dist for server-side
        const pdfParse = await import('pdf-parse')
        
        let pdfData: any
        try {
            pdfData = await pdfParse.default(buffer)
        } catch (parseError) {
            console.error('Error parsing PDF:', parseError)
            throw new Error(`Failed to parse PDF: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
        }

        // Extract text - pdf-parse gives us all text at once
        // Similar to Python: "\n\n".join([page.extract_text() for page in reader.pages])
        let extractedText = pdfData.text || ''
        
        // Clean up the text (similar to Python scraper's text cleaning)
        // Remove excessive whitespace
        extractedText = extractedText.replace(/\s+/g, ' ').trim()
        // Normalize line breaks
        extractedText = extractedText.replace(/\n\s*\n\s*\n+/g, '\n\n')
        
        const totalPages = pdfData.numpages || 0

        // Limit to reasonable length (equivalent to 50 pages)
        const maxLength = 500000 // ~50 pages of text
        if (extractedText.length > maxLength) {
            extractedText = extractedText.substring(0, maxLength) + '\n\n[Content truncated - PDF text exceeds maximum length]'
        }

        if (totalPages > 50) {
            return NextResponse.json({
                success: true,
                text: extractedText + '\n\n[Content truncated - PDF has more than 50 pages]',
                pagesExtracted: Math.min(totalPages, 50),
                totalPages: totalPages
            })
        }

        return NextResponse.json({
            success: true,
            text: extractedText,
            pagesExtracted: totalPages,
            totalPages: totalPages
        })

    } catch (error) {
        console.error('PDF extraction error:', error)
        return NextResponse.json(
            { 
                error: 'Failed to extract PDF text',
                message: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        )
    }
}

