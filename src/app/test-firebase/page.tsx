'use client';

// Simple Firestore connectivity test page.
// Reads documents from the `test` collection and renders them as small cards.

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface TestDoc {
  id: string;
  message?: string;
}

export default function TestFirebasePage() {
  const [docs, setDocs] = useState<TestDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const snapshot = await getDocs(collection(db, 'test'));
        const items: TestDoc[] = snapshot.docs.map((d) => {
          const data = d.data() as { message?: string; str?: string } | undefined;
          // 우선 message 필드를 사용하고, 없으면 str 필드를 fallback으로 사용합니다.
          return { id: d.id, message: data?.message ?? data?.str };
        });
        setDocs(items);
      } catch (err) {
        console.error('Firestore test error', err);
        setError('Firestore에서 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-10 md:px-6 md:pt-12">
      <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-sm">
        <header>
          <h1 className="text-section-title">Firebase / Firestore Test</h1>
          <p className="mt-2 max-w-2xl text-body text-slate-300">
            이 페이지는 Firestore의 <code className="rounded bg-slate-900 px-1">test</code>{' '}
            컬렉션을 읽어와 간단한 카드로 보여줍니다. 연결이 정상이라면
            아래에 문서 목록이 나타납니다.
          </p>
        </header>

        {loading && (
          <p className="text-sm text-slate-400">불러오는 중입니다...</p>
        )}
        {error && (
          <p className="text-sm text-red-400" aria-live="polite">
            {error}
          </p>
        )}

        {!loading && !error && docs.length === 0 && (
          <p className="text-sm text-slate-400">
            test 컬렉션에 문서가 없습니다. Firestore 콘솔에서 문서를 하나
            추가한 뒤 다시 확인해 보세요.
          </p>
        )}

        {!loading && !error && docs.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {docs.map((doc) => (
              <article
                key={doc.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200"
              >
                <p className="mb-1 text-[11px] font-mono text-slate-400">
                  id: {doc.id}
                </p>
                <p className="text-slate-100">
                  {doc.message ?? '(no message)'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


