'use client';

// Habit Statistics Page
// Shows overall habit statistics with correlation analysis

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';
import type {
  HabitDefinition,
  HabitLog,
  DailyRecord
} from '@/lib/repositories/dashboardRepository';
import type { HabitDiagnosis } from '@/lib/firestore/types';
import { AIAnalysisModal } from '@/components/shared/AIAnalysisModal';
import { calculateHabitStats } from '@/lib/utils/habitStats';
import { getLocalDateString } from '@/lib/utils/dateUtils';

export default function HabitStatsPage() {
  const [habitDefinitions, setHabitDefinitions] = useState<HabitDefinition[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [latestDiagnosis, setLatestDiagnosis] = useState<HabitDiagnosis | null>(null);
  const [savedDiagnosis, setSavedDiagnosis] = useState<HabitDiagnosis | null>(null);

  // 디버깅: 상태 변경 추적
  useEffect(() => {
    console.log('📊 State changed:', { 
      hasAiAnalysis: !!aiAnalysis, 
      aiAnalysisLength: aiAnalysis?.length,
      showAIModal 
    });
  }, [aiAnalysis, showAIModal]);

  useEffect(() => {
    async function loadData() {
      try {
        const definitions = await dashboardRepository.getHabitDefinitions();
        setHabitDefinitions(definitions);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = getLocalDateString();
        
        const logs = await dashboardRepository.getHabitLogs(
          undefined,
          getLocalDateString(thirtyDaysAgo), // startDate
          today // endDate
        );
        console.log('📋 Loaded Logs:', logs);
        console.log('📅 Date Range:', getLocalDateString(thirtyDaysAgo), '~', today);
        setHabitLogs(logs);

        const records = await dashboardRepository.getDailyRecords(
          getLocalDateString(thirtyDaysAgo),
          today
        );
        setDailyRecords(records);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleAIAnalysis() {
    console.log('🚀 AI 진단 시작 버튼 클릭됨');
    setAnalyzing(true);
    setAiAnalysis(null);
    setShowAIModal(false);
    
    try {
      console.log('📤 API 호출 준비 중...');
      // Prepare data for AI analysis
      const analysisData = {
        habitDefinitions: habitDefinitions.map(h => ({ id: h.id, name: h.name, unit: h.unit })),
        habitLogs: habitLogs.map(log => ({
          habitId: log.habitId,
          date: log.date,
          value: log.value,
          notes: log.notes,
          completed: log.completed
        })),
        dailyRecords: dailyRecords.map(record => ({
          date: record.date,
          sleepStart: record.sleepStart,
          sleepEnd: record.sleepEnd,
          moodMorning: record.moodMorning,
          moodNoon: record.moodNoon,
          moodEvening: record.moodEvening,
          weather: record.weather,
          temperature: record.temperature,
          memo: record.memo
        }))
      };

      // 실제 Gemini API 호출
      console.log('📡 API 호출 시작:', '/api/ai/habits/analyze');
      console.log('📦 전송 데이터:', { 
        habitCount: analysisData.habitDefinitions.length,
        logCount: analysisData.habitLogs.length,
        recordCount: analysisData.dailyRecords.length
      });
      
      const response = await fetch('/api/ai/habits/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });
      
      console.log('📥 API 응답 받음:', { 
        ok: response.ok, 
        status: response.status,
        statusText: response.statusText 
      });

      if (!response.ok) {
        let errorMessage = 'AI 분석 실패';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.error || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 기본 메시지 사용
          errorMessage = `AI 분석 실패 (상태 코드: ${response.status})`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ AI Analysis received:', data);
      console.log('📄 Analysis content:', data.analysis);
      console.log('🔤 Analysis type:', typeof data.analysis);
      console.log('📏 Analysis length:', data.analysis?.length);
      
      if (!data.analysis || data.analysis.trim() === '') {
        console.error('❌ AI analysis is empty!');
        alert('AI 분석 결과가 비어있습니다. 다시 시도해주세요.');
        return;
      }
      
      console.log('💾 Setting aiAnalysis state...');
      setAiAnalysis(data.analysis);
      setSavedDiagnosis(null);
      
      // 진단서 정보 저장
      const sortedLogs = [...habitLogs].sort((a, b) => b.date.localeCompare(a.date));
      const lastLogDate = sortedLogs.length > 0 ? sortedLogs[0]!.date : getLocalDateString();
      
      const newDiagnosis: Omit<HabitDiagnosis, 'id' | 'createdAt' | 'updatedAt'> = {
        habitId: null, // 전체 습관 진단
        analysis: data.analysis,
        lastLogDate,
        logCountAtDiagnosis: habitLogs.length
      };
      const diagnosisId = await dashboardRepository.saveDiagnosis(newDiagnosis);
      const saved = await dashboardRepository.getLatestDiagnosis(null);
      setLatestDiagnosis(saved);
      console.log('✅ Diagnosis saved:', diagnosisId);
      
      // 약간의 지연을 두고 모달 열기 (상태 업데이트 보장)
      setTimeout(() => {
        console.log('🔓 Setting showAIModal to true...');
        setShowAIModal(true);
        console.log('✅ Modal should be open now');
      }, 100);
    } catch (error: any) {
      console.error('❌ Error in AI analysis:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`AI 분석 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      console.log('🏁 AI 분석 프로세스 종료');
      setAnalyzing(false);
    }
  }

  function generateAIAnalysis(data: any): string {
    // This is a placeholder - replace with actual AI API call
    let analysis = '## 습관 성취 진단 결과\n\n';
    
    // Basic statistics
    const totalHabits = data.habitDefinitions.length;
    const totalLogs = data.habitLogs.length;
    const totalDays = 30;
    const possibleLogs = totalHabits * totalDays;
    const achievementRate = possibleLogs > 0 ? Math.round((totalLogs / possibleLogs) * 100) : 0;
    
    analysis += `### 전체 통계\n`;
    analysis += `- 총 습관 수: ${totalHabits}개\n`;
    analysis += `- 전체 달성률: ${achievementRate}%\n`;
    analysis += `- 총 기록 수: ${totalLogs}개\n\n`;
    
    // Correlation analysis
    const habitLogsByDate = new Map<string, HabitLog[]>();
    data.habitLogs.forEach((log: HabitLog) => {
      if (!habitLogsByDate.has(log.date)) {
        habitLogsByDate.set(log.date, []);
      }
      habitLogsByDate.get(log.date)!.push(log);
    });
    
    const correlationData: Array<{
      date: string;
      habitAchieved: boolean;
      sleepDuration?: number;
      avgMood?: number;
    }> = [];
    
    data.dailyRecords.forEach((record: DailyRecord) => {
      const logsOnDate = habitLogsByDate.get(record.date) || [];
      const habitAchieved = logsOnDate.length > 0;
      
      let sleepDuration: number | undefined;
      if (record.sleepStart && record.sleepEnd) {
        const [startH, startM] = record.sleepStart.split(':').map(Number);
        const [endH, endM] = record.sleepEnd.split(':').map(Number);
        let startTotal = startH * 60 + startM;
        let endTotal = endH * 60 + endM;
        if (endTotal < startTotal) endTotal += 24 * 60;
        sleepDuration = (endTotal - startTotal) / 60;
      }
      
      const moods = [record.moodMorning, record.moodNoon, record.moodEvening].filter(m => m !== undefined) as number[];
      const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : undefined;
      
      correlationData.push({ date: record.date, habitAchieved, sleepDuration, avgMood });
    });
    
    // Sleep correlation
    const sleepRanges = [
      { range: '< 6시간', achieved: 0, total: 0 },
      { range: '6-8시간', achieved: 0, total: 0 },
      { range: '8-10시간', achieved: 0, total: 0 },
      { range: '> 10시간', achieved: 0, total: 0 }
    ];
    
    correlationData.forEach(data => {
      if (data.sleepDuration !== undefined) {
        let range;
        if (data.sleepDuration < 6) range = sleepRanges[0];
        else if (data.sleepDuration < 8) range = sleepRanges[1];
        else if (data.sleepDuration < 10) range = sleepRanges[2];
        else range = sleepRanges[3];
        range.total++;
        if (data.habitAchieved) range.achieved++;
      }
    });
    
    analysis += `### 수면 시간별 달성률\n`;
    sleepRanges.filter(r => r.total > 0).forEach(range => {
      const rate = range.total > 0 ? Math.round((range.achieved / range.total) * 100) : 0;
      analysis += `- ${range.range}: ${rate}% (${range.achieved}/${range.total})\n`;
    });
    analysis += '\n';
    
    // Mood correlation
    const moodRanges = [
      { range: '1-2 (나쁨)', achieved: 0, total: 0 },
      { range: '3 (보통)', achieved: 0, total: 0 },
      { range: '4-5 (좋음)', achieved: 0, total: 0 }
    ];
    
    correlationData.forEach(data => {
      if (data.avgMood !== undefined) {
        let range;
        if (data.avgMood <= 2) range = moodRanges[0];
        else if (data.avgMood <= 3) range = moodRanges[1];
        else range = moodRanges[2];
        range.total++;
        if (data.habitAchieved) range.achieved++;
      }
    });
    
    analysis += `### 기분별 달성률\n`;
    moodRanges.filter(r => r.total > 0).forEach(range => {
      const rate = range.total > 0 ? Math.round((range.achieved / range.total) * 100) : 0;
      analysis += `- ${range.range}: ${rate}% (${range.achieved}/${range.total})\n`;
    });
    analysis += '\n';
    
    // Insights
    analysis += `### 인사이트\n`;
    const bestSleepRange = sleepRanges.reduce((best, current) => {
      const currentRate = current.total > 0 ? (current.achieved / current.total) : 0;
      const bestRate = best.total > 0 ? (best.achieved / best.total) : 0;
      return currentRate > bestRate ? current : best;
    }, sleepRanges[0]);
    
    if (bestSleepRange.total > 0) {
      const bestRate = Math.round((bestSleepRange.achieved / bestSleepRange.total) * 100);
      analysis += `- 수면 시간이 ${bestSleepRange.range}일 때 습관 달성률이 가장 높습니다 (${bestRate}%)\n`;
    }
    
    const bestMoodRange = moodRanges.reduce((best, current) => {
      const currentRate = current.total > 0 ? (current.achieved / current.total) : 0;
      const bestRate = best.total > 0 ? (best.achieved / best.total) : 0;
      return currentRate > bestRate ? current : best;
    }, moodRanges[0]);
    
    if (bestMoodRange.total > 0) {
      const bestRate = Math.round((bestMoodRange.achieved / bestMoodRange.total) * 100);
      analysis += `- 기분이 ${bestMoodRange.range}일 때 습관 달성률이 가장 높습니다 (${bestRate}%)\n`;
    }
    
    return analysis;
  }

  // Calculate statistics
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStartStr = getLocalDateString(weekStart);
  const weekLogs = habitLogs.filter(log => log.date >= weekStartStr);
  const totalDays = 7;
  const totalHabits = habitDefinitions.length;
  const totalPossible = totalDays * totalHabits;
  const achieved = weekLogs.length;
  const weekAchievementRate = totalPossible > 0 ? Math.round((achieved / totalPossible) * 100) : 0;

  // Correlation analysis
  const habitLogsByDate = new Map<string, HabitLog[]>();
  habitLogs.forEach(log => {
    if (!habitLogsByDate.has(log.date)) {
      habitLogsByDate.set(log.date, []);
    }
    habitLogsByDate.get(log.date)!.push(log);
  });

  const correlationData: Array<{
    date: string;
    habitAchieved: boolean;
    weather?: string;
    temperature?: number;
    sleepDuration?: number;
    avgMood?: number;
  }> = [];

  dailyRecords.forEach(record => {
    const logsOnDate = habitLogsByDate.get(record.date) || [];
    const habitAchieved = logsOnDate.length > 0;
    
    let sleepDuration: number | undefined;
    if (record.sleepStart && record.sleepEnd) {
      const [startH, startM] = record.sleepStart.split(':').map(Number);
      const [endH, endM] = record.sleepEnd.split(':').map(Number);
      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;
      if (endTotal < startTotal) endTotal += 24 * 60;
      sleepDuration = (endTotal - startTotal) / 60;
    }

    const moods = [record.moodMorning, record.moodNoon, record.moodEvening].filter(m => m !== undefined) as number[];
    const avgMood = moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : undefined;

    correlationData.push({
      date: record.date,
      habitAchieved,
      weather: record.weather,
      temperature: record.temperature,
      sleepDuration,
      avgMood
    });
  });

  // Calculate correlations
  const weatherStats = new Map<string, { total: number; achieved: number }>();
  const tempRanges: Array<{ range: string; total: number; achieved: number }> = [
    { range: '< 10°C', total: 0, achieved: 0 },
    { range: '10-20°C', total: 0, achieved: 0 },
    { range: '20-30°C', total: 0, achieved: 0 },
    { range: '> 30°C', total: 0, achieved: 0 }
  ];
  const sleepRanges: Array<{ range: string; total: number; achieved: number }> = [
    { range: '< 6시간', total: 0, achieved: 0 },
    { range: '6-8시간', total: 0, achieved: 0 },
    { range: '8-10시간', total: 0, achieved: 0 },
    { range: '> 10시간', total: 0, achieved: 0 }
  ];
  const moodRanges: Array<{ range: string; total: number; achieved: number }> = [
    { range: '1-2 (나쁨)', total: 0, achieved: 0 },
    { range: '3 (보통)', total: 0, achieved: 0 },
    { range: '4-5 (좋음)', total: 0, achieved: 0 }
  ];

  correlationData.forEach(data => {
    if (data.weather) {
      const stats = weatherStats.get(data.weather) || { total: 0, achieved: 0 };
      stats.total++;
      if (data.habitAchieved) stats.achieved++;
      weatherStats.set(data.weather, stats);
    }

    if (data.temperature !== undefined) {
      let range;
      if (data.temperature < 10) range = tempRanges[0];
      else if (data.temperature < 20) range = tempRanges[1];
      else if (data.temperature < 30) range = tempRanges[2];
      else range = tempRanges[3];
      range.total++;
      if (data.habitAchieved) range.achieved++;
    }

    if (data.sleepDuration !== undefined) {
      let range;
      if (data.sleepDuration < 6) range = sleepRanges[0];
      else if (data.sleepDuration < 8) range = sleepRanges[1];
      else if (data.sleepDuration < 10) range = sleepRanges[2];
      else range = sleepRanges[3];
      range.total++;
      if (data.habitAchieved) range.achieved++;
    }

    if (data.avgMood !== undefined) {
      let range;
      if (data.avgMood <= 2) range = moodRanges[0];
      else if (data.avgMood <= 3) range = moodRanges[1];
      else range = moodRanges[2];
      range.total++;
      if (data.habitAchieved) range.achieved++;
    }
  });

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <header className="mb-6 md:mb-8">
        <Link
          href="/admin/dashboard"
          className="mb-4 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          ← Dashboard로 돌아가기
        </Link>
        <h1 className="text-section-title">전체 습관 통계</h1>
        <p className="mt-2 max-w-2xl text-body text-slate-300">
          전체 습관의 달성률과 Daily Record와의 상관관계를 분석합니다.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">로딩 중...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Analysis Section */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-100">AI 습관 성취 진단</h2>
              <button
                type="button"
                onClick={handleAIAnalysis}
                disabled={analyzing}
                className="rounded-full bg-warmBeige px-4 py-2 text-xs font-medium text-slate-900 transition hover:bg-warmBeige/90 disabled:opacity-50"
              >
                {analyzing ? '분석 중...' : 'AI 진단 시작'}
              </button>
            </div>
          </section>

          {/* Basic Stats */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-100">기본 통계</h2>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">총 습관 수</span>
                <span>{habitDefinitions.length}개</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">이번 주 달성률</span>
                <span>{weekAchievementRate}% ({achieved}/{totalPossible})</span>
              </div>
            </div>
          </section>

          {/* Sleep Correlation */}
          {sleepRanges.some(r => r.total > 0) && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-100">수면 시간별 달성률</h2>
              <div className="space-y-2">
                {sleepRanges.filter(r => r.total > 0).map((range) => {
                  const rate = range.total > 0 ? Math.round((range.achieved / range.total) * 100) : 0;
                  return (
                    <div key={range.range} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{range.range}</span>
                        <span className="text-slate-300">{rate}% ({range.achieved}/{range.total})</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warmBeige transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Mood Correlation */}
          {moodRanges.some(r => r.total > 0) && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-100">기분별 달성률</h2>
              <div className="space-y-2">
                {moodRanges.filter(r => r.total > 0).map((range) => {
                  const rate = range.total > 0 ? Math.round((range.achieved / range.total) * 100) : 0;
                  return (
                    <div key={range.range} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{range.range}</span>
                        <span className="text-slate-300">{rate}% ({range.achieved}/{range.total})</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warmBeige transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Weather Correlation */}
          {weatherStats.size > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-100">날씨별 달성률</h2>
              <div className="space-y-2">
                {Array.from(weatherStats.entries()).map(([weather, stats]) => {
                  const rate = stats.total > 0 ? Math.round((stats.achieved / stats.total) * 100) : 0;
                  return (
                    <div key={weather} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{weather}</span>
                        <span className="text-slate-300">{rate}% ({stats.achieved}/{stats.total})</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warmBeige transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Temperature Correlation */}
          {tempRanges.some(r => r.total > 0) && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-100">온도별 달성률</h2>
              <div className="space-y-2">
                {tempRanges.filter(r => r.total > 0).map((range) => {
                  const rate = range.total > 0 ? Math.round((range.achieved / range.total) * 100) : 0;
                  return (
                    <div key={range.range} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{range.range}</span>
                        <span className="text-slate-300">{rate}% ({range.achieved}/{range.total})</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warmBeige transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* AI Analysis Modal */}
      {aiAnalysis && (
        <AIAnalysisModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          analysis={aiAnalysis}
          title="전체 습관 AI 진단"
          stats={calculateHabitStats(habitLogs, dailyRecords, habitDefinitions.length)}
        />
      )}
    </main>
  );
}

