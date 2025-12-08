'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { HabitStats } from '@/lib/utils/habitStats';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  stats?: HabitStats;
  title?: string;
}

export function AIAnalysisModal({ 
  isOpen, 
  onClose, 
  analysis, 
  stats, 
  title = 'AI 습관 성취 진단'
}: AIAnalysisModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log('Modal props:', { isOpen, mounted, hasAnalysis: !!analysis, analysisLength: analysis?.length, title });
  }, [isOpen, mounted, analysis, title]);

  if (!isOpen || !mounted) {
    console.log('Modal not rendering - early return:', { isOpen, mounted });
    return null;
  }

  if (!analysis || analysis.trim() === '') {
    console.log('Modal not rendering - no analysis:', { hasAnalysis: !!analysis, analysisLength: analysis?.length });
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div 
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="mb-6 space-y-4">
            {/* Achievement Rate Card */}
            {stats.achievementRate !== undefined && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <div className="mb-2 text-xs text-slate-400">전체 달성률</div>
                <div className="text-2xl font-bold text-warmBeige">{stats.achievementRate}%</div>
                {stats.totalLogs !== undefined && (
                  <div className="mt-1 text-xs text-slate-500">총 {stats.totalLogs}개 기록</div>
                )}
              </div>
            )}

            {/* Combined Chart: Sleep and Mood Stats */}
            {(stats.sleepStats || stats.moodStats) && (
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <h3 className="mb-4 text-sm font-semibold text-slate-300">수면 시간 및 기분별 달성률</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(() => {
                      // 수면 시간별 데이터 준비
                      const sleepData = stats.sleepStats 
                        ? Object.entries(stats.sleepStats)
                            .filter(([_, stat]) => stat.total > 0)
                            .map(([range, stat]) => ({
                              category: range,
                              달성률: stat.total > 0 ? Math.round((stat.achieved / stat.total) * 100) : 0,
                              달성: stat.achieved,
                              전체: stat.total,
                              type: '수면'
                            }))
                        : [];

                      // 기분별 데이터 준비
                      const moodData = stats.moodStats
                        ? Object.entries(stats.moodStats)
                            .filter(([_, stat]) => stat.total > 0)
                            .map(([range, stat]) => ({
                              category: range,
                              달성률: stat.total > 0 ? Math.round((stat.achieved / stat.total) * 100) : 0,
                              달성: stat.achieved,
                              전체: stat.total,
                              type: '기분'
                            }))
                        : [];

                      // 두 데이터를 합치기
                      return [...sleepData, ...moodData];
                    })()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      label={{ value: '달성률 (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        if (name === '달성률') {
                          return [`${value}% (${props.payload.달성}/${props.payload.전체})`, '달성률'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                    />
                    <Bar dataKey="달성률" fill="#d4a574" radius={[4, 4, 0, 0]}>
                      {(() => {
                        const sleepData = stats.sleepStats 
                          ? Object.entries(stats.sleepStats).filter(([_, stat]) => stat.total > 0).map(([range]) => range)
                          : [];
                        const moodData = stats.moodStats
                          ? Object.entries(stats.moodStats).filter(([_, stat]) => stat.total > 0).map(([range]) => range)
                          : [];
                        const allCategories = [...sleepData, ...moodData];
                        return allCategories.map((category, index) => {
                          // 수면 데이터는 warmBeige, 기분 데이터는 약간 다른 색상
                          const isSleep = index < sleepData.length;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={isSleep ? '#d4a574' : '#a78bfa'} 
                            />
                          );
                        });
                      })()}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-warmBeige"></div>
                    <span>수면 시간별</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-purple-400"></div>
                    <span>기분별</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Content */}
        <div className="prose prose-invert max-w-none text-sm text-slate-300">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
            rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
            components={{
              h1: ({ children }) => <h1 className="mb-4 mt-6 text-xl font-bold text-slate-100">{children}</h1>,
              h2: ({ children }) => <h2 className="mb-3 mt-5 text-lg font-semibold text-slate-200">{children}</h2>,
              h3: ({ children }) => <h3 className="mb-2 mt-4 text-base font-semibold text-slate-200">{children}</h3>,
              p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="mb-3 ml-6 list-disc space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="mb-3 ml-6 list-decimal space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-slate-300">{children}</li>,
              strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-warmBeige">{children}</code>
                ) : (
                  <code className="block rounded-lg bg-slate-900 p-3 text-xs text-slate-300">{children}</code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="my-3 border-l-4 border-warmBeige/50 bg-slate-900/50 pl-4 italic text-slate-400">
                  {children}
                </blockquote>
              ),
            }}
          >
            {analysis}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-full bg-warmBeige px-6 py-2 text-sm font-medium text-slate-900 transition hover:bg-warmBeige/90"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

