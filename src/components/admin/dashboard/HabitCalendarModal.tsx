'use client';

import { useState, useEffect } from 'react';
import { dashboardRepository, type HabitLog } from '@/lib/repositories/dashboardRepository';
import { getLocalDateString } from '@/lib/utils/dateUtils';

interface HabitCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitId: string;
  habitName: string;
  unit?: string;
}

export function HabitCalendarModal({ isOpen, onClose, habitId, habitName, unit }: HabitCalendarModalProps) {
  const [viewDate, setViewDate] = useState(new Date()); // Tracks the month being viewed
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && habitId) {
      loadMonthLogs();
    }
  }, [isOpen, viewDate, habitId]);

  async function loadMonthLogs() {
    setLoading(true);
    try {
      // Calculate start and end of the month
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of current month

      const logsData = await dashboardRepository.getHabitLogs(
        habitId,
        getLocalDateString(startDate),
        getLocalDateString(endDate)
      );
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading calendar logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePrevMonth() {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewDate(newDate);
  }

  function handleNextMonth() {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewDate(newDate);
  }

  function renderCalendarDays() {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];
    
    // Empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 border border-slate-800/50 bg-slate-900/20" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = getLocalDateString(currentDate);
      const log = logs.find(l => l.date === dateStr);
      const isToday = dateStr === getLocalDateString(new Date());

      days.push(
        <div 
          key={day} 
          className={`h-20 border border-slate-800/50 p-1 flex flex-col items-center relative transition-colors
            ${isToday ? 'bg-blue-900/10 border-blue-500/30' : 'bg-slate-900/40 hover:bg-slate-800/60'}
          `}
        >
          <span className={`text-xs mb-1 ${isToday ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
            {day}
          </span>
          
          {log && (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mb-1
                ${log.completed !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
              `}>
                {log.completed !== false ? '✓' : '✕'}
              </div>
              {log.value && (
                <span className="text-[10px] text-slate-300 truncate max-w-full px-1">
                  {log.value}{unit}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📅 {habitName} <span className="text-sm font-normal text-slate-400">달성 현황</span>
          </h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900/50 border-b border-slate-800">
          <button 
            onClick={handlePrevMonth}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            ◀ 이전 달
          </button>
          <span className="font-semibold text-slate-200">
            {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            다음 달 ▶
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 bg-slate-950/50">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div key={day} className={`text-xs font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>
                {day}
              </div>
            ))}
          </div>
          
          {/* Days */}
          <div className="grid grid-cols-7 gap-px border border-slate-800/50 bg-slate-800/50 rounded overflow-hidden">
            {renderCalendarDays()}
          </div>
        </div>

        {/* Footer / Summary */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-between text-xs text-slate-400">
          <div className="flex gap-4">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500/50"></div> 달성</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500/50"></div> 미달성</span>
          </div>
          <div>
            {loading ? '불러오는 중...' : `${viewDate.getMonth() + 1}월 달성: ${logs.filter(l => l.completed !== false).length}회`}
          </div>
        </div>
      </div>
    </div>
  );
}

