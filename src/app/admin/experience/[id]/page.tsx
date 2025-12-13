'use client';

// Admin Experience editor page

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { experienceRepository } from '@/lib/repositories/experienceRepository';
import type { ExperienceItem } from '@/lib/firestore/types';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

export default function AdminExperienceEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';
  
  // 이전 경로 가져오기
  const from = searchParams.get('from');
  const category = searchParams.get('category');
  const backUrl = from === 'admin' && category
    ? `/admin/experience?category=${encodeURIComponent(category)}`
    : from === 'admin'
    ? '/admin/experience'
    : '/admin';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [item, setItem] = useState<Partial<ExperienceItem>>({
    title: '',
    category: '',
    thumbnailUrl: '',
    period: '',
    startDate: '',
    endDate: '',
    summary: '',
    content: '',
    public: false,
    draft: true
  });

  useEffect(() => {
    loadExistingCategories();
    if (isNew) {
      // 새 항목일 때 오늘 날짜로 자동 설정
      const today = new Date().toISOString().split('T')[0];
      setItem(prev => ({ ...prev, startDate: today }));
    } else {
      loadItem();
    }
  }, [id, isNew]);

  async function loadExistingCategories() {
    try {
      const entries = await experienceRepository.getAllEntries();
      const uniqueCategories = Array.from(new Set(entries.map(e => e.category).filter(Boolean)));
      setExistingCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

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
      if (!item.title || !item.category || !item.summary) {
        alert('Title, Category, Summary는 필수입니다.');
        return;
      }
      if (!item.content || item.content.trim().length === 0) {
        alert('본문을 입력해 주세요.');
        return;
      }
      if (!item.thumbnailUrl) {
        alert('썸네일 이미지 URL을 입력해주세요.');
        return;
      }
      setSaving(true);
      // startDate가 없으면 오늘 날짜로 설정
      const today = new Date().toISOString().split('T')[0];
      const startDate = item.startDate || today;
      
      const itemData: Omit<ExperienceItem, 'id' | 'createdAt' | 'updatedAt'> = {
        title: item.title!,
        category: item.category!,
        thumbnailUrl: item.thumbnailUrl!,
        period: item.period || '',
        startDate: startDate,
        endDate: item.endDate,
        summary: item.summary!,
        content: item.content || '',
        public: !draft,
        draft
      };

      if (isNew) {
        const response = await fetch('/api/admin/experience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create entry');
        }
      } else {
        const response = await fetch(`/api/admin/experience/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update entry');
        }
      }

      router.push(backUrl);
      router.refresh();
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
      router.push(backUrl);
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
          onClick={() => router.push(backUrl)}
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

      {/* Velog-style Editor layout */}
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl p-6 space-y-6">
          {/* 썸네일 URL 입력 */}
          <div>
            <label
              htmlFor="thumbnail-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              썸네일 이미지(URL) *
            </label>
            <div className="space-y-2">
              {item.thumbnailUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                  <img
                    src={item.thumbnailUrl}
                    alt="썸네일 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                id="thumbnail-input"
                type="url"
                value={item.thumbnailUrl || ''}
                onChange={(e) =>
                  setItem({ ...item, thumbnailUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              />
              <p className="text-xs text-slate-500">URL을 붙여넣으면 바로 미리보기가 갱신됩니다.</p>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label
              htmlFor="title-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              제목 *
            </label>
            <input
              id="title-input"
              type="text"
              value={item.title || ''}
              onChange={(e) =>
                setItem({ ...item, title: e.target.value })
              }
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-semibold text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              placeholder="2023 겨울, 2024-1학기"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Category *
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  id="category-input"
                  type="text"
                  value={item.category || ''}
                  onChange={(e) =>
                    setItem({ ...item, category: e.target.value })
                  }
                  onFocus={() => setShowCategoryDropdown(true)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
                  placeholder="part-time, project, club, military"
                />
                {existingCategories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    선택
                  </button>
                )}
              </div>
              {showCategoryDropdown && existingCategories.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 shadow-lg max-h-48 overflow-auto">
                  {existingCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setItem({ ...item, category });
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 transition"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label
              htmlFor="summary-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Summary *
            </label>
            <textarea
              id="summary-input"
              value={item.summary || ''}
              onChange={(e) => setItem({ ...item, summary: e.target.value })}
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              placeholder="짧은 요약을 입력하세요"
              rows={3}
            />
          </div>

          {/* 본문 에디터 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              본문 *
            </label>
            <div className="h-[600px]">
              <MarkdownEditor
                value={item.content || ''}
                onChange={(value) => setItem({ ...item, content: value })}
              />
            </div>
          </div>

          {/* 날짜 및 기타 설정 (작은 크기) */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label
                htmlFor="exp-start-date-input"
                className="mb-2 block text-xs font-medium text-slate-400"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              />
            </div>
            <div>
              <label
                htmlFor="exp-end-date-input"
                className="mb-2 block text-xs font-medium text-slate-400"
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
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              />
            </div>
          </div>

          {/* Public/Draft 체크박스 */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.public || false}
                onChange={(e) =>
                  setItem({ ...item, public: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950"
              />
              <span className="text-sm text-slate-300">Public</span>
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
              <span className="text-sm text-slate-300">Draft</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

