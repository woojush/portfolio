// Admin login route: validates 6-digit EDITOR_CODE and issues a simple cookie session.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { addAdminSession } from '@/lib/adminSessionStore';

const MAX_ATTEMPTS = 5;
const BLOCK_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

const attempts = new Map<
  string,
  { count: number; firstAttemptAt: number; blockedUntil?: number }
>();

function getClientKey(req: Request): string {
  const ip =
    req.headers.get('x-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'unknown';
  const ua = req.headers.get('user-agent') ?? 'unknown';
  return `${ip}:${ua}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code: string | undefined = body?.code;
  const clientKey = getClientKey(req);

  const now = Date.now();
  const record = attempts.get(clientKey);

  if (record?.blockedUntil && record.blockedUntil > now) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const expectedCode = process.env.EDITOR_CODE;

  if (!expectedCode) {
    return NextResponse.json(
      { ok: false, error: 'Server not configured with EDITOR_CODE.' },
      { status: 500 }
    );
  }

  if (!code || typeof code !== 'string') {
    return NextResponse.json(
      { ok: false, error: 'Invalid code.' },
      { status: 400 }
    );
  }

  if (code === expectedCode) {
    attempts.delete(clientKey);

    const token = randomUUID();
    addAdminSession(token);

    const res = NextResponse.json({ ok: true }, { status: 200 });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 // 1 hour
    });
    return res;
  }

  // Wrong code; update attempts
  if (!record) {
    attempts.set(clientKey, {
      count: 1,
      firstAttemptAt: now
    });
  } else {
    let { count, firstAttemptAt } = record;
    if (now - firstAttemptAt > BLOCK_WINDOW_MS) {
      count = 0;
      firstAttemptAt = now;
    }
    count += 1;

    const updated: (typeof record) = { count, firstAttemptAt };
    if (count >= MAX_ATTEMPTS) {
      updated.blockedUntil = now + BLOCK_WINDOW_MS;
    }
    attempts.set(clientKey, updated);
  }

  return NextResponse.json(
    { ok: false, error: 'Incorrect code.' },
    { status: 401 }
  );
}




