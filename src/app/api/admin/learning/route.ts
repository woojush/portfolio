import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';
import type { LearningEntry } from '@/lib/firestore/types';

export async function POST(req: Request) {
  try {
    // 관리자 세션 확인
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session')?.value;
    
    if (!sessionCookie) {
      console.error('No admin_session cookie found');
      return NextResponse.json(
        { error: 'Unauthorized: No session cookie' },
        { status: 401 }
      );
    }
    
    if (!hasAdminSession(sessionCookie)) {
      console.error('Invalid admin session:', sessionCookie.substring(0, 20) + '...');
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const entryData: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'> = body;

    const id = await learningRepository.create(entryData);

    // 캐시 무효화
    revalidatePath('/learning');
    revalidatePath('/admin/learning');
    revalidatePath('/');

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating learning entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create learning entry' },
      { status: 500 }
    );
  }
}

