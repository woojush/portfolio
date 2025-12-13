import { NextResponse } from 'next/server';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';

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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting experience entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete experience entry' },
      { status: 500 }
    );
  }
}

