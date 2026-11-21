import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getClassById, getLearnerProfile, getUserById, addAuditLog } from '@/lib/server/db';
import { CONCEPTS } from '@/data/concepts';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['teacher', 'admin']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');
  const format = searchParams.get('format') || 'json';

  if (!classId) {
    return NextResponse.json({ error: 'classId is required' }, { status: 400 });
  }

  // Verify authorization
  if (auth.user.role === 'teacher') {
    const assigned = auth.user.assignedClassIds || [];
    if (!assigned.includes(classId)) {
      return NextResponse.json(
        { error: 'Forbidden: You are not authorized to export data for this class' },
        { status: 403 }
      );
    }
  }

  const cls = getClassById(classId);
  if (!cls) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  const records = cls.studentIds.map((sId) => {
    const user = getUserById(sId);
    const profile = getLearnerProfile(sId);

    const scores = Object.fromEntries(
      CONCEPTS.map((c) => [c.id, profile.masteryMap[c.id]?.score ?? null])
    );

    return {
      studentId: sId,
      studentName: user?.name || profile.name,
      studentEmail: user?.email || '',
      diagnosticCompleted: profile.diagnosticCompleted,
      totalAttempts: profile.attempts.length,
      masteryScores: scores,
      lastActive: profile.lastActive
    };
  });

  addAuditLog({
    event: 'TEACHER_EXPORTED_CLASS_TELEMETRY',
    userId: auth.user.id,
    role: auth.user.role,
    ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
    details: { classId, studentCount: records.length, format }
  });

  if (format === 'csv') {
    const headers = ['Student ID', 'Student Name', 'Diagnostic Completed', ...CONCEPTS.map((c) => `${c.id} (${c.name})`)];
    const rows = records.map((r) => [
      r.studentId,
      `"${r.studentName}"`,
      r.diagnosticCompleted ? 'Yes' : 'No',
      ...CONCEPTS.map((c) => (r.masteryScores[c.id] !== null ? `${r.masteryScores[c.id]}%` : 'Unassessed'))
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="medha_${classId}_telemetry.csv"`
      }
    });
  }

  return NextResponse.json({
    success: true,
    classId,
    className: cls.name,
    exportedAt: new Date().toISOString(),
    exportedBy: auth.user.name,
    records
  });
}
