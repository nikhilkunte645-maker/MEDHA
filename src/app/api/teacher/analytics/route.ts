import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getClassById, getLearnerProfile, getUserById } from '@/lib/server/db';
import { CONCEPTS } from '@/data/concepts';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req, ['teacher']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'classId parameter is required' }, { status: 400 });
  }

  // Authorization check: Teacher MUST be assigned to this class
  const teacherAssigned = auth.user.assignedClassIds || [];
  if (!teacherAssigned.includes(classId)) {
    return NextResponse.json(
      { error: 'Forbidden: You are not authorized to view this class' },
      { status: 403 }
    );
  }

  const cls = getClassById(classId);
  if (!cls) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  // Fetch authorized student profiles in this class
  const studentSummaries = cls.studentIds.map((studentId) => {
    const user = getUserById(studentId);
    const profile = getLearnerProfile(studentId);

    const scores = Object.fromEntries(
      CONCEPTS.map((c) => [c.id, profile.masteryMap[c.id]?.score ?? null])
    );

    const lastMisconceptionAttempt = profile.attempts
      .slice()
      .reverse()
      .find((a) => a.misconceptionDetected);

    return {
      id: studentId,
      name: user?.name || profile.name || 'Student',
      email: user?.email || '',
      masteryMap: scores,
      recentMisconception: lastMisconceptionAttempt
        ? {
            code: lastMisconceptionAttempt.misconceptionCode || 'MISC',
            title: lastMisconceptionAttempt.misconceptionTitle || 'Cognitive fallacy',
            conceptId: lastMisconceptionAttempt.targetConceptIds[0] || 'C01',
            timestamp: lastMisconceptionAttempt.timestamp
          }
        : undefined,
      diagnosticCompleted: profile.diagnosticCompleted,
      attemptCount: profile.attempts.length,
      lastActive: profile.lastActive
    };
  });

  // Calculate concept averages across students
  const conceptAverages = CONCEPTS.map((c) => {
    const validScores = studentSummaries
      .map((s) => s.masteryMap[c.id])
      .filter((score): score is number => typeof score === 'number');

    const avgScore = validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null;

    const atRiskCount = validScores.filter((s) => s < 50).length;

    return {
      concept: c,
      avgScore,
      atRiskCount,
      assessedCount: validScores.length
    };
  });

  // Misconception counts
  const misconceptionCounts: Record<string, { title: string; count: number; conceptId: string }> = {
    CURRENT_VOLTAGE_CONFUSION: {
      title: 'Confusing current with voltage & charge consumption',
      count: 0,
      conceptId: 'C01'
    },
    RESISTIVITY_DIMENSIONAL_DEPENDENCE: {
      title: 'Believing resistivity changes when wire is cut or stretched',
      count: 0,
      conceptId: 'C05'
    },
    PARALLEL_RESISTANCE_GREATER_FALLACY: {
      title: 'Believing parallel combinations increase total resistance',
      count: 0,
      conceptId: 'C07'
    },
    STRETCHED_WIRE_AREA_NEGLECT: {
      title: 'Neglecting cross-sectional area reduction during elongation',
      count: 0,
      conceptId: 'C05'
    },
    SERIES_CURRENT_DECAY: {
      title: 'Believing current decreases progressively in series resistors',
      count: 0,
      conceptId: 'C06'
    }
  };

  studentSummaries.forEach((s) => {
    if (s.recentMisconception && misconceptionCounts[s.recentMisconception.code]) {
      misconceptionCounts[s.recentMisconception.code].count += 1;
    }
  });

  return NextResponse.json({
    success: true,
    class: {
      id: cls.id,
      name: cls.name,
      grade: cls.grade,
      section: cls.section
    },
    studentCount: studentSummaries.length,
    conceptAverages,
    students: studentSummaries,
    misconceptionDistribution: misconceptionCounts
  });
}
