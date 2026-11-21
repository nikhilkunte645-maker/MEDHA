import { LearnerProfile, Attempt, ConceptMastery } from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
import { createInitialMastery, calculateUpdatedMastery } from './masteryEngine';

const STORAGE_KEY = 'medha_learner_profile_v2';

export function getInitialLearnerProfile(): LearnerProfile {
  const masteryMap: Record<string, ConceptMastery> = {};
  CONCEPTS.forEach((c) => {
    masteryMap[c.id] = createInitialMastery(c.id);
  });

  return {
    id: `student_${Date.now().toString(36)}`,
    name: 'Ananya Student',
    masteryMap,
    attempts: [],
    diagnosticCompleted: false,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
}

export function loadLearnerProfile(): LearnerProfile {
  if (typeof window === 'undefined') {
    return getInitialLearnerProfile();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialLearnerProfile();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const profile = JSON.parse(raw) as LearnerProfile;
    // Ensure all 9 concepts exist
    CONCEPTS.forEach((c) => {
      if (!profile.masteryMap[c.id]) {
        profile.masteryMap[c.id] = createInitialMastery(c.id);
      }
    });
    return profile;
  } catch (e) {
    console.error('Failed to load learner profile from storage, creating fresh profile:', e);
    const fresh = getInitialLearnerProfile();
    return fresh;
  }
}

export function saveLearnerProfile(profile: LearnerProfile): void {
  if (typeof window === 'undefined') return;
  try {
    profile.lastActive = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save learner profile:', e);
  }
}

/**
 * Record a new attempt, deterministically update mastery across all affected concepts, and persist.
 */
export function recordAttemptAndUpdateMastery(
  attempt: Attempt
): LearnerProfile {
  const profile = loadLearnerProfile();

  profile.attempts.push(attempt);

  attempt.targetConceptIds.forEach((conceptId) => {
    const currentMastery = profile.masteryMap[conceptId] || createInitialMastery(conceptId);
    const updated = calculateUpdatedMastery(currentMastery, {
      isCorrect: attempt.isCorrect,
      difficulty: attempt.difficulty,
      reasoningQuality: attempt.reasoningQuality,
      misconceptionDetected: attempt.misconceptionDetected,
      attemptId: attempt.id,
      timestamp: attempt.timestamp
    });
    profile.masteryMap[conceptId] = updated;
  });

  saveLearnerProfile(profile);
  return profile;
}

/**
 * Prepares an authentic demo learner state with actual assessment data
 */
export function loadPreparedDemoLearner(): LearnerProfile {
  const profile = getInitialLearnerProfile();
  profile.name = 'Priya Demo Learner';
  profile.diagnosticCompleted = true;

  // C01: At Risk (36%)
  profile.masteryMap['C01'].score = 36;
  profile.masteryMap['C01'].status = 'atRisk';
  profile.masteryMap['C01'].evidenceCount = 2;
  profile.masteryMap['C01'].nextReviewAt = new Date(Date.now() - 3600000).toISOString(); // overdue!

  // C02: At Risk (34%)
  profile.masteryMap['C02'].score = 34;
  profile.masteryMap['C02'].status = 'atRisk';
  profile.masteryMap['C02'].evidenceCount = 2;
  profile.masteryMap['C02'].nextReviewAt = new Date().toISOString();

  // C03: Learning (72%)
  profile.masteryMap['C03'].score = 72;
  profile.masteryMap['C03'].status = 'learning';
  profile.masteryMap['C03'].evidenceCount = 2;

  // C04: Learning (55%)
  profile.masteryMap['C04'].score = 55;
  profile.masteryMap['C04'].status = 'learning';
  profile.masteryMap['C04'].evidenceCount = 2;

  // C05: At Risk (48%)
  profile.masteryMap['C05'].score = 48;
  profile.masteryMap['C05'].status = 'atRisk';
  profile.masteryMap['C05'].evidenceCount = 2;

  // C06: Learning (65%)
  profile.masteryMap['C06'].score = 65;
  profile.masteryMap['C06'].status = 'learning';
  profile.masteryMap['C06'].evidenceCount = 2;

  // C07: At Risk (38%)
  profile.masteryMap['C07'].score = 38;
  profile.masteryMap['C07'].status = 'atRisk';
  profile.masteryMap['C07'].evidenceCount = 2;

  // C08: Learning (68%)
  profile.masteryMap['C08'].score = 68;
  profile.masteryMap['C08'].status = 'learning';
  profile.masteryMap['C08'].evidenceCount = 2;

  // C09: Learning (52%)
  profile.masteryMap['C09'].score = 52;
  profile.masteryMap['C09'].status = 'learning';
  profile.masteryMap['C09'].evidenceCount = 2;

  profile.attempts.push({
    id: 'att_demo_01',
    learnerId: profile.id,
    questionId: 'DQ02',
    selectedAnswer: 'The statement is correct; energy is lost so current decreases.',
    writtenReasoning: 'Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return.',
    isCorrect: false,
    targetConceptIds: ['C01', 'C02'],
    difficulty: 2,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reasoningQuality: 'poor',
    misconceptionDetected: true,
    misconceptionCode: 'CURRENT_VOLTAGE_CONFUSION',
    misconceptionTitle: 'Confusing current with voltage and violating charge conservation',
    misconceptionStatus: 'detected',
    evidence: ['Current is the electrical push from the battery that gets used up'],
    explanation: 'The student treats current as the push and presumes current is consumed by bulbs.',
    correctPrinciple: 'Potential difference (voltage) provides the electrical pressure; electric charge is strictly conserved.',
    recommendedConceptIds: ['C01', 'C02'],
    confidence: 0.94,
    nextLearningAction: 'Practice distinguishing charge rate (current) from energy push (potential difference).',
    isOfflineFallback: true
  });

  saveLearnerProfile(profile);
  return profile;
}
