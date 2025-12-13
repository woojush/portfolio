import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';
import type { ExperienceItem } from '@/lib/firestore/types';

export async function POST(req: Request) {
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

    const body = await req.json();
    const itemData: Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'> = body;

    const id = await experienceRepository.create(itemData);

    // 캐시 무효화
    revalidatePath('/experience');
    revalidatePath('/admin/experience');
    revalidatePath('/');

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating experience entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create experience entry' },
      { status: 500 }
    );
  }
}

