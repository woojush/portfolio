// API endpoint to delete entries with no startDate
// Only accessible by admin

import { NextResponse } from 'next/server';
import { hasAdminSession } from '@/lib/adminSessionStore';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { experienceRepository } from '@/lib/repositories/experienceRepository';

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

    // Get all entries
    const learningItems = await learningRepository.getAllEntries();
    const experienceEntries = await experienceRepository.getAllEntries();

    // Find entries with no startDate or empty startDate
    const learningToDelete = learningItems.filter(
      (entry) => !entry.startDate || entry.startDate.trim() === ''
    );
    const experienceToDelete = experienceEntries.filter(
      (entry) => !entry.startDate || entry.startDate.trim() === ''
    );

    // Delete entries
    const deletedLearning = [];
    const deletedExperience = [];

    for (const entry of learningToDelete) {
      try {
        await learningRepository.delete(entry.id);
        deletedLearning.push(entry.id);
      } catch (error) {
        console.error(`Error deleting learning entry ${entry.id}:`, error);
      }
    }

    for (const entry of experienceToDelete) {
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
    console.error('Error cleaning up entries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

