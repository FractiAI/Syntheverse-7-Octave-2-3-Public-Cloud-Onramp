/**
 * Upload Profile Picture
 * POST /api/social/upload-profile-picture
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 2MB for profile pictures)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    // Generate unique filename using user email hash for consistency
    const fileExt = file.name.split('.').pop() || 'jpg';
    const emailHash = crypto.createHash('md5').update(user.email).digest('hex').substring(0, 8);
    const fileName = `${emailHash}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old profile picture if exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .limit(1);

    if (existingUser[0]?.profile_picture_url) {
      try {
        // Extract old file path from URL
        const oldUrl = existingUser[0].profile_picture_url;
        const urlParts = oldUrl.split('/');
        const oldFileName = urlParts[urlParts.length - 1];
        
        // Delete old file from storage
        await supabase.storage
          .from('profile-pictures')
          .remove([oldFileName]);
      } catch (error) {
        // Ignore errors when deleting old picture (file might not exist)
        console.warn('Could not delete old profile picture:', error);
      }
    }

    // Upload to Supabase Storage (upsert to replace if exists)
    const { data, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      console.error('Error uploading profile picture:', uploadError);
      return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);

    // Update user record
    await db
      .update(usersTable)
      .set({ profile_picture_url: publicUrl })
      .where(eq(usersTable.email, user.email));

    return NextResponse.json({
      url: publicUrl,
      path: filePath,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ error: 'Failed to upload profile picture' }, { status: 500 });
  }
}

