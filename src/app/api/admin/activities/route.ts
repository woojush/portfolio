import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { activitiesRepository } from '@/lib/repositories/activitiesRepository';
import { cookies } from 'next/headers';
import { hasAdminSession } from '@/lib/adminSessionStore';
import type { Activity } from '@/lib/firestore/activities';

export async function GET() {
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

    const items = await activitiesRepository.getAllEntries();
    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

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
    const activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = body;

    const id = await activitiesRepository.create(activityData);

    // 캐시 무효화
    revalidatePath('/journey');
    revalidatePath('/');

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create activity' },
      { status: 500 }
    );
  }
}

