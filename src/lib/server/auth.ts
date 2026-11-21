import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import {
  User,
  UserRole,
  UserSession
} from '@/types/mastery';
import {
  getUserById,
  getUserByEmail,
  saveSession,
  getSession,
  deleteSession,
  addAuditLog
} from './db';

export const SESSION_COOKIE_NAME = 'medha_session';
const SESSION_EXPIRY_DAYS = 7;

// In-memory brute force protection tracking
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

export function checkLoginRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = loginRateLimitMap.get(key);

  if (!record) return { allowed: true };

  if (record.blockedUntil > now) {
    const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds: remainingSeconds };
  }

  // Reset if block expired
  if (record.blockedUntil > 0 && record.blockedUntil <= now) {
    loginRateLimitMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedLoginAttempt(key: string): void {
  const now = Date.now();
  const record = loginRateLimitMap.get(key) || { attempts: 0, blockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 5) {
    // Block for 15 minutes after 5 consecutive failures
    record.blockedUntil = now + 15 * 60 * 1000;
  }

  loginRateLimitMap.set(key, record);
}

export function resetLoginRateLimit(key: string): void {
  loginRateLimitMap.delete(key);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSessionForUser(user: User): Promise<UserSession> {
  const token = generateSecureToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const session: UserSession = {
    token,
    userId: user.id,
    role: user.role,
    createdAt: now.toISOString(),
    expiresAt
  };

  saveSession(session);
  return session;
}

export async function validateSessionToken(
  token: string
): Promise<{ user: User; session: UserSession } | null> {
  if (!token || typeof token !== 'string') return null;

  const session = getSession(token);
  if (!session) return null;

  const user = getUserById(session.userId);
  if (!user || user.isDeactivated) {
    deleteSession(token);
    return null;
  }

  return { user, session };
}

export function getSessionTokenFromRequest(req: NextRequest): string | null {
  // 1. Check HTTP-only cookie
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (cookie?.value) return cookie.value;

  // 2. Check Authorization header (Bearer <token>)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export async function authenticateRequest(
  req: NextRequest
): Promise<{ user: User; session: UserSession } | null> {
  const token = getSessionTokenFromRequest(req);
  if (!token) return null;
  return validateSessionToken(token);
}

export async function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): Promise<
  | { user: User; session: UserSession }
  | { errorResponse: NextResponse }
> {
  const auth = await authenticateRequest(req);

  if (!auth) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthenticated: Valid session required' },
        { status: 401 }
      )
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
    addAuditLog({
      event: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      userId: auth.user.id,
      role: auth.user.role,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      details: {
        path: req.nextUrl.pathname,
        allowedRoles,
        userRole: auth.user.role
      }
    });

    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Insufficient role permissions' },
        { status: 403 }
      )
    };
  }

  return auth;
}

export function setSessionCookie(response: NextResponse, token: string, isHttps = false): void {
  const isProduction = process.env.NODE_ENV === 'production';
  // Over http://localhost (development and local production testing), secure must be false so browsers accept and send it.
  const isSecure = isProduction && (isHttps || process.env.COOKIE_SECURE === 'true' || Boolean(process.env.VERCEL));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60
  });
}

export function clearSessionCookie(response: NextResponse, isHttps = false): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = isProduction && (isHttps || process.env.COOKIE_SECURE === 'true' || Boolean(process.env.VERCEL));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}
