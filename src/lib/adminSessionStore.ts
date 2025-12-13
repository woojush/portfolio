// Stateless admin session helpers (backward-compatible function names).
// We now use signed tokens instead of in-memory sessions.

import { verifyAdminToken } from './adminAuth';

export function addAdminSession(_: string) {
  // no-op: stateless token, nothing to store
}

export function hasAdminSession(token: string | undefined): boolean {
  const secret = process.env.ADMIN_SECRET;
  return verifyAdminToken(token, secret);
}

export function removeAdminSession(_: string) {
  // no-op: logout handled by cookie deletion
}