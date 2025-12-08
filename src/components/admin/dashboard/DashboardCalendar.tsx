'use client';

import { useState, useEffect } from 'react';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';

export function DashboardCalendar() {
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCalendarUrl() {
      try {
        setLoading(true);
        const settings = await dashboardRepository.getDashboardSettings();
        console.log('📅 Loaded dashboard settings:', settings);
        
        // calendarUrl이 존재하고 빈 문자열이 아닌 경우
        if (settings?.calendarUrl && settings.calendarUrl.trim() !== '') {
          setCalendarUrl(settings.calendarUrl);
          console.log('📅 Calendar URL loaded from Firestore:', settings.calendarUrl);
        } else {
          // Fallback to localStorage for backward compatibility
          const savedUrl = localStorage.getItem('calendar_url') || '';
          if (savedUrl && savedUrl.trim() !== '') {
            console.log('📅 Calendar URL loaded from localStorage:', savedUrl);
            setCalendarUrl(savedUrl);
            // Migrate to Firestore
            try {
              await dashboardRepository.saveDashboardSettings({ calendarUrl: savedUrl });
              localStorage.removeItem('calendar_url');
              console.log('📅 Migrated calendar URL to Firestore');
            } catch (migrateError) {
              console.error('Error migrating calendar URL:', migrateError);
            }
          } else {
            console.log('📅 No calendar URL found');
          }
        }
      } catch (error) {
        console.error('Error loading calendar URL:', error);
        // Fallback to localStorage
        const savedUrl = localStorage.getItem('calendar_url') || '';
        if (savedUrl && savedUrl.trim() !== '') {
          setCalendarUrl(savedUrl);
          console.log('📅 Calendar URL loaded from localStorage (fallback):', savedUrl);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCalendarUrl();
  }, []);

  async function handleSave() {
    if (saving) return;
    
    setSaving(true);
    try {
      // Convert calendar URL to embed format if needed
      let embedUrl = calendarUrl.trim();
      
      // 빈 문자열이면 저장하지 않음
      if (embedUrl === '') {
        alert('캘린더 URL을 입력해주세요.');
        setSaving(false);
        return;
      }
      
      // If it's a regular calendar URL, try to convert to embed format
      if (embedUrl.includes('calendar.google.com') && !embedUrl.includes('/embed')) {
        // Extract calendar ID from various URL formats
        const cidMatch = embedUrl.match(/[?&]cid=([^&]+)/);
        const srcMatch = embedUrl.match(/[?&]src=([^&]+)/);
        
        let calendarId = '';
        if (cidMatch) calendarId = decodeURIComponent(cidMatch[1]);
        else if (srcMatch) calendarId = decodeURIComponent(srcMatch[1]);
        
        if (calendarId) {
          embedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}&ctz=Asia%2FSeoul`;
        }
      }

      console.log('📅 Saving calendar URL:', embedUrl);
      
      // Save to Firestore
      await dashboardRepository.saveDashboardSettings({ calendarUrl: embedUrl });
      console.log('📅 Calendar URL saved to Firestore');
      
      // Also save to localStorage as backup
      localStorage.setItem('calendar_url', embedUrl);
      console.log('📅 Calendar URL saved to localStorage');
      
      setCalendarUrl(embedUrl);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving calendar URL:', error);
      alert('캘린더 URL 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card-surface p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            📅 캘린더
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          📅 캘린더
          {calendarUrl && !isEditing && (
            <span className="text-xs font-normal text-slate-500">Google Calendar</span>
          )}
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={saving}
          className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50"
        >
          {isEditing ? '취소' : (calendarUrl ? 'URL 편집' : 'URL 설정')}
        </button>
      </div>

      {isEditing ? (
        <div className="flex-1 flex flex-col justify-center items-center space-y-4">
          <div className="w-full max-w-md space-y-2">
            <label className="text-sm text-slate-400">Google Calendar URL 또는 Embed URL</label>
            <input
              type="text"
              value={calendarUrl}
              onChange={(e) => setCalendarUrl(e.target.value)}
              placeholder="https://calendar.google.com/..."
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none"
            />
            <p className="text-xs text-slate-500">
              * 구글 캘린더 설정 &gt; '이 캘린더의 공개 URL' 또는 '통합' 섹션의 코드를 입력하세요.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      ) : calendarUrl ? (
        <div className="flex-1 -mx-2 -mb-2">
          <iframe
            src={calendarUrl}
            style={{ border: 0 }}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            className="rounded-lg opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-lg">
          <button 
            onClick={() => setIsEditing(true)}
            className="hover:text-slate-300 transition-colors"
          >
            + 캘린더 URL 설정하기
          </button>
        </div>
      )}
    </div>
  );
}

