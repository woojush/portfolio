'use client';

import { useState, useEffect } from 'react';
import { 
  dashboardRepository, 
  type HabitDefinition, 
  type HabitLog,
  type DailyRecord
} from '@/lib/repositories/dashboardRepository';
import { AIAnalysisModal } from '@/components/shared/AIAnalysisModal';
import { HabitCalendarModal } from '@/components/admin/dashboard/HabitCalendarModal';
import { calculateHabitStats } from '@/lib/utils/habitStats';
import type { HabitDiagnosis } from '@/lib/firestore/types';

import { getLocalDateString } from '@/lib/utils/dateUtils';

interface DashboardHabitsProps {
  today: string;
}

type ViewMode = 'overview' | 'habit-detail';
type HabitDetailTab = 'calendar' | 'info';

export function DashboardHabits({ today }: DashboardHabitsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [habitDefinitions, setHabitDefinitions] = useState<HabitDefinition[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stats Data
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);

  // Forms
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitUnit, setNewHabitUnit] = useState('');
  const [newHabitValue, setNewHabitValue] = useState('');
  const [newHabitNotes, setNewHabitNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(true); // New: Completion status

  // AI Analysis
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiHabitAnalysis, setAiHabitAnalysis] = useState<string | null>(null);
  const [analyzingHabit, setAnalyzingHabit] = useState(false);
  const [latestDiagnosis, setLatestDiagnosis] = useState<HabitDiagnosis | null>(null);

  // Detail View State
  const [habitDetailTab, setHabitDetailTab] = useState<HabitDetailTab>('calendar');
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    loadHabitDefinitions();
  }, []);

  useEffect(() => {
    if (viewMode === 'habit-detail' && selectedHabitId) {
      loadHabitDetailData();
    }
  }, [viewMode, selectedHabitId, today]);

  async function loadHabitDefinitions() {
    try {
      const defs = await dashboardRepository.getHabitDefinitions();
      setHabitDefinitions(defs);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHabitDetailData() {
    if (!selectedHabitId) return;
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]!;
      
      const logs = await dashboardRepository.getHabitLogs(
        selectedHabitId,
        thirtyDaysAgoStr,
        today
      );
      setHabitLogs(logs);

      // Load daily records for correlation analysis
      const records = await dashboardRepository.getDailyRecords(
        thirtyDaysAgoStr,
        today
      );
      setDailyRecords(records);

      // Load latest diagnosis
      const diagnosis = await dashboardRepository.getLatestDiagnosis(selectedHabitId);
      setLatestDiagnosis(diagnosis);
      
    } catch (error) {
      console.error('Error loading habit detail:', error);
    }
  }

  async function handleAddHabitDefinition() {
    if (!newHabitName.trim()) {
      alert('습관 이름을 입력해주세요.');
      return;
    }
    try {
      await dashboardRepository.addHabitDefinition({
        name: newHabitName.trim(),
        unit: newHabitUnit.trim() || undefined
      });
      setNewHabitName('');
      setNewHabitUnit('');
      loadHabitDefinitions();
    } catch (error) {
      console.error('Error adding habit definition:', error);
      alert('습관 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleDeleteHabitDefinition(id: string) {
    if (!confirm('정말 삭제하시겠습니까? 관련 기록도 모두 삭제됩니다.')) return;
    try {
      await dashboardRepository.deleteHabitDefinition(id);
      if (selectedHabitId === id) {
        setViewMode('overview');
        setSelectedHabitId(null);
      }
      loadHabitDefinitions();
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('습관 삭제 중 오류가 발생했습니다.');
    }
  }

  async function handleAddHabitLog() {
    if (!selectedHabitId) return;
    try {
      // Check if already logged today
      const existing = habitLogs.find(l => l.date === today);
      if (existing) {
        if (!confirm('오늘 이미 기록이 있습니다. 덮어씌우시겠습니까? (기존 기록 삭제 후 추가됨)')) return;
        await dashboardRepository.deleteHabitLog(existing.id);
      }

      await dashboardRepository.addHabitLog({
        habitId: selectedHabitId,
        date: today,
        value: isCompleted && newHabitValue ? parseFloat(newHabitValue) : undefined,
        notes: newHabitNotes.trim() || undefined,
        completed: isCompleted
      });
      setNewHabitValue('');
      setNewHabitNotes('');
      setIsCompleted(true); // Reset to default
      loadHabitDetailData();
    } catch (error) {
      console.error('Error adding habit log:', error);
      alert('기록 추가 중 오류가 발생했습니다.');
    }
  }

  async function handleDeleteHabitLog(id: string) {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      await dashboardRepository.deleteHabitLog(id);
      loadHabitDetailData();
    } catch (error) {
      console.error('Error deleting habit log:', error);
      alert('기록 삭제 중 오류가 발생했습니다.');
    }
  }

  async function handleAnalyzeHabit() {
    if (!selectedHabitId) return;
    setAnalyzingHabit(true);
    try {
        const habitDef = habitDefinitions.find(h => h.id === selectedHabitId);
        if (!habitDef) return;

        // Prepare data for AI
        const analysisData = {
            habitId: selectedHabitId,
            habitDefinitions: [habitDef], // Pass current habit as definition
            habitLogs: habitLogs,
            dailyRecords: dailyRecords
        };

        const response = await fetch('/api/ai/habits/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analysisData)
        });

        if (!response.ok) throw new Error('AI analysis failed');
        const data = await response.json();
        
        setAiHabitAnalysis(data.analysis);
        setShowAIModal(true);
        
        // Save diagnosis
        await dashboardRepository.saveDiagnosis({
            habitId: selectedHabitId,
            analysis: data.analysis,
            periodStart: dailyRecords[dailyRecords.length - 1]?.date || today,
            periodEnd: today
        });
        
        // Refresh diagnosis
        const diagnosis = await dashboardRepository.getLatestDiagnosis(selectedHabitId);
        setLatestDiagnosis(diagnosis);

    } catch (error) {
        console.error('Error analyzing habit:', error);
        alert('AI 분석 중 오류가 발생했습니다.');
    } finally {
        setAnalyzingHabit(false);
    }
  }

  // --- UI Renders ---

  if (loading) return <div className="card-surface p-6 h-full animate-pulse bg-slate-800/50" />;

  // Overview Mode
  if (viewMode === 'overview') {
    return (
      <div className="card-surface p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-100">습관 관리</h2>
          <button
            onClick={() => window.open('/admin/dashboard/habits/stats', '_self')}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            전체 통계 보기
          </button>
        </div>

        {/* Add Habit Form */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="새 습관 이름 (예: 독서, 운동)"
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
          />
          <input
            type="text"
            value={newHabitUnit}
            onChange={(e) => setNewHabitUnit(e.target.value)}
            placeholder="단위 (선택)"
            className="w-20 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
          />
          <button
            onClick={handleAddHabitDefinition}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700"
          >
            추가
          </button>
        </div>

        {/* Habit List */}
        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
            {habitDefinitions.length === 0 && (
                <p className="text-center text-slate-500 py-10">등록된 습관이 없습니다.</p>
            )}
            {habitDefinitions.map((habit) => (
                <div
                    key={habit.id}
                    onClick={() => {
                        setSelectedHabitId(habit.id);
                        setViewMode('habit-detail');
                    }}
                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-600 hover:bg-slate-900/60"
                >
                    <div>
                        <h3 className="font-semibold text-slate-200">{habit.name}</h3>
                        {habit.unit && <p className="text-xs text-slate-500">단위: {habit.unit}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            클릭하여 관리
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHabitDefinition(habit.id);
                            }}
                            className="rounded p-1 text-slate-500 hover:bg-red-900/20 hover:text-red-400"
                            title="삭제"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  // Detail Mode
  const habit = habitDefinitions.find(h => h.id === selectedHabitId);
  if (!habit) return null;

  return (
    <div className="card-surface p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
            <button
                onClick={() => {
                    setViewMode('overview');
                    setSelectedHabitId(null);
                }}
                className="text-slate-400 hover:text-slate-200"
            >
                ←
            </button>
            <h2 className="text-xl font-bold text-slate-100">{habit.name}</h2>
            {habit.unit && <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">{habit.unit}</span>}
            <div className="flex-1" />
            <button
                onClick={handleAnalyzeHabit}
                disabled={analyzingHabit}
                className="flex items-center gap-1.5 rounded-full bg-indigo-600/20 px-3 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-50"
            >
                {analyzingHabit ? '분석 중...' : '✨ AI 분석'}
            </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
            <button
                onClick={() => setHabitDetailTab('calendar')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    habitDetailTab === 'calendar' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
            >
                캘린더 & 기록
            </button>
            <button
                onClick={() => setHabitDetailTab('info')}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                    habitDetailTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
            >
                정보 & 통계
            </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {habitDetailTab === 'calendar' && (
                <div className="space-y-6">
                    {/* Log Form */}
                    <div className="rounded-lg bg-slate-900/30 p-4 border border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-slate-200">오늘 기록하기 ({today})</span>
                            {habitLogs.some(l => l.date === today) && (
                                <span className="text-xs text-green-400">✓ 이미 기록됨</span>
                            )}
                        </div>
                        <div className="flex flex-col gap-3">
                            {/* Status Toggle */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}>
                                        {isCompleted && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={isCompleted} 
                                        onChange={(e) => setIsCompleted(e.target.checked)} 
                                        className="hidden" 
                                    />
                                    <span className={`text-sm ${isCompleted ? 'text-green-400' : 'text-slate-400'}`}>
                                        {isCompleted ? '달성함' : '미달성 (사유 기록)'}
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-2">
                                {isCompleted && (
                                    <input
                                        type="number"
                                        value={newHabitValue}
                                        onChange={(e) => setNewHabitValue(e.target.value)}
                                        placeholder={habit.unit ? `수치 (${habit.unit})` : '수치 (선택)'}
                                        className="w-28 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
                                    />
                                )}
                                <input
                                    type="text"
                                    value={newHabitNotes}
                                    onChange={(e) => setNewHabitNotes(e.target.value)}
                                    placeholder={isCompleted ? "메모 (선택)" : "미달성 사유를 적어주세요"}
                                    className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleAddHabitLog}
                                    className={`rounded px-4 py-2 text-sm font-semibold text-white transition-colors ${
                                        isCompleted 
                                            ? 'bg-blue-600 hover:bg-blue-500' 
                                            : 'bg-slate-600 hover:bg-slate-500'
                                    }`}
                                >
                                    저장
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Calendar (Simplified Visualization) */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-400">이번 주</h3>
                            <button 
                                onClick={() => setShowCalendarModal(true)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                📅 달력 보기
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: 7 }).map((_, i) => {
                                // Calculate the start of the current week (Monday)
                                const todayDate = new Date(today);
                                const dayOfWeek = todayDate.getDay(); // 0 (Sun) - 6 (Sat)
                                const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday. Otherwise back to Monday.
                                
                                const monday = new Date(todayDate);
                                monday.setDate(todayDate.getDate() - diffToMonday);

                                const d = new Date(monday);
                                d.setDate(monday.getDate() + i); // Monday + i days

                                const dateStr = getLocalDateString(d);
                                const log = habitLogs.find(l => l.date === dateStr);
                                const isToday = dateStr === today;
                                
                                const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
                                
                                return (
                                    <div key={i} className={`flex flex-col items-center rounded-lg border p-2 ${
                                        isToday ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-800 bg-slate-900/30'
                                    }`}>
                                        <span className="text-[10px] text-slate-500 mb-0.5">
                                            {dayNames[i]}
                                        </span>
                                        <span className="text-xs text-slate-300 mb-1">
                                            {d.getDate()}
                                        </span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                                            log 
                                                ? (log.completed !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')
                                                : 'bg-slate-800/50 text-slate-600'
                                        }`}>
                                            {log ? (log.completed !== false ? '✓' : '✕') : ''}
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 h-3 truncate w-full text-center">
                                            {log?.value ? `${log.value}${habit.unit || ''}` : ''}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Logs List */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 mb-3">최근 기록</h3>
                        <div className="space-y-2">
                            {habitLogs.sort((a,b) => b.date.localeCompare(a.date)).slice(0, 10).map(log => (
                                <div key={log.id} className="flex items-center justify-between rounded bg-slate-900/30 px-4 py-3 border border-slate-800/50">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-sm text-slate-300 font-mono whitespace-nowrap">{log.date}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${
                                            log.completed !== false 
                                                ? 'border-green-500/30 bg-green-500/10 text-green-400' 
                                                : 'border-red-500/30 bg-red-500/10 text-red-400'
                                        }`}>
                                            {log.completed !== false ? '달성' : '미달성'}
                                        </span>
                                        {log.value && (
                                            <span className="text-sm font-medium text-slate-200 whitespace-nowrap">
                                                {log.value} {habit.unit}
                                            </span>
                                        )}
                                        {log.notes && (
                                            <span className="text-xs text-slate-500 border-l border-slate-700 pl-3 truncate">
                                                {log.notes}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteHabitLog(log.id)}
                                        className="text-xs text-slate-500 hover:text-red-400 ml-2 whitespace-nowrap"
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {habitDetailTab === 'info' && (
                <div className="space-y-6">
                    {latestDiagnosis && (
                        <div className="rounded-xl border border-indigo-500/30 bg-indigo-900/10 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-indigo-300">💡 최근 AI 분석 리포트</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setAiHabitAnalysis(latestDiagnosis.analysis);
                                            setShowAIModal(true);
                                        }}
                                        className="text-xs text-indigo-400 hover:text-indigo-200"
                                    >
                                        다시 보기
                                    </button>
                                    <span className="text-xs text-slate-500">{new Date(latestDiagnosis.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                                {latestDiagnosis.analysis.replace(/[#*`]/g, '').substring(0, 150)}...
                            </p>
                        </div>
                    )}

                    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-5">
                        <h3 className="font-semibold text-slate-200 mb-4">습관 정보</h3>
                        <div className="space-y-2 text-sm text-slate-400">
                            <p>습관명: <span className="text-slate-200">{habit.name}</span></p>
                            <p>단위: <span className="text-slate-200">{habit.unit || '없음'}</span></p>
                            <p>총 기록 수: <span className="text-slate-200">{habitLogs.length}회</span></p>
                            <p>성공 횟수: <span className="text-green-400">{habitLogs.filter(l => l.completed !== false).length}회</span></p>
                            <p>실패 횟수: <span className="text-red-400">{habitLogs.filter(l => l.completed === false).length}회</span></p>
                            <p>생성일: <span className="text-slate-200">{new Date(habit.createdAt).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Calendar Modal */}
        <HabitCalendarModal
            isOpen={showCalendarModal}
            onClose={() => setShowCalendarModal(false)}
            habitId={selectedHabitId || ''}
            habitName={habit.name}
            unit={habit.unit}
        />

        {/* AI Modal */}
        {showAIModal && aiHabitAnalysis && (
            <AIAnalysisModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                analysis={aiHabitAnalysis}
                title={`${habit.name} AI 진단`}
                stats={calculateHabitStats(habitLogs, dailyRecords, 1, selectedHabitId || undefined)}
            />
        )}
    </div>
  );
}
