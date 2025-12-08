'use client';

// Admin tab component for managing Experience items via Firestore.

import { useState, useEffect } from 'react';
import {
  getExperienceItems,
  addExperienceItem,
  updateExperienceItem,
  deleteExperienceItem,
  type ExperienceItem
} from '@/lib/firestore/experience';

export function ExperienceAdminTab() {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    periodLabel: '',
    category: '',
    role: '',
    startDate: '',
    endDate: '',
    summary: '',
    learnings: '',
    images: '',
    content: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      const data = await getExperienceItems();
      setItems(data);
    } catch (err) {
      setError('경험 기록을 불러오지 못했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      periodLabel: '',
      category: '',
      role: '',
      startDate: '',
      endDate: '',
      summary: '',
      learnings: '',
      images: '',
      content: ''
    });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: ExperienceItem) {
    setFormData({
      title: item.title,
      periodLabel: item.periodLabel,
      category: item.category,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate ?? '',
      summary: item.summary,
      learnings: item.learnings.join('\n'),
      images: item.images.join(', '),
      content: item.content ?? ''
    });
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const learningsArray = formData.learnings
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const imagesArray = formData.images
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      if (editingId) {
        await updateExperienceItem(editingId, {
          title: formData.title,
          periodLabel: formData.periodLabel,
          category: formData.category,
          role: formData.role,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          summary: formData.summary,
          learnings: learningsArray,
          images: imagesArray,
          content: formData.content || undefined
        });
      } else {
        await addExperienceItem({
          title: formData.title,
          periodLabel: formData.periodLabel,
          category: formData.category,
          role: formData.role,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          summary: formData.summary,
          learnings: learningsArray,
          images: imagesArray,
          content: formData.content || undefined
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
      await deleteExperienceItem(id);
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
          Experience 관리
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
                htmlFor="periodLabel"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                기간 표시 (예: 2023 겨울, 2024-1학기) *
              </label>
              <input
                id="periodLabel"
                type="text"
                required
                value={formData.periodLabel}
                onChange={(e) =>
                  setFormData({ ...formData, periodLabel: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                카테고리 (예: part-time, project, club, military) *
              </label>
              <input
                id="category"
                type="text"
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                역할 *
              </label>
              <input
                id="role"
                type="text"
                required
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="startDate"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                시작 날짜 (YYYY-MM-DD) *
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                종료 날짜 (YYYY-MM-DD, 선택)
              </label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
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
                rows={3}
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="learnings"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                배운 점 (줄바꿈 별로 입력) *
              </label>
              <textarea
                id="learnings"
                required
                rows={4}
                value={formData.learnings}
                onChange={(e) =>
                  setFormData({ ...formData, learnings: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
                placeholder="한 줄씩 입력하세요"
              />
            </div>
            <div>
              <label
                htmlFor="images"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                이미지 URL (쉼표로 구분, 선택)
              </label>
              <input
                id="images"
                type="text"
                value={formData.images}
                onChange={(e) =>
                  setFormData({ ...formData, images: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="content"
                className="mb-1 block text-[11px] font-medium text-slate-300"
              >
                내용 (선택)
              </label>
              <textarea
                id="content"
                rows={4}
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
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
          아직 경험 기록이 없습니다. 위의 "새 항목 추가" 버튼을 눌러 추가해
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
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-100 md:text-base">
                      {item.title}
                    </h3>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {item.periodLabel}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    역할: {item.role}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">{item.summary}</p>
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
