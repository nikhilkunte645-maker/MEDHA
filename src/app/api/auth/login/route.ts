import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByEmail,
  addAuditLog
} from '@/lib/server/db';
import {
  verifyPassword,
  createSessionForUser,
  setSessionCookie,
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  resetLoginRateLimit
} from '@/lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const rateKey = `${ip}_${email.toLowerCase().trim()}`;
    const rateCheck = checkLoginRateLimit(rateKey);
    if (!rateCheck.allowed) {
      addAuditLog({
        event: 'LOGIN_RATE_LIMITED',
        userId: email,
        role: 'unknown',
        ip,
        details: { retryAfterSeconds: rateCheck.retryAfterSeconds }
      });

      return NextResponse.json(
        { error: `Too many failed login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.` },
        { status: 429 }
      );
    }

    const user = getUserByEmail(email);
    if (!user) {
      recordFailedLoginAttempt(rateKey);
      addAuditLog({
        event: 'USER_LOGIN_FAILED_NOT_FOUND',
        userId: email,
        role: 'unknown',
        ip
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedLoginAttempt(rateKey);
      addAuditLog({
        event: 'USER_LOGIN_FAILED_BAD_PASSWORD',
        userId: user.id,
        role: user.role,
        ip
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Success: reset rate limits and create session
    resetLoginRateLimit(rateKey);
    const session = await createSessionForUser(user);

    addAuditLog({
      event: 'USER_LOGIN_SUCCESS',
      userId: user.id,
      role: user.role,
      ip,
      details: { email: user.email }
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      classId: user.classId,
      assignedClassIds: user.assignedClassIds
    };

    const response = NextResponse.json({
      success: true,
      user: safeUser
    });

    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    setSessionCookie(response, session.token, isHttps);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
