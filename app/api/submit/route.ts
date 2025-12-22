import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db/db'
import { contributionsTable } from '@/utils/db/schema'
import { createClient } from '@/utils/supabase/server'
import { debug, debugError } from '@/utils/debug'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
    debug('SubmitContribution', 'Submission request received')
    
    try {
        // Check authentication
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user || !user.email) {
            debug('SubmitContribution', 'Unauthorized submission attempt')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }
        
        const formData = await request.formData()
        const title = formData.get('title') as string
        const contributor = formData.get('contributor') as string || user.email
        const category = formData.get('category') as string || 'scientific'
        const text_content = formData.get('text_content') as string || ''
        const file = formData.get('file') as File | null
        
        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }
        
        // Generate submission hash
        const submission_hash = crypto.randomBytes(16).toString('hex')
        
        // Calculate content hash
        const contentToHash = text_content || title
        const content_hash = crypto
            .createHash('sha256')
            .update(contentToHash.toLowerCase().trim())
            .digest('hex')
        
        // Handle file upload if present
        let pdf_path: string | null = null
        if (file) {
            // In production, you'd upload to Supabase Storage or S3
            // For now, we'll store the file name
            pdf_path = file.name
            debug('SubmitContribution', 'File received', { fileName: file.name, size: file.size })
        }
        
        // Insert contribution into database
        await db.insert(contributionsTable).values({
            submission_hash,
            title,
            contributor,
            content_hash,
            text_content: text_content || null,
            pdf_path,
            status: 'draft',
            category,
            metals: [],
            metadata: {}
        })
        
        debug('SubmitContribution', 'Contribution submitted successfully', {
            submission_hash,
            title,
            contributor
        })
        
        return NextResponse.json({
            success: true,
            submission_hash
        })
    } catch (error) {
        debugError('SubmitContribution', 'Error submitting contribution', error)
        return NextResponse.json(
            { error: 'Failed to submit contribution' },
            { status: 500 }
        )
    }
}

