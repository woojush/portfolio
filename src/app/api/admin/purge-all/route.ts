// Admin-only endpoint to remove all learning and experience entries.
// Use with caution: this deletes all documents so that URL 기반으로 재시작할 수 있습니다.

import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSessionStore';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { experienceRepository } from '@/lib/repositories/experienceRepository';

export async function POST(req: Request) {
  try {
    const sessionCookie = req.headers
      .get('cookie')
      ?.split(';')
      .find((c) => c.trim().startsWith('admin_session='))
      ?.split('=')[1];

    if (!sessionCookie || !hasAdminSession(sessionCookie)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 모든 학습/경험 항목 조회
    const [learningItems, experienceEntries] = await Promise.all([
      learningRepository.getAllEntries(),
      experienceRepository.getAllEntries()
    ]);

    // 개별 삭제 (연쇄 에러 방지를 위해 try/catch)
    const deletedLearning: string[] = [];
    const deletedExperience: string[] = [];

    for (const entry of learningItems) {
      try {
        await learningRepository.delete(entry.id);
        deletedLearning.push(entry.id);
      } catch (error) {
        console.error(`Error deleting learning entry ${entry.id}:`, error);
      }
    }

    for (const entry of experienceEntries) {
      try {
        await experienceRepository.delete(entry.id);
        deletedExperience.push(entry.id);
      } catch (error) {
        console.error(`Error deleting experience entry ${entry.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      deleted: {
        learning: deletedLearning.length,
        experience: deletedExperience.length,
        total: deletedLearning.length + deletedExperience.length
      },
      details: {
        learning: deletedLearning,
        experience: deletedExperience
      }
    });
  } catch (error) {
    console.error('Error purging entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

