import { ConceptMastery, MasteryStatus, ReasoningQuality, Attempt } from '@/types/mastery';
import { calculateNextReview } from './spacedRepetition';

export function getMasteryStatus(score: number | null): MasteryStatus {
  if (score === null || score === undefined) return 'unassessed';
  if (score < 50) return 'atRisk';
  if (score < 80) return 'learning';
  return 'mastered';
}

export function createInitialMastery(conceptId: string): ConceptMastery {
  return {
    conceptId,
    score: null,
    status: 'unassessed',
    evidenceCount: 0,
    lastAssessed: null,
    nextReviewAt: null,
    reviewCount: 0,
    history: []
  };
}

/**
 * Deterministic evidence-based mastery update algorithm.
 * 
 * - If current concept is unassessed (score === null), baseline is assigned based on answer correctness, difficulty, and reasoning.
 * - If assessed, updates with inertia and diminishing return mathematics.
 * - Score range: 0 - 100
 */
export function calculateUpdatedMastery(
  current: ConceptMastery,
  params: {
    isCorrect: boolean;
    difficulty: number;
    reasoningQuality: ReasoningQuality;
    misconceptionDetected: boolean;
    attemptId: string;
    timestamp?: string;
  }
): ConceptMastery {
  const { isCorrect, difficulty, reasoningQuality, misconceptionDetected, attemptId } = params;
  const now = params.timestamp || new Date().toISOString();
  const isFirstAssessment = current.score === null || current.evidenceCount === 0;

  let newScore = current.score ?? 50;
  let scoreDelta = 0;

  // Base difficulty factor
  const diffFactor = difficulty === 3 ? 1.3 : difficulty === 2 ? 1.0 : 0.8;

  // Reasoning quality weight
  let reasoningFactor = 1.0;
  switch (reasoningQuality) {
    case 'exceptional':
      reasoningFactor = 1.25;
      break;
    case 'good':
      reasoningFactor = 1.1;
      break;
    case 'fair':
      reasoningFactor = 0.9;
      break;
    case 'poor':
      reasoningFactor = 0.6;
      break;
    case 'insufficient_evidence':
      reasoningFactor = 0.85;
      break;
  }

  if (isFirstAssessment) {
    if (isCorrect) {
      // First baseline correct: starts between 60 and 82 depending on difficulty & reasoning
      const baseline = 62 + (difficulty * 5) + (reasoningFactor > 1.0 ? 6 : 0);
      newScore = Math.min(84, Math.round(baseline));
    } else {
      // First baseline incorrect: starts between 25 and 45
      const baseline = 28 + (reasoningQuality === 'fair' || reasoningQuality === 'good' ? 12 : 5);
      newScore = Math.min(45, Math.round(baseline));
    }
    scoreDelta = newScore;
  } else {
    if (isCorrect) {
      // Headroom
      const currentVal = current.score ?? 50;
      const headroom = 100 - currentVal;
      const potentialGain = (18 * diffFactor * reasoningFactor * (headroom / 100));
      scoreDelta = Math.min(22, Math.max(4, Math.round(potentialGain)));
      newScore = Math.min(100, currentVal + scoreDelta);
    } else {
      const currentVal = current.score ?? 50;
      const inertia = Math.min(0.7, current.evidenceCount * 0.1); // up to 70% damping
      let baseDrop = 14 * diffFactor;
      
      if (misconceptionDetected) {
        baseDrop *= 1.2;
      } else if (reasoningQuality === 'fair' || reasoningQuality === 'good') {
        baseDrop *= 0.6;
      }

      const dampenedDrop = baseDrop * (1 - inertia);
      scoreDelta = -Math.min(18, Math.max(3, Math.round(dampenedDrop)));
      newScore = Math.max(0, currentVal + scoreDelta);
    }
  }

  const updatedStatus = getMasteryStatus(newScore);
  const updatedEvidenceCount = current.evidenceCount + 1;
  const updatedReviewCount = current.reviewCount + 1;
  const nextReviewAt = calculateNextReview(updatedStatus, updatedReviewCount, now);

  const updatedHistory = [
    ...current.history,
    {
      timestamp: now,
      score: newScore,
      attemptId,
      change: scoreDelta
    }
  ];

  return {
    conceptId: current.conceptId,
    score: newScore,
    status: updatedStatus,
    evidenceCount: updatedEvidenceCount,
    lastAssessed: now,
    nextReviewAt,
    reviewCount: updatedReviewCount,
    history: updatedHistory
  };
}

/**
 * Calculates baseline mastery scores across all concepts from diagnostic attempts.
 */
export function calculateDiagnosticBaseline(
  diagnosticAttempts: Attempt[],
  conceptIds: string[]
): Record<string, ConceptMastery> {
  const masteryMap: Record<string, ConceptMastery> = {};

  conceptIds.forEach((cId) => {
    masteryMap[cId] = createInitialMastery(cId);
  });

  for (const attempt of diagnosticAttempts) {
    for (const cId of attempt.targetConceptIds) {
      if (masteryMap[cId]) {
        masteryMap[cId] = calculateUpdatedMastery(masteryMap[cId], {
          isCorrect: attempt.isCorrect,
          difficulty: attempt.difficulty,
          reasoningQuality: attempt.reasoningQuality,
          misconceptionDetected: attempt.misconceptionDetected,
          attemptId: attempt.id,
          timestamp: attempt.timestamp
        });
      }
    }
  }

  return masteryMap;
}
