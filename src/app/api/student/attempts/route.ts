import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { getLearnerProfile, saveLearnerProfile } from '@/lib/server/db';
import { Attempt } from '@/types/mastery';
import { calculateUpdatedMastery } from '@/lib/masteryEngine';

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req, ['student']);
  if ('errorResponse' in auth) {
    return auth.errorResponse;
  }

  try {
    const rawBody = await req.json();
    const body = ((rawBody && typeof rawBody === 'object' && 'attempt' in rawBody && rawBody.attempt)
      ? rawBody.attempt
      : rawBody) as Partial<Attempt>;

    const {
      questionId,
      selectedAnswer,
      writtenReasoning,
      isCorrect,
      targetConceptIds,
      difficulty,
      reasoningQuality,
      misconceptionDetected,
      misconceptionCode,
      misconceptionTitle,
      misconceptionStatus,
      evidence,
      explanation,
      correctPrinciple,
      recommendedConceptIds,
      confidence,
      nextLearningAction,
      isOfflineFallback
    } = body;

    if (!questionId || !selectedAnswer || !Array.isArray(targetConceptIds)) {
      return NextResponse.json({ error: 'Missing required attempt fields' }, { status: 400 });
    }

    const attempt: Attempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      learnerId: auth.user.id, // Immutable ID derived from session
      questionId,
      selectedAnswer,
      writtenReasoning: writtenReasoning || '',
      isCorrect: Boolean(isCorrect),
      targetConceptIds,
      difficulty: typeof difficulty === 'number' ? difficulty : 2,
      timestamp: new Date().toISOString(),
      reasoningQuality: reasoningQuality || 'insufficient_evidence',
      misconceptionDetected: Boolean(misconceptionDetected),
      misconceptionCode: misconceptionCode || undefined,
      misconceptionTitle: misconceptionTitle || undefined,
      misconceptionStatus: misconceptionStatus || (misconceptionDetected ? 'detected' : 'unverified'),
      evidence: Array.isArray(evidence) ? evidence : [],
      explanation: explanation || '',
      correctPrinciple: correctPrinciple || undefined,
      recommendedConceptIds: Array.isArray(recommendedConceptIds) ? recommendedConceptIds : targetConceptIds,
      confidence: typeof confidence === 'number' ? confidence : 0.85,
      nextLearningAction: nextLearningAction || 'Continue targeted practice.',
      isOfflineFallback: Boolean(isOfflineFallback)
    };

    const profile = getLearnerProfile(auth.user.id);
    profile.attempts.push(attempt);

    // Update mastery for each target concept
    targetConceptIds.forEach((cId: string) => {
      const current = profile.masteryMap[cId];
      if (current) {
        profile.masteryMap[cId] = calculateUpdatedMastery(current, {
          isCorrect: attempt.isCorrect,
          difficulty: attempt.difficulty,
          reasoningQuality: attempt.reasoningQuality,
          misconceptionDetected: attempt.misconceptionDetected,
          attemptId: attempt.id,
          timestamp: attempt.timestamp
        });
      }
    });

    saveLearnerProfile(profile);

    return NextResponse.json({
      success: true,
      profile,
      attempt
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
