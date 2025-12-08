'use client';

// Admin Archive management page
// Unified page for Learning and Experience with tab navigation

import { useState, useEffect } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { LearningEntry, ExperienceItem } from '@/lib/firestore/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminArchiveClient } from '@/components/admin/archive/AdminArchiveClient';

export default function AdminArchivePage() {
  const [learningEntries, setLearningEntries] = useState<LearningEntry[]>([]);
  const [experienceItems, setExperienceItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [learnings, experiences] = await Promise.all([
          learningRepository.getAllEntries(),
          experienceRepository.getAllEntries()
        ]);
        setLearningEntries(learnings);
        setExperienceItems(experiences);
      } catch (err) {
        setError('데이터를 불러오지 못했습니다.');
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 md:p-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <AdminHeader />
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-400">불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminHeader />
        
        {error && (
          <p className="text-sm text-red-400" aria-live="polite">
            {error}
          </p>
        )}

        <AdminArchiveClient 
          learningEntries={learningEntries}
          experienceItems={experienceItems}
        />
      </div>
    </div>
  );
}

