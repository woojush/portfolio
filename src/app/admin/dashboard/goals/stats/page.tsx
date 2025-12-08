'use client';

// Goal Statistics Page
// Shows all goals statistics

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';
import type { Goal } from '@/lib/firestore/types';

export default function GoalStatsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const allGoals = await dashboardRepository.getGoals();
        setGoals(allGoals);
      } catch (error) {
        console.error('Error loading goals:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <p>불러오는 중...</p>
      </div>
    );
  }

  // 통계 계산
  const weeklyGoals = goals.filter(g => g.type === 'weekly');
  const monthlyGoals = goals.filter(g => g.type === 'monthly');
  const completedGoals = goals.filter(g => !!g.reflection);
  const activeGoals = goals.filter(g => !g.reflection);

  // 주간 목표 달성률
  const weeklyCompleted = weeklyGoals.filter(g => !!g.reflection).length;
  const weeklyCompletionRate = weeklyGoals.length > 0 
    ? Math.round((weeklyCompleted / weeklyGoals.length) * 100) 
    : 0;

  // 월간 목표 달성률
  const monthlyCompleted = monthlyGoals.filter(g => !!g.reflection).length;
  const monthlyCompletionRate = monthlyGoals.length > 0 
    ? Math.round((monthlyCompleted / monthlyGoals.length) * 100) 
    : 0;

  // 전체 달성률
  const totalCompletionRate = goals.length > 0 
    ? Math.round((completedGoals.length / goals.length) * 100) 
    : 0;

  // 기간별 통계
  const goalsByPeriod = new Map<string, { weekly: number; monthly: number; completed: number }>();
  goals.forEach(goal => {
    if (!goalsByPeriod.has(goal.period)) {
      goalsByPeriod.set(goal.period, { weekly: 0, monthly: 0, completed: 0 });
    }
    const periodData = goalsByPeriod.get(goal.period)!;
    if (goal.type === 'weekly') {
      periodData.weekly++;
    } else {
      periodData.monthly++;
    }
    if (goal.reflection) {
      periodData.completed++;
    }
  });

  const sortedPeriods = Array.from(goalsByPeriod.entries())
    .sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin/dashboard"
              className="mb-2 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              ← Dashboard로 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-slate-100">목표 통계</h1>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-1 text-xs text-slate-400">전체 목표</div>
            <div className="text-2xl font-bold text-warmBeige">{goals.length}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-1 text-xs text-slate-400">달성한 목표</div>
            <div className="text-2xl font-bold text-green-400">{completedGoals.length}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-1 text-xs text-slate-400">진행 중 목표</div>
            <div className="text-2xl font-bold text-blue-400">{activeGoals.length}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-1 text-xs text-slate-400">전체 달성률</div>
            <div className="text-2xl font-bold text-warmBeige">{totalCompletionRate}%</div>
          </div>
        </div>

        {/* Type Statistics */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">주간 목표</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">전체</span>
                <span className="text-sm font-medium text-slate-200">{weeklyGoals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">달성</span>
                <span className="text-sm font-medium text-green-400">{weeklyCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">달성률</span>
                <span className="text-sm font-medium text-warmBeige">{weeklyCompletionRate}%</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">월간 목표</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">전체</span>
                <span className="text-sm font-medium text-slate-200">{monthlyGoals.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">달성</span>
                <span className="text-sm font-medium text-green-400">{monthlyCompleted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">달성률</span>
                <span className="text-sm font-medium text-warmBeige">{monthlyCompletionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Goals by Period */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-200">기간별 목표 현황</h2>
          <div className="space-y-2">
            {sortedPeriods.length > 0 ? (
              sortedPeriods.map(([period, data]) => {
                const total = data.weekly + data.monthly;
                const completionRate = total > 0 
                  ? Math.round((data.completed / total) * 100) 
                  : 0;
                
                return (
                  <div
                    key={period}
                    className="rounded border border-slate-700 bg-slate-800/30 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">{period}</span>
                      <span className="text-xs text-slate-400">{completionRate}% 달성</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>주간: {data.weekly}</span>
                      <span>월간: {data.monthly}</span>
                      <span>달성: {data.completed}</span>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full bg-warmBeige transition-all"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">목표가 없습니다.</p>
            )}
          </div>
        </div>

        {/* All Goals List */}
        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-200">전체 목표 목록</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {goals.length > 0 ? (
              goals
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((goal) => (
                  <div
                    key={goal.id}
                    className={`rounded border p-2 ${
                      goal.reflection
                        ? 'border-green-700/50 bg-green-900/20'
                        : 'border-slate-700 bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-200">{goal.title}</span>
                          <span className="text-[10px] text-slate-500">
                            {goal.type === 'weekly' ? '주간' : '월간'}
                          </span>
                          {goal.reflection && (
                            <span className="text-[10px] text-green-400">✓ 달성</span>
                          )}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-500">{goal.period}</div>
                      </div>
                    </div>
                    {goal.reflection && (
                      <div className="mt-2 rounded border border-slate-700 bg-slate-800/30 p-2">
                        <div className="mb-1 text-[10px] text-slate-400">회고</div>
                        <p className="text-[10px] text-slate-300 whitespace-pre-wrap">
                          {goal.reflection}
                        </p>
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p className="text-xs text-slate-500">목표가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

