// API endpoint for uploading images to Firebase Storage
// Only accessible by admin

import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSessionStore';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(req: Request) {
  try {
    // Check admin session
    const sessionCookie = req.headers.get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('admin_session='))
      ?.split('=')[1];

    if (!sessionCookie || !hasAdminSession(sessionCookie)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `thumbnails/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    await uploadBytes(storageRef, bytes);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);

    return NextResponse.json({ url: downloadURL });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

