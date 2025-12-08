'use client';

import { useState, useEffect } from 'react';

export function DashboardCalendar() {
  const [calendarUrl, setCalendarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('calendar_url') || '';
    setCalendarUrl(savedUrl);
  }, []);

  function handleSave() {
    // Convert calendar URL to embed format if needed
    let embedUrl = calendarUrl.trim();
    
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

    setCalendarUrl(embedUrl);
    localStorage.setItem('calendar_url', embedUrl);
    setIsEditing(false);
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
          className="text-xs text-slate-400 hover:text-slate-200"
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
            className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            저장
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

