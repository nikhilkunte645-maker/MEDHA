import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getAuditLogs } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  const logs = getAuditLogs(Math.min(500, Math.max(1, limit)));
  return NextResponse.json({ success: true, logs });
}
