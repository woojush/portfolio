'use client';

// Admin tab component for managing Journey items via Firestore.

import { useState, useEffect } from 'react';
import {
  getJourneyItems,
  addJourneyItem,
  updateJourneyItem,
  deleteJourneyItem,
  type JourneyItem
} from '@/lib/firestore/journey';

export function JourneyAdminTab() {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    period: '',
    title: '',
    description: '',
    sortOrder: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const data = await getJourneyItems();
      setItems(data);
    } catch (err) {
      setError('여정 기록을 불러오지 못했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      period: '',
      title: '',
      description: '',
      sortOrder: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: JourneyItem) {
    setFormData({
      period: item.period,
      title: item.title,
      description: item.description,
      sortOrder: item.sortOrder?.toString() ?? ''
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const sortOrderNum =
        formData.sortOrder.trim() === ''
          ? undefined
          : parseInt(formData.sortOrder, 10);

      if (editingId) {
        await updateJourneyItem(editingId, {
          period: formData.period,
          title: formData.title,
          description: formData.description,
          sortOrder: sortOrderNum
        });
      } else {
        await addJourneyItem({
          period: formData.period,
          title: formData.title,
          description: formData.description,
          sortOrder: sortOrderNum
        });
      }
      resetForm();
      await loadItems();
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error('Save error:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 이 항목을 삭제하시겠습니까?')) return;
    try {
      await deleteJourneyItem(id);
      await loadItems();
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다.');
      console.error('Delete error:', err);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100 md:text-base">
          Journey 관리
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
                htmlFor="period"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                기간 (예: 2023 · 고등학교 후반) *
              </label>
              <input
                id="period"
                type="text"
                required
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
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
                htmlFor="description"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                설명 *
              </label>
              <textarea
                id="description"
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="sortOrder"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                정렬 순서 (숫자, 큰 수가 위로, 선택)
              </label>
              <input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: e.target.value })
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

      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-400">
          아직 여정 기록이 없습니다. 위의 "새 항목 추가" 버튼을 눌러 추가해
          보세요.
        </p>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    {item.period}
                  </p>
                  <h3 className="mt-1 text-sm font-semibold text-slate-100 md:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300">
                    {item.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
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

