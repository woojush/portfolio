// Archive page - unified Learning and Experience with tab navigation

import { Suspense } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import { ArchiveClient } from '@/components/archive/ArchiveClient';

export default async function ArchivePage() {
  // Fetch all entries
  const learningEntries = await learningRepository.getPublicEntries();
  const learningSubjects = await learningRepository.getSubjects();
  const experienceItems = await experienceRepository.getPublicEntries();

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-slate-400">불러오는 중...</p></div>}>
      <ArchiveClient 
        learningEntries={learningEntries}
        learningSubjects={learningSubjects}
        experienceItems={experienceItems}
      />
    </Suspense>
  );
}

