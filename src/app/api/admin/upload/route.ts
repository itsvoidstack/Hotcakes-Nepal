import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export const revalidate = 0;

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer authenticated-session-token-hc' || authHeader === 'Bearer authenticated-dev-session-token-hc';
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const customFilename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!bucket) {
      return NextResponse.json({ error: 'Storage bucket not specified' }, { status: 400 });
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Generate unique or custom filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    let filename = '';
    if (customFilename) {
      filename = customFilename;
      if (!filename.endsWith(`.${fileExtension}`)) {
        filename = `${filename}.${fileExtension}`;
      }
    } else {
      filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    }

    // Convert file to arrayBuffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename: filename
    });

  } catch (err: unknown) {
    const message = (err instanceof Error ? err.message : null) || 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
