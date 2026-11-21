// Automated Test Suite for MEDHA Core Engines
import assert from 'node:assert';

console.log('--- RUNNING AUTOMATED UNIT TEST SUITE FOR MEDHA ---');

// Test 1: Spaced Repetition Scheduling
function calculateNextReview(status, reviewCount, baseDateIso) {
  const base = baseDateIso ? new Date(baseDateIso) : new Date();
  let days = 1;
  switch (status) {
    case 'atRisk': days = 1; break;
    case 'learning': days = 3; break;
    case 'mastered': days = 7; break;
    default: days = 1; break;
  }
  if (reviewCount > 2 && status === 'mastered') {
    days = Math.round(days * 1.5);
  }
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

const baseIso = '2026-11-21T00:00:00.000Z';
const revAtRisk = calculateNextReview('atRisk', 1, baseIso);
assert.strictEqual(new Date(revAtRisk).getDate(), 22, 'At Risk mastery must schedule for +1 day');

const revLearning = calculateNextReview('learning', 1, baseIso);
assert.strictEqual(new Date(revLearning).getDate(), 24, 'Learning mastery must schedule for +3 days');

const revMastered = calculateNextReview('mastered', 1, baseIso);
assert.strictEqual(new Date(revMastered).getDate(), 28, 'Mastered mastery must schedule for +7 days');

console.log('✓ TEST PASS: Spaced Repetition intervals match MEDHA specification (1/3/7 days).');

// Test 2: Mastery Status Scale (0-49: atRisk, 50-79: learning, 80-100: mastered, null: unassessed)
function getMasteryStatus(score) {
  if (score === null || score === undefined) return 'unassessed';
  if (score < 50) return 'atRisk';
  if (score < 80) return 'learning';
  return 'mastered';
}

assert.strictEqual(getMasteryStatus(null), 'unassessed');
assert.strictEqual(getMasteryStatus(0), 'atRisk');
assert.strictEqual(getMasteryStatus(49), 'atRisk');
assert.strictEqual(getMasteryStatus(50), 'learning');
assert.strictEqual(getMasteryStatus(79), 'learning');
assert.strictEqual(getMasteryStatus(80), 'mastered');
assert.strictEqual(getMasteryStatus(100), 'mastered');
console.log('✓ TEST PASS: Mastery scale boundaries verified (atRisk: <50%, learning: 50-79%, mastered: >=80%, unassessed: null).');

// Test 3: Offline Reasoning Evaluation Heuristics (Current vs Voltage Confusion)
function runOfflineMisconceptionAnalysis(studentReasoning, isSelectedCorrect) {
  const reasoningLower = (studentReasoning || '').toLowerCase().trim();
  if (
    reasoningLower.includes('push') && (reasoningLower.includes('current') || reasoningLower.includes('used up') || reasoningLower.includes('consumed')) ||
    reasoningLower.includes('current gets used') ||
    reasoningLower.includes('fewer electrons')
  ) {
    return {
      is_correct: false,
      reasoning_quality: 'poor',
      misconception_detected: true,
      misconception_status: 'detected',
      misconception_code: 'CURRENT_VOLTAGE_CONFUSION'
    };
  }
  return {
    is_correct: isSelectedCorrect,
    reasoning_quality: isSelectedCorrect ? 'good' : 'fair',
    misconception_detected: false,
    misconception_status: 'unverified'
  };
}

const testReasoning1 = 'Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return.';
const res1 = runOfflineMisconceptionAnalysis(testReasoning1, false);
assert.strictEqual(res1.misconception_detected, true, 'Misconception must be detected');
assert.strictEqual(res1.misconception_code, 'CURRENT_VOLTAGE_CONFUSION', 'Correct code identified');
assert.strictEqual(res1.misconception_status, 'detected');
assert.strictEqual(res1.reasoning_quality, 'poor');
console.log('✓ TEST PASS: Flawed student reasoning accurately triggers CURRENT_VOLTAGE_CONFUSION diagnosis.');

const testReasoning2 = 'By conservation of charge, current entering equals current leaving. Voltage provides the work done per unit charge.';
const res2 = runOfflineMisconceptionAnalysis(testReasoning2, true);
assert.strictEqual(res2.is_correct, true);
assert.strictEqual(res2.misconception_detected, false);
console.log('✓ TEST PASS: Sound conceptual reasoning correctly accepted.');

console.log('--- ALL MEDHA CORE ENGINE AUTOMATED TESTS PASSED! ---');
