// Learning page - shows subject category cards with dynamic category filtering

import { learningRepository } from '@/lib/repositories/learningRepository';
import { LearningClient } from '@/components/learning/LearningClient';

interface LearningPageProps {
  searchParams: Promise<{ subject?: string }>;
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
  const params = await searchParams;
  const subject = params.subject;

  // Fetch all entries and subjects
  const entries = await learningRepository.getPublicEntries();
  const subjects = await learningRepository.getSubjects();

  // If subject is specified, show entries for that subject
  if (subject) {
    const filteredEntries = await learningRepository.getEntriesBySubject(subject);
    return <LearningClient entries={filteredEntries} subjects={subjects.filter(s => s.subject === subject)} />;
  }

  return <LearningClient entries={entries} subjects={subjects} />;
}
