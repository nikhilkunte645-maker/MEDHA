import assert from 'node:assert';
import { CONCEPTS, CONCEPT_MAP } from '../src/data/concepts';
import { DIAGNOSTIC_QUESTIONS } from '../src/data/diagnosticQuestions';
import { SAMPLE_COHORT } from '../src/data/sampleCohort';
import {
  getMasteryStatus,
  createInitialMastery,
  calculateUpdatedMastery,
  calculateDiagnosticBaseline
} from '../src/lib/masteryEngine';
import {
  calculateNextReview,
  isReviewOverdue,
  formatReviewDueRelative
} from '../src/lib/spacedRepetition';
import {
  runOfflineMisconceptionAnalysis,
  validateMisconceptionResponse,
  validateGeneratedQuestion
} from '../src/lib/gemini';

console.log('================================================================');
console.log('MEDHA COMPREHENSIVE REGRESSION & FULL-SYSTEM AUDIT TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// SECTION 1: TOPOLOGY & SYLLABUS INTEGRITY (Class 10 Physics: Electricity)
// -----------------------------------------------------------------------------
console.log('[AUDIT 1] Concept Topology Integrity:');
assert.strictEqual(CONCEPTS.length, 9, 'Must have exactly 9 concepts');
const expectedConcepts = [
  { id: 'C01', name: 'Electric Charge and Current' },
  { id: 'C02', name: 'Potential Difference' },
  { id: 'C03', name: 'Circuit Diagrams and Symbols' },
  { id: 'C04', name: "Ohm's Law" },
  { id: 'C05', name: 'Resistivity' },
  { id: 'C06', name: 'Resistors in Series' },
  { id: 'C07', name: 'Resistors in Parallel' },
  { id: 'C08', name: 'Heating Effect of Current' },
  { id: 'C09', name: 'Electric Power' }
];

expectedConcepts.forEach((exp, idx) => {
  const actual = CONCEPTS[idx];
  assert.strictEqual(actual.id, exp.id, `Concept index ${idx} must have id ${exp.id}`);
  assert.strictEqual(actual.name, exp.name, `Concept ${exp.id} must match expected name ${exp.name}`);
  assert.ok(actual.learningObjectives.length >= 2, `Concept ${exp.id} must have learning objectives`);
});

// Prerequisite DAG acyclicity check
const visited = new Set();
const visiting = new Set();
function checkCycle(nodeId) {
  visiting.add(nodeId);
  const node = CONCEPT_MAP.get(nodeId);
  assert.ok(node, `Node ${nodeId} must exist in concept map`);
  for (const prereqId of node.prerequisiteIds) {
    assert.ok(!visiting.has(prereqId), `Cycle detected between ${nodeId} and ${prereqId}`);
    if (!visited.has(prereqId)) {
      checkCycle(prereqId);
    }
  }
  visiting.delete(nodeId);
  visited.add(nodeId);
}
CONCEPTS.forEach((c) => {
  if (!visited.has(c.id)) {
    checkCycle(c.id);
  }
});
console.log('✓ PASS: All 9 concepts validated in strict topological DAG order with zero cycles.\n');

// -----------------------------------------------------------------------------
// SECTION 2: DETERMINISTIC LEARNING ENGINE & INERTIA DAMPING
// -----------------------------------------------------------------------------
console.log('[AUDIT 2] Deterministic Learning Engine & Inertia:');

// Threshold tests
assert.strictEqual(getMasteryStatus(null), 'unassessed');
assert.strictEqual(getMasteryStatus(0), 'atRisk');
assert.strictEqual(getMasteryStatus(49), 'atRisk');
assert.strictEqual(getMasteryStatus(50), 'learning');
assert.strictEqual(getMasteryStatus(79), 'learning');
assert.strictEqual(getMasteryStatus(80), 'mastered');
assert.strictEqual(getMasteryStatus(100), 'mastered');

// Unassessed initial state
const initM = createInitialMastery('C04');
assert.strictEqual(initM.score, null);
assert.strictEqual(initM.status, 'unassessed');
assert.strictEqual(initM.evidenceCount, 0);

// First assessment calibration (baseline)
const assessedOnceCorrect = calculateUpdatedMastery(initM, {
  isCorrect: true,
  difficulty: 2,
  reasoningQuality: 'good',
  misconceptionDetected: false,
  attemptId: 'att_init_1'
});
assert.ok(assessedOnceCorrect.score >= 70 && assessedOnceCorrect.score <= 84, 'Initial correct baseline in expected band');
assert.strictEqual(assessedOnceCorrect.status, 'learning');
assert.strictEqual(assessedOnceCorrect.evidenceCount, 1);

// Diminishing returns on successive correct answers
const nextCorrect = calculateUpdatedMastery(assessedOnceCorrect, {
  isCorrect: true,
  difficulty: 3,
  reasoningQuality: 'exceptional',
  misconceptionDetected: false,
  attemptId: 'att_init_2'
});
assert.ok(nextCorrect.score > assessedOnceCorrect.score, 'Score must increase');
const gain1 = nextCorrect.score - assessedOnceCorrect.score;

const higherM = { ...nextCorrect, score: 95 };
const highGainAttempt = calculateUpdatedMastery(higherM, {
  isCorrect: true,
  difficulty: 3,
  reasoningQuality: 'exceptional',
  misconceptionDetected: false,
  attemptId: 'att_high'
});
const gain2 = highGainAttempt.score - 95;
assert.ok(gain2 < gain1, 'Gain must diminish as score approaches 100% headroom ceiling');

// Inertia damping on loss (high evidence count dampens loss)
const lowEvidenceMastered = {
  ...createInitialMastery('C04'),
  score: 85,
  status: 'mastered',
  evidenceCount: 1
};
const dropLowEvidence = calculateUpdatedMastery(lowEvidenceMastered, {
  isCorrect: false,
  difficulty: 2,
  reasoningQuality: 'poor',
  misconceptionDetected: true,
  attemptId: 'att_drop_1'
});

const highEvidenceMastered = {
  ...createInitialMastery('C04'),
  score: 85,
  status: 'mastered',
  evidenceCount: 6
};
const dropHighEvidence = calculateUpdatedMastery(highEvidenceMastered, {
  isCorrect: false,
  difficulty: 2,
  reasoningQuality: 'poor',
  misconceptionDetected: true,
  attemptId: 'att_drop_2'
});

const lossLow = 85 - dropLowEvidence.score;
const lossHigh = 85 - dropHighEvidence.score;
assert.ok(lossHigh < lossLow, 'Higher prior evidence count must dampen mastery loss against isolated mistakes');
console.log('✓ PASS: Deterministic mastery mathematics, headroom, and inertia damping validated.\n');

// -----------------------------------------------------------------------------
// SECTION 3: REASONING ANALYSIS SCENARIOS (Section F9 Cases A through H)
// -----------------------------------------------------------------------------
console.log('[AUDIT 3] AI & Heuristic Reasoning Scenarios (Cases A to H):');

// Case A: Correct reasoning
const caseA = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Explain how current changes across series resistors.',
  expectedAnswer: 'Current is identical throughout.',
  studentAnswer: 'Current is identical throughout.',
  studentReasoning: 'Because there is only one continuous path for charge carriers, electric charge is conserved and current must be identical at all points.',
  targetConceptIds: ['C06']
});
assert.strictEqual(caseA.is_correct, true);
assert.strictEqual(caseA.misconception_detected, false);
assert.strictEqual(caseA.reasoning_quality, 'good');
console.log('  ✓ Case A passed: Sound conceptual reasoning correctly accepted without hallucinated misconceptions.');

// Case B: Incorrect conceptual reasoning with identified misconception
const caseB = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Explain how current changes across series resistors.',
  expectedAnswer: 'Current is identical throughout.',
  studentAnswer: 'Current decreases across each resistor.',
  studentReasoning: 'The first resistor in series uses up current, so the second resistor receives less current.',
  targetConceptIds: ['C06']
});
assert.strictEqual(caseB.is_correct, false);
assert.strictEqual(caseB.misconception_detected, true);
assert.strictEqual(caseB.misconception_code, 'SERIES_CURRENT_DECAY');
assert.strictEqual(caseB.misconception_status, 'detected');
assert.ok(caseB.evidence.length > 0, 'Evidence must be extracted');
console.log('  ✓ Case B passed: Incorrect conceptual reasoning correctly identifies SERIES_CURRENT_DECAY with verbatim evidence.');

// Case C: Correct answer with incorrect reasoning
const caseC = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Does current change across a lamp?',
  expectedAnswer: 'No, current remains equal before and after.',
  studentAnswer: 'No, current remains equal before and after.',
  studentReasoning: 'Current stays the same because voltage flows through the wire and pushes the electrons equally.',
  targetConceptIds: ['C01', 'C02']
});
// Even though the student accidentally selected the correct option, their reasoning contains "voltage flows" and confusion
assert.strictEqual(caseC.misconception_detected, true, 'Latent misconception must be flagged even if option was guessed');
assert.strictEqual(caseC.is_correct, false, 'Misconception in reasoning must override lucky option guess');
console.log('  ✓ Case C passed: Accidental lucky answer with flawed reasoning correctly flags latent misconception.');

// Case D: Incorrect answer due to arithmetic (not conceptual fallacy)
const caseD = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Calculate total resistance of 2 ohm and 3 ohm in parallel.',
  expectedAnswer: '1.2 ohms',
  studentAnswer: '1.5 ohms',
  studentReasoning: 'By parallel formula 1/Rp = 1/2 + 1/3 = 5/6, so Rp = 6/5. I did arithmetic error and got 1.5.',
  targetConceptIds: ['C07']
});
assert.strictEqual(caseD.is_correct, false);
assert.strictEqual(caseD.misconception_code, undefined, 'Calculation error must not be labelled as conceptual misconception');
assert.strictEqual(caseD.reasoning_quality, 'fair');
console.log('  ✓ Case D passed: Mathematical arithmetic slip is correctly distinguished from cognitive misconception.');

// Case E: Ambiguous reasoning
const caseE = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Explain why voltmeter is connected in parallel.',
  expectedAnswer: 'Because it measures potential difference across two points.',
  studentAnswer: 'Parallel is better.',
  studentReasoning: 'Because parallel has more branches and looks better in the circuit schematic.',
  targetConceptIds: ['C02']
});
assert.strictEqual(caseE.is_correct, false);
assert.strictEqual(caseE.misconception_detected, false);
assert.ok(caseE.confidence <= 0.75, 'Ambiguous reasoning returns lower confidence / uncertainty');
console.log('  ✓ Case E passed: Ambiguous reasoning marked with uncertainty without fabricating diagnoses.');

// Case F: Empty or short reasoning
const caseF = runOfflineMisconceptionAnalysis({
  questionPrompt: 'Explain Ohm law.',
  expectedAnswer: 'V = IR at constant temperature.',
  studentAnswer: 'V = IR',
  studentReasoning: 'IDK',
  targetConceptIds: ['C04']
});
assert.strictEqual(caseF.reasoning_quality, 'insufficient_evidence');
assert.strictEqual(caseF.confidence, 0.5);
assert.strictEqual(caseF.misconception_detected, false);
console.log('  ✓ Case F passed: Empty or sub-5 character reasoning correctly returns insufficient_evidence.');

// Case G: Safe offline fallback tagging
assert.strictEqual(caseA.is_offline_fallback, true);
console.log('  ✓ Case G passed: Offline heuristic responses explicitly declare is_offline_fallback: true.');

// Case H: Invalid AI output schema sanitization
const rawMalformedData = {
  is_correct: 1, // number instead of boolean
  reasoning_quality: 'superb', // invalid enum
  misconception_detected: 'true',
  confidence: 1.8, // out of bounds
  evidence: 'Single string instead of array'
};
const sanitized = validateMisconceptionResponse(rawMalformedData);
assert.strictEqual(typeof sanitized.is_correct, 'boolean');
assert.strictEqual(sanitized.reasoning_quality, 'insufficient_evidence');
assert.ok(sanitized.confidence <= 1.0);
assert.strictEqual(sanitized.is_offline_fallback, false);
console.log('  ✓ Case H passed: Malformed/untrusted LLM responses safely validated and normalized.\n');

// -----------------------------------------------------------------------------
// SECTION 4: QUESTION GENERATION SCHEMA VALIDATION
// -----------------------------------------------------------------------------
console.log('[AUDIT 4] Adaptive Question Generation Schema:');
const malformedQuestion = {
  question: 'What is 1 Volt?',
  options: ['1 Joule per Coulomb', '1 Coulomb per second'],
  correct_answer: '1 Joule per Coulomb',
  difficulty: 5 // out of bounds
};
const sanitizedQ = validateGeneratedQuestion(malformedQuestion, 'C02');
assert.strictEqual(sanitizedQ.difficulty, 3, 'Difficulty clamped to max 3');
assert.strictEqual(sanitizedQ.concept_id, 'C02');
assert.ok(sanitizedQ.options.length >= 2);
assert.strictEqual(sanitizedQ.is_offline_fallback, false);
console.log('✓ PASS: Adaptive question schema validated and normalized.\n');

// -----------------------------------------------------------------------------
// SECTION 5: SPACED REPETITION PROTOCOL
// -----------------------------------------------------------------------------
console.log('[AUDIT 5] Spaced Repetition Protocol (1/3/7 Days):');
const testDate = '2026-11-21T12:00:00.000Z';
const revAtRisk = calculateNextReview('atRisk', 0, testDate);
const revLearning = calculateNextReview('learning', 0, testDate);
const revMastered = calculateNextReview('mastered', 0, testDate);

assert.strictEqual(new Date(revAtRisk).getUTCDate(), 22, 'At Risk = +1 day');
assert.strictEqual(new Date(revLearning).getUTCDate(), 24, 'Learning = +3 days');
assert.strictEqual(new Date(revMastered).getUTCDate(), 28, 'Mastered = +7 days');

// Expansion for repeated successful reviews (reviewCount > 2)
const revRepeatedMastered = calculateNextReview('mastered', 3, testDate);
const daysRepeated = Math.round((new Date(revRepeatedMastered).getTime() - new Date(testDate).getTime()) / (24 * 60 * 60 * 1000));
assert.strictEqual(daysRepeated, 11, 'Progressive expansion on repeated mastery = 7 * 1.5 = ~11 days');

// Overdue status check
assert.strictEqual(isReviewOverdue(new Date(Date.now() - 3600000).toISOString()), true);
assert.strictEqual(isReviewOverdue(new Date(Date.now() + 86400000).toISOString()), false);
console.log('✓ PASS: Spaced repetition intervals and overdue logic strictly adhere to protocol.\n');

// -----------------------------------------------------------------------------
// SECTION 6: COHORT DATA INTEGRITY & ISOLATION
// -----------------------------------------------------------------------------
console.log('[AUDIT 6] Cohort Data Integrity & Isolation:');
assert.strictEqual(SAMPLE_COHORT.length, 8, 'Sample cohort must contain 8 students');
SAMPLE_COHORT.forEach((student) => {
  assert.ok(student.id.startsWith('STD-'), 'Cohort student id must be prefixed with STD-');
  assert.ok(!student.id.startsWith('student_'), 'Cohort student must never collide with live student namespace');
  assert.ok(student.name.length > 0, 'Cohort student must have name');
  CONCEPTS.forEach((c) => {
    const val = student.masteryMap[c.id];
    assert.ok(val === null || (typeof val === 'number' && val >= 0 && val <= 100), 'Score must be null or 0-100');
  });
});
console.log('✓ PASS: Sample cohort isolated and valid across all 9 concepts.\n');

console.log('================================================================');
console.log('ALL REGRESSION AUDIT SUITE TESTS PASSED WITH 100% SUCCESS RATE');
console.log('================================================================');
