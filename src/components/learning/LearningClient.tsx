'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LearningEntry } from '@/lib/firestore/types';
import { LearningEntryCard } from './LearningEntryCard';

interface LearningClientProps {
  entries: LearningEntry[];
  subjects?: Array<{ subject: string; count: number; latestDate: string }>;
  initialSubject?: string;
}

export function LearningClient({ entries, subjects, initialSubject }: LearningClientProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<'category' | 'period'>('category');
  const [activeCategory, setActiveCategory] = useState<string>(initialSubject || 'all');
  const [quarter, setQuarter] = useState<'none' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('none');

  const quarters = [
    { key: 'Q1', label: 'Q1', range: [1, 3] },
    { key: 'Q2', label: 'Q2', range: [4, 6] },
    { key: 'Q3', label: 'Q3', range: [7, 9] },
    { key: 'Q4', label: 'Q4', range: [10, 12] }
  ];

  const getMonth = (entry: LearningEntry) => {
    if (entry.startDate && entry.startDate.length >= 7) {
      const m = Number(entry.startDate.slice(5, 7));
      return isNaN(m) ? null : m;
    }
    return null;
  };

  // 기간이 여러 분기에 걸치는 경우, 더 많이 포함되는 분기를 반환
  const getQuarterForEntry = (entry: LearningEntry): 'Q1' | 'Q2' | 'Q3' | 'Q4' | null => {
    if (!entry.startDate || entry.startDate.length < 7) return null;
    
    const startDate = new Date(entry.startDate);
    const endDate = entry.endDate && entry.endDate.length >= 7 
      ? new Date(entry.endDate) 
      : startDate;
    
    // 각 분기에 포함된 일수 계산
    const quarterDays: Record<'Q1' | 'Q2' | 'Q3' | 'Q4', number> = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0
    };
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1; // 1-12
      if (month >= 1 && month <= 3) quarterDays.Q1++;
      else if (month >= 4 && month <= 6) quarterDays.Q2++;
      else if (month >= 7 && month <= 9) quarterDays.Q3++;
      else if (month >= 10 && month <= 12) quarterDays.Q4++;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 가장 많이 포함된 분기 찾기
    const maxDays = Math.max(quarterDays.Q1, quarterDays.Q2, quarterDays.Q3, quarterDays.Q4);
    if (maxDays === 0) return null;
    
    if (quarterDays.Q1 === maxDays) return 'Q1';
    if (quarterDays.Q2 === maxDays) return 'Q2';
    if (quarterDays.Q3 === maxDays) return 'Q3';
    if (quarterDays.Q4 === maxDays) return 'Q4';
    return null;
  };

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

  // 시기 목록: startDate의 연도 기준으로 추출
  const periods = useMemo(() => {
    const uniquePeriods = Array.from(
      new Set(
        entries
          .map((e) => (e.startDate ? e.startDate.slice(0, 4) : '미정'))
          .filter(Boolean)
      )
    );
    const periodList = [
      { key: 'all', label: '전체보기' },
      ...uniquePeriods.map((period) => ({
        key: period,
        label: period
      }))
    ];
    return periodList;
  }, [entries]);

  // 현재 필터 타입에 맞게 목록 필터링
  const filteredEntries = useMemo(() => {
    if (activeCategory === 'all') return entries;
    if (filterType === 'category') {
      return entries.filter((e) => e.subject === activeCategory);
    }
    return entries.filter((e) => {
      const year = e.startDate ? e.startDate.slice(0, 4) : '미정';
      if (year !== activeCategory) return false;
      if (quarter === 'none') return true;
      
      // 기간이 여러 분기에 걸치는 경우, 더 많이 포함되는 분기로 분류
      const entryQuarter = getQuarterForEntry(e);
      if (!entryQuarter) {
        // 분기를 계산할 수 없는 경우, 기존 로직 사용
        const month = getMonth(e);
        if (!month) return true;
        const q = quarters.find((q) => q.key === quarter);
        if (!q) return true;
        return month >= q.range[0] && month <= q.range[1];
      }
      
      return entryQuarter === quarter;
    });
  }, [entries, activeCategory, filterType, quarter]);


  return (
    <main
      className="mx-auto grid px-5 pb-20 pt-4 md:px-8 md:pt-6 bg-slate-100 text-slate-900"
      style={{ height: '100%', width: '1000px', maxWidth: '1000px' }}
    >
      <section className="section-container pt-0" style={{ borderTop: 'none' }}>
        <header className="section-header">
          <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-sm">
            <h1 className="text-section-title text-black">Learning</h1>
            <p className="mt-2 max-w-2xl text-body text-slate-600 mx-auto">
              배움을 기록하고 나눕니다.
            </p>
          </div>
          <div className="mt-4 h-px w-full bg-slate-200" />
        </header>

        {/* 필터: 토글 버튼 우측, 필터 옵션은 파란색 버튼으로 */}
        <div className="mt-4 flex items-center justify-between gap-4">
          {/* 필터 옵션 버튼들 (파란색) */}
          <div className="flex flex-wrap gap-2 flex-1" style={{ color: 'rgba(53, 60, 69, 1)' }}>
            {filterType === 'category' && categories.length > 1 && (
              <>
                {categories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(c.key);
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
              </>
            )}

            {filterType === 'period' && periods.length > 1 && (
              <>
                {periods.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => {
                      setActiveCategory(p.key);
                      // 연도 선택 시 분기 필터 리셋
                      if (p.key !== 'all') {
                        setQuarter('none');
                      }
                      router.push('/learning');
                    }}
                    className={[
                      'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                      activeCategory === p.key
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white text-slate-900 hover:border-blue-600 hover:text-blue-600'
                    ].join(' ')}
                  >
                    {p.label}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* 필터 타입 토글 버튼 (회색, 우측) */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilterType('category');
                setActiveCategory('all');
                setQuarter('none'); // 분기 필터 리셋
                router.push('/learning');
              }}
              className={[
                'rounded-full px-3 py-1 text-xs md:text-sm transition border border-black',
                filterType === 'category'
                  ? 'bg-blue-500'
                  : 'bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              ].join(' ')}
              style={filterType === 'category' ? { color: 'var(--surface-bg)' } : undefined}
            >
              카테고리
            </button>
            <button
              type="button"
              onClick={() => {
                setFilterType('period');
                setActiveCategory('all');
                setQuarter('none'); // 분기 필터 리셋
                router.push('/learning');
              }}
              className={[
                'rounded-full px-3 py-1 text-xs md:text-sm transition border border-black',
                filterType === 'period'
                  ? 'bg-blue-500'
                  : 'bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              ].join(' ')}
              style={filterType === 'period' ? { color: 'var(--surface-bg)' } : undefined}
            >
              시기
            </button>
          </div>
        </div>

        {/* 분기 필터 (시기 모드이고 연도가 선택되었을 때만 표시, 연도 하단에 위치) */}
        {filterType === 'period' && activeCategory !== 'all' && (
          <div className="mt-3 flex flex-wrap gap-2">
            {quarters.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => {
                  // 이미 선택된 분기를 다시 클릭하면 해제
                  setQuarter((prev: 'none' | 'Q1' | 'Q2' | 'Q3' | 'Q4') => (prev === q.key ? 'none' : q.key as typeof prev));
                }}
                className={[
                  'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                  quarter === q.key
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:text-blue-500'
                ].join(' ')}
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Entry 카드 그리드 (항상 글 카드만 표시) */}
        <div className="mt-6">
          {filteredEntries.length === 0 ? (
            <p className="text-sm text-slate-400">해당 조건에 기록이 없습니다.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEntries.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/learning/${encodeURIComponent(entry.subject)}/${entry.id}?category=${encodeURIComponent(activeCategory)}`}
                  className="block"
                >
                  <LearningEntryCard entry={entry} disableLink={true} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

