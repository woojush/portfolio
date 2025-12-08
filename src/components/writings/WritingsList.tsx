'use client';

import { useMemo, useState } from 'react';
import type { WritingEntry } from '@/lib/firestore/types';
import { WritingCard } from './WritingCard';

interface WritingsListProps {
  entries: WritingEntry[];
}

export function WritingsList({ entries }: WritingsListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((e) => {
      const haystack = [
        e.title,
        e.summary,
        (e.tags || []).join(' ')
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [entries, search]);

  return (
    <section
      className="section-container pt-0"
      style={{ borderTop: 'none' }}
    >
      <header className="section-header">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-section-title">Writings</h1>
            <p className="mt-2 max-w-2xl text-body text-slate-0">
              기술과 공부 이야기에서 잠시 물러나, 그때그때 떠오른 생각과
              에세이, 짧은 노트를 모아 둔 공간입니다.
            </p>
            <div className="mt-4 h-px w-full bg-slate-800" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="제목, 요약, 태그 검색"
            className="w-full max-w-xs rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
          />
        </div>
      </header>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => (
            <WritingCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}

