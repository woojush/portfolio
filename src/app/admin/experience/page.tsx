'use client';

// Admin Experience management page
// Lists all experience entries with edit links

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { ExperienceItem } from '@/lib/firestore/types';

export default function AdminExperiencePage() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-section-title">경험 관리</h1>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          경험 기록을 관리할 수 있습니다. 각 항목을 클릭하여 편집하거나, "새 항목 추가" 버튼으로 새 항목을 만들 수 있습니다.
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100 md:text-base">
            경험 기록 목록
          </h2>
          <Link
            href="/admin/experience/new"
            className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90"
          >
            + 새 항목 추가
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-400" aria-live="polite">
            {error}
          </p>
        )}

        {loading && (
          <p className="text-sm text-slate-400">불러오는 중입니다...</p>
        )}

        {!loading && items.length === 0 && (
          <p className="text-sm text-slate-400">
            아직 경험 기록이 없습니다. 위의 "새 항목 추가" 버튼을 눌러 추가해 보세요.
          </p>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
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
        )}
      </section>
    </main>
  );
}

