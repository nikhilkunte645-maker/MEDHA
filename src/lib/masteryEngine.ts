import { ConceptMastery, MasteryStatus, ReasoningQuality, Attempt } from '@/types/mastery';
import { calculateNextReview } from './spacedRepetition';

export function getMasteryStatus(score: number): MasteryStatus {
  if (score < 40) return 'needs_attention';
  if (score < 70) return 'developing';
  if (score < 85) return 'proficient';
  return 'strong';
}

export function createInitialMastery(conceptId: string): ConceptMastery {
  return {
    conceptId,
    score: 0,
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
 * Target Evidence Target:
 * - Base difficulty multiplier: L1 = 15 pts, L2 = 22 pts, L3 = 30 pts
 * - Reasoning Quality Multiplier:
 *     - exceptional: 1.25x
 *     - good: 1.1x
 *     - fair: 0.9x
 *     - poor: 0.5x
 *     - insufficient_evidence: 0.8x
 * 
 * If Correct:
 * - Gains step size attenuated by current mastery (diminishing returns as score -> 100).
 * - Maximum single correct jump capped at 25 points so no single lucky guess leaps to mastery.
 * 
 * If Incorrect:
 * - Loss step size dampened by existing evidence count (inertia) and reasoning quality.
 * - If reasoning showed good understanding despite accidental mistake, deduction is minimal (-3 to -6 pts).
 * - If deep misconception is confirmed, deduction is calibrated (-8 to -15 pts).
 * - High mastery student (e.g. 85) does not crash to 20 from one mistake.
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
  const isFirstAssessment = current.status === 'unassessed' || current.evidenceCount === 0;

  let newScore = current.score;
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
      // First baseline correct: starts between 55 and 75 depending on difficulty & reasoning
      const baseline = 55 + (difficulty * 6) + (reasoningFactor > 1.0 ? 8 : 0);
      newScore = Math.min(80, Math.round(baseline));
    } else {
      // First baseline incorrect: starts between 20 and 38
      const baseline = 22 + (reasoningQuality === 'fair' || reasoningQuality === 'good' ? 12 : 5);
      newScore = Math.min(38, Math.round(baseline));
    }
    scoreDelta = newScore - current.score;
  } else {
    if (isCorrect) {
      // Room to grow
      const headroom = 100 - current.score;
      // Step: proportional to headroom with diminishing returns
      const potentialGain = (18 * diffFactor * reasoningFactor * (headroom / 100));
      // Cap maximum single gain at 22 points
      scoreDelta = Math.min(22, Math.max(4, Math.round(potentialGain)));
      newScore = Math.min(100, current.score + scoreDelta);
    } else {
      // Penalty: dampened if learner has high past evidence count (inertia)
      const inertia = Math.min(0.7, current.evidenceCount * 0.1); // up to 70% damping
      let baseDrop = 14 * diffFactor;
      
      // If student had a conceptual misconception vs calculation slip
      if (misconceptionDetected) {
        baseDrop *= 1.2;
      } else if (reasoningQuality === 'fair' || reasoningQuality === 'good') {
        baseDrop *= 0.6; // Accidental error or minor slip
      }

      const dampenedDrop = baseDrop * (1 - inertia);
      // Floor maximum single loss to 18 points so high mastery isn't wiped out
      scoreDelta = -Math.min(18, Math.max(3, Math.round(dampenedDrop)));
      newScore = Math.max(0, current.score + scoreDelta);
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

  // Process attempts sequentially
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
