'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { LearningEntry } from '@/lib/firestore/types';
import { LearningSubjectCard } from './LearningSubjectCard';
import { LearningEntryCard } from './LearningEntryCard';

interface LearningClientProps {
  entries: LearningEntry[];
  subjects: Array<{ subject: string; count: number; latestDate: string }>;
}

export function LearningClient({ entries, subjects }: LearningClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // URL 쿼리 파라미터에서 초기 카테고리 설정
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (subjectParam) {
      setActiveCategory(subjectParam);
    }
  }, [searchParams]);

  // 동적으로 카테고리 생성 (실제 데이터의 subject 기반)
  const categories = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(entries.map((e) => e.subject))).filter(Boolean);
    const categoryList = [
      { key: 'all', label: '전체보기' },
      ...uniqueSubjects.map((subject) => ({
        key: subject,
        label: subject
      }))
    ];
    return categoryList;
  }, [entries]);

  const filteredSubjects = useMemo(() => {
    if (activeCategory === 'all') return subjects;
    return subjects.filter((s) => s.subject === activeCategory);
  }, [activeCategory, subjects]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-3 md:px-6 md:pt-4 bg-slate-100 text-slate-900">
      <section className="section-container pt-0" style={{ borderTop: 'none' }}>
        <header className="section-header">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
            <h1 className="text-section-title">Learning</h1>
            <p className="mt-2 max-w-2xl text-body text-slate-0 mx-auto">
              수학, 프로그래밍, 인공지능을 배우며 남기고 싶은 기록들을 모아 둔
              공간입니다. 과목별로 정리되어 있습니다.
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-slate-200" />
        </header>

        {/* 동적 카테고리 버튼 */}
        {categories.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setActiveCategory(c.key);
                  // URL 업데이트 (subject 파라미터 제거 또는 설정)
                  if (c.key === 'all') {
                    router.push('/learning');
                  } else {
                    router.push(`/learning?subject=${encodeURIComponent(c.key)}`);
                  }
                }}
                className={[
                  'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                  activeCategory === c.key
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-blue-600 hover:text-blue-600'
                ].join(' ')}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Subject 카드 그리드 */}
        <div className="mt-6">
          {filteredSubjects.length === 0 ? (
            <p className="text-sm text-slate-400">해당 카테고리에 기록이 없습니다.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSubjects.map((subject) => (
                <LearningSubjectCard
                  key={subject.subject}
                  subject={subject.subject}
                  count={subject.count}
                  latestDate={subject.latestDate}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

