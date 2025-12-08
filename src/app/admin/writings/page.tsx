'use client';

// Admin Writings management page
// Lists all writing entries with edit links

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { writingsRepository } from '@/lib/repositories/writingsRepository';
import type { WritingEntry } from '@/lib/firestore/types';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminWritingsPage() {
  const [entries, setEntries] = useState<WritingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await writingsRepository.getAllEntries();
      setEntries(data);
    } catch (err) {
      setError('글을 불러오지 못했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminHeader />
        
        <main>
          <header className="mb-6 md:mb-8">
            <p className="mt-2 max-w-2xl text-body text-slate-300">
              글을 관리할 수 있습니다. 각 항목을 클릭하여 편집하거나, "새 항목 추가" 버튼으로 새 항목을 만들 수 있습니다.
            </p>
          </header>

      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-slate-100 md:text-base">
              글 목록
            </h2>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="제목, 요약, 태그로 검색"
              className="w-full max-w-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>
          <Link
            href="/admin/writings/new"
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

        {!loading && entries.length === 0 && (
          <p className="text-sm text-slate-400">
            아직 글이 없습니다. 위의 "새 항목 추가" 버튼을 눌러 추가해 보세요.
          </p>
        )}

        {!loading && entries.length > 0 && (
          <div className="space-y-3">
            {entries
              .filter((entry) => {
                const term = search.trim().toLowerCase();
                if (!term) return true;
                const haystack = [
                  entry.title,
                  entry.summary,
                  entry.tags?.join(' ') || ''
                ]
                  .join(' ')
                  .toLowerCase();
                return haystack.includes(term);
              })
              .map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
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
                    <p className="mt-1 text-[11px] text-slate-400">{entry.date}</p>
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
                    href={`/admin/writings/${entry.id}`}
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
      </div>
    </div>
  );
}

