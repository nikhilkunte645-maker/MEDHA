import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getClassesForTeacher } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['teacher']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  // Teacher accesses ONLY classes assigned to them
  const classes = getClassesForTeacher(auth.user.id);
  return NextResponse.json({ success: true, classes });
}
