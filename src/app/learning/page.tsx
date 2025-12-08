// Learning page - shows subject category cards with dynamic category filtering

import { Suspense } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { LearningClient } from '@/components/learning/LearningClient';

interface LearningPageProps {
  searchParams: Promise<{ subject?: string }>;
}

async function LearningContent({ subject }: { subject?: string }) {
  // Fetch all entries and subjects
  const entries = await learningRepository.getPublicEntries();
  const subjects = await learningRepository.getSubjects();

  // If subject is specified, show entries for that subject
  if (subject) {
    const filteredEntries = await learningRepository.getEntriesBySubject(subject);
    return <LearningClient entries={filteredEntries} subjects={subjects.filter((s) => s.subject === subject)} initialSubject={subject} />;
  }

  return <LearningClient entries={entries} subjects={subjects} />;
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
