import assert from 'node:assert';
import { CONCEPTS, CONCEPT_MAP } from '../src/data/concepts';
import { DIAGNOSTIC_QUESTIONS } from '../src/data/diagnosticQuestions';
import { SAMPLE_COHORT } from '../src/data/sampleCohort';
import { getMasteryStatus, createInitialMastery, calculateUpdatedMastery, calculateDiagnosticBaseline } from '../src/lib/masteryEngine';
import { calculateNextReview, isReviewOverdue, formatReviewDueRelative } from '../src/lib/spacedRepetition';
import { runOfflineMisconceptionAnalysis } from '../src/lib/gemini';

console.log('====================================================');
console.log('MEDHA INDEPENDENT QA ENGINE & INTEGRITY AUDIT SUITE');
console.log('====================================================');

// TEST 1: Exactly 9 Concepts and strict DAG validation
console.log('\n[AUDIT 1] Concept Topology Integrity:');
assert.strictEqual(CONCEPTS.length, 9, 'Must have exactly 9 concepts');
const expectedCodes = ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09'];
CONCEPTS.forEach((c, idx) => {
  assert.strictEqual(c.id, expectedCodes[idx], `Concept id must be ${expectedCodes[idx]}`);
  assert.ok(c.name.length > 0, `Concept ${c.id} must have a name`);
  assert.ok(c.description.length > 0, `Concept ${c.id} must have a description`);
  assert.ok(c.learningObjectives.length > 0, `Concept ${c.id} must have learning objectives`);
});

// Verify Prerequisite DAG: all prerequisites exist and no cycles
CONCEPTS.forEach((c) => {
  c.prerequisiteIds.forEach((prereqId) => {
    assert.ok(CONCEPT_MAP.has(prereqId), `Prerequisite ${prereqId} of ${c.id} must exist in CONCEPT_MAP`);
    // Ensure topological order: prerequisite must come before current concept
    const prereqIdx = expectedCodes.indexOf(prereqId);
    const currIdx = expectedCodes.indexOf(c.id);
    assert.ok(prereqIdx < currIdx, `Prerequisite ${prereqId} (idx ${prereqIdx}) must precede ${c.id} (idx ${currIdx})`);
  });
});
console.log('✓ PASS: All 9 concepts verified with valid topological DAG prerequisites (no circular dependencies).');

// TEST 2: Diagnostic Questions Integrity
console.log('\n[AUDIT 2] Diagnostic Questions Coverage & Options:');
assert.ok(DIAGNOSTIC_QUESTIONS.length >= 10, 'Must have at least 10 diagnostic questions');
const coveredConcepts = new Set();
DIAGNOSTIC_QUESTIONS.forEach((q) => {
  assert.ok(q.options.length >= 2, `Question ${q.id} must have options`);
  assert.ok(q.options.includes(q.correctAnswer), `Question ${q.id} correct answer must match one of its options`);
  assert.ok(q.conceptIds.length > 0, `Question ${q.id} must map to concept IDs`);
  q.conceptIds.forEach((cId) => {
    assert.ok(CONCEPT_MAP.has(cId), `Question ${q.id} concept ${cId} must exist`);
    coveredConcepts.add(cId);
  });
});
expectedCodes.forEach((cId) => {
  assert.ok(coveredConcepts.has(cId), `Concept ${cId} must be targeted by the diagnostic questions`);
});
console.log(`✓ PASS: All ${DIAGNOSTIC_QUESTIONS.length} diagnostic questions verified; 100% of the 9 concepts covered.`);

// TEST 3: Mastery Engine Determinism & Edge Cases
console.log('\n[AUDIT 3] Deterministic Mastery Calculation Engine:');
// 3a: Initial unassessed state has null score
const initM = createInitialMastery('C01');
assert.strictEqual(initM.score, null, 'Initial score must be null (not 0)');
assert.strictEqual(initM.status, 'unassessed', 'Initial status must be unassessed');
assert.strictEqual(getMasteryStatus(null), 'unassessed');
assert.strictEqual(getMasteryStatus(undefined), 'unassessed');

// 3b: Status boundary tests
assert.strictEqual(getMasteryStatus(0), 'atRisk');
assert.strictEqual(getMasteryStatus(49), 'atRisk');
assert.strictEqual(getMasteryStatus(50), 'learning');
assert.strictEqual(getMasteryStatus(79), 'learning');
assert.strictEqual(getMasteryStatus(80), 'mastered');
assert.strictEqual(getMasteryStatus(100), 'mastered');

// 3c: First assessment baseline calculation
const firstCorrect = calculateUpdatedMastery(initM, {
  isCorrect: true,
  difficulty: 2,
  reasoningQuality: 'good',
  misconceptionDetected: false,
  attemptId: 'att_01'
});
assert.ok(firstCorrect.score !== null && firstCorrect.score >= 60 && firstCorrect.score <= 84, 'First correct baseline must be in 60-84');
assert.strictEqual(firstCorrect.evidenceCount, 1);

const firstIncorrect = calculateUpdatedMastery(initM, {
  isCorrect: false,
  difficulty: 2,
  reasoningQuality: 'poor',
  misconceptionDetected: true,
  attemptId: 'att_02'
});
assert.ok(firstIncorrect.score !== null && firstIncorrect.score <= 45, 'First incorrect baseline must be atRisk (<=45)');
assert.strictEqual(firstIncorrect.status, 'atRisk');

// 3d: Inertia damping on high-mastery
const highMastery = {
  conceptId: 'C01',
  score: 85,
  status: 'mastered',
  evidenceCount: 5,
  lastAssessed: '2026-11-20T00:00:00Z',
  nextReviewAt: '2026-11-27T00:00:00Z',
  reviewCount: 3,
  history: []
};
const afterSlip = calculateUpdatedMastery(highMastery, {
  isCorrect: false,
  difficulty: 2,
  reasoningQuality: 'good', // accidental slip
  misconceptionDetected: false,
  attemptId: 'att_03'
});
// Score should only drop by 3 to 7 points due to high evidenceCount and sound reasoning
assert.ok(afterSlip.score >= 78, `High mastery must not collapse on single slip. Score is: ${afterSlip.score}`);
console.log('✓ PASS: Deterministic mastery engine passed all baseline, inertia, and boundary checks.');

// TEST 4: Spaced Repetition Intervals
console.log('\n[AUDIT 4] Spaced Repetition Scheduling Protocol:');
const base = '2026-11-21T12:00:00.000Z';
const revAtRisk = calculateNextReview('atRisk', 1, base);
const revLearning = calculateNextReview('learning', 1, base);
const revMastered = calculateNextReview('mastered', 1, base);

const diffDays = (d1, d2) => Math.round((new Date(d1) - new Date(d2)) / (1000 * 60 * 60 * 24));
assert.strictEqual(diffDays(revAtRisk, base), 1, 'At risk must schedule at +1 day');
assert.strictEqual(diffDays(revLearning, base), 3, 'Learning must schedule at +3 days');
assert.strictEqual(diffDays(revMastered, base), 7, 'Mastered must schedule at +7 days');
console.log('✓ PASS: Spaced repetition intervals strictly adhere to protocol (1/3/7 days).');

// TEST 5: Sample Cohort Data Isolation
console.log('\n[AUDIT 5] Cohort Data Integrity:');
assert.strictEqual(SAMPLE_COHORT.length, 8, 'Sample cohort must contain 8 students');
SAMPLE_COHORT.forEach((s) => {
  expectedCodes.forEach((cId) => {
    assert.ok(cId in s.masteryMap, `Student ${s.name} must have entry for concept ${cId}`);
  });
});
console.log('✓ PASS: Sample cohort completely populated across all 9 concepts.');

// TEST 6: Offline Reasoning Misconception Diagnostic
console.log('\n[AUDIT 6] AI Offline Misconception Heuristic Engine:');
const reasoningCurrentVoltage = 'Current is the electrical push from the battery that gets used up in the lamp.';
const diagCV = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Explain how charges flow in a circuit',
  expectedAnswer: 'Option B',
  studentAnswer: 'Option A',
  studentReasoning: reasoningCurrentVoltage,
  targetConceptIds: ['C01', 'C02']
});
assert.strictEqual(diagCV.misconception_detected, true);
assert.strictEqual(diagCV.misconception_code, 'CURRENT_VOLTAGE_CONFUSION');
assert.strictEqual(diagCV.misconception_status, 'detected');
assert.ok(diagCV.evidence.length > 0);
assert.ok(diagCV.correct_principle.length > 0);

console.log('✓ PASS: Offline cognitive heuristic accurately diagnoses reasoning and extracts evidence.');
console.log('\n====================================================');
console.log('ALL QA ENGINE INTEGRITY AUDITS PASSED WITH ZERO ERRORS');
console.log('====================================================');
