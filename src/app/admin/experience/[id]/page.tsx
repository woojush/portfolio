'use client';

// Admin Experience editor page

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { ExperienceItem } from '@/lib/firestore/types';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

export default function AdminExperienceEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<Partial<ExperienceItem>>({
    periodLabel: '',
    category: '',
    role: '',
    startDate: '',
    endDate: '',
    summary: '',
    learnings: [],
    images: [],
    content: '',
    public: false,
    draft: true
  });

  useEffect(() => {
    if (!isNew) {
      loadItem();
    }
  }, [id, isNew]);

  async function loadItem() {
    try {
      setLoading(true);
      const data = await experienceRepository.getEntryById(id, true);
      if (data) {
        setItem(data);
      }
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(draft: boolean) {
    try {
      setSaving(true);
      const itemData: Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'> = {
        periodLabel: item.periodLabel!,
        category: item.category!,
        role: item.role!,
        startDate: item.startDate!,
        endDate: item.endDate,
        summary: item.summary!,
        learnings: item.learnings || [],
        images: item.images || [],
        content: item.content,
        public: !draft,
        draft
      };

      if (isNew) {
        await experienceRepository.create(itemData);
      } else {
        await experienceRepository.update(id, itemData);
      }

      router.push('/admin');
    } catch (error) {
      console.error('Error saving item:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('정말 이 항목을 삭제하시겠습니까?')) return;
    try {
      await experienceRepository.delete(id);
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting item:', error);
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
            value={item.content || ''}
            onChange={(value) => setItem({ ...item, content: value })}
          />
        </div>

        {/* Right: Metadata Sidebar */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/40 p-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="period-label-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Period Label *
              </label>
              <input
                id="period-label-input"
                type="text"
                value={item.periodLabel || ''}
                onChange={(e) =>
                  setItem({ ...item, periodLabel: e.target.value })
                }
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                placeholder="2023 겨울, 2024-1학기"
              />
            </div>

            <div>
              <label
                htmlFor="category-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Category *
              </label>
              <input
                id="category-input"
                type="text"
                value={item.category || ''}
                onChange={(e) =>
                  setItem({ ...item, category: e.target.value })
                }
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                placeholder="part-time, project, club, military"
              />
            </div>

            <div>
              <label
                htmlFor="role-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Role *
              </label>
              <input
                id="role-input"
                type="text"
                value={item.role || ''}
                onChange={(e) => setItem({ ...item, role: e.target.value })}
                onClick={(e) => e.currentTarget.select()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                placeholder="역할을 입력하세요"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="exp-start-date-input"
                  className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
                >
                  Start Date *
                </label>
                <input
                  id="exp-start-date-input"
                  type="date"
                  value={item.startDate || ''}
                  onChange={(e) =>
                    setItem({ ...item, startDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                />
              </div>
              <div>
                <label
                  htmlFor="exp-end-date-input"
                  className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
                >
                  End Date
                </label>
                <input
                  id="exp-end-date-input"
                  type="date"
                  value={item.endDate || ''}
                  onChange={(e) =>
                    setItem({ ...item, endDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="exp-summary-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Summary *
              </label>
              <textarea
                id="exp-summary-input"
                value={item.summary || ''}
                onChange={(e) =>
                  setItem({ ...item, summary: e.target.value })
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
                htmlFor="learnings-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Learnings (줄바꿈으로 구분)
              </label>
              <textarea
                id="learnings-input"
                value={item.learnings?.join('\n') || ''}
                onChange={(e) => {
                  const learnings = e.target.value
                    .split('\n')
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0);
                  setItem({ ...item, learnings });
                }}
                rows={5}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text resize-y"
                placeholder="한 줄씩 입력하세요"
              />
            </div>

            <div>
              <label
                htmlFor="images-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Images (URL, 한 줄씩)
              </label>
              <textarea
                id="images-input"
                value={item.images?.join('\n') || ''}
                onChange={(e) => {
                  const images = e.target.value
                    .split('\n')
                    .map((i) => i.trim())
                    .filter((i) => i.length > 0);
                  setItem({ ...item, images });
                }}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text resize-y"
                placeholder="이미지 URL을 한 줄씩 입력하세요"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.public || false}
                  onChange={(e) =>
                    setItem({ ...item, public: e.target.checked })
                  }
                  className="rounded border-slate-700 bg-slate-950"
                />
                <span className="text-xs text-slate-300">Public</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.draft || false}
                  onChange={(e) =>
                    setItem({ ...item, draft: e.target.checked })
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

