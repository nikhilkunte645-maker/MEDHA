import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getAllClasses, assignTeacherToClass, assignStudentToClass, addAuditLog } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const classes = getAllClasses();
  return NextResponse.json({ success: true, classes });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await req.json();
    const { action, userId, classId, role } = body;

    if (!action || !userId || !classId) {
      return NextResponse.json({ error: 'action, userId, and classId are required' }, { status: 400 });
    }

    if (action === 'assign_teacher') {
      const ok = assignTeacherToClass(userId, classId);
      if (!ok) return NextResponse.json({ error: 'Failed to assign teacher to class' }, { status: 400 });

      addAuditLog({
        event: 'ADMIN_ASSIGNED_TEACHER_CLASS',
        userId: auth.user.id,
        role: auth.user.role,
        details: { teacherId: userId, classId }
      });
      return NextResponse.json({ success: true, message: 'Teacher assigned to class' });
    }

    if (action === 'assign_student') {
      const ok = assignStudentToClass(userId, classId);
      if (!ok) return NextResponse.json({ error: 'Failed to assign student to class' }, { status: 400 });

      addAuditLog({
        event: 'ADMIN_ASSIGNED_STUDENT_CLASS',
        userId: auth.user.id,
        role: auth.user.role,
        details: { studentId: userId, classId }
      });
      return NextResponse.json({ success: true, message: 'Student assigned to class' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
