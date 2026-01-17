import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getAuthenticatedUserWithRole } from '@/utils/auth/permissions';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// POST: Upload a file (image or PDF) for chat messages
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (images and PDFs only)
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      return NextResponse.json({ error: 'File must be an image or PDF' }, { status: 400 });
    }

    // Validate file size (max 10MB for images, 20MB for PDFs)
    const maxSizeImage = 10 * 1024 * 1024; // 10MB
    const maxSizePDF = 20 * 1024 * 1024; // 20MB
    const maxSize = isImage ? maxSizeImage : maxSizePDF;
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const bucketName = isImage ? 'chat-images' : 'chat-files';
    const filePath = `${bucketName}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      type: isImage ? 'image' : 'pdf',
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

