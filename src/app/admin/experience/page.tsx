'use client';

// Admin Experience management page
// Uses same UI as public Experience page with edit functionality

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { ExperienceItem } from '@/lib/firestore/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ExperienceCard } from '@/components/experience/ExperienceCard';

export default function AdminExperiencePage() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'category' | 'period'>('category');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const data = await experienceRepository.getAllEntries();
      setItems(data);
    } catch (err) {
      setError('경험 기록을 불러오지 못했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // 동적으로 카테고리 생성
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
    const categoryList = [
      { key: 'all', label: '전체보기' },
      ...uniqueCategories.map((category) => ({
        key: category,
        label: category
      }))
    ];
    return categoryList;
  }, [items]);

  // 동적으로 시기 생성
  const periods = useMemo(() => {
    const uniquePeriods = Array.from(new Set(items.map((item) => item.period).filter(Boolean)));
    const periodList = [
      { key: 'all', label: '전체보기' },
      ...uniquePeriods.map((period) => ({
        key: period,
        label: period
      }))
    ];
    return periodList;
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return items;
    if (filterType === 'category') {
      return items.filter((item) => item.category === activeCategory);
    } else {
      return items.filter((item) => item.period === activeCategory);
    }
  }, [activeCategory, filterType, items]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminHeader />
        
        <main className="mx-auto max-w-6xl">
          <header className="mb-6 md:mb-8">
            <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/60 px-8 py-8 text-center shadow-sm">
              <h1 className="text-3xl font-bold text-slate-100">Experience</h1>
              <p className="mt-2 max-w-2xl text-slate-400 mx-auto">
                도전과 경험의 배움을 공유합니다.
              </p>
            </div>
            <div className="mt-4 h-px w-full bg-slate-800" />
          </header>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <Link
              href={`/admin/experience/new?from=admin&category=${encodeURIComponent(activeCategory)}`}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + 새 항목 추가
            </Link>
          </div>

          {/* 필터: 토글 버튼 우측, 필터 옵션은 파란색 버튼으로 */}
          <div className="mt-4 flex items-center justify-between gap-4">
            {/* 필터 옵션 버튼들 (파란색) */}
            <div className="flex flex-wrap gap-2 flex-1">
              {filterType === 'category' && categories.length > 1 && (
                <>
                  {categories.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setActiveCategory(c.key)}
                      className={[
                        'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                        activeCategory === c.key
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-600 hover:text-blue-400'
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
                      onClick={() => setActiveCategory(p.key)}
                      className={[
                        'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                        activeCategory === p.key
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-600 hover:text-blue-400'
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
                }}
                className={[
                  'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                  filterType === 'category'
                    ? 'border-slate-500 bg-slate-700 text-slate-200'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                ].join(' ')}
              >
                카테고리
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType('period');
                  setActiveCategory('all');
                }}
                className={[
                  'rounded-full px-3 py-1 text-xs md:text-sm transition border',
                  filterType === 'period'
                    ? 'border-slate-500 bg-slate-700 text-slate-200'
                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                ].join(' ')}
              >
                시기
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 mt-4" aria-live="polite">
              {error}
            </p>
          )}

          {loading && (
            <p className="text-sm text-slate-400 mt-4">불러오는 중입니다...</p>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-sm text-slate-400 mt-4">
              해당 카테고리에 기록이 없습니다.
            </p>
          )}

          {!loading && filtered.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {filtered.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/experience/${item.id}?from=admin&category=${encodeURIComponent(activeCategory)}`}
                  className="relative group block"
                >
                  <ExperienceCard item={item} disableLink={true} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white shadow-lg">
                      편집
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

