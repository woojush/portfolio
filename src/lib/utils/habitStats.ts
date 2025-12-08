import { HabitLog, DailyRecord } from '@/lib/repositories/dashboardRepository';

export interface HabitStats {
  achievementRate: number;
  totalLogs: number;
  totalHabits: number;
  sleepStats: Record<string, { achieved: number; total: number }>;
  moodStats: Record<string, { achieved: number; total: number }>;
}

export function calculateHabitStats(
  logs: HabitLog[], 
  records: DailyRecord[], 
  totalHabitsCount: number,
  targetHabitId?: string
): HabitStats {
  // Filter logs if targetHabitId provided
  const relevantLogs = targetHabitId 
    ? logs.filter(l => l.habitId === targetHabitId)
    : logs;

  // Only count completed logs as "achieved"
  const completedLogs = relevantLogs.filter(l => l.completed !== false); // Default to true if undefined
  const totalLogs = completedLogs.length;
  
  // records assumed to cover the analysis period (e.g. 30 days)
  // If records is empty, fallback to 30 days default calculation?
  const daysCount = records.length || 30;

  const denominator = targetHabitId ? daysCount : (daysCount * totalHabitsCount);
  const achievementRate = denominator > 0 
    ? Math.round((totalLogs / denominator) * 100) 
    : 0;

  const logsByDate = new Map<string, HabitLog[]>();
  relevantLogs.forEach(log => {
    if (!logsByDate.has(log.date)) logsByDate.set(log.date, []);
    logsByDate.get(log.date)!.push(log);
  });

  const sleepStats: Record<string, { achieved: number; total: number }> = {
    '< 6시간': { achieved: 0, total: 0 },
    '6-8시간': { achieved: 0, total: 0 },
    '8-10시간': { achieved: 0, total: 0 },
    '> 10시간': { achieved: 0, total: 0 }
  };

  const moodStats: Record<string, { achieved: number; total: number }> = {
    '1-2 (나쁨)': { achieved: 0, total: 0 },
    '3 (보통)': { achieved: 0, total: 0 },
    '4-5 (좋음)': { achieved: 0, total: 0 }
  };

  records.forEach(record => {
    const logsOnDate = logsByDate.get(record.date) || [];
    // Check if ANY log on this date is completed
    const achieved = logsOnDate.some(l => l.completed !== false);

    // Sleep
    let sleepDuration: number | undefined;
    if (record.sleepStart && record.sleepEnd) {
      const [startH, startM] = record.sleepStart.split(':').map(Number);
      const [endH, endM] = record.sleepEnd.split(':').map(Number);
      let startTotal = startH * 60 + startM;
      let endTotal = endH * 60 + endM;
      if (endTotal < startTotal) endTotal += 24 * 60;
      sleepDuration = (endTotal - startTotal) / 60;
    }

    if (sleepDuration !== undefined) {
      let range: string;
      if (sleepDuration < 6) range = '< 6시간';
      else if (sleepDuration < 8) range = '6-8시간';
      else if (sleepDuration < 10) range = '8-10시간';
      else range = '> 10시간';
      
      sleepStats[range].total++;
      if (achieved) sleepStats[range].achieved++;
    }

    // Mood
    const moods = [record.moodMorning, record.moodNoon, record.moodEvening]
      .filter(m => m !== undefined) as number[];
    const avgMood = moods.length > 0 
      ? moods.reduce((a, b) => a + b, 0) / moods.length 
      : undefined;

    if (avgMood !== undefined) {
      let range: string;
      if (avgMood <= 2) range = '1-2 (나쁨)';
      else if (avgMood <= 3) range = '3 (보통)';
      else range = '4-5 (좋음)';
      
      moodStats[range].total++;
      if (achieved) moodStats[range].achieved++;
    }
  });

  return {
    achievementRate,
    totalLogs,
    totalHabits: targetHabitId ? 1 : totalHabitsCount,
    sleepStats,
    moodStats
  };
}
