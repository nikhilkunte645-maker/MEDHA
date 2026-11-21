import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getLearnerProfile, saveLearnerProfile } from '@/lib/server/db';
import { Attempt } from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
import { calculateDiagnosticBaseline } from '@/lib/masteryEngine';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['student']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const body = await req.json();
    const { attempts } = body;

    if (!Array.isArray(attempts) || attempts.length === 0) {
      return NextResponse.json({ error: 'Attempts array is required' }, { status: 400 });
    }

    const profile = getLearnerProfile(auth.user.id);

    // Ensure learnerId is forced to authenticated student ID
    const sanitizedAttempts: Attempt[] = attempts.map((a: Attempt) => ({
      ...a,
      learnerId: auth.user.id
    }));

    // Append to profile attempts
    profile.attempts.push(...sanitizedAttempts);
    profile.diagnosticCompleted = true;

    // Calculate baseline
    const conceptIds = CONCEPTS.map((c) => c.id);
    const baselineMap = calculateDiagnosticBaseline(sanitizedAttempts, conceptIds);
    profile.masteryMap = baselineMap;

    saveLearnerProfile(profile);

    return NextResponse.json({
      success: true,
      profile
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
