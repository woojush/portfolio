'use client';

// Admin Writings editor page
// Handles both new entries (/admin/writings/new) and editing existing entries

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { writingsRepository } from '@/lib/repositories/writingsRepository';
import type { WritingEntry } from '@/lib/firestore/types';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

export default function AdminWritingsEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<Partial<WritingEntry>>({
    title: '',
    date: '',
    summary: '',
    content: '',
    tags: [],
    public: false,
    draft: true
  });

  useEffect(() => {
    if (!isNew) {
      loadEntry();
    }
  }, [id, isNew]);

  async function loadEntry() {
    try {
      setLoading(true);
      const data = await writingsRepository.getEntryById(id, true);
      if (data) {
        setEntry(data);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(draft: boolean) {
    try {
      setSaving(true);
      const today = new Date().toISOString().slice(0, 10);
      const entryData: Omit<WritingEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        title: entry.title!,
        date: entry.date || today,
        summary: entry.summary!,
        content: entry.content!,
        tags: entry.tags,
        public: !draft,
        draft
      };

      if (isNew) {
        await writingsRepository.create(entryData);
      } else {
        await writingsRepository.update(id, entryData);
      }

      router.push('/admin');
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('정말 이 항목을 삭제하시겠습니까?')) return;
    try {
      await writingsRepository.delete(id);
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-slate-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top sticky bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="text-sm text-slate-300 hover:text-slate-100"
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? '저장 중...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90 disabled:opacity-50"
          >
            {saving ? '발행 중...' : 'Publish'}
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-red-900/50 bg-red-950/30 px-4 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-950/50"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Editor layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Markdown Editor */}
        <div className="flex-1 overflow-auto p-4">
          <MarkdownEditor
            value={entry.content || ''}
            onChange={(value) => setEntry({ ...entry, content: value })}
          />
        </div>

        {/* Right: Metadata Sidebar */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/40 p-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="writings-title-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Title *
              </label>
              <input
                id="writings-title-input"
                type="text"
                value={entry.title || ''}
                onChange={(e) => setEntry({ ...entry, title: e.target.value })}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                placeholder="제목을 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="writings-date-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Date *
              </label>
              <input
                id="writings-date-input"
                type="text"
                value={entry.date || ''}
                onChange={(e) => setEntry({ ...entry, date: e.target.value })}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                placeholder="2024-11"
              />
            </div>

            <div>
              <label
                htmlFor="writings-summary-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Summary *
              </label>
              <textarea
                id="writings-summary-input"
                value={entry.summary || ''}
                onChange={(e) =>
                  setEntry({ ...entry, summary: e.target.value })
                }
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text resize-y"
                placeholder="요약을 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="writings-tags-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Tags (쉼표로 구분)
              </label>
              <input
                id="writings-tags-input"
                type="text"
                value={entry.tags?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t.length > 0);
                  setEntry({ ...entry, tags });
                }}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                placeholder="태그를 쉼표로 구분하여 입력하세요"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={entry.public || false}
                  onChange={(e) =>
                    setEntry({ ...entry, public: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={entry.draft || false}
                  onChange={(e) =>
                    setEntry({ ...entry, draft: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Draft</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

