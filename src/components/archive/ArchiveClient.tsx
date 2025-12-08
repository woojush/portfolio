'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { LearningEntry, ExperienceItem } from '@/lib/firestore/types';
import { LearningSubjectCard } from '@/components/learning/LearningSubjectCard';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

interface ArchiveClientProps {
  learningEntries: LearningEntry[];
  learningSubjects: Array<{ subject: string; count: number; latestDate: string }>;
  experienceItems: ExperienceItem[];
}

type TabType = 'learning' | 'experience';

export function ArchiveClient({ learningEntries, learningSubjects, experienceItems }: ArchiveClientProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('learning');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // URL 파라미터에서 초기값 설정
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const categoryParam = searchParams.get('category');
    if (tabParam === 'learning' || tabParam === 'experience') {
      setActiveTab(tabParam);
    }
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  // Learning 카테고리 (subject 기반)
  const learningCategories = useMemo(() => {
    const uniqueSubjects = Array.from(new Set(learningEntries.map((e) => e.subject))).filter(Boolean);
    return [
      { key: 'all', label: '전체보기' },
      ...uniqueSubjects.map((subject) => ({
        key: subject,
        label: subject
      }))
    ];
  }, [learningEntries]);

  // Experience 카테고리 (category 기반)
  const experienceCategories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(experienceItems.map((item) => item.category).filter(Boolean)));
    return [
      { key: 'all', label: '전체보기' },
      ...uniqueCategories.map((category) => ({
        key: category,
        label: category
      }))
    ];
  }, [experienceItems]);

  // 현재 탭에 맞는 카테고리
  const categories = activeTab === 'learning' ? learningCategories : experienceCategories;

  // 필터링된 데이터
  const filteredLearningSubjects = useMemo(() => {
    if (activeCategory === 'all') return learningSubjects;
    return learningSubjects.filter((s) => s.subject === activeCategory);
  }, [activeCategory, learningSubjects]);

  const filteredExperienceItems = useMemo(() => {
    if (activeCategory === 'all') return experienceItems;
    return experienceItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, experienceItems]);

  // 탭 변경 시 카테고리 리셋
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveCategory('all');
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-3 md:px-6 md:pt-4 bg-slate-100 text-slate-900">
      <section className="section-container pt-0" style={{ borderTop: 'none' }}>
        <header className="section-header">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
            <h1 className="text-section-title">Archive</h1>
            <p className="mt-2 max-w-2xl text-body text-slate-0 mx-auto">
              학습과 경험을 통해 얻은 배움과 성장의 기록을 모아 둔 공간입니다.
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-slate-200" />
        </header>

        {/* 탭 네비게이션 */}
        <div className="mt-6 flex gap-2 border-b border-slate-300">
          <button
            type="button"
            onClick={() => handleTabChange('learning')}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'learning'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ].join(' ')}
          >
            Learning
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('experience')}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'experience'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            ].join(' ')}
          >
            Experience
          </button>
        </div>

        {/* 동적 카테고리 버튼 */}
        {categories.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveCategory(c.key)}
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

        {/* 콘텐츠 영역 */}
        <div className="mt-6">
          {activeTab === 'learning' ? (
            // Learning 탭
            filteredLearningSubjects.length === 0 ? (
              <p className="text-sm text-slate-400">해당 카테고리에 기록이 없습니다.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredLearningSubjects.map((subject) => (
                  <LearningSubjectCard
                    key={subject.subject}
                    subject={subject.subject}
                    count={subject.count}
                    latestDate={subject.latestDate}
                  />
                ))}
              </div>
            )
          ) : (
            // Experience 탭
            filteredExperienceItems.length === 0 ? (
              <p className="text-sm text-slate-400">해당 카테고리에 기록이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {filteredExperienceItems.map((item) => (
                  <ExperienceCard key={item.id} item={item} />
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

