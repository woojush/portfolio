'use client';

// Daily Record Statistics Page
// Shows sleep time, mood graphs, averages, and correlations

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardRepository, type DailyRecord } from '@/lib/repositories/dashboardRepository';

export default function DailyRecordStatsPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      setLoading(true);
      // 1년 전부터 오늘까지의 모든 기록 가져오기
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      const startDate = oneYearAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      const allRecords = await dashboardRepository.getDailyRecords(startDate, endDate);
      setRecords(allRecords);
    } catch (error) {
      console.error('Error loading daily records:', error);
    } finally {
      setLoading(false);
    }
  }

  // 수면 시간 계산 (분 단위)
  function calculateSleepMinutes(start: string, end: string): number | null {
    if (!start || !end) return null;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let startTotal = startHour * 60 + startMin;
    let endTotal = endHour * 60 + endMin;
    if (endTotal < startTotal) endTotal += 24 * 60;
    return endTotal - startTotal;
  }

  // 통계 계산
  const sleepData = records
    .map(r => {
      const minutes = calculateSleepMinutes(r.sleepStart || '', r.sleepEnd || '');
      return minutes ? { date: r.date, minutes, hours: minutes / 60 } : null;
    })
    .filter(Boolean) as Array<{ date: string; minutes: number; hours: number }>;

  const moodData = records
    .map(r => ({
      date: r.date,
      morning: r.moodMorning,
      noon: r.moodNoon,
      evening: r.moodEvening,
      average: r.moodMorning && r.moodNoon && r.moodEvening
        ? (r.moodMorning + r.moodNoon + r.moodEvening) / 3
        : null
    }))
    .filter(r => r.morning || r.noon || r.evening);

  const avgSleepHours = sleepData.length > 0
    ? sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length
    : 0;

  const avgMood = moodData.length > 0
    ? moodData.reduce((sum, d) => sum + (d.average || 0), 0) / moodData.filter(d => d.average).length
    : 0;

  // 수면 시간과 기분의 상관관계
  const correlationData = records
    .map(r => {
      const sleepMinutes = calculateSleepMinutes(r.sleepStart || '', r.sleepEnd || '');
      const moodAvg = r.moodMorning && r.moodNoon && r.moodEvening
        ? (r.moodMorning + r.moodNoon + r.moodEvening) / 3
        : null;
      return sleepMinutes && moodAvg ? { sleepHours: sleepMinutes / 60, mood: moodAvg } : null;
    })
    .filter(Boolean) as Array<{ sleepHours: number; mood: number }>;

  // 수면 시간 구간별 평균 기분
  const sleepRanges = [
    { min: 0, max: 6, label: '6시간 미만' },
    { min: 6, max: 7, label: '6-7시간' },
    { min: 7, max: 8, label: '7-8시간' },
    { min: 8, max: 9, label: '8-9시간' },
    { min: 9, max: 24, label: '9시간 이상' }
  ];

  const moodBySleepRange = sleepRanges.map(range => {
    const matching = correlationData.filter(d => d.sleepHours >= range.min && d.sleepHours < range.max);
    const avgMood = matching.length > 0
      ? matching.reduce((sum, d) => sum + d.mood, 0) / matching.length
      : null;
    return { ...range, count: matching.length, avgMood };
  });

  // 그래프 데이터 준비
  const maxSleepHours = Math.max(...sleepData.map(d => d.hours), 10);
  const maxMood = 5;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <header className="mb-6 md:mb-8">
        <Link
          href="/admin/dashboard"
          className="mb-4 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          ← Dashboard로 돌아가기
        </Link>
        <h1 className="text-section-title">하루 기록 통계</h1>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          수면 시간, 기분 등의 통계와 상관관계를 분석합니다.
        </p>
      </header>

      <div className="space-y-6">
        {/* 요약 통계 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-xs font-medium text-slate-400 mb-2">평균 수면 시간</h3>
            <p className="text-2xl font-bold text-slate-100">
              {avgSleepHours.toFixed(1)}시간
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {sleepData.length}일 기록
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-xs font-medium text-slate-400 mb-2">평균 기분</h3>
            <p className="text-2xl font-bold text-slate-100">
              {avgMood.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {moodData.length}일 기록
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h3 className="text-xs font-medium text-slate-400 mb-2">총 기록일</h3>
            <p className="text-2xl font-bold text-slate-100">
              {records.length}일
            </p>
          </div>
        </section>

        {/* 수면 시간 그래프 */}
        {sleepData.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-sm font-semibold text-slate-100 mb-4">수면 시간 추이</h2>
            <div className="space-y-2">
              {sleepData.slice(-30).map((d, idx) => {
                const barWidth = (d.hours / maxSleepHours) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">{d.date}</span>
                    <div className="flex-1 h-6 bg-slate-900 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-300 w-16 text-right">
                      {d.hours.toFixed(1)}h
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 기분 그래프 */}
        {moodData.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-sm font-semibold text-slate-100 mb-4">기분 추이</h2>
            <div className="space-y-2">
              {moodData.slice(-30).map((d, idx) => {
                const morningBar = d.morning ? (d.morning / maxMood) * 100 : 0;
                const noonBar = d.noon ? (d.noon / maxMood) * 100 : 0;
                const eveningBar = d.evening ? (d.evening / maxMood) * 100 : 0;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-20">{d.date}</span>
                    <div className="flex-1 h-6 bg-slate-900 rounded overflow-hidden flex gap-0.5">
                      {d.morning && (
                        <div
                          className="bg-green-500"
                          style={{ width: `${morningBar}%` }}
                          title={`아침: ${d.morning}`}
                        />
                      )}
                      {d.noon && (
                        <div
                          className="bg-yellow-500"
                          style={{ width: `${noonBar}%` }}
                          title={`점심: ${d.noon}`}
                        />
                      )}
                      {d.evening && (
                        <div
                          className="bg-purple-500"
                          style={{ width: `${eveningBar}%` }}
                          title={`저녁: ${d.evening}`}
                        />
                      )}
                    </div>
                    {d.average && (
                      <span className="text-xs text-slate-300 w-12 text-right">
                        {d.average.toFixed(1)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>아침</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" />
                <span>점심</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span>저녁</span>
              </div>
            </div>
          </section>
        )}

        {/* 수면 시간에 따른 기분 차이 */}
        {correlationData.length > 0 && (
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-sm font-semibold text-slate-100 mb-4">수면 시간에 따른 평균 기분</h2>
            <div className="space-y-3">
              {moodBySleepRange.map((range, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 w-24">{range.label}</span>
                  <div className="flex-1">
                    {range.count > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-4 bg-slate-900 rounded overflow-hidden">
                          <div
                            className="h-full bg-warmBeige transition-all"
                            style={{ width: `${(range.avgMood! / maxMood) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-300 w-16 text-right">
                          {range.avgMood!.toFixed(2)} ({range.count}일)
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600">데이터 없음</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

