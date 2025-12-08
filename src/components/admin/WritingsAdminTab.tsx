'use client';

// Admin tab component for managing Writing entries via Firestore.

import { useState, useEffect } from 'react';
import {
  getWritingEntries,
  addWritingEntry,
  updateWritingEntry,
  deleteWritingEntry,
  type WritingEntry
} from '@/lib/firestore/writings';

export function WritingsAdminTab() {
  const [entries, setEntries] = useState<WritingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'note' as WritingEntry['type'],
    summary: '',
    link: ''
  });

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      setLoading(true);
      setError(null);
      const data = await getWritingEntries();
      setEntries(data);
    } catch (err) {
      setError('글을 불러오지 못했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      date: '',
      type: 'note',
      summary: '',
      link: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(entry: WritingEntry) {
    setFormData({
      title: entry.title,
      date: entry.date,
      type: entry.type,
      summary: entry.summary,
      link: entry.link ?? ''
    });
    setEditingId(entry.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateWritingEntry(editingId, {
          title: formData.title,
          date: formData.date,
          type: formData.type,
          summary: formData.summary,
          link: formData.link || undefined
        });
      } else {
        await addWritingEntry({
          title: formData.title,
          date: formData.date,
          type: formData.type,
          summary: formData.summary,
          link: formData.link || undefined
        });
      }
      resetForm();
      await loadEntries();
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error('Save error:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 이 항목을 삭제하시겠습니까?')) return;
    try {
      await deleteWritingEntry(id);
      await loadEntries();
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다.');
      console.error('Delete error:', err);
    }
  }

  const typeLabels: Record<WritingEntry['type'], string> = {
    essay: '에세이',
    reflection: '생각 정리',
    note: '노트'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100 md:text-base">
          Writings 관리
        </h2>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90"
        >
          + 새 항목 추가
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400" aria-live="polite">
          {error}
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <h3 className="text-xs font-semibold text-slate-200">
            {editingId ? '항목 수정' : '새 항목 추가'}
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                제목 *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                날짜 (예: 2024-11) *
              </label>
              <input
                id="date"
                type="text"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="type"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                타입 *
              </label>
              <select
                id="type"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as WritingEntry['type']
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              >
                <option value="essay">에세이</option>
                <option value="reflection">생각 정리</option>
                <option value="note">노트</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="summary"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                요약 *
              </label>
              <textarea
                id="summary"
                required
                rows={4}
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="link"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                링크 (선택)
              </label>
              <input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90"
            >
              {editingId ? '수정 저장' : '추가'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
            >
              취소
            </button>
          </div>
        </form>
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
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100 md:text-base">
                      {entry.title}
                    </h3>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {typeLabels[entry.type]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{entry.date}</p>
                  <p className="mt-2 text-xs text-slate-300">{entry.summary}</p>
                  {entry.link && (
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[11px] text-warmBeige hover:underline"
                    >
                      링크 열기 →
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(entry)}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="rounded-full border border-red-900/50 bg-red-950/30 px-3 py-1 text-[11px] text-red-300 transition hover:bg-red-950/50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

