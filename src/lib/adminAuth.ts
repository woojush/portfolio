import { createHmac } from 'crypto';

const ALG = 'HS256';

function base64urlEncode(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string) {
  const pad = 4 - (str.length % 4 || 4);
  const normalized = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  return Buffer.from(normalized, 'base64');
}

type AdminPayload = {
  sub: string;
  exp: number; // seconds since epoch
};

export function signAdminToken(payload: AdminPayload, secret: string): string {
  const header = { alg: ALG, typ: 'JWT' };
  const headerPart = base64urlEncode(Buffer.from(JSON.stringify(header)));
  const payloadPart = base64urlEncode(Buffer.from(JSON.stringify(payload)));
  const data = `${headerPart}.${payloadPart}`;
  const sig = createHmac('sha256', secret).update(data).digest();
  const sigPart = base64urlEncode(sig);
  return `${data}.${sigPart}`;
}

export function verifyAdminToken(token: string | undefined, secret: string | undefined): boolean {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [headerPart, payloadPart, sigPart] = parts;
  const data = `${headerPart}.${payloadPart}`;
  const expected = base64urlEncode(createHmac('sha256', secret).update(data).digest());
  if (expected !== sigPart) return false;
  try {
    const payloadJson = base64urlDecode(payloadPart).toString('utf8');
    const payload = JSON.parse(payloadJson) as AdminPayload;
    if (!payload.exp || typeof payload.exp !== 'number') return false;
    const now = Math.floor(Date.now() / 1000);
    return now < payload.exp;
  } catch {
    return false;
  }
}
