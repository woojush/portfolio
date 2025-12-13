'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { JourneyItem } from '@/lib/firestore/journey';
import type { Activity } from '@/lib/firestore/activities';

type FormState = {
  id?: string;
  period: string;
  title: string;        // 역할*
  organization: string; // 조직*
  affiliation: string;  // 소속
  location: string;     // 위치*
  description: string;  // 설명*
  logoUrl: string;      // 로고만 사용
  sortOrder: string;
  isCurrent: boolean;
  logoOffsetX: number;
  logoOffsetY: number;
  logoScale: number;
};

type ActivityFormState = {
  id?: string;
  date: string;        // YY.MM 형식
  description: string;
};

const emptyForm: FormState = {
  period: '',
  title: '',
  organization: '',
  affiliation: '',
  location: '',
  description: '',
  logoUrl: '',
  sortOrder: '',
  isCurrent: false,
  logoOffsetX: 0,
  logoOffsetY: 0,
  logoScale: 100
};

async function fetchJson(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, { credentials: 'include', ...init });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
    const text = await res.text().catch(() => '');
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export default function AdminJourneyPage() {
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [logoPreviewSize, setLogoPreviewSize] = useState(72); // px, UI용
  const [logoOffsetX, setLogoOffsetX] = useState(0);
  const [logoOffsetY, setLogoOffsetY] = useState(0);
  const [logoScale, setLogoScale] = useState(100);

  // Activities state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [activityForm, setActivityForm] = useState<ActivityFormState>({ date: '', description: '' });
  const [activitySubmitting, setActivitySubmitting] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);

  function computeDuration(text: string): string {
    // 지원 포맷 예: "2025년 2월 - 2025년 5월", "2025.02 - 2025.05"
    // 연-월 추출 후 개월 차이 계산
    const normalize = text.replace(/\s+/g, '');
    const match = normalize.match(
      /(?<sy>\d{4})[.\s년-]?(?<sm>\d{1,2})월?(?:-|~|to)?(?<ey>\d{4})[.\s년-]?(?<em>\d{1,2})월?/
    );
    if (!match || !match.groups) return '';
    const sy = Number(match.groups.sy);
    const sm = Number(match.groups.sm);
    const ey = Number(match.groups.ey);
    const em = Number(match.groups.em);
    if (
      Number.isNaN(sy) ||
      Number.isNaN(sm) ||
      Number.isNaN(ey) ||
      Number.isNaN(em)
    ) {
      return '';
    }
    const totalStart = sy * 12 + (sm - 1);
    const totalEnd = ey * 12 + (em - 1);
    const diff = totalEnd - totalStart + 1; // 포함 기간
    if (diff <= 0) return '';
    const years = Math.floor(diff / 12);
    const months = diff % 12;
    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    return parts.join(' ') || '';
  }

  useEffect(() => {
    load();
    loadActivities();
  }, []);

  const sorted = useMemo(() => {
    const sortedItems = [...items].sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
        return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
      }
      return (b.period || '').localeCompare(a.period || '');
    });
    return sortedItems;
  }, [items]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchJson('/api/admin/journey');
      setItems(data.items ?? []);
    } catch (err: any) {
      console.error(err);
      if (err?.message === 'Unauthorized') {
        setError('인증이 만료되었습니다. 다시 로그인해 주세요.');
      } else {
        setError('여정을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setForm(emptyForm);
    setLogoPreviewSize(72);
    setLogoOffsetX(0);
    setLogoOffsetY(0);
    setLogoScale(100);
    setShowForm(true);
  }

  function startEdit(item: JourneyItem) {
    setForm({
      id: item.id,
      period: item.period || '',
      title: item.title || '',
      organization: item.organization || '',
      affiliation: item.affiliation || '',
      location: item.location || '',
      description: item.description || '',
      logoUrl: item.logoUrl || '',
      sortOrder: item.sortOrder?.toString() ?? '',
      isCurrent: Boolean(item.isCurrent),
      logoOffsetX: item.logoOffsetX ?? 0,
      logoOffsetY: item.logoOffsetY ?? 0,
      logoScale: item.logoScale ?? 100
    });
    setLogoPreviewSize(72);
    setLogoOffsetX(item.logoOffsetX ?? 0);
    setLogoOffsetY(item.logoOffsetY ?? 0);
    setLogoScale(item.logoScale ?? 100);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setForm(emptyForm);
    setLogoPreviewSize(72);
    setLogoOffsetX(0);
    setLogoOffsetY(0);
    setLogoScale(100);
    setSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const payload = {
      period: form.period.trim(),
      title: form.title.trim(),
      organization: form.organization.trim(),
      affiliation: form.affiliation.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      logoUrl: form.logoUrl.trim(),
      sortOrder:
        form.sortOrder.trim() === '' ? undefined : Number(form.sortOrder),
      isCurrent: form.isCurrent,
      logoOffsetX: form.logoOffsetX ?? 0,
      logoOffsetY: form.logoOffsetY ?? 0,
      logoScale: form.logoScale ?? 100
    };

    if (!payload.period || !payload.title || !payload.description) {
      setError('필수 항목(기간/제목/설명)을 입력하세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (form.id) {
        await fetchJson(`/api/admin/journey/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetchJson('/api/admin/journey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      cancelForm();
      await load();
    } catch (err: any) {
      console.error(err);
      if (err?.message === 'Unauthorized') {
        setError('인증이 만료되었습니다. 다시 로그인해 주세요.');
      } else {
        setError('저장 중 오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetchJson(`/api/admin/journey/${id}`, { method: 'DELETE' });
      await load();
    } catch (err: any) {
      console.error(err);
      setError('삭제 중 오류가 발생했습니다.');
    }
  }

  // Activities functions
  async function loadActivities() {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      const data = await fetchJson('/api/admin/activities');
      setActivities(data.items ?? []);
    } catch (err: any) {
      console.error(err);
      if (err?.message === 'Unauthorized') {
        setActivitiesError('인증이 만료되었습니다. 다시 로그인해 주세요.');
      } else {
        setActivitiesError('Activities를 불러오지 못했습니다.');
      }
    } finally {
      setActivitiesLoading(false);
    }
  }

  function startCreateActivity() {
    setActivityForm({ date: '', description: '' });
    setShowActivityForm(true);
  }

  function startEditActivity(activity: Activity) {
    setActivityForm({
      id: activity.id,
      date: activity.date,
      description: activity.description
    });
    setShowActivityForm(true);
  }

  function cancelActivityForm() {
    setShowActivityForm(false);
    setActivityForm({ date: '', description: '' });
    setActivitySubmitting(false);
  }

  async function handleActivitySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activitySubmitting) return;

    const payload = {
      date: activityForm.date.trim(),
      description: activityForm.description.trim()
    };

    if (!payload.date || !payload.description) {
      setActivitiesError('날짜와 설명을 입력하세요.');
      return;
    }

    setActivitySubmitting(true);
    setActivitiesError(null);
    try {
      if (activityForm.id) {
        await fetchJson(`/api/admin/activities/${activityForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetchJson('/api/admin/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      cancelActivityForm();
      await loadActivities();
    } catch (err: any) {
      console.error(err);
      if (err?.message === 'Unauthorized') {
        setActivitiesError('인증이 만료되었습니다. 다시 로그인해 주세요.');
      } else {
        setActivitiesError('저장 중 오류가 발생했습니다.');
      }
    } finally {
      setActivitySubmitting(false);
    }
  }

  async function handleActivityDelete(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetchJson(`/api/admin/activities/${id}`, { method: 'DELETE' });
      await loadActivities();
    } catch (err: any) {
      console.error(err);
      setActivitiesError('삭제 중 오류가 발생했습니다.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-20 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminHeader />

        <main className="space-y-5">
          <header>
            <p className="mt-2 max-w-2xl text-body text-slate-300">
              여정 타임라인의 직위, 조직, 이미지 등을 추가/수정하고 현재 여부를
              설정합니다. isCurrent는 한 항목만 유지됩니다.
            </p>
          </header>

          <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <h2 className="text-sm font-semibold text-slate-100">목록</h2>
              <button
                type="button"
                onClick={startCreate}
                className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90"
              >
                + 새 항목 추가
              </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {loading && <p className="text-sm text-slate-400">불러오는 중...</p>}

            {!loading && sorted.length === 0 && (
              <p className="text-sm text-slate-400">여정 항목이 없습니다.</p>
            )}

            {!loading && sorted.length > 0 && (
              <div className="space-y-3">
                {sorted.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-warmBeige/70"
                  >
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {item.logoUrl ? (
                          <img
                            src={item.logoUrl}
                            alt={item.organization || item.title}
                            className="h-12 w-12 rounded-xl border border-slate-800 bg-slate-900"
                            style={{
                              objectFit: 'cover',
                              transform: `translate(${item.logoOffsetX ?? 0}px, ${item.logoOffsetY ?? 0}px) scale(${(item.logoScale ?? 100) / 100})`,
                              transformOrigin: 'center center'
                            }}
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-[10px] text-slate-400">
                            Logo
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400">{item.period}</p>
                          <h3 className="text-sm font-semibold text-slate-50 leading-tight">
                            {item.organization || item.title}
                          </h3>
                          {item.affiliation && (
                            <p className="text-xs text-slate-300">
                              {item.affiliation}
                            </p>
                          )}
                          {item.title && (
                            <p className="text-xs text-slate-300">{item.title}</p>
                          )}
                          <div className="flex gap-2">
                            {item.isCurrent && (
                              <span className="inline-block rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] text-emerald-200">
                                현재
                              </span>
                            )}
                            {item.sortOrder !== undefined && (
                              <span className="inline-block rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                                정렬 {item.sortOrder}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800 hover:border-warmBeige/50"
                        >
                          편집
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
                    <p className="text-sm text-slate-200">{item.description}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          {showForm && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-50">
                  {form.id ? '항목 수정' : '새 항목 추가'}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300 transition hover:bg-slate-800"
                >
                  닫기
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <LabeledInput
                    label="기간 *"
                    value={form.period}
                    onChange={(v) => {
                      setForm({ ...form, period: v });
                    }}
                    placeholder="2025년 2월 - 2025년 5월 (또는 2025.02 - 2025.05)"
                    required
                  />
                  <LabeledInput
                    label="조직 *"
                    value={form.organization}
                    onChange={(v) => setForm({ ...form, organization: v })}
                    placeholder="조직/학교명"
                    required
                  />
                  <LabeledInput
                    label="소속"
                    value={form.affiliation}
                    onChange={(v) => setForm({ ...form, affiliation: v })}
                    placeholder="소속 (선택)"
                  />
                  <LabeledInput
                    label="역할 *"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder="역할/직책"
                    required
                  />
                  <LabeledInput
                    label="위치 *"
                    value={form.location}
                    onChange={(v) => setForm({ ...form, location: v })}
                    placeholder="도시, 국가"
                    required
                  />
                  <LabeledTextarea
                    label="설명 *"
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    placeholder="간단한 설명을 작성하세요."
                    required
                  />
                  <LabeledInput
                    label="정렬 순서 (숫자, 큰 수 우선)"
                    value={form.sortOrder}
                    onChange={(v) => setForm({ ...form, sortOrder: v })}
                    type="number"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={form.isCurrent}
                      onChange={(e) => setForm({ ...form, isCurrent: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-warmBeige focus:ring-warmBeige"
                    />
                    현재(isCurrent)
                    <span className="text-xs text-slate-400">(하나만 유지됩니다)</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <LabeledInput
                    label="로고 URL"
                    value={form.logoUrl}
                    onChange={(v) => setForm({ ...form, logoUrl: v })}
                    placeholder="https://..."
                  />

                    {/* 로고 미리보기 + 이동/확대 */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-xs font-semibold text-slate-200">로고 미리보기</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                          className="flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900 overflow-hidden"
                          style={{ width: logoPreviewSize, height: logoPreviewSize }}
                        >
                          {form.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={form.logoUrl}
                              alt="logo preview"
                              className="h-full w-full rounded-lg"
                              style={{
                                objectFit: 'cover',
                                transform: `translate(${logoOffsetX}px, ${logoOffsetY}px) scale(${logoScale / 100})`,
                                transformOrigin: 'center center'
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-500">Logo</span>
                          )}
                        </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[11px] font-medium text-slate-300">
                          컨테이너 크기 (px)
                        </label>
                        <input
                          type="range"
                          min={48}
                          max={120}
                          value={logoPreviewSize}
                          onChange={(e) => setLogoPreviewSize(Number(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-[11px] text-slate-400">{logoPreviewSize}px</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <label className="flex items-center gap-2">
                            X 이동
                            <input
                              type="range"
                              min={-30}
                              max={30}
                              value={logoOffsetX}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setLogoOffsetX(v);
                                setForm({ ...form, logoOffsetX: v });
                              }}
                              className="w-full"
                            />
                          </label>
                          <label className="flex items-center gap-2">
                            Y 이동
                            <input
                              type="range"
                              min={-30}
                              max={30}
                              value={logoOffsetY}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setLogoOffsetY(v);
                                setForm({ ...form, logoOffsetY: v });
                              }}
                              className="w-full"
                            />
                          </label>
                          <label className="flex items-center gap-2 col-span-2">
                            확대/축소
                            <input
                              type="range"
                              min={80}
                              max={150}
                              value={logoScale}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setLogoScale(v);
                                setForm({ ...form, logoScale: v });
                              }}
                              className="w-full"
                            />
                            <span className="w-10 text-right">{logoScale}%</span>
                          </label>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          이동/확대 값도 저장됩니다. 로고 URL 없이 값만 조정하면 의미가 없습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-warmBeige/90 disabled:opacity-60"
                    >
                      {submitting ? '저장 중...' : form.id ? '수정 저장' : '추가'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </form>
            </section>
          )}

          {/* Activities Section */}
          <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <h2 className="text-sm font-semibold text-slate-100">Activities</h2>
              <button
                type="button"
                onClick={startCreateActivity}
                className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90"
              >
                + 새 항목 추가
              </button>
            </div>

            {activitiesError && <p className="text-sm text-red-400">{activitiesError}</p>}
            {activitiesLoading && <p className="text-sm text-slate-400">불러오는 중...</p>}

            {!activitiesLoading && activities.length === 0 && (
              <p className="text-sm text-slate-400">Activities 항목이 없습니다.</p>
            )}

            {!activitiesLoading && activities.length > 0 && (
              <div className="space-y-2">
                {activities.map((activity) => (
                  <article
                    key={activity.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 transition hover:border-warmBeige/70"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3 flex-1">
                        <span className="text-xs font-medium text-slate-300 whitespace-nowrap flex-shrink-0">
                          {activity.date}
                        </span>
                        <p className="text-xs text-slate-200 flex-1">{activity.description}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditActivity(activity)}
                          className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[10px] text-slate-300 transition hover:bg-slate-800 hover:border-warmBeige/50"
                        >
                          편집
                        </button>
                        <button
                          type="button"
                          onClick={() => handleActivityDelete(activity.id)}
                          className="rounded-full border border-red-900/50 bg-red-950/30 px-2.5 py-1 text-[10px] text-red-300 transition hover:bg-red-950/50"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {showActivityForm && (
              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/80 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-50">
                    {activityForm.id ? '항목 수정' : '새 항목 추가'}
                  </h3>
                  <button
                    type="button"
                    onClick={cancelActivityForm}
                    className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] text-slate-300 transition hover:bg-slate-800"
                  >
                    닫기
                  </button>
                </div>

                <form onSubmit={handleActivitySubmit} className="space-y-3">
                  <LabeledInput
                    label="날짜 *"
                    value={activityForm.date}
                    onChange={(v) => setActivityForm({ ...activityForm, date: v })}
                    placeholder="YY.MM (예: 24.06)"
                    required
                  />
                  <LabeledTextarea
                    label="설명 *"
                    value={activityForm.description}
                    onChange={(v) => setActivityForm({ ...activityForm, description: v })}
                    placeholder="활동 설명을 입력하세요."
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={activitySubmitting}
                      className="rounded-full bg-warmBeige px-4 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-warmBeige/90 disabled:opacity-60"
                    >
                      {activitySubmitting ? '저장 중...' : activityForm.id ? '수정 저장' : '추가'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelActivityForm}
                      className="rounded-full border border-slate-700 px-4 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

type InputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text'
}: InputProps) {
  return (
    <label className="block space-y-1">
      <span className="block text-[11px] font-medium text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
      />
    </label>
  );
}

type TextareaProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
};

function LabeledTextarea({
  label,
  value,
  onChange,
  placeholder,
  required
}: TextareaProps) {
  return (
    <label className="block space-y-1">
      <span className="block text-[11px] font-medium text-slate-300">{label}</span>
      <textarea
        value={value}
        required={required}
        rows={5}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
      />
    </label>
  );
}

