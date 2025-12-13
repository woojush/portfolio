'use client';

// Client component that fetches Learning entries from Firestore
// and displays subject category cards on the home page.

import { useEffect, useState } from 'react';
import { learningRepository } from '@/lib/repositories/learningRepository';
import { LearningSubjectCard } from './LearningSubjectCard';

interface SubjectInfo {
  subject: string;
  count: number;
  latestDate: string;
}

export function LearningSection() {
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await learningRepository.getSubjects();
        setSubjects(data);
      } catch (err) {
        setError('학습 기록을 불러오지 못했습니다.');
        console.error('Learning fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section
      id="learning"
      className="section-container py-10 md:py-14"
    >
      <header className="section-header space-y-3">
        <h2 className="text-4xl font-bold md:text-5xl">Learning</h2>
        <p className="mt-1 max-w-3xl text-lg text-slate-300 md:text-xl">
          지식을 기록하고 공유합니다.
        </p>
      </header>

      {loading && (
        <p className="text-sm text-slate-400">불러오는 중입니다...</p>
      )}

      {error && (
        <p className="text-sm text-red-400" aria-live="polite">
          {error}
        </p>
      )}

      {!loading && !error && subjects.length === 0 && (
        <p className="text-sm text-slate-400">
          아직 학습 기록이 없습니다. Admin 페이지에서 항목을 추가해 보세요.
        </p>
      )}

      {!loading && !error && subjects.length > 0 && (
        <div className="grid gap-5 md:grid-cols-3">
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
  );
}
