import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionTokenFromRequest,
  clearSessionCookie,
  validateSessionToken
} from '@/lib/server/auth';
import { deleteSession, addAuditLog } from '@/lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const token = getSessionTokenFromRequest(req);
    if (token) {
      const auth = await validateSessionToken(token);
      if (auth) {
        addAuditLog({
          event: 'USER_LOGOUT',
          userId: auth.user.id,
          role: auth.user.role,
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1'
        });
      }
      deleteSession(token);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    clearSessionCookie(response);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
