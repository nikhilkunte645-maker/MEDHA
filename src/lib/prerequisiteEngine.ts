import { CONCEPTS, CONCEPT_MAP } from '@/data/concepts';
import {
  ConceptMastery,
  LearnerProfile,
  PrerequisiteGapInfo,
  ReasoningChainStep,
  CognitiveErrorCategory,
  DiagnosticConfidenceLevel
} from '@/types/mastery';

/**
 * Traverses upstream prerequisites in the DAG to identify unmastered root concepts
 * that are causing learning bottlenecks downstream.
 */
export function findRootPrerequisiteGaps(
  targetConceptId: string,
  masteryMap: Record<string, ConceptMastery>
): PrerequisiteGapInfo[] {
  const gaps: PrerequisiteGapInfo[] = [];
  const visited = new Set<string>();

  function traversePrereqs(cId: string, depth = 0) {
    const concept = CONCEPT_MAP.get(cId);
    if (!concept) return;

    for (const prereqId of concept.prerequisiteIds) {
      if (visited.has(prereqId)) continue;
      visited.add(prereqId);

      const prereqConcept = CONCEPT_MAP.get(prereqId);
      const mastery = masteryMap[prereqId];
      const isWeak = !mastery || mastery.score === null || mastery.score < 60 || mastery.status === 'atRisk';

      if (prereqConcept && isWeak) {
        // Check if this node itself has unmastered parents (to find root)
        const hasUnmasteredParents = prereqConcept.prerequisiteIds.some(
          (pId) => !masteryMap[pId] || masteryMap[pId].score === null || (masteryMap[pId].score ?? 0) < 60
        );

        gaps.push({
          conceptId: prereqId,
          conceptName: prereqConcept.name,
          relationship: depth === 0 ? `Direct prerequisite to ${concept.name}` : `Foundational upstream prerequisite to ${concept.name}`,
          rootGap: !hasUnmasteredParents
        });
      }

      traversePrereqs(prereqId, depth + 1);
    }
  }

  traversePrereqs(targetConceptId);
  return gaps;
}

/**
 * Determines all downstream concepts in the curriculum that directly or indirectly
 * depend on a given concept.
 */
export function getDownstreamImpact(conceptId: string): string[] {
  const downstream = new Set<string>();

  for (const concept of CONCEPTS) {
    if (concept.id === conceptId) continue;

    // Check if conceptId is reachable upstream from concept.id
    const visited = new Set<string>();
    const hasDependency = (cId: string): boolean => {
      const c = CONCEPT_MAP.get(cId);
      if (!c) return false;
      for (const p of c.prerequisiteIds) {
        if (p === conceptId) return true;
        if (!visited.has(p)) {
          visited.add(p);
          if (hasDependency(p)) return true;
        }
      }
      return false;
    };

    if (hasDependency(concept.id)) {
      downstream.add(concept.id);
    }
  }

  return Array.from(downstream);
}

/**
 * Computes a topologically valid recommended learning sequence prioritizing
 * foundational root gaps before higher-order application topics.
 */
export function getRecommendedLearningSequence(
  masteryMap: Record<string, ConceptMastery>
): string[] {
  // Topological sort with in-degree
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};

  for (const c of CONCEPTS) {
    inDegree[c.id] = c.prerequisiteIds.length;
    adjList[c.id] = [];
  }

  for (const c of CONCEPTS) {
    for (const p of c.prerequisiteIds) {
      adjList[p].push(c.id);
    }
  }

  const queue: string[] = CONCEPTS.filter((c) => inDegree[c.id] === 0).map((c) => c.id);
  const sequence: string[] = [];

  while (queue.length > 0) {
    // Sort queue by lowest score / atRisk status first
    queue.sort((a, b) => {
      const scoreA = masteryMap[a]?.score ?? 0;
      const scoreB = masteryMap[b]?.score ?? 0;
      return scoreA - scoreB;
    });

    const curr = queue.shift()!;
    sequence.push(curr);

    for (const neighbor of adjList[curr]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    }
  }

  return sequence;
}

/**
 * Generates an individualized adaptive learning action for a student profile
 * that strictly differentiates between conceptual gaps, calculation slips,
 * and prerequisite blockages.
 */
export function generateAdaptiveRecommendation(profile: LearnerProfile): {
  recommendedConceptId: string;
  recommendedConceptName: string;
  actionTitle: string;
  actionDescription: string;
  pedagogicalRationale: string;
  prerequisiteGaps: PrerequisiteGapInfo[];
  downstreamImpactIds: string[];
  suggestedDifficulty: 1 | 2 | 3;
} {
  const masteryMap = profile.masteryMap;

  // 1. Identify all concepts that are atRisk or learning
  const atRiskList = CONCEPTS.filter((c) => masteryMap[c.id]?.status === 'atRisk');
  const learningList = CONCEPTS.filter((c) => masteryMap[c.id]?.status === 'learning');

  // Check recent attempts for error patterns
  const recentAttempts = profile.attempts.slice(-5);
  const hasCalculationSlip = recentAttempts.some((a) => a.errorCategory === 'calculation_error');
  const hasConceptualMisconception = recentAttempts.some((a) => a.misconceptionDetected);

  // If student has at-risk concepts, look for root prerequisite gap
  if (atRiskList.length > 0) {
    // Check if the lowest concept has an unmastered root prerequisite
    const lowestConcept = [...atRiskList].sort(
      (a, b) => (masteryMap[a.id]?.score ?? 0) - (masteryMap[b.id]?.score ?? 0)
    )[0];

    const rootGaps = findRootPrerequisiteGaps(lowestConcept.id, masteryMap);
    const primaryRootGap = rootGaps.find((g) => g.rootGap) || rootGaps[0];

    if (primaryRootGap && primaryRootGap.conceptId !== lowestConcept.id) {
      const rootConcept = CONCEPT_MAP.get(primaryRootGap.conceptId)!;
      const impact = getDownstreamImpact(primaryRootGap.conceptId);
      return {
        recommendedConceptId: primaryRootGap.conceptId,
        recommendedConceptName: rootConcept.name,
        actionTitle: `Reinforce Foundational ${rootConcept.name}`,
        actionDescription: `Remediate ${primaryRootGap.conceptId} to unlock ${lowestConcept.id} (${lowestConcept.name}) and ${impact.length} downstream topics.`,
        pedagogicalRationale: `Prerequisite Gap Detected: Although friction appeared in ${lowestConcept.name}, cognitive evidence indicates the root barrier is upstream in ${rootConcept.name} (${primaryRootGap.relationship}).`,
        prerequisiteGaps: rootGaps,
        downstreamImpactIds: impact,
        suggestedDifficulty: rootConcept.difficulty
      };
    }

    // Lowest concept is its own root gap
    const impact = getDownstreamImpact(lowestConcept.id);
    return {
      recommendedConceptId: lowestConcept.id,
      recommendedConceptName: lowestConcept.name,
      actionTitle: `Resolve Conceptual Misconception in ${lowestConcept.name}`,
      actionDescription: `Targeted practice to correct intuition gaps before advancing to dependent resistor networks.`,
      pedagogicalRationale: `Active Conceptual Remediation: At-risk mastery (${masteryMap[lowestConcept.id]?.score ?? 0}%) is directly blocking ${impact.join(', ')}.`,
      prerequisiteGaps: [],
      downstreamImpactIds: impact,
      suggestedDifficulty: 1
    };
  }

  // If student has calculation slips but good conceptual understanding
  if (hasCalculationSlip && !hasConceptualMisconception && learningList.length > 0) {
    const target = learningList[0];
    return {
      recommendedConceptId: target.id,
      recommendedConceptName: target.name,
      actionTitle: `Precision Calculation Drills in ${target.name}`,
      actionDescription: `Reinforce step-by-step arithmetic and SI unit conversions without re-teaching established theory.`,
      pedagogicalRationale: `Algorithmic Precision Focus: The learner demonstrates sound physical intuition, but requires deliberate arithmetic practice to prevent precision errors under examination conditions.`,
      prerequisiteGaps: [],
      downstreamImpactIds: getDownstreamImpact(target.id),
      suggestedDifficulty: 2
    };
  }

  // Developing concepts
  if (learningList.length > 0) {
    const target = learningList[0];
    return {
      recommendedConceptId: target.id,
      recommendedConceptName: target.name,
      actionTitle: `Elevate ${target.name} to Full Mastery`,
      actionDescription: `Solve challenging multi-step circuit problems to solidify transfer.`,
      pedagogicalRationale: `Mastery Elevation: Foundational prerequisites are secure; target higher-difficulty application questions to achieve mastery status (≥80%).`,
      prerequisiteGaps: [],
      downstreamImpactIds: getDownstreamImpact(target.id),
      suggestedDifficulty: 3
    };
  }

  // All mastered or baseline
  const first = CONCEPTS[0];
  return {
    recommendedConceptId: first.id,
    recommendedConceptName: first.name,
    actionTitle: `Spaced Retention Review for ${first.name}`,
    actionDescription: `Keep circuits and charge intuition fresh with interval practice.`,
    pedagogicalRationale: `Long-Term Retention: Periodic spaced retrieval prevents decay of foundational definitions.`,
    prerequisiteGaps: [],
    downstreamImpactIds: getDownstreamImpact(first.id),
    suggestedDifficulty: 2
  };
}

/**
 * Constructs the explicit 8-Stage Reasoning-to-Intervention chain required
 * by the hackathon judging specification.
 */
export function buildReasoningChain(params: {
  studentAnswer: string;
  studentReasoning: string;
  isCorrect: boolean;
  evidence: string[];
  misconceptionDetected: boolean;
  misconceptionCode?: string;
  misconceptionTitle?: string;
  errorCategory: CognitiveErrorCategory;
  confidence: number;
  confidenceLevel: DiagnosticConfidenceLevel;
  targetConceptId: string;
  correctPrinciple?: string;
  nextLearningAction: string;
  scoreChange?: number;
}): ReasoningChainStep[] {
  const {
    studentAnswer,
    studentReasoning,
    isCorrect,
    evidence,
    misconceptionDetected,
    misconceptionCode,
    misconceptionTitle,
    errorCategory,
    confidence,
    confidenceLevel,
    targetConceptId,
    correctPrinciple,
    nextLearningAction,
    scoreChange
  } = params;

  const concept = CONCEPT_MAP.get(targetConceptId);
  const prereqGaps = concept?.prerequisiteIds.length ? `Prerequisites: ${concept.prerequisiteIds.join(', ')}` : 'Foundational root concept';

  return [
    {
      step: 1,
      stage: 'STUDENT_RESPONSE',
      label: 'Student Response',
      content: `Selected Option: ${studentAnswer} | Written Reasoning: "${studentReasoning.slice(0, 120)}${studentReasoning.length > 120 ? '...' : ''}"`,
      status: isCorrect ? 'passed' : 'warning'
    },
    {
      step: 2,
      stage: 'REASONING_EVIDENCE',
      label: 'Reasoning Evidence',
      content: evidence.length > 0 ? evidence.join('; ') : 'Analysis of submitted reasoning text',
      status: evidence.length > 0 && misconceptionDetected ? 'flagged' : isCorrect ? 'passed' : 'neutral'
    },
    {
      step: 3,
      stage: 'MISCONCEPTION_DIAGNOSIS',
      label: 'Cognitive Diagnosis',
      content: misconceptionDetected
        ? `${misconceptionTitle || misconceptionCode} [Category: ${errorCategory.replace(/_/g, ' ')}]`
        : isCorrect
        ? `Sound Conceptual Understanding [${errorCategory.replace(/_/g, ' ')}]`
        : `Non-conceptual error: ${errorCategory.replace(/_/g, ' ')}`,
      status: misconceptionDetected ? 'flagged' : isCorrect ? 'passed' : 'warning'
    },
    {
      step: 4,
      stage: 'CONFIDENCE_CALIBRATION',
      label: 'Diagnostic Confidence',
      content: `${Math.round(confidence * 100)}% (${confidenceLevel.toUpperCase()}) — ${confidenceLevel === 'insufficient_evidence' ? 'Insufficient text to diagnose' : 'Traceable evidence match'}`,
      status: confidence >= 0.85 ? 'passed' : confidence >= 0.65 ? 'neutral' : 'warning'
    },
    {
      step: 5,
      stage: 'PREREQUISITE_GAP',
      label: 'Prerequisite Topology',
      content: `${targetConceptId} (${concept?.name || 'Target Concept'}). ${prereqGaps}`,
      status: 'neutral'
    },
    {
      step: 6,
      stage: 'PERSONALIZED_INTERVENTION',
      label: 'Targeted Intervention',
      content: correctPrinciple || 'Review foundational principles of current and energy conservation.',
      status: 'passed'
    },
    {
      step: 7,
      stage: 'FOLLOW_UP_ACTION',
      label: 'Follow-Up Action',
      content: nextLearningAction,
      status: 'passed'
    },
    {
      step: 8,
      stage: 'MASTERY_UPDATE',
      label: 'Mastery & Schedule',
      content: typeof scoreChange === 'number'
        ? `${scoreChange >= 0 ? `+${scoreChange}%` : `${scoreChange}%`} update with inertia damping & 1/3/7 day review schedule`
        : 'Telemetry recorded in learner model with spaced repetition schedule',
      status: typeof scoreChange === 'number' && scoreChange < 0 ? 'warning' : 'passed'
    }
  ];
}
