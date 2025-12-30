import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Server-side PDF text extraction API
 * Uses pdf-parse library approach (similar to modesty/pdf-parse) for better text extraction
 * Based on the pdf-parse package's getPageText method which properly handles:
 * - Viewport-based text positioning
 * - Line break detection based on Y coordinates
 * - Proper handling of hasEOL flags
 * - Intelligent text item joining
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

        // Read file as Uint8Array
        let arrayBuffer: ArrayBuffer
        try {
            arrayBuffer = await file.arrayBuffer()
            console.log(`[PDF Extract] File read successfully, arrayBuffer size: ${arrayBuffer.byteLength} bytes`)
        } catch (readError) {
            console.error('[PDF Extract] Failed to read file:', readError)
            throw new Error(`Failed to read file: ${readError instanceof Error ? readError.message : String(readError)}`)
        }
        
        const uint8Array = new Uint8Array(arrayBuffer)
        console.log(`[PDF Extract] Uint8Array created, length: ${uint8Array.length} bytes`)
        
        // Verify it looks like a PDF (starts with %PDF)
        try {
            const pdfHeader = String.fromCharCode(...uint8Array.slice(0, Math.min(4, uint8Array.length)))
            if (!pdfHeader.startsWith('%PDF')) {
                console.warn(`[PDF Extract] Warning: File does not start with PDF header. Got: ${pdfHeader}`)
            } else {
                console.log(`[PDF Extract] PDF header verified: ${pdfHeader}`)
            }
        } catch (headerError) {
            console.warn('[PDF Extract] Could not verify PDF header:', headerError)
        }

        // Polyfill DOMMatrix for Node.js (pdfjs-dist requires this)
        if (typeof (globalThis as any).DOMMatrix === 'undefined') {
            // Minimal DOMMatrix polyfill for pdfjs-dist
            class DOMMatrixPolyfill {
                a: number = 1
                b: number = 0
                c: number = 0
                d: number = 1
                e: number = 0
                f: number = 0
                m11: number = 1
                m12: number = 0
                m21: number = 0
                m22: number = 1
                m41: number = 0
                m42: number = 0
                constructor(init?: string | number[] | any) {
                    if (init) {
                        // Handle initialization if needed
                    }
                }
                static fromMatrix(other?: any) {
                    return new DOMMatrixPolyfill()
                }
                static fromFloat32Array(array: Float32Array) {
                    return new DOMMatrixPolyfill()
                }
                static fromFloat64Array(array: Float64Array) {
                    return new DOMMatrixPolyfill()
                }
            }
            ;(globalThis as any).DOMMatrix = DOMMatrixPolyfill
            console.log('[PDF Extract] DOMMatrix polyfill created')
        }
        
        // Use standard pdfjs-dist (more compatible with Next.js/Vercel serverless)
        // We'll configure it for server-side synchronous processing
        // Set environment variable to disable workers
        process.env.PDFJS_DISABLE_WORKER = 'true'
        const pdfjs = await import('pdfjs-dist')
        
        // Configure worker BEFORE getting getDocument (important!)
        // For server-side Node.js/serverless, don't set workerSrc (like pdf-parse does)
        if (pdfjs?.GlobalWorkerOptions === null) {
            console.log('[PDF Extract] GlobalWorkerOptions is null, skipping worker configuration')
        } else {
            const GlobalWorkerOptions = pdfjs.GlobalWorkerOptions || pdfjs.default?.GlobalWorkerOptions
            if (GlobalWorkerOptions) {
                // Completely disable workers for server-side
                GlobalWorkerOptions.workerSrc = ''
                GlobalWorkerOptions.workerPort = null

                // Try to disable worker loading entirely by patching PDFWorker
                try {
                    const PDFWorker = pdfjs.PDFWorker || pdfjs.default?.PDFWorker
                    if (PDFWorker) {
                        // Create a mock worker port to prevent actual worker loading
                        const mockWorkerPort = {
                            postMessage: () => {},
                            addEventListener: () => {},
                            removeEventListener: () => {},
                            terminate: () => {},
                            onmessage: null,
                            onerror: null
                        }

                        GlobalWorkerOptions.workerPort = mockWorkerPort

                        // Monkey patch PDFWorker.fromPort to return a mock worker
                        const originalFromPort = PDFWorker.fromPort
                        PDFWorker.fromPort = function(params) {
                            // Return a mock PDFWorker that doesn't actually load workers
                            return {
                                destroy: () => {},
                                promise: Promise.resolve(),
                                port: mockWorkerPort,
                                _isDestroyed: false
                            }
                        }
                        console.log('[PDF Extract] PDFWorker patched with mock worker')
                    }
                } catch (patchError) {
                    console.warn('[PDF Extract] Could not patch PDFWorker:', patchError)
                }

                console.log('[PDF Extract] Workers completely disabled for server-side')
            } else {
                console.warn('[PDF Extract] GlobalWorkerOptions not found')
            }
        }
        
        // Get getDocument - try different access patterns
        let getDocument: any = null
        if (typeof (pdfjs as any).getDocument === 'function') {
            getDocument = (pdfjs as any).getDocument
        } else if (pdfjs.default && typeof pdfjs.default.getDocument === 'function') {
            getDocument = pdfjs.default.getDocument
        } else if ((pdfjs as any).default?.getDocument) {
            getDocument = (pdfjs as any).default.getDocument
        }
        
        if (!getDocument || typeof getDocument !== 'function') {
            console.error('[PDF Extract] getDocument not found. Module keys:', Object.keys(pdfjs).slice(0, 20))
            throw new Error('PDF.js getDocument function not available')
        }
        
        console.log('[PDF Extract] getDocument found successfully')

        // Load PDF document
        let pdf: any
        
        try {
            console.log('[PDF Extract] Calling getDocument...')
            // Load PDF with explicit synchronous processing
            // Multiple options to ensure no worker is used
            const loadingTask = getDocument({
                data: uint8Array,
                verbosity: 0, // 0 = errors only
                useSystemFonts: false,
                disableFontFace: true,
                // Explicitly disable worker for server-side
                disableWorker: true,
                disableRange: true,
                disableStream: true,
                disableAutoFetch: true,
                // Additional worker disabling options
                isEvalSupported: false,
                useWorkerFetch: false
            })
            
            pdf = await loadingTask.promise
            console.log(`[PDF Extract] PDF loaded successfully, pages: ${pdf.numPages}`)
        } catch (loadError) {
            console.error('[PDF Extract] Error loading PDF:', loadError)
            throw new Error(`Failed to load PDF: ${loadError instanceof Error ? loadError.message : String(loadError)}`)
        }

        // Extract text from each page using pdf-parse approach
        const textParts: string[] = []
        const maxPages = Math.min(pdf.numPages, 50)
        
        console.log(`[PDF Extract] Extracting text from ${maxPages} pages...`)
        
        // Line threshold for detecting line breaks (similar to pdf-parse default)
        const lineThreshold = 5
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum)
                const viewport = page.getViewport({ scale: 1 })
                
                // Get text content (similar to pdf-parse getPageText)
                const textContent = await page.getTextContent({
                    includeMarkedContent: false,
                    disableNormalization: false,
                })
                
                if (textContent && textContent.items && Array.isArray(textContent.items)) {
                    // Process text items using pdf-parse approach
                    const strBuf: string[] = []
                    let lastX: number | undefined
                    let lastY: number | undefined
                    let lineHeight = 0
                    
                    for (const item of textContent.items) {
                        if (!('str' in item)) {
                            continue
                        }
                        
                        // Get transform matrix (position)
                        const tm = item.transform || [1, 0, 0, 1, 0, 0]
                        const [x, y] = viewport.convertToViewportPoint(tm[4], tm[5])
                        
                        // Handle line breaks based on Y position (pdf-parse approach)
                        if (lastY !== undefined && Math.abs(lastY - y) > lineThreshold) {
                            const lastItem = strBuf.length ? strBuf[strBuf.length - 1] : undefined
                            const isCurrentItemHasNewLine = item.str.startsWith('\n') || (item.str.trim() === '' && item.hasEOL)
                            if (lastItem?.endsWith('\n') === false && !isCurrentItemHasNewLine) {
                                const ydiff = Math.abs(lastY - y)
                                if (ydiff - 1 > lineHeight) {
                                    strBuf.push('\n')
                                    lineHeight = 0
                                }
                            }
                        }
                        
                        strBuf.push(item.str)
                        lastX = x + (item.width || 0)
                        lastY = y
                        lineHeight = Math.max(lineHeight, item.height || 0)
                        
                        // Handle end of line flags
                        if (item.hasEOL) {
                            strBuf.push('\n')
                        }
                        if (item.hasEOL || item.str.endsWith('\n')) {
                            lineHeight = 0
                        }
                    }
                    
                    const pageText = strBuf.join('').trim()
                    
                    if (pageText) {
                        textParts.push(pageText)
                    }
                }
                
                // Cleanup page resources
                page.cleanup()
            } catch (pageError) {
                console.warn(`[PDF Extract] Error extracting text from page ${pageNum}:`, pageError)
                // Continue with other pages
            }
        }

        // Combine all pages with double newlines (similar to Python: "\n\n".join(text_parts))
        let extractedText = textParts.join('\n\n')
        
        console.log(`[PDF Extract] Extracted ${extractedText.length} characters from ${textParts.length} pages`)

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

        if (pdf.numPages > 50) {
            return NextResponse.json({
                success: true,
                text: extractedText + '\n\n[Content truncated - PDF has more than 50 pages]',
                pagesExtracted: maxPages,
                totalPages: pdf.numPages
            })
        }

        return NextResponse.json({
            success: true,
            text: extractedText,
            pagesExtracted: maxPages,
            totalPages: pdf.numPages
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

