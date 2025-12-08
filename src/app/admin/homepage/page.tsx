'use client';

// Home Page Settings Management
// Allows admin to manage hero image, name, slogan, intro, and additional content

import { useState, useEffect } from 'react';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';
import type { HomePageSettings } from '@/lib/firestore/types';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function HomePageSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<HomePageSettings | null>(null);
  const [showBackgroundSettings, setShowBackgroundSettings] = useState(false);
  const [formData, setFormData] = useState({
    heroImageUrl: '',
    heroImagePosition: 'center', // legacy string
    heroImageFit: 'cover' as 'cover' | 'contain',
    heroImagePosX: 50,
    heroImagePosY: 50,
    heroOverlayOpacity: 0.7,
    heroTextColor: '#F8FAFC',
    heroTextAlign: 'left' as 'left' | 'center' | 'right',
    heroNameSize: 64,
    heroSloganSize: 24,
    heroIntroSize: 18,
    navBgColor: 'rgba(15,23,42,0.8)',
    navTextColor: '#F8FAFC',
    navHoverBgColor: 'rgba(255,255,255,0.08)',
    navHoverTextColor: '#FFFFFF',
    navActiveBgColor: 'rgba(255,255,255,0.10)',
    navActiveTextColor: '#FFFFFF',
    name: '',
    slogan: '',
    introParagraphs: ['', ''],
    additionalContent: ''
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await dashboardRepository.getHomePageSettings();
        if (data) {
          setSettings(data);
          setFormData({
            heroImageUrl: data.heroImageUrl || '',
            heroImagePosition: data.heroImagePosition || 'center',
            heroImageFit: data.heroImageFit || 'cover',
            heroImagePosX: data.heroImagePosX ?? 50,
            heroImagePosY: data.heroImagePosY ?? 50,
            heroOverlayOpacity: data.heroOverlayOpacity ?? 0.7,
            heroTextColor: data.heroTextColor || '#F8FAFC',
            heroTextAlign: data.heroTextAlign || 'left',
            heroNameSize: data.heroNameSize ?? 64,
            heroSloganSize: data.heroSloganSize ?? 24,
            heroIntroSize: data.heroIntroSize ?? 18,
            navBgColor: data.navBgColor || 'rgba(15,23,42,0.8)',
            navTextColor: data.navTextColor || '#F8FAFC',
            navHoverBgColor: data.navHoverBgColor || 'rgba(255,255,255,0.08)',
            navHoverTextColor: data.navHoverTextColor || '#FFFFFF',
            navActiveBgColor: data.navActiveBgColor || 'rgba(255,255,255,0.10)',
            navActiveTextColor: data.navActiveTextColor || '#FFFFFF',
            name: data.name || '',
            slogan: data.slogan || '',
            introParagraphs: data.introParagraphs.length > 0 
              ? data.introParagraphs 
              : ['', ''],
            additionalContent: data.additionalContent || ''
          });
        } else {
          // 기본값 설정
          setFormData({
            heroImageUrl: '',
            heroImagePosition: 'center',
            heroImageFit: 'cover',
            heroImagePosX: 50,
            heroImagePosY: 50,
            heroOverlayOpacity: 0.7,
            heroTextColor: '#F8FAFC',
            heroTextAlign: 'left',
            heroNameSize: 64,
            heroSloganSize: 24,
            heroIntroSize: 18,
            navBgColor: 'rgba(15,23,42,0.8)',
            navTextColor: '#F8FAFC',
            navHoverBgColor: 'rgba(255,255,255,0.08)',
            navHoverTextColor: '#FFFFFF',
            navActiveBgColor: 'rgba(255,255,255,0.10)',
            navActiveTextColor: '#FFFFFF',
            name: 'Shin Woo-Ju',
            slogan: 'AI와 삶을 함께 공부하는 2005년생 신우주입니다.',
            introParagraphs: [
              '자신만의 속도로 깊게 학습하는 것을 좋아합니다. 이곳은 그런 걸음들을 조용히 모아 두는 개인 아카이브입니다.',
              '여러 관점을 체득하기 위한 시도를 합니다. 그 과정에서 무엇을 배우며 생각하는지 기록합니다.'
            ],
            additionalContent: ''
          });
        }
      } catch (error) {
        console.error('Error loading home page settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  async function handleSave() {
    if (!formData.name.trim() || !formData.slogan.trim()) {
      alert('이름과 한 줄 소개는 필수입니다.');
      return;
    }

    // introParagraphs 필터링 (빈 문자열 제거)
    const filteredParagraphs = formData.introParagraphs
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (filteredParagraphs.length === 0) {
      alert('최소 하나의 자기소개 문단을 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      console.log('Saving home page settings:', {
        heroImageUrl: formData.heroImageUrl.trim() || undefined,
        name: formData.name.trim(),
        slogan: formData.slogan.trim(),
        introParagraphs: filteredParagraphs,
        additionalContent: formData.additionalContent.trim() || undefined
      });

      await dashboardRepository.saveHomePageSettings({
        heroImageUrl: formData.heroImageUrl.trim() || undefined,
        heroImagePosition: formData.heroImagePosition || 'center',
        heroImageFit: formData.heroImageFit || 'cover',
        heroImagePosX: formData.heroImagePosX,
        heroImagePosY: formData.heroImagePosY,
        heroOverlayOpacity: formData.heroOverlayOpacity,
        heroTextColor: formData.heroTextColor || '#F8FAFC',
        heroTextAlign: formData.heroTextAlign || 'left',
        heroNameSize: formData.heroNameSize || 64,
        heroSloganSize: formData.heroSloganSize || 24,
        heroIntroSize: formData.heroIntroSize || 18,
        navBgColor: formData.navBgColor,
        navTextColor: formData.navTextColor,
        navHoverBgColor: formData.navHoverBgColor,
        navHoverTextColor: formData.navHoverTextColor,
        navActiveBgColor: formData.navActiveBgColor,
        navActiveTextColor: formData.navActiveTextColor,
        name: formData.name.trim(),
        slogan: formData.slogan.trim(),
        introParagraphs: filteredParagraphs,
        additionalContent: formData.additionalContent.trim() || undefined
      });
      
      alert('저장되었습니다.');
      // 페이지 새로고침하여 최신 데이터 로드
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving home page settings:', error);
      const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.';
      alert(`저장 중 오류가 발생했습니다.\n\n${errorMessage}\n\n콘솔을 확인해주세요.`);
    } finally {
      setSaving(false);
    }
  }

  function addParagraph() {
    setFormData({
      ...formData,
      introParagraphs: [...formData.introParagraphs, '']
    });
  }

  function removeParagraph(index: number) {
    if (formData.introParagraphs.length <= 1) {
      alert('최소 하나의 문단은 필요합니다.');
      return;
    }
    setFormData({
      ...formData,
      introParagraphs: formData.introParagraphs.filter((_, i) => i !== index)
    });
  }

  function updateParagraph(index: number, value: string) {
    const newParagraphs = [...formData.introParagraphs];
    newParagraphs[index] = value;
    setFormData({
      ...formData,
      introParagraphs: newParagraphs
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <p>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6 pb-20">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminHeader />
        
        <div className="mx-auto max-w-4xl">
          {/* Description */}
          <div className="mb-6">
            <p className="mt-2 text-sm text-slate-400">
              홈 페이지의 배경 이미지, 이름, 자기소개 등을 관리합니다.
            </p>
          </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Background Settings - Collapsible */}
          <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
            <button
              type="button"
              onClick={() => setShowBackgroundSettings((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-200"
            >
              <span>배경 이미지 / 위치 / 오버레이</span>
              <span className="text-xs text-slate-400">
                {showBackgroundSettings ? '접기' : '펼치기'}
              </span>
            </button>
            {showBackgroundSettings && (
              <div className="space-y-4 border-t border-slate-800 p-4">
                {/* Hero Image URL */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    배경 이미지 URL
                  </label>
                  <input
                    type="text"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                    placeholder="/images/hero-background.jpg 또는 https://example.com/image.jpg"
                    className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    정적 이미지는 /images/ 경로를, 외부 이미지는 전체 URL을 입력하세요.
                  </p>
                  {formData.heroImageUrl && (
                    <div className="mt-3 rounded border border-slate-700 bg-slate-800/30 p-2">
                      <p className="mb-2 text-xs text-slate-400">미리보기 (드래그 가능):</p>
                      <div
                        className="relative h-48 w-full overflow-hidden rounded border border-slate-700 bg-slate-900/60"
                        onMouseDown={(e) => {
                          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                          const updatePos = (clientX: number, clientY: number) => {
                            const x = Math.min(Math.max(0, clientX - rect.left), rect.width);
                            const y = Math.min(Math.max(0, clientY - rect.top), rect.height);
                            setFormData((prev) => ({
                              ...prev,
                              heroImagePosX: Math.round((x / rect.width) * 100),
                              heroImagePosY: Math.round((y / rect.height) * 100)
                            }));
                          };
                          const move = (ev: MouseEvent) => updatePos(ev.clientX, ev.clientY);
                          const up = () => {
                            window.removeEventListener('mousemove', move);
                            window.removeEventListener('mouseup', up);
                          };
                          window.addEventListener('mousemove', move);
                          window.addEventListener('mouseup', up);
                        }}
                      >
                        <img
                          src={formData.heroImageUrl}
                          alt="Preview"
                          className="h-full w-full"
                          style={{
                            objectFit: formData.heroImageFit,
                            objectPosition: `${formData.heroImagePosX}% ${formData.heroImagePosY}%`,
                            filter: `brightness(${1 - formData.heroOverlayOpacity * 0.6})`
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        {/* 오버레이 미리보기 */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            backgroundColor: `rgba(15,23,42,${formData.heroOverlayOpacity})`
                          }}
                        />
                        {/* 포지션 핸들 표시 */}
                        <div
                          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-warmBeige bg-white/80 shadow"
                          style={{
                            left: `${formData.heroImagePosX}%`,
                            top: `${formData.heroImagePosY}%`
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        이미지를 드래그하거나 슬라이더로 위치를 조정하세요. (object-position % 단위)
                      </p>
                    </div>
                  )}
                </div>

                {/* Image Position & Fit */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    이미지 정렬 및 채우기
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs text-slate-400">Object Position (드래그/슬라이더)</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 w-10">X</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={formData.heroImagePosX}
                            onChange={(e) =>
                              setFormData({ ...formData, heroImagePosX: Number(e.target.value) })
                            }
                            className="flex-1"
                          />
                          <span className="w-10 text-right text-[11px] text-slate-400">
                            {formData.heroImagePosX}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 w-10">Y</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={formData.heroImagePosY}
                            onChange={(e) =>
                              setFormData({ ...formData, heroImagePosY: Number(e.target.value) })
                            }
                            className="flex-1"
                          />
                          <span className="w-10 text-right text-[11px] text-slate-400">
                            {formData.heroImagePosY}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-slate-400">Object Fit</div>
                      <select
                        value={formData.heroImageFit}
                        onChange={(e) =>
                          setFormData({ ...formData, heroImageFit: e.target.value as 'cover' | 'contain' })
                        }
                        className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
                      >
                        <option value="cover">Cover (채우기)</option>
                        <option value="contain">Contain (전체보기)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Overlay Opacity */}
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    오버레이 투명도
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round((formData.heroOverlayOpacity ?? 0.7) * 100)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroOverlayOpacity: Number(e.target.value) / 100
                        })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right text-sm text-slate-300">
                      {Math.round((formData.heroOverlayOpacity ?? 0.7) * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    오버레이가 진할수록 텍스트 가독성↑, 사진 노출↓ (0~100%)
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Name */}

          {/* Name */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              이름 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Shin Woo-Ju"
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>

          {/* Slogan */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              한 줄 소개 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
              placeholder="AI와 삶을 함께 공부하는 2005년생 신우주입니다."
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
            />
          </div>

          {/* Intro Paragraphs */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-200">
                자기소개 문단
              </label>
              <button
                type="button"
                onClick={addParagraph}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                + 문단 추가
              </button>
            </div>
            <div className="space-y-3">
              {formData.introParagraphs.map((paragraph, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={paragraph}
                    onChange={(e) => updateParagraph(index, e.target.value)}
                    placeholder={`문단 ${index + 1}`}
                    rows={3}
                    className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none"
                  />
                  {formData.introParagraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParagraph(index)}
                      className="rounded border border-red-700 bg-red-900/30 px-2 text-xs text-red-400 hover:bg-red-900/50"
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Content */}
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              추가 내용 (마크다운)
            </label>
            <textarea
              value={formData.additionalContent}
              onChange={(e) => setFormData({ ...formData, additionalContent: e.target.value })}
              placeholder="추가로 표시할 내용을 마크다운 형식으로 입력하세요."
              rows={6}
              className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-warmBeige focus:outline-none font-mono"
            />
            <p className="mt-1 text-xs text-slate-500">
              선택사항입니다. 홈 페이지 하단에 표시됩니다.
            </p>
          </div>
          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-warmBeige px-6 py-2 text-sm font-medium text-slate-900 transition hover:bg-warmBeige/90 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

