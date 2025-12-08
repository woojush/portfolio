'use client';

import { useState, useEffect } from 'react';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';
import type { Goal } from '@/lib/firestore/types';

interface DashboardGoalsProps {
  today: string;
}

export function DashboardGoals({ today }: DashboardGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showGoals, setShowGoals] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [reflectingGoalId, setReflectingGoalId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());
  const [isEditingWeekly, setIsEditingWeekly] = useState(false);
  const [isEditingMonthly, setIsEditingMonthly] = useState(false);
  const [newWeeklyGoal, setNewWeeklyGoal] = useState({ title: '' });
  const [newMonthlyGoal, setNewMonthlyGoal] = useState({ title: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    try {
      const allGoals = await dashboardRepository.getGoals();
      setGoals(allGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  }

  // Helpers
  function getCurrentWeekPeriod(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Sunday
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }

  function getCurrentMonthPeriod(): string {
    const d = new Date();
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }

  const currentWeekPeriod = getCurrentWeekPeriod();
  const currentMonthPeriod = getCurrentMonthPeriod();

  const weeklyGoals = goals.filter(g => g.type === 'weekly' && g.period === currentWeekPeriod);
  const monthlyGoals = goals.filter(g => g.type === 'monthly' && g.period === currentMonthPeriod);

  const activeWeeklyGoals = weeklyGoals.filter(g => !g.reflection);
  const activeMonthlyGoals = monthlyGoals.filter(g => !g.reflection);

  // Handlers
  async function handleAddWeeklyGoal() {
    if (!newWeeklyGoal.title.trim()) {
      alert('목표명을 입력해주세요.');
      return;
    }
    try {
      await dashboardRepository.addGoal({
        type: 'weekly',
        period: currentWeekPeriod,
        title: newWeeklyGoal.title.trim(),
        completed: false
      });
      setNewWeeklyGoal({ title: '' });
      setIsEditingWeekly(false);
      loadGoals();
    } catch (error) {
      console.error('Error adding weekly goal:', error);
      alert('주간 목표 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleAddMonthlyGoal() {
    if (!newMonthlyGoal.title.trim()) {
      alert('목표명을 입력해주세요.');
      return;
    }
    try {
      await dashboardRepository.addGoal({
        type: 'monthly',
        period: currentMonthPeriod,
        title: newMonthlyGoal.title.trim(),
        completed: false
      });
      setNewMonthlyGoal({ title: '' });
      setIsEditingMonthly(false);
      loadGoals();
    } catch (error) {
      console.error('Error adding monthly goal:', error);
      alert('월간 목표 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleDeleteGoal(id: string) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await dashboardRepository.deleteGoal(id);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('목표 삭제 중 오류가 발생했습니다.');
    }
  }

  function handleStartReflection(goal: Goal) {
    setReflectingGoalId(goal.id);
    setReflectionText(goal.reflection || '');
  }

  async function handleSaveReflection() {
    if (!reflectingGoalId) return;
    try {
      const goal = goals.find(g => g.id === reflectingGoalId);
      if (!goal) return;
      await dashboardRepository.updateGoal(reflectingGoalId, {
        ...goal,
        reflection: reflectionText
      });
      setReflectingGoalId(null);
      setReflectionText('');
      loadGoals();
    } catch (error) {
      console.error('Error saving reflection:', error);
      alert('회고 저장 중 오류가 발생했습니다.');
    }
  }

  function toggleGoalExpansion(goalId: string) {
    const newSet = new Set(expandedGoalIds);
    if (newSet.has(goalId)) {
      newSet.delete(goalId);
    } else {
      newSet.add(goalId);
    }
    setExpandedGoalIds(newSet);
  }

  if (loading) return <div className="card-surface p-6 animate-pulse bg-slate-800/50 min-h-[200px]" />;

  return (
    <div className="card-surface p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          🎯 주간/월간 목표
          <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {activeWeeklyGoals.length + activeMonthlyGoals.length} 진행중
          </span>
        </h2>
        <button
          onClick={() => setShowGoals(!showGoals)}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          {showGoals ? '접기' : '펼치기'}
        </button>
      </div>

      {showGoals && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Weekly Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-slate-200">
                주간 목표 <span className="text-xs text-slate-400 font-normal ml-2">{currentWeekPeriod}</span>
              </h3>
              <button
                onClick={() => setIsEditingWeekly(!isEditingWeekly)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {isEditingWeekly ? '취소' : '추가'}
              </button>
            </div>
            
            {isEditingWeekly && (
              <div className="flex gap-2 mb-4 animate-fadeIn">
                <input
                  type="text"
                  value={newWeeklyGoal.title}
                  onChange={(e) => setNewWeeklyGoal({ ...newWeeklyGoal, title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWeeklyGoal()}
                  placeholder="이번 주 목표 입력"
                  className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleAddWeeklyGoal}
                  className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  완료
                </button>
              </div>
            )}

            <div className="space-y-3">
              {activeWeeklyGoals.length === 0 && !isEditingWeekly && (
                <p className="text-sm text-slate-500 py-2">등록된 주간 목표가 없습니다.</p>
              )}
              {activeWeeklyGoals.map((goal) => (
                <div key={goal.id} className="group relative rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition hover:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-slate-200">{goal.title}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartReflection(goal)}
                        className="text-xs text-slate-400 hover:text-blue-400"
                      >
                        회고
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-xs text-slate-400 hover:text-red-400"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  
                  {/* Reflection Form */}
                  {reflectingGoalId === goal.id && (
                    <div className="mt-3 border-t border-slate-800 pt-3">
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="이번 주 목표에 대한 회고를 작성해주세요..."
                        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setReflectingGoalId(null)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveReflection}
                          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          회고 저장 (완료 처리)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-slate-200">
                월간 목표 <span className="text-xs text-slate-400 font-normal ml-2">{currentMonthPeriod}</span>
              </h3>
              <button
                onClick={() => setIsEditingMonthly(!isEditingMonthly)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                {isEditingMonthly ? '취소' : '추가'}
              </button>
            </div>

            {isEditingMonthly && (
              <div className="flex gap-2 mb-4 animate-fadeIn">
                <input
                  type="text"
                  value={newMonthlyGoal.title}
                  onChange={(e) => setNewMonthlyGoal({ ...newMonthlyGoal, title: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMonthlyGoal()}
                  placeholder="이번 달 목표 입력"
                  className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleAddMonthlyGoal}
                  className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  완료
                </button>
              </div>
            )}

            <div className="space-y-3">
              {activeMonthlyGoals.length === 0 && !isEditingMonthly && (
                <p className="text-sm text-slate-500 py-2">등록된 월간 목표가 없습니다.</p>
              )}
              {activeMonthlyGoals.map((goal) => (
                <div key={goal.id} className="group relative rounded-lg border border-slate-800 bg-slate-900/40 p-3 transition hover:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-slate-200">{goal.title}</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartReflection(goal)}
                        className="text-xs text-slate-400 hover:text-blue-400"
                      >
                        회고
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-xs text-slate-400 hover:text-red-400"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  
                  {/* Reflection Form */}
                  {reflectingGoalId === goal.id && (
                    <div className="mt-3 border-t border-slate-800 pt-3">
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="이번 달 목표에 대한 회고를 작성해주세요..."
                        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                        rows={3}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setReflectingGoalId(null)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveReflection}
                          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          회고 저장 (완료 처리)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

