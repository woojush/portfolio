'use client';

// Admin Learning editor page
// Unified editor with markdown editor on left, metadata sidebar on right

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { learningRepository } from '@/lib/repositories/learningRepository';
import type { LearningEntry } from '@/lib/firestore/types';
import { TiptapEditor } from '@/components/admin/TiptapEditor';

export default function AdminLearningEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [existingSubjects, setExistingSubjects] = useState<string[]>([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [entry, setEntry] = useState<Partial<LearningEntry>>({
    title: '',
    subject: '',
    startDate: '',
    endDate: '',
    summary: '',
    content: '',
    tags: [],
    public: false,
    draft: true
  });

  useEffect(() => {
    loadExistingSubjects();
    if (!isNew) {
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
      setSaving(true);
      const entryData: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        title: entry.title!,
        subject: entry.subject!,
        startDate: entry.startDate || '',
        endDate: entry.endDate,
        summary: entry.summary!,
        content: entry.content!,
        tags: entry.tags || [],
        public: !draft,
        draft
      };

      if (isNew) {
        await learningRepository.create(entryData);
      } else {
        await learningRepository.update(id, entryData);
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
      await learningRepository.delete(id);
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
        {/* Left: Rich Text Editor */}
        <div className="flex-1 overflow-auto p-4">
          <TiptapEditor
            value={entry.content || ''}
            onChange={(value) => setEntry({ ...entry, content: value })}
          />
        </div>

        {/* Right: Metadata Sidebar */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/40 p-4 overflow-auto">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Title *
              </label>
              <input
                id="title-input"
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
                htmlFor="subject-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
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
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                    placeholder="Math, CS, AI, etc."
                  />
                  {existingSubjects.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition"
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
                        className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 transition"
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="start-date-input"
                  className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
                >
                  Start Date
                </label>
                <input
                  id="start-date-input"
                  type="date"
                  value={entry.startDate || ''}
                  onChange={(e) =>
                    setEntry({ ...entry, startDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                />
              </div>
              <div>
                <label
                  htmlFor="end-date-input"
                  className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
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
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none focus:ring-1 focus:ring-warmBeige/50 cursor-text"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="summary-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Summary *
              </label>
              <textarea
                id="summary-input"
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
                htmlFor="tags-input"
                className="mb-1 block text-xs font-medium text-slate-300 cursor-text"
              >
                Tags (쉼표로 구분)
              </label>
              <input
                id="tags-input"
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
                placeholder="선형대수, 내적, 기하학적 의미"
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

