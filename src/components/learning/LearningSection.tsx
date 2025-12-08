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
    <section id="learning" className="section-container">
      <header className="section-header">
        <h2 className="text-section-title">Learning</h2>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          수학, 프로그래밍, 인공지능을 배우며 남기고 싶은 기록들을 모아 둔
          공간입니다. 개념을 이해해 가는 과정을 차분히 정리하려고 합니다.
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
  );
}
