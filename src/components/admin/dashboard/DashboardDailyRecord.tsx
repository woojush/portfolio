'use client';

import { useState, useEffect } from 'react';
import { dashboardRepository, type DailyRecord } from '@/lib/repositories/dashboardRepository';
import { getLocalDateString } from '@/lib/utils/dateUtils';

interface DashboardDailyRecordProps {
  today: string;
}

export function DashboardDailyRecord({ today }: DashboardDailyRecordProps) {
  const [currentDate, setCurrentDate] = useState(today);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(true);
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [moodMorning, setMoodMorning] = useState('');
  const [moodNoon, setMoodNoon] = useState('');
  const [moodEvening, setMoodEvening] = useState('');
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentDate) {
      loadRecord();
    }
  }, [currentDate]);

  // Handle date navigation (limit to 3 days back)
  const handlePrevDay = () => {
    const curr = new Date(currentDate);
    const limit = new Date(today);
    limit.setDate(limit.getDate() - 3);
    
    curr.setDate(curr.getDate() - 1);
    
    if (curr >= limit) {
      setCurrentDate(getLocalDateString(curr));
    }
  };

  const handleNextDay = () => {
    const curr = new Date(currentDate);
    curr.setDate(curr.getDate() + 1);
    const todayDate = new Date(today);
    
    if (curr <= todayDate) {
      setCurrentDate(getLocalDateString(curr));
    }
  };

  async function loadRecord() {
    setLoading(true);
    try {
      const data = await dashboardRepository.getDailyRecord(currentDate);
      setRecord(data);
      if (data) {
        setSleepStart(data.sleepStart || '');
        setSleepEnd(data.sleepEnd || '');
        setMoodMorning(data.moodMorning?.toString() || '');
        setMoodNoon(data.moodNoon?.toString() || '');
        setMoodEvening(data.moodEvening?.toString() || '');
        setWeather(data.weather || '');
        setTemperature(data.temperature?.toString() || '');
        setMemo(data.memo || '');
        setIsEditing(false);
      } else {
        // Reset form
        setSleepStart('');
        setSleepEnd('');
        setMoodMorning('');
        setMoodNoon('');
        setMoodEvening('');
        setWeather('');
        setTemperature('');
        setMemo('');
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading daily record:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateSleepDuration(start: string, end: string): string {
    if (!start || !end) return '';
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let startTotal = startHour * 60 + startMin;
    let endTotal = endHour * 60 + endMin;
    if (endTotal < startTotal) endTotal += 24 * 60;
    const duration = endTotal - startTotal;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}시간 ${minutes}분`;
  }

  const normalizeMood = (value: string) => {
    if (!value || value === '-') return null;
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
  };

  async function handleSave() {
    if (!currentDate) return;
    try {
      setSaving(true);
      const payload: any = {
        date: currentDate,
        moodMorning: normalizeMood(moodMorning),
        moodNoon: normalizeMood(moodNoon),
        moodEvening: normalizeMood(moodEvening)
      };

      if (sleepStart) payload.sleepStart = sleepStart;
      if (sleepEnd) payload.sleepEnd = sleepEnd;
      if (weather.trim()) payload.weather = weather.trim(); else payload.weather = null;
      if (temperature) payload.temperature = parseFloat(temperature); else payload.temperature = null;
      if (memo.trim()) payload.memo = memo.trim(); else payload.memo = null;

      await dashboardRepository.saveDailyRecord(payload);
      await loadRecord(); // Reload to update UI state
    } catch (error) {
      console.error('Error saving daily record:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const moodOptions = [
    { value: '1', label: '😢', desc: '매우 나쁨' },
    { value: '2', label: '🙁', desc: '나쁨' },
    { value: '3', label: '😐', desc: '보통' },
    { value: '4', label: '🙂', desc: '좋음' },
    { value: '5', label: '😄', desc: '매우 좋음' }
  ];

  if (loading) return <div className="card-surface p-6 h-full animate-pulse bg-slate-800/50" />;

  return (
    <div className="card-surface p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-20">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            📝 하루 기록
            {record && !isEditing && (
                <span className="text-xs font-normal text-slate-500">작성됨</span>
            )}
            </h2>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-1 text-sm bg-slate-900 rounded px-2 py-1 border border-slate-800">
                <button 
                    onClick={handlePrevDay}
                    disabled={new Date(currentDate) <= new Date(new Date(today).setDate(new Date(today).getDate() - 3))}
                    className="text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed px-1"
                >
                    ←
                </button>
                <span className={`min-w-[85px] text-center font-mono ${currentDate === today ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
                    {currentDate}
                </span>
                <button 
                    onClick={handleNextDay}
                    disabled={currentDate >= today}
                    className="text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed px-1"
                >
                    →
                </button>
            </div>
        </div>

        <div className="flex gap-2">
           <button
             onClick={() => window.open('/admin/dashboard/habits/stats', '_self')}
             className="text-xs text-slate-400 hover:text-slate-200"
           >
             통계
           </button>
           {!isEditing && (
             <button
               onClick={() => setIsEditing(true)}
               className="text-xs text-blue-400 hover:text-blue-300"
             >
               편집
             </button>
           )}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
        {/* Sleep */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">수면 시간</label>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={sleepStart}
                onChange={(e) => setSleepStart(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
              />
              <span className="text-slate-500">~</span>
              <input
                type="time"
                value={sleepEnd}
                onChange={(e) => setSleepEnd(e.target.value)}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
              />
              {sleepStart && sleepEnd && (
                <span className="ml-2 text-xs text-blue-400">
                  {calculateSleepDuration(sleepStart, sleepEnd)}
                </span>
              )}
            </div>
          ) : (
            <div className="text-slate-200 text-sm">
              {record?.sleepStart} ~ {record?.sleepEnd}
              {record?.sleepStart && record?.sleepEnd && (
                <span className="ml-2 text-slate-500">
                  ({calculateSleepDuration(record.sleepStart, record.sleepEnd)})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-400">기분</label>
          <div className="grid grid-cols-3 gap-2">
            {['Morning', 'Noon', 'Evening'].map((time) => {
              const label = time === 'Morning' ? '아침' : time === 'Noon' ? '점심' : '저녁';
              const value = time === 'Morning' ? moodMorning : time === 'Noon' ? moodNoon : moodEvening;
              const setValue = time === 'Morning' ? setMoodMorning : time === 'Noon' ? setMoodNoon : setMoodEvening;

              return (
                <div key={time} className="space-y-1">
                  <span className="text-xs text-slate-500 block text-center">{label}</span>
                  {isEditing ? (
                    <select
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full rounded border border-slate-700 bg-slate-900 px-1 py-1 text-sm text-slate-200 focus:border-slate-500 focus:outline-none text-center"
                    >
                      <option value="">-</option>
                      <option value="-">-</option>
                      {moodOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-center text-lg">
                      {moodOptions.find(o => o.value === value)?.label || '-'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Weather & Temperature */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">날씨</label>
            {isEditing ? (
              <input
                type="text"
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                placeholder="예: 맑음, 비"
                className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
              />
            ) : (
              <div className="text-slate-200 text-sm">{record?.weather || '-'}</div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">온도</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="20"
                  className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-sm text-slate-500">°C</span>
              </div>
            ) : (
              <div className="text-slate-200 text-sm">
                {record?.temperature !== undefined && record?.temperature !== null ? `${record.temperature}°C` : '-'}
              </div>
            )}
          </div>
        </div>

        {/* Memo */}
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-sm font-medium text-slate-400">메모 / 일기</label>
          {isEditing ? (
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="오늘 하루는 어땠나요?"
              className="flex-1 min-h-[100px] w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-slate-500 focus:outline-none resize-none"
            />
          ) : (
            <div className="min-h-[100px] w-full rounded border border-slate-800 bg-slate-900/30 px-3 py-2 text-sm text-slate-300 whitespace-pre-wrap">
              {memo || '기록된 메모가 없습니다.'}
            </div>
          )}
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

