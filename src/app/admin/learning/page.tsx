'use client';

// Admin Learning management page
// Uses same UI as public Learning page with edit functionality

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { learningRepository } from '@/lib/repositories/learningRepository';
import type { LearningEntry } from '@/lib/firestore/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LearningEntryCard } from '@/components/learning/LearningEntryCard';

export default function AdminLearningPage() {
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await learningRepository.getAllEntries();
      setEntries(data);
    } catch (err) {
      setError('학습 기록을 불러오지 못했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // 동적으로 카테고리 생성
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

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return entries;
    return entries.filter((entry) => entry.subject === activeCategory);
  }, [activeCategory, entries]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminHeader />
        
        <main className="mx-auto max-w-6xl space-y-6">
          <header className="mb-6 md:mb-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-6 text-center shadow-sm">
              <h1 className="text-3xl font-bold text-slate-100">Learning</h1>
              <p className="mt-2 max-w-2xl text-slate-400 mx-auto">
                배움을 기록하고 공유합니다.
              </p>
            </div>
            <div className="mt-4 h-px w-full bg-slate-800" />
          </header>

          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <Link
              href={`/admin/learning/new?from=admin&category=${encodeURIComponent(activeCategory)}`}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + 새 항목 추가
            </Link>
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
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-600 hover:text-blue-400'
                    ].join(' ')}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

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
              {filtered.map((entry) => (
                <Link 
                  key={entry.id} 
                  href={`/learning/${encodeURIComponent(entry.subject)}/${entry.id}?from=admin&category=${encodeURIComponent(activeCategory)}`}
                  className="relative group block"
                >
                  <LearningEntryCard entry={entry} disableLink={true} />
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

