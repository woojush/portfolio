'use client';

import { useState, useEffect } from 'react';
import { DashboardDailyRecord } from '@/components/admin/dashboard/DashboardDailyRecord';
import { DashboardHabits } from '@/components/admin/dashboard/DashboardHabits';
import { DashboardTodos } from '@/components/admin/dashboard/DashboardTodos';
import { DashboardGoals } from '@/components/admin/dashboard/DashboardGoals';
import { DashboardCalendar } from '@/components/admin/dashboard/DashboardCalendar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getLocalDateString } from '@/lib/utils/dateUtils';

export default function AdminDashboardPage() {
  const [today, setToday] = useState('');

  useEffect(() => {
    // Set today in client only to avoid hydration mismatch
    setToday(getLocalDateString());
  }, []);

  if (!today) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <AdminHeader />

        {/* 1. Goals Section (Full Width) */}
        <section>
            <DashboardGoals today={today} />
        </section>

        {/* 2. Main Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Daily Record & Todos (lg:col-span-5) */}
            <div className="space-y-6 lg:col-span-5">
                 {/* Daily Record (includes Memo, Mood, Sleep) */}
                 <div className="h-[400px]">
                    <DashboardDailyRecord today={today} />
                 </div>
                 
                 {/* Todo List */}
                 <div className="h-[500px]">
                    <DashboardTodos />
                 </div>
            </div>

            {/* Right Column: Habits & Calendar (lg:col-span-7) */}
            <div className="space-y-6 lg:col-span-7">
                {/* Habits Tracker */}
                <div className="h-[400px]">
                    <DashboardHabits today={today} />
                </div>
                
                {/* Calendar */}
                <div className="h-[500px]">
                    <DashboardCalendar />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
