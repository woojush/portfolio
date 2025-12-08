'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { JourneyItem } from '@/lib/firestore/journey';
import {
  addJourneyItem,
  updateJourneyItem,
  deleteJourneyItem,
  getJourneyItems
} from '@/lib/firestore/journey';

export default function AdminJourneyEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<JourneyItem>>({
    title: '',
    organization: '',
    period: '',
    description: '',
    logoUrl: '',
    isCurrent: false,
    sortOrder: 0
  });

  useEffect(() => {
    if (!isNew) {
      load();
    }
  }, [id, isNew]);

  async function load() {
    try {
      setLoading(true);
      const items = await getJourneyItems();
      const target = items.find((i) => i.id === id);
      if (target) {
        setForm(target);
      }
    } catch (err) {
      console.error(err);
      alert('불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.title || !form.period) {
      alert('제목과 기간을 입력해주세요.');
      return;
    }
    try {
      setSaving(true);
    const payload: Omit<JourneyItem, 'id'> = {
      id: '',
      title: form.title || '',
      organization: form.organization || '',
      period: form.period || '',
      description: form.description || '',
      logoUrl: form.logoUrl || '',
      isCurrent: form.isCurrent || false,
      createdAt: form.createdAt,
      sortOrder: form.sortOrder ?? 0
    };

      if (isNew) {
        await addJourneyItem(payload);
      } else {
        await updateJourneyItem(id, payload);
      }
      router.push('/admin/journey');
    } catch (err) {
      console.error(err);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (isNew) return;
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      await deleteJourneyItem(id);
      router.push('/admin/journey');
    } catch (err) {
      console.error(err);
      alert('삭제에 실패했습니다.');
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
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/journey')}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          ← 목록으로
        </button>
        {!isNew && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-full border border-red-900/60 bg-red-950/30 px-3 py-1 text-xs text-red-300 hover:bg-red-950/50"
          >
            삭제
          </button>
        )}
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs text-slate-400">조직명 *</label>
            <input
              type="text"
              value={form.organization || ''}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">역할 / 학과 *</label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">기간 *</label>
            <input
              type="text"
              value={form.period || ''}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="예: 2025년 2월 - 2025년 5월"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">로고 URL (선택)</label>
            <input
              type="text"
              value={form.logoUrl || ''}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400">추가 내용 (학점/한 일 등)</label>
          <textarea
            rows={4}
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.isCurrent || false}
              onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
              className="rounded border-slate-700 bg-slate-900"
            />
            현재 직위로 표시
          </label>
          <div className="space-y-2">
            <label className="text-xs text-slate-400">정렬 순서 (높을수록 위)</label>
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.push('/admin/journey')}
            className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-warmBeige px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-warmBeige/90 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </section>
    </main>
  );
}

