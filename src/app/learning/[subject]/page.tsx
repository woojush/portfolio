// Learning subject page - shows all entries for a specific subject
// This is an alternative route structure, but we'll use query params instead
// Keeping this for backward compatibility or future use

import { notFound } from 'next/navigation';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { LearningEntryCard } from '@/components/learning/LearningEntryCard';

interface LearningSubjectPageProps {
  params: Promise<{ subject: string }>;
}

export default async function LearningSubjectPage({
  params
}: LearningSubjectPageProps) {
  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  const entries = await learningRepository.getEntriesBySubject(decodedSubject);

  if (entries.length === 0) {
    return notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="section-container border-t-0 pt-0">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-section-title">{decodedSubject}</h1>
          <a
            href="/learning"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            ← 전체 과목으로
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <LearningEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>
    </main>
  );
}

