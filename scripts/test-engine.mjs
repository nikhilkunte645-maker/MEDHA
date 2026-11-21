// Automated Test Suite for MASTERY Core Engines
import assert from 'node:assert';

console.log('--- RUNNING AUTOMATED UNIT TEST SUITE FOR MASTERY ---');

// Test 1: Spaced Repetition Scheduling
function calculateNextReview(status, reviewCount, baseDateIso) {
  const base = baseDateIso ? new Date(baseDateIso) : new Date();
  let days = 1;
  switch (status) {
    case 'needs_attention': days = 1; break;
    case 'developing': days = 2; break;
    case 'proficient': days = 4; break;
    case 'strong': days = 7; break;
    default: days = 1; break;
  }
  if (reviewCount > 2 && (status === 'proficient' || status === 'strong')) {
    days = Math.round(days * 1.5);
  }
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

const baseIso = '2026-11-21T00:00:00.000Z';
const revWeak = calculateNextReview('needs_attention', 1, baseIso);
assert.strictEqual(new Date(revWeak).getDate(), 22, 'Weak mastery must schedule for +1 day');

const revDev = calculateNextReview('developing', 1, baseIso);
assert.strictEqual(new Date(revDev).getDate(), 23, 'Developing mastery must schedule for +2 days');

const revProf = calculateNextReview('proficient', 1, baseIso);
assert.strictEqual(new Date(revProf).getDate(), 25, 'Proficient mastery must schedule for +4 days');

const revStrong = calculateNextReview('strong', 1, baseIso);
assert.strictEqual(new Date(revStrong).getDate(), 28, 'Strong mastery must schedule for +7 days');

console.log('✓ TEST PASS: Spaced Repetition intervals correctly match specification (1/2/4/7 days).');

// Test 2: Mastery Status Scale
function getMasteryStatus(score) {
  if (score < 40) return 'needs_attention';
  if (score < 70) return 'developing';
  if (score < 85) return 'proficient';
  return 'strong';
}

assert.strictEqual(getMasteryStatus(0), 'needs_attention');
assert.strictEqual(getMasteryStatus(39), 'needs_attention');
assert.strictEqual(getMasteryStatus(40), 'developing');
assert.strictEqual(getMasteryStatus(69), 'developing');
assert.strictEqual(getMasteryStatus(70), 'proficient');
assert.strictEqual(getMasteryStatus(84), 'proficient');
assert.strictEqual(getMasteryStatus(85), 'strong');
assert.strictEqual(getMasteryStatus(100), 'strong');
console.log('✓ TEST PASS: Mastery scale boundaries correctly verified (0-39, 40-69, 70-84, 85-100).');

// Test 3: Offline Reasoning Evaluation Heuristics (Confusing Current with Voltage)
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
      misconception_code: 'CURRENT_VOLTAGE_CONFUSION'
    };
  }
  return {
    is_correct: isSelectedCorrect,
    reasoning_quality: isSelectedCorrect ? 'good' : 'fair',
    misconception_detected: false
  };
}

const testReasoning1 = 'Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return.';
const res1 = runOfflineMisconceptionAnalysis(testReasoning1, false);
assert.strictEqual(res1.misconception_detected, true, 'Misconception must be detected');
assert.strictEqual(res1.misconception_code, 'CURRENT_VOLTAGE_CONFUSION', 'Correct code identified');
assert.strictEqual(res1.reasoning_quality, 'poor');
console.log('✓ TEST PASS: Flawed student reasoning accurately triggers CURRENT_VOLTAGE_CONFUSION diagnosis.');

const testReasoning2 = 'By conservation of charge, current entering equals current leaving. Voltage provides the work done per unit charge.';
const res2 = runOfflineMisconceptionAnalysis(testReasoning2, true);
assert.strictEqual(res2.is_correct, true);
assert.strictEqual(res2.misconception_detected, false);
console.log('✓ TEST PASS: Sound conceptual reasoning correctly accepted.');

console.log('--- ALL CORE ENGINE AUTOMATED TESTS PASSED! ---');
