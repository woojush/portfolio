'use client';

// Admin Learning editor page
// Unified editor with markdown editor on left, metadata sidebar on right

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { learningRepository } from '@/lib/repositories/learningRepository';
import type { LearningEntry } from '@/lib/firestore/types';
import { MarkdownEditor } from '@/components/admin/MarkdownEditor';

export default function AdminLearningEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';
  
  // 이전 경로 가져오기
  const from = searchParams.get('from');
  const category = searchParams.get('category');
  const backUrl = from === 'admin' && category
    ? `/admin/learning?category=${encodeURIComponent(category)}`
    : from === 'admin'
    ? '/admin/learning'
    : '/admin';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [existingSubjects, setExistingSubjects] = useState<string[]>([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [entry, setEntry] = useState<Partial<LearningEntry>>({
    title: '',
    subject: '',
    thumbnailUrl: '',
    startDate: '',
    endDate: '',
    summary: '',
    content: '',
    // 태그 입력을 숨겼지만 백엔드 스키마 호환을 위해 기본값 유지
    tags: [],
    public: false,
    draft: true
  });

  useEffect(() => {
    loadExistingSubjects();
    if (isNew) {
      // 새 항목일 때 오늘 날짜로 자동 설정
      const today = new Date().toISOString().split('T')[0];
      setEntry(prev => ({ ...prev, startDate: today }));
      setLoading(false);
    } else if (id) {
      loadEntry();
    }
  }, [id, isNew]);

  async function loadExistingSubjects() {
    try {
      const subjects = await learningRepository.getSubjects();
      const uniqueSubjects = Array.from(new Set(subjects.map(s => s.subject))).filter(Boolean);
      setExistingSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  }

  async function loadEntry() {
    if (!id || isNew) return;
    try {
      setLoading(true);
      const data = await learningRepository.getEntryById(id, true);
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
      if (!entry.title || !entry.subject || !entry.summary || !entry.content) {
        alert('Title, Subject, Summary, Content는 필수입니다.');
        return;
      }
      if (!entry.thumbnailUrl) {
        alert('썸네일 이미지 URL을 입력해주세요.');
        return;
      }
      setSaving(true);
      // startDate가 없으면 오늘 날짜로 설정
      const today = new Date().toISOString().split('T')[0];
      const startDate = entry.startDate || today;
      
      const entryData: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        title: entry.title!,
        subject: entry.subject!,
        thumbnailUrl: entry.thumbnailUrl!,
        startDate: startDate,
        endDate: entry.endDate,
        summary: entry.summary!,
        content: entry.content!,
        tags: entry.tags || [],
        public: !draft,
        draft
      };

      if (isNew) {
        const response = await fetch('/api/admin/learning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(entryData),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          const errorMessage = errorData.error || `HTTP ${response.status}: Failed to create entry`;
          console.error('Create error:', errorMessage, errorData);
          throw new Error(errorMessage);
        }
      } else {
        const response = await fetch(`/api/admin/learning/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(entryData),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          const errorMessage = errorData.error || `HTTP ${response.status}: Failed to update entry`;
          console.error('Update error:', errorMessage, errorData);
          throw new Error(errorMessage);
        }
      }

      router.push(backUrl);
      router.refresh();
    } catch (error: any) {
      console.error('Error saving entry:', error);
      const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('정말 이 항목을 삭제하시겠습니까?')) return;
    try {
      await learningRepository.delete(id);
      router.push(backUrl);
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
              {entry.thumbnailUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                  <img
                    src={entry.thumbnailUrl}
                    alt="썸네일 미리보기"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <input
                id="thumbnail-input"
                type="url"
                value={entry.thumbnailUrl || ''}
                onChange={(e) =>
                  setEntry({ ...entry, thumbnailUrl: e.target.value })
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
              value={entry.title || ''}
              onChange={(e) => setEntry({ ...entry, title: e.target.value })}
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-semibold text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* Subject */}
          <div>
            <label
              htmlFor="subject-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Subject *
            </label>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  id="subject-input"
                  type="text"
                  value={entry.subject || ''}
                  onChange={(e) =>
                    setEntry({ ...entry, subject: e.target.value })
                  }
                  onFocus={() => setShowSubjectDropdown(true)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
                  placeholder="Math, CS, AI, etc."
                />
                {existingSubjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    선택
                  </button>
                )}
              </div>
              {showSubjectDropdown && existingSubjects.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 shadow-lg max-h-48 overflow-auto">
                  {existingSubjects.map((subject) => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => {
                        setEntry({ ...entry, subject });
                        setShowSubjectDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 transition"
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 요약 */}
          <div>
            <label
              htmlFor="summary-input"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Summary *
            </label>
            <textarea
              id="summary-input"
              value={entry.summary || ''}
              onChange={(e) => setEntry({ ...entry, summary: e.target.value })}
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
                value={entry.content || ''}
                onChange={(value) => setEntry({ ...entry, content: value })}
              />
            </div>
          </div>

          {/* 날짜 및 기타 설정 (작은 크기) */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label
                htmlFor="start-date-input"
                className="mb-2 block text-xs font-medium text-slate-400"
              >
                Start Date *
              </label>
              <input
                id="start-date-input"
                type="date"
                value={entry.startDate || ''}
                onChange={(e) =>
                  setEntry({ ...entry, startDate: e.target.value })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50"
              />
            </div>
            <div>
              <label
                htmlFor="end-date-input"
                className="mb-2 block text-xs font-medium text-slate-400"
              >
                End Date
              </label>
              <input
                id="end-date-input"
                type="date"
                value={entry.endDate || ''}
                onChange={(e) =>
                  setEntry({ ...entry, endDate: e.target.value })
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
                checked={entry.public || false}
                onChange={(e) =>
                  setEntry({ ...entry, public: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-950"
              />
              <span className="text-sm text-slate-300">Public</span>
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
              <span className="text-sm text-slate-300">Draft</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

