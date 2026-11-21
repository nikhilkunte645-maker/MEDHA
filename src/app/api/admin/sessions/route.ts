import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { deleteSession, deleteUserSessions, addAuditLog } from '@/lib/server/db';

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const targetUserId = searchParams.get('userId');

    if (token) {
      deleteSession(token);
      addAuditLog({
        event: 'ADMIN_REVOKED_SESSION_TOKEN',
        userId: auth.user.id,
        role: auth.user.role,
        details: { tokenPrefix: token.slice(0, 8) }
      });
      return NextResponse.json({ success: true, message: 'Session revoked' });
    }

    if (targetUserId) {
      deleteUserSessions(targetUserId);
      addAuditLog({
        event: 'ADMIN_REVOKED_USER_ALL_SESSIONS',
        userId: auth.user.id,
        role: auth.user.role,
        details: { targetUserId }
      });
      return NextResponse.json({ success: true, message: `All sessions for user ${targetUserId} revoked` });
    }

    return NextResponse.json({ error: 'token or userId query parameter is required' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
