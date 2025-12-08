// Learning page - shows subject category cards with dynamic category filtering

import { Suspense } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { LearningClient } from '@/components/learning/LearningClient';

interface LearningPageProps {
  searchParams: Promise<{ subject?: string }>;
}

async function LearningContent({ subject }: { subject?: string }) {
  // Fetch all entries (always fetch all for category buttons)
  const entries = await learningRepository.getPublicEntries();

  return <LearningClient entries={entries} initialSubject={subject} />;
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
  const params = await searchParams;
  const subject = params.subject;

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><p className="text-slate-400">불러오는 중...</p></div>}>
      <LearningContent subject={subject} />
    </Suspense>
  );
}
