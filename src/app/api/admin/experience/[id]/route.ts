import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';
import type { ExperienceItem } from '@/lib/firestore/types';

export async function PUT(
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
    const body = await request.json();
    const itemData: Partial<Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'>> = body;

    await experienceRepository.update(id, itemData);

    // 캐시 무효화
    revalidatePath('/experience');
    revalidatePath('/admin/experience');
    revalidatePath('/');
    revalidatePath(`/experience/${id}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating experience entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update experience entry' },
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
    await experienceRepository.delete(id);

    // 캐시 무효화
    revalidatePath('/experience');
    revalidatePath('/admin/experience');
    revalidatePath('/'); // 홈페이지도 갱신 (ExperienceSection)

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting experience entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete experience entry' },
      { status: 500 }
    );
  }
}

