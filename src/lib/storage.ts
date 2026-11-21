import { LearnerProfile, Attempt, ConceptMastery } from '@/types/mastery';
import { CONCEPTS } from '@/data/concepts';
import { createInitialMastery, calculateUpdatedMastery } from './masteryEngine';

const STORAGE_KEY = 'mastery_learner_profile_v1';

export function getInitialLearnerProfile(): LearnerProfile {
  const masteryMap: Record<string, ConceptMastery> = {};
  CONCEPTS.forEach((c) => {
    masteryMap[c.id] = createInitialMastery(c.id);
  });

  return {
    id: `student_${Date.now().toString(36)}`,
    name: 'Student Learner',
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
    // Ensure all 8 concepts exist in masteryMap
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

  // Add attempt to list
  profile.attempts.push(attempt);

  // Update mastery for each targeted concept
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
 * Prepares a demo learner state specifically illustrating Section 18:
 * The student has completed the diagnostic and struggles with C01/C02 (Current vs Voltage Confusion).
 */
export function loadPreparedDemoLearner(): LearnerProfile {
  const profile = getInitialLearnerProfile();
  profile.name = 'Demo Student (Pre-calibrated)';
  profile.diagnosticCompleted = true;

  // Set initial mastery profile
  profile.masteryMap['C01'].score = 36;
  profile.masteryMap['C01'].status = 'needs_attention';
  profile.masteryMap['C01'].evidenceCount = 2;
  profile.masteryMap['C01'].nextReviewAt = new Date(Date.now() - 3600000).toISOString(); // overdue!

  profile.masteryMap['C02'].score = 34;
  profile.masteryMap['C02'].status = 'needs_attention';
  profile.masteryMap['C02'].evidenceCount = 2;
  profile.masteryMap['C02'].nextReviewAt = new Date().toISOString();

  profile.masteryMap['C03'].score = 72;
  profile.masteryMap['C03'].status = 'proficient';
  profile.masteryMap['C03'].evidenceCount = 2;

  profile.masteryMap['C04'].score = 55;
  profile.masteryMap['C04'].status = 'developing';
  profile.masteryMap['C04'].evidenceCount = 2;

  profile.masteryMap['C05'].score = 48;
  profile.masteryMap['C05'].status = 'developing';
  profile.masteryMap['C05'].evidenceCount = 2;

  profile.masteryMap['C06'].score = 40;
  profile.masteryMap['C06'].status = 'developing';
  profile.masteryMap['C06'].evidenceCount = 2;

  profile.masteryMap['C07'].score = 68;
  profile.masteryMap['C07'].status = 'developing';
  profile.masteryMap['C07'].evidenceCount = 2;

  profile.masteryMap['C08'].score = 52;
  profile.masteryMap['C08'].status = 'developing';
  profile.masteryMap['C08'].evidenceCount = 2;

  // Add recorded initial diagnostic attempt reflecting C01/C02 misconception
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
    evidence: ['Current is the electrical push from the battery that gets used up'],
    explanation: 'The student treats current as the push and presumes current is consumed by bulbs.',
    recommendedConceptIds: ['C01', 'C02'],
    confidence: 0.94,
    nextLearningAction: 'Practice distinguishing charge rate (current) from energy push (potential difference).',
    isOfflineFallback: true
  });

  saveLearnerProfile(profile);
  return profile;
}
