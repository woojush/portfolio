'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { journeyRepository } from '@/lib/repositories/journeyRepository';
import type { JourneyItem } from '@/lib/firestore/journey';

export default function AdminJourneyPage() {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await journeyRepository.getPublicEntries();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError('여정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  const sorted = [...items].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
    }
    return (b.period || '').localeCompare(a.period || '');
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <header className="mb-6 md:mb-8">
        <h1 className="text-section-title">여정 관리</h1>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          여정 타임라인의 직위, 조직, 이미지 등을 추가/수정할 수 있습니다.
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">목록</h2>
          <Link
            href="/admin/journey/new"
            className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90"
          >
            + 새 항목 추가
          </Link>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {loading && <p className="text-sm text-slate-400">불러오는 중...</p>}

        {!loading && sorted.length === 0 && (
          <p className="text-sm text-slate-400">여정 항목이 없습니다.</p>
        )}

        {!loading && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-warmBeige/70"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {item.logoUrl ? (
                      <img
                        src={item.logoUrl}
                        alt={item.organization || item.title}
                        className="h-10 w-10 rounded-lg border border-slate-800 bg-slate-900 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[10px] text-slate-400">
                        Logo
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">{item.period}</p>
                      <h3 className="text-sm font-semibold text-slate-50 leading-tight">
                        {item.organization}
                      </h3>
                      {item.title && (
                        <p className="text-xs text-slate-300">{item.title}</p>
                      )}
                      {item.isCurrent && (
                        <span className="inline-block rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-200">
                          현재
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/journey/${item.id}`}
                    className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800 hover:border-warmBeige/50"
                  >
                    편집
                  </Link>
                </div>
                <p className="text-sm text-slate-200">{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

