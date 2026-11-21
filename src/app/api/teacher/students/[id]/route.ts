import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getUserById, getLearnerProfile, getAllClasses, addAuditLog } from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req, ['teacher', 'admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const { id: studentId } = await params;
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
  }

  const targetStudent = getUserById(studentId);
  if (!targetStudent || targetStudent.role !== 'student') {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Teacher authorization check: targetStudent MUST be in teacher's assigned classes
  if (auth.user.role === 'teacher') {
    const assigned = auth.user.assignedClassIds || [];
    const studentClassId = targetStudent.classId;

    if (!studentClassId || !assigned.includes(studentClassId)) {
      addAuditLog({
        event: 'TEACHER_UNAUTHORIZED_STUDENT_INSPECTION_ATTEMPT',
        userId: auth.user.id,
        role: auth.user.role,
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
        details: { targetStudentId: studentId, studentClassId, teacherAssignedClasses: assigned }
      });

      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to view student records outside your assigned classes' },
        { status: 403 }
      );
    }
  }

  const profile = getLearnerProfile(studentId);
  return NextResponse.json({
    success: true,
    student: {
      id: targetStudent.id,
      name: targetStudent.name,
      email: targetStudent.email,
      classId: targetStudent.classId
    },
    profile
  });
}
