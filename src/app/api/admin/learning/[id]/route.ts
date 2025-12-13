import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';
import type { LearningEntry } from '@/lib/firestore/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const entryData: Partial<Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'>> = body;

    await learningRepository.update(id, entryData);

    // 캐시 무효화
    revalidatePath('/learning');
    revalidatePath('/admin/learning');
    revalidatePath('/');
    revalidatePath(`/learning/${entryData.subject}/${id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating learning entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update learning entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 세션 확인
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session')?.value;
    
    if (!sessionCookie || !hasAdminSession(sessionCookie)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await learningRepository.delete(id);

    // 캐시 무효화
    revalidatePath('/learning');
    revalidatePath('/admin/learning');
    revalidatePath('/'); // 홈페이지도 갱신 (LearningSection)

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting learning entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete learning entry' },
      { status: 500 }
    );
  }
}

