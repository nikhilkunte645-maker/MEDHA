'use client';

import React, { useState } from 'react';
import { loadPreparedDemoLearner, recordAttemptAndUpdateMastery } from '@/lib/storage';
import { Attempt, MisconceptionAnalysis } from '@/types/mastery';
import {
  Play,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-react';

interface HackathonDemoRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string, conceptId?: string) => void;
}

export const HackathonDemoRunner: React.FC<HackathonDemoRunnerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<MisconceptionAnalysis | null>(null);

  if (!isOpen) return null;

  const demoQuestion = {
    id: 'DEMO_Q01',
    conceptIds: ['C01', 'C02'],
    prompt: 'Two copper wires connect a 6V battery to an electric lamp. A student says: "Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return to the battery."',
    options: [
      'The statement is correct; energy is lost so current decreases.',
      'The statement is false; voltage is the push and electric charge is strictly conserved.',
      'The statement is false; voltage increases across the lamp to keep current constant.',
      'The statement is correct; electrons are converted into light energy.'
    ],
    studentAnswer: 'The statement is correct; energy is lost so current decreases.',
    expectedAnswer: 'The statement is false; voltage is the push and electric charge is strictly conserved.',
    studentReasoning: 'Current is the electrical push from the battery that gets used up as it passes through the lamp so fewer electrons return to the negative terminal.'
  };

  const handleExecuteReasoningDiagnosis = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch('/api/diagnose-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPrompt: demoQuestion.prompt,
          expectedAnswer: demoQuestion.expectedAnswer,
          studentAnswer: demoQuestion.studentAnswer,
          studentReasoning: demoQuestion.studentReasoning,
          targetConceptIds: demoQuestion.conceptIds
        })
      });

      const data = await res.json();
      const analysis: MisconceptionAnalysis = data.analysis;
      setAnalysisResult(analysis);

      const attempt: Attempt = {
        id: `att_demo_${Date.now()}`,
        learnerId: 'active_student',
        questionId: demoQuestion.id,
        selectedAnswer: demoQuestion.studentAnswer,
        writtenReasoning: demoQuestion.studentReasoning,
        isCorrect: analysis.is_correct,
        targetConceptIds: ['C01', 'C02'],
        difficulty: 2,
        timestamp: new Date().toISOString(),
        reasoningQuality: analysis.reasoning_quality,
        misconceptionDetected: analysis.misconception_detected,
        misconceptionCode: analysis.misconception_code,
        misconceptionTitle: analysis.misconception_title,
        misconceptionStatus: 'detected',
        evidence: analysis.evidence,
        explanation: analysis.explanation,
        correctPrinciple: analysis.correct_principle,
        recommendedConceptIds: analysis.recommended_concept_ids,
        confidence: analysis.confidence,
        nextLearningAction: analysis.next_learning_action,
        isOfflineFallback: analysis.is_offline_fallback
      };

      recordAttemptAndUpdateMastery(attempt);
      setCurrentStep(3);
    } catch (err) {
      console.error('Error executing demo diagnosis:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLoadPreparedDemoProfile = () => {
    loadPreparedDemoLearner();
    setCurrentStep(4);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-elevated border border-outline-variant rounded-3xl p-6 lg:p-7 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                MEDHA Interactive Demo Walkthrough
              </h3>
              <p className="text-xs text-text-secondary">
                Step-by-step verification of the 7-stage learning intelligence loop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Pill Tracker */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
          {[
            { num: 1, label: 'Prompt' },
            { num: 2, label: 'Reasoning' },
            { num: 3, label: 'AI Diagnosis' },
            { num: 4, label: 'Mastery Update' },
            { num: 5, label: 'Concept Graph' },
            { num: 6, label: 'Targeted Q' },
            { num: 7, label: 'Teacher Gap' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                currentStep === s.num
                  ? 'bg-accent-primaryContainer text-white font-bold'
                  : currentStep > s.num
                  ? 'bg-mastery-mastered/20 text-mastery-mastered border border-mastery-mastered/40'
                  : 'bg-surface-deep text-text-secondary border border-outline-variant/30'
              }`}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-4">
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-secondary font-mono">
                <span>SCENARIO STEP 1: Assessment Question</span>
                <span>Concepts: C01, C02</span>
              </div>
              <h4 className="text-sm font-semibold text-text-primary leading-relaxed">
                {demoQuestion.prompt}
              </h4>
              <p className="text-xs text-text-secondary">
                The student faces a fundamental physical dilemma: distinguishing between electric current (rate of flow of charge) and potential difference (energy push per unit charge).
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Student Submits Flawed Reasoning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-mastery-learning font-mono">
                <span>SCENARIO STEP 2: Submitted Flawed Reasoning</span>
                <span>Latent Misconception Present</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/30 text-xs text-text-secondary space-y-1">
                <span className="text-[10px] font-mono uppercase text-text-secondary">Chosen Option:</span>
                <p className="font-semibold text-mastery-atRisk">{demoQuestion.studentAnswer}</p>
                <span className="text-[10px] font-mono uppercase text-text-secondary block pt-1">Written Reasoning:</span>
                <p className="italic text-text-primary bg-surface-deep p-2 rounded-lg border border-outline-variant/20">
                  &ldquo;{demoQuestion.studentReasoning}&rdquo;
                </p>
              </div>

              <p className="text-xs text-text-secondary">
                A conventional tutor simply marks this incorrect. MEDHA evaluates the reasoning step-by-step using Google Gemini 2.5 Flash to extract evidence and isolate the cognitive error.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  disabled={isExecuting}
                  onClick={handleExecuteReasoningDiagnosis}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white text-xs font-bold flex items-center gap-2 shadow-neonPrimary"
                >
                  {isExecuting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Evaluating with Gemini AI...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Run AI Misconception Diagnosis
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-primary font-mono">
                <span>SCENARIO STEP 3: Structured AI Diagnosis</span>
                <span>Confidence: 94%</span>
              </div>

              <div className="p-4 rounded-2xl bg-mastery-atRisk/15 border border-mastery-atRisk/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-mastery-atRisk font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Misconception Detected: CURRENT_VOLTAGE_CONFUSION</span>
                </div>
                <p className="text-text-secondary">
                  {analysisResult?.explanation ||
                    'The student confuses electric current (the rate of flow of charge) with electric potential difference (the energy push per unit charge), and incorrectly assumes charges are consumed.'}
                </p>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-mono text-mastery-learning font-bold block mb-1">
                    Extracted Verbatim Evidence:
                  </span>
                  <p className="italic text-text-primary bg-surface p-2 rounded-lg border border-outline-variant/20">
                    &ldquo;Current is the electrical push from the battery that gets used up&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Apply Deterministic Mastery Update</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-secondary font-mono">
                <span>SCENARIO STEP 4: Deterministic Engine Execution</span>
                <span>Rule-Based Telemetry</span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                The deterministic engine receives the AI diagnosis. Because a genuine misconception was confirmed at difficulty level 2 with flawed reasoning, C01 & C02 mastery is reduced by 12 points, transitioning both to <strong>At Risk (&lt;50%)</strong>:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-surface border border-mastery-atRisk/40 text-center">
                  <span className="text-text-secondary block text-[10px]">C01: Electric Current</span>
                  <span className="text-lg font-bold text-mastery-atRisk">36% (At Risk)</span>
                  <span className="text-[10px] text-mastery-atRisk block mt-0.5">Demoted to Red</span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-mastery-atRisk/40 text-center">
                  <span className="text-text-secondary block text-[10px]">C02: Potential Difference</span>
                  <span className="text-lg font-bold text-mastery-atRisk">34% (At Risk)</span>
                  <span className="text-[10px] text-mastery-atRisk block mt-0.5">Demoted to Red</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Concept Graph Propagation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-primary font-mono">
                <span>SCENARIO STEP 5: Knowledge Topology Telemetry</span>
                <span>Prerequisite DAG</span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                In the Knowledge Topology, nodes <strong>C01</strong> and <strong>C02</strong> switch to red with pulsing halos. Because they are prerequisites for C03 (Circuits) and C04 (Ohm&apos;s Law), downstream concepts are flagged as vulnerable.
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('graph');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/40 text-accent-secondary text-xs font-semibold"
                >
                  Inspect Live Graph
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Synthesize Targeted Remediation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-secondary font-mono">
                <span>SCENARIO STEP 6: Targeted Adaptive Question</span>
                <span>Target: C01 (Charge Conservation)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/30 text-xs space-y-1">
                <span className="text-[10px] font-mono text-accent-secondary font-bold uppercase block">
                  Synthesized Question:
                </span>
                <p className="font-semibold text-text-primary">
                  A current of 0.75 A is drawn by a filament of an electric lamp for 20 minutes. Find the amount of electric charge that flows through the circuit.
                </p>
                <p className="text-text-secondary text-[11px] pt-1">
                  Correct Answer: 900 C (testing Q = I × t with explicit seconds conversion).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('workspace', 'C01');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface border border-outline-variant/40 text-accent-secondary text-xs font-semibold"
                >
                  Practice in Learning Workspace
                </button>
                <button
                  onClick={() => setCurrentStep(7)}
                  className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Cohort Teacher Gap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-mastery-mastered font-mono">
                <span>SCENARIO STEP 7: Teacher Cohort Feedback Loop</span>
                <span>Pedagogical Action</span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                The learning gap is immediately reflected in the Teacher Dashboard heatmap across the class:
              </p>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mastery-mastered shrink-0" />
                  <span><strong>Misconception Distribution:</strong> 4 students in Class 10-A identified with Current/Voltage confusion.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-mastery-mastered shrink-0" />
                  <span><strong>Teacher Action Plan:</strong> Recommends a physical two-ammeter circuit demonstration in laboratory.</span>
                </li>
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                <button
                  onClick={handleLoadPreparedDemoProfile}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-text-secondary hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Load Demo State
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('teacher');
                    }}
                    className="px-4 py-2 rounded-xl bg-accent-secondary/20 border border-accent-secondary text-accent-secondary text-xs font-bold"
                  >
                    Open Teacher Dashboard
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold"
                  >
                    Finish Walkthrough
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
