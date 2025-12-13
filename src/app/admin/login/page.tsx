'use client';

// Admin login page: asks for 6-digit code and calls /api/admin/login.

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Login failed.');
        setLoading(false);
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-lg">
        <h1 className="mb-2 text-section-title text-white">Admin Login</h1>
        <p className="mb-4 text-sm text-slate-300">
          6자리 편집 코드를 입력하면 개인 아카이브 데이터를 수정할 수 있는
          관리자 화면으로 이동합니다.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="mb-1 block text-xs font-medium text-slate-300"
            >
              6자리 코드
            </label>
            <input
              id="code"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-warmBeige"
              placeholder="******"
              required
            />
          </div>
          {error && (
            <p className="text-xs text-red-400" aria-live="polite">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </main>
  );
}




