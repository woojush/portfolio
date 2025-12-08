'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LearningEntry, ExperienceItem } from '@/lib/firestore/types';

interface AdminArchiveClientProps {
  learningEntries: LearningEntry[];
  experienceItems: ExperienceItem[];
}

type TabType = 'learning' | 'experience';

export function AdminArchiveClient({ learningEntries, experienceItems }: AdminArchiveClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('learning');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

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
  const filteredLearningEntries = useMemo(() => {
    let filtered = learningEntries;
    
    // 카테고리 필터
    if (activeCategory !== 'all') {
      filtered = filtered.filter((e) => e.subject === activeCategory);
    }
    
    // 검색 필터
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((entry) => {
        const haystack = [
          entry.title,
          entry.summary,
          entry.subject,
          entry.tags.join(' ')
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      });
    }
    
    // 과목별 그룹화
    return filtered.reduce<Record<string, LearningEntry[]>>((acc, entry) => {
      const key = entry.subject || '기타';
      acc[key] = acc[key] ? [...acc[key], entry] : [entry];
      return acc;
    }, {});
  }, [learningEntries, activeCategory, search]);

  const filteredExperienceItems = useMemo(() => {
    let filtered = experienceItems;
    
    // 카테고리 필터
    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === activeCategory);
    }
    
    // 검색 필터
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = filtered.filter((item) => {
        const haystack = [
          item.periodLabel,
          item.category,
          item.role,
          item.summary,
          item.learnings.join(' ')
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      });
    }
    
    return filtered;
  }, [experienceItems, activeCategory, search]);

  // 탭 변경 시 카테고리 리셋
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setActiveCategory('all');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          type="button"
          onClick={() => handleTabChange('learning')}
          className={[
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'learning'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-200'
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
              : 'border-transparent text-slate-400 hover:text-slate-200'
          ].join(' ')}
        >
          Experience
        </button>
      </div>

      {/* 검색 및 추가 버튼 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={activeTab === 'learning' ? '제목, 요약, 태그, 과목으로 검색' : '기간, 카테고리, 역할, 요약으로 검색'}
          className="w-full max-w-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-slate-500 focus:outline-none"
        />
        <Link
          href={activeTab === 'learning' ? '/admin/learning/new' : '/admin/experience/new'}
          className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90 whitespace-nowrap"
        >
          + 새 항목 추가
        </Link>
      </div>

      {/* 동적 카테고리 버튼 */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setActiveCategory(c.key)}
              className={[
                'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                activeCategory === c.key
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-600 hover:text-blue-600'
              ].join(' ')}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* 콘텐츠 영역 */}
      <div className="space-y-6">
        {activeTab === 'learning' ? (
          // Learning 탭
          Object.keys(filteredLearningEntries).length === 0 ? (
            <p className="text-sm text-slate-400">해당 카테고리에 기록이 없습니다.</p>
          ) : (
            Object.entries(filteredLearningEntries).map(([subject, list]) => (
              <div
                key={subject}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-100 md:text-base">
                    {subject}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {list.length}개
                  </span>
                </div>
                <div className="space-y-3">
                  {list.map((entry) => (
                    <article
                      key={entry.id}
                      className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:-translate-y-0.5 hover:border-warmBeige/70 hover:bg-slate-900/80 hover:shadow-md"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold text-slate-100 md:text-base">
                              {entry.title}
                            </h3>
                            {entry.draft && (
                              <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-[10px] text-yellow-300">
                                Draft
                              </span>
                            )}
                            {!entry.public && (
                              <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-[10px] text-red-300">
                                Private
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {entry.endDate && entry.endDate !== entry.startDate
                              ? `${entry.startDate} ~ ${entry.endDate}`
                              : entry.startDate || '날짜 없음'}
                          </p>
                          <p className="mt-2 text-xs text-slate-300">{entry.summary}</p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {entry.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-400"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/admin/learning/${entry.id}`}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800 hover:border-warmBeige/50"
                        >
                          편집
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )
        ) : (
          // Experience 탭
          filteredExperienceItems.length === 0 ? (
            <p className="text-sm text-slate-400">해당 카테고리에 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {filteredExperienceItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-100 md:text-base">
                          {item.periodLabel}
                        </h3>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {item.category}
                        </span>
                        {item.draft && (
                          <span className="rounded-full bg-yellow-900/30 px-2 py-0.5 text-[10px] text-yellow-300">
                            Draft
                          </span>
                        )}
                        {!item.public && (
                          <span className="rounded-full bg-red-900/30 px-2 py-0.5 text-[10px] text-red-300">
                            Private
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        역할: {item.role}
                      </p>
                      <p className="mt-2 text-xs text-slate-300">{item.summary}</p>
                      {item.learnings && item.learnings.length > 0 && (
                        <div className="mt-2 text-xs text-slate-400">
                          주요 배움: {item.learnings.slice(0, 3).join(', ')}
                          {item.learnings.length > 3 && ` 외 ${item.learnings.length - 3}개`}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/admin/experience/${item.id}`}
                      className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800 hover:border-warmBeige/50"
                    >
                      편집
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

