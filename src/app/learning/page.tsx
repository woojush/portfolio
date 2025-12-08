// Learning page - shows subject category cards or filtered entries

import { Suspense } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { LearningSubjectCard } from '@/components/learning/LearningSubjectCard';
import { LearningEntryCard } from '@/components/learning/LearningEntryCard';

interface LearningPageProps {
  searchParams: Promise<{ subject?: string }>;
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
  const params = await searchParams;
  const subject = params.subject;

  if (subject) {
    // Show entries for specific subject
    const entries = await learningRepository.getEntriesBySubject(subject);

    return (
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
        <section className="section-container border-t-0 pt-0">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-section-title">{subject}</h1>
            <a
              href="/learning"
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              ← 전체 과목으로
            </a>
          </div>
          {entries.length === 0 ? (
            <p className="text-sm text-slate-400">
              이 과목에 대한 기록이 없습니다.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map((entry) => (
                <LearningEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  // Show subject index
  const subjects = await learningRepository.getSubjects();

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-3 md:px-6 md:pt-4">
      <section
        className="section-container border-0 pt-0"
        style={{ borderTop: 'none' }}
      >
        <header className="section-header">
          <h1 className="text-section-title">Learning</h1>
          <p className="mt-2 max-w-2xl text-body text-slate-0">
            수학, 프로그래밍, 인공지능을 배우며 남기고 싶은 기록들을 모아 둔
            공간입니다. 과목별로 정리되어 있습니다.
          </p>
          <div className="mt-4 h-px w-full bg-slate-800" />
        </header>
        {subjects.length === 0 ? (
          <p className="text-sm text-slate-400">
            아직 학습 기록이 없습니다.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subject) => (
              <LearningSubjectCard
                key={subject.subject}
                subject={subject.subject}
                count={subject.count}
                latestDate={subject.latestDate}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
