// Dashboard repository: Firestore operations for private dashboard data

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Goal, HabitDiagnosis, HomePageSettings } from '@/lib/firestore/types';

export interface TodayMemo {
  id: string;
  date: string; // "YYYY-MM-DD"
  content: string;
  updatedAt: string;
}

export interface HabitDefinition {
  id: string;
  name: string; // "운동", "독서", "코딩" 등
  unit?: string; // "분", "km", "페이지" 등 (선택사항)
  color?: string; // 달력 표시용 색상 (선택사항)
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string; // HabitDefinition의 id 참조
  date: string; // "YYYY-MM-DD"
  value?: number; // minutes, km, etc. (선택사항)
  notes?: string;
  completed?: boolean; // 달성 여부 (true: 달성, false: 미달성/실패)
  attributes?: Record<string, string>; // 사용자 정의 속성 (예: { "날씨": "맑음", "컨디션": "좋음" })
  createdAt: string;
}

export interface TodoItem {
  id: string;
  type?: 'todo' | 'folder'; // New: type of item
  title: string;
  priority?: 'high' | 'medium' | 'low'; // Optional for folders
  completed: boolean;
  subTasks?: { 
    id: string; 
    title: string; 
    completed: boolean;
    priority?: 'high' | 'medium' | 'low'; // Optional for subtasks
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  sleepStart?: string; // "HH:mm" format
  sleepEnd?: string; // "HH:mm" format
  moodMorning?: number; // 1-5 scale
  moodNoon?: number; // 1-5 scale
  moodEvening?: number; // 1-5 scale
  memo?: string; // 메모 내용 (일기에서 변경)
  weather?: string; // 날씨
  temperature?: number; // 온도
  createdAt: string;
  updatedAt: string;
}



export const dashboardRepository = {
  // Today Memo
  async getTodayMemo(date: string): Promise<TodayMemo | null> {
    try {
      // 인덱스 오류 방지를 위해 클라이언트 사이드 필터링 사용
      const q = query(collection(db, 'dashboard_memos'));
      const snapshot = await getDocs(q);
      const memos = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data()
        } as TodayMemo))
        .filter((memo) => memo.date === date)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      
      if (memos.length === 0) return null;
      return memos[0]!;
    } catch (error) {
      console.error('Error fetching today memo:', error);
      return null;
    }
  },

  async saveTodayMemo(date: string, content: string): Promise<string> {
    try {
      const existing = await this.getTodayMemo(date);
      if (existing) {
        const docRef = doc(db, 'dashboard_memos', existing.id);
        await updateDoc(docRef, {
          content,
          updatedAt: new Date().toISOString()
        });
        return existing.id;
      } else {
        const docRef = await addDoc(collection(db, 'dashboard_memos'), {
          date,
          content,
          updatedAt: new Date().toISOString()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving today memo:', error);
      throw error;
    }
  },

  // Habit Definitions
  async getHabitDefinitions(): Promise<HabitDefinition[]> {
    try {
      // 인덱스 의존성을 피하기 위해 클라이언트 사이드 정렬로 변경
      const q = query(collection(db, 'dashboard_habit_definitions'));
      const snapshot = await getDocs(q);
      const definitions = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      } as HabitDefinition));
      
      // 클라이언트 사이드 정렬 (최신순)
      definitions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      
      return definitions;
    } catch (error) {
      console.error('Error fetching habit definitions:', error);
      throw error;
    }
  },

  async addHabitDefinition(habit: Omit<HabitDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const payload: Record<string, any> = {
        name: habit.name,
        createdAt: now,
        updatedAt: now
      };
      
      if (habit.unit) payload.unit = habit.unit;
      if (habit.color) payload.color = habit.color;

      const docRef = await addDoc(collection(db, 'dashboard_habit_definitions'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error adding habit definition:', error);
      throw error;
    }
  },

  async updateHabitDefinition(id: string, updates: Partial<HabitDefinition>): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_habit_definitions', id);
      
      const payload: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof HabitDefinition];
        if (value !== undefined) {
          payload[key] = value;
        }
      });

      await updateDoc(docRef, payload);
    } catch (error) {
      console.error('Error updating habit definition:', error);
      throw error;
    }
  },

  async deleteHabitDefinition(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_habit_definitions', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting habit definition:', error);
      throw error;
    }
  },

  // Habit Logs
  async getHabitLogs(habitId?: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    try {
      // Fetch all logs and filter client-side to avoid index requirements
      const q = query(collection(db, 'dashboard_habit_logs'));
      const snapshot = await getDocs(q);
      let logs = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      } as HabitLog));

      // Client-side filtering
      if (habitId) {
        logs = logs.filter(log => log.habitId === habitId);
      }
      if (startDate) {
        logs = logs.filter(log => log.date >= startDate);
      }
      if (endDate) {
        logs = logs.filter(log => log.date <= endDate);
      }

      // Client-side sorting (newest first)
      logs.sort((a, b) => b.date.localeCompare(a.date));

      return logs;
    } catch (error) {
      console.error('Error fetching habit logs:', error);
      throw error;
    }
  },

  async addHabitLog(log: Omit<HabitLog, 'id' | 'createdAt'>): Promise<string> {
    try {
      const payload: Record<string, any> = {
        habitId: log.habitId,
        date: log.date,
        createdAt: new Date().toISOString()
      };
      if (log.value !== undefined && log.value !== null) {
        payload.value = log.value;
      }
      if (log.notes !== undefined && log.notes !== null && log.notes !== '') {
        payload.notes = log.notes;
      }
      if (log.completed !== undefined) {
        payload.completed = log.completed;
      } else {
        payload.completed = true; // Default to true for backward compatibility
      }
      const docRef = await addDoc(collection(db, 'dashboard_habit_logs'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error adding habit log:', error);
      throw error;
    }
  },

  async deleteHabitLog(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_habit_logs', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting habit log:', error);
      throw error;
    }
  },

  // TODO Items
  async getTodos(completed?: boolean): Promise<TodoItem[]> {
    try {
      // orderBy가 없는 데이터가 섞여 있을 수 있으므로 전체 조회 후 클라이언트 정렬
      let q = query(collection(db, 'dashboard_todos'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data()
        } as TodoItem))
        .filter((item) => (completed === undefined ? true : item.completed === completed))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      return items;
    } catch (error) {
      console.error('Error fetching todos:', error);
      throw error;
    }
  },

  async addTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const payload: Record<string, any> = {
        ...todo,
        createdAt: now,
        updatedAt: now
      };
      
      // Clean up undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      const docRef = await addDoc(collection(db, 'dashboard_todos'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error adding todo:', error);
      throw error;
    }
  },

  async updateTodo(id: string, updates: Partial<TodoItem>): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_todos', id);
      
      const payload: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof TodoItem];
        if (value !== undefined) {
          payload[key] = value;
        }
      });

      await updateDoc(docRef, payload);
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  },

  async deleteTodo(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_todos', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  },

  // Daily Records (Sleep, Mood, Diary)
  async getDailyRecord(date: string): Promise<DailyRecord | null> {
    try {
      const q = query(
        collection(db, 'dashboard_daily_records'),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const data = snapshot.docs[0]!.data();
      return {
        id: snapshot.docs[0]!.id,
        ...data
      } as DailyRecord;
    } catch (error) {
      console.error('Error fetching daily record:', error);
      return null;
    }
  },

  async getDailyRecords(startDate: string, endDate: string): Promise<DailyRecord[]> {
    try {
      // 인덱스 오류 방지를 위해 클라이언트 사이드 필터링 사용
      const q = query(collection(db, 'dashboard_daily_records'));
      const snapshot = await getDocs(q);
      
      const records = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data()
        } as DailyRecord))
        .filter(record => record.date >= startDate && record.date <= endDate)
        .sort((a, b) => b.date.localeCompare(a.date));
      
      return records;
    } catch (error) {
      console.error('Error fetching daily records:', error);
      throw error;
    }
  },

  async saveDailyRecord(record: Omit<DailyRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const existing = await this.getDailyRecord(record.date);
      const now = new Date().toISOString();
      
      if (existing) {
        const docRef = doc(db, 'dashboard_daily_records', existing.id);
        await updateDoc(docRef, {
          ...record,
          updatedAt: now
        });
        return existing.id;
      } else {
        const docRef = await addDoc(collection(db, 'dashboard_daily_records'), {
          ...record,
          createdAt: now,
          updatedAt: now
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving daily record:', error);
      throw error;
    }
  },

  // Goals
  async getGoals(type?: 'weekly' | 'monthly', period?: string): Promise<Goal[]> {
    try {
      // 인덱스 오류 방지를 위해 클라이언트 사이드 필터링 사용
      const q = query(collection(db, 'dashboard_goals'));
      const snapshot = await getDocs(q);
      let goals = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      } as Goal));
      
      // 클라이언트 사이드 필터링
      if (type) {
        goals = goals.filter((g) => g.type === type);
      }
      if (period) {
        goals = goals.filter((g) => g.period === period);
      }
      
      // 정렬
      goals.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      
      return goals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  async addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const payload: Record<string, any> = {
        type: goal.type,
        period: goal.period,
        title: goal.title,
        completed: goal.completed,
        createdAt: now,
        updatedAt: now
      };
      
      if (goal.reflection) payload.reflection = goal.reflection;

      const docRef = await addDoc(collection(db, 'dashboard_goals'), payload);
      return docRef.id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_goals', id);
      
      const payload: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };
      
      Object.keys(updates).forEach(key => {
        const value = updates[key as keyof Goal];
        if (value !== undefined) {
          payload[key] = value;
        }
      });

      await updateDoc(docRef, payload);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  async deleteGoal(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'dashboard_goals', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Habit Diagnosis
  async saveDiagnosis(diagnosis: Omit<HabitDiagnosis, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, 'dashboard_habit_diagnoses'), {
        ...diagnosis,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      throw error;
    }
  },

  async getLatestDiagnosis(habitId: string | null): Promise<HabitDiagnosis | null> {
    try {
      // 인덱스 오류 방지를 위해 클라이언트 사이드 필터링 사용
      const q = query(
        collection(db, 'dashboard_habit_diagnoses'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const diagnoses = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...d.data()
        } as HabitDiagnosis))
        .filter(d => d.habitId === habitId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      
      return diagnoses.length > 0 ? diagnoses[0]! : null;
    } catch (error) {
      console.error('Error fetching latest diagnosis:', error);
      return null;
    }
  },

  // Home Page Settings
  async getHomePageSettings(): Promise<HomePageSettings | null> {
    try {
      // 홈 페이지 설정은 단일 문서로 저장 (id: 'home')
      const docRef = doc(db, 'homepage_settings', 'home');
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as HomePageSettings;
    } catch (error) {
      console.error('Error fetching home page settings:', error);
      return null;
    }
  },

  async saveHomePageSettings(settings: Omit<HomePageSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = doc(db, 'homepage_settings', 'home');
      const docSnap = await getDoc(docRef);
      const now = new Date().toISOString();
      
      // introParagraphs가 빈 배열이면 기본값 설정
      const introParagraphs = settings.introParagraphs.length > 0 
        ? settings.introParagraphs 
        : ['자신만의 속도로 깊게 학습하는 것을 좋아합니다. 이곳은 그런 걸음들을 조용히 모아 두는 개인 아카이브입니다.'];
      
      // Firestore는 undefined 값을 허용하지 않으므로 null로 치환하거나 필드 제거
      const dataToSave: Record<string, any> = {
        heroImageUrl: settings.heroImageUrl ?? null,
        heroImagePosition: settings.heroImagePosition ?? 'center',
        heroImageFit: settings.heroImageFit ?? 'cover',
        heroImagePosX: settings.heroImagePosX ?? 50,
        heroImagePosY: settings.heroImagePosY ?? 50,
        heroOverlayOpacity: settings.heroOverlayOpacity ?? 0.7,
        heroTextColor: settings.heroTextColor ?? '#F8FAFC',
        heroTextAlign: settings.heroTextAlign ?? 'left',
        heroNameSize: settings.heroNameSize ?? 64,
        heroSloganSize: settings.heroSloganSize ?? 24,
        heroIntroSize: settings.heroIntroSize ?? 18,
        navBgColor: settings.navBgColor ?? 'rgba(15,23,42,0.8)', // slate-950/80
        navTextColor: settings.navTextColor ?? '#F8FAFC', // slate-50
        navHoverBgColor: settings.navHoverBgColor ?? 'rgba(255,255,255,0.08)',
        navHoverTextColor: settings.navHoverTextColor ?? '#FFFFFF',
        navActiveBgColor: settings.navActiveBgColor ?? 'rgba(255,255,255,0.10)',
        navActiveTextColor: settings.navActiveTextColor ?? '#FFFFFF',
        name: settings.name,
        slogan: settings.slogan,
        introParagraphs,
        additionalContent: settings.additionalContent ?? null,
        updatedAt: now
      };
      // undefined 필드 제거(혹시 모를 잔여값 방지)
      Object.keys(dataToSave).forEach((key) => {
        if (dataToSave[key] === undefined) {
          delete dataToSave[key];
        }
      });
      
      if (docSnap.exists()) {
        // 기존 문서 업데이트
        await updateDoc(docRef, dataToSave);
        return docSnap.id;
      } else {
        // 새 문서 생성 (setDoc 사용)
        await setDoc(docRef, {
          ...dataToSave,
          createdAt: now
        });
        return 'home';
      }
    } catch (error) {
      console.error('Error saving home page settings:', error);
      throw error;
    }
  },
};
