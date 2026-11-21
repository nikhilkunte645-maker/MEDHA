import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { user } = auth;
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
        assignedClassIds: user.assignedClassIds
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
