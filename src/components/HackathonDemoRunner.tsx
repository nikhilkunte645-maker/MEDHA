'use client';

import React, { useState } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { loadPreparedDemoLearner, recordAttemptAndUpdateMastery } from '@/lib/storage';
import { Attempt, MisconceptionAnalysis } from '@/types/mastery';
import {
  Play,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Calendar,
  Users,
  ShieldAlert,
  Brain,
  RotateCcw
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

  // Step 1 & 2 Demo Question & Reasoning
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

      // Record in storage and update deterministic mastery engine
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
        evidence: analysis.evidence,
        explanation: analysis.explanation,
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
      <div className="bg-surface-elevated border border-surface-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-violet to-brand-cyan flex items-center justify-center text-white">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Hackathon Demo Scenario Runner (Section 18)
              </h3>
              <p className="text-xs text-slate-400">
                Step-by-step interactive verification of the 7-stage learning intelligence loop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-surface"
          >
            ✕
          </button>
        </div>

        {/* 7-Step Progress Pill Tracker */}
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
                  ? 'bg-brand-violet text-white font-bold'
                  : currentStep > s.num
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                  : 'bg-background text-slate-500 border border-surface-border'
              }`}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>

        {/* STEP CONTENT */}
        <div className="p-4 rounded-xl bg-background border border-surface-border space-y-4">
          {/* STEP 1: Question Presentation */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-brand-cyan font-mono">
                <span>SCENARIO STEP 1: Assessment Question</span>
                <span>Concepts: C01, C02</span>
              </div>
              <h4 className="text-sm font-semibold text-white leading-relaxed">
                {demoQuestion.prompt}
              </h4>
              <p className="text-xs text-slate-400">
                The student is presented with a fundamental dilemma testing the distinction between electric current (rate of charge flow) and potential difference (energy push per charge).
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Student Submits Flawed Reasoning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Flawed Reasoning Submission */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                <span>SCENARIO STEP 2: Submitted Flawed Student Reasoning</span>
                <span>Misconception Clues Present</span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-surface-border text-xs text-slate-300 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-500">Student Option:</span>
                <p className="font-semibold text-red-300">{demoQuestion.studentAnswer}</p>
                <span className="text-[10px] font-mono uppercase text-slate-500 block pt-1">Student Reasoning:</span>
                <p className="italic text-slate-200 bg-background/60 p-2 rounded border border-surface-border/50">
                  &ldquo;{demoQuestion.studentReasoning}&rdquo;
                </p>
              </div>

              <p className="text-xs text-slate-400">
                Unlike a generic tutor which would simply say &quot;Incorrect! The answer is B&quot;, MASTERY will send this reasoning to the server-side Gemini diagnostic engine to extract evidence and identify the cognitive flaw.
              </p>

              <div className="flex justify-end pt-2">
                <button
                  disabled={isExecuting}
                  onClick={handleExecuteReasoningDiagnosis}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand-violet/25"
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

          {/* STEP 3: AI Diagnosis Output */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-brand-violet font-mono">
                <span>SCENARIO STEP 3: Structured AI Diagnosis</span>
                <span>Confidence: 94%</span>
              </div>

              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Misconception Detected: CURRENT_VOLTAGE_CONFUSION</span>
                </div>
                <p className="text-slate-300">
                  {analysisResult?.explanation ||
                    'The student confuses electric current (the rate of flow of charge) with electric potential difference (the energy push per unit charge), and incorrectly assumes charges are consumed.'}
                </p>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold block mb-1">
                    Extracted Reasoning Evidence:
                  </span>
                  <ul className="space-y-1 text-slate-300">
                    <li className="flex items-start gap-1">
                      <span className="text-brand-violet font-bold">•</span>
                      <span>&quot;Current is the electrical push from the battery that gets used up&quot;</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Apply Deterministic Mastery Update</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Deterministic Mastery Update */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-brand-cyan font-mono">
                <span>SCENARIO STEP 4: Deterministic Engine Execution</span>
                <span>Rule-Based Telemetry</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The deterministic mastery engine receives the diagnosis. Because this was a confirmed conceptual misconception at difficulty level 2 with poor reasoning, the engine reduces C01 & C02 mastery by -12 points:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-surface border border-red-500/30 text-center">
                  <span className="text-slate-400 block text-[10px]">C01: Electric Current</span>
                  <span className="text-lg font-bold text-red-400">36% (Needs Attention)</span>
                  <span className="text-[10px] text-red-400/80 block mt-1">Status: Demoted to Red</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-red-500/30 text-center">
                  <span className="text-slate-400 block text-[10px]">C02: Potential Difference</span>
                  <span className="text-lg font-bold text-red-400">34% (Needs Attention)</span>
                  <span className="text-[10px] text-red-400/80 block mt-1">Status: Demoted to Red</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: View Concept Graph Propagation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Concept Graph Propagation */}
          {currentStep === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-brand-violet font-mono">
                <span>SCENARIO STEP 5: Concept Graph Telemetry</span>
                <span>Prerequisite DAG</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                In the Concept Knowledge Graph, nodes <strong>C01</strong> and <strong>C02</strong> transition to red with pulsating attention halos. Since C01 and C02 are direct prerequisites for <strong>C03 (Circuits)</strong> and <strong>C04 (Ohm&apos;s Law)</strong>, the graph flags downstream concepts as conditionally at risk.
              </p>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('graph');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border hover:bg-surface-elevated text-brand-cyan text-xs font-semibold"
                >
                  Inspect Live Graph View
                </button>
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Synthesize Targeted Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Targeted Question Generation */}
          {currentStep === 6 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-brand-cyan font-mono">
                <span>SCENARIO STEP 6: Targeted Adaptive Question</span>
                <span>Target: C01 (Charge Conservation)</span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-surface-border text-xs space-y-1">
                <span className="text-[10px] font-mono text-brand-cyan font-bold uppercase block">
                  Synthesized Question:
                </span>
                <p className="font-semibold text-white">
                  A current of 0.75 A is drawn by a filament of an electric lamp for 20 minutes. Find the amount of electric charge that flows through the circuit.
                </p>
                <p className="text-slate-400 text-[11px] pt-1">
                  Correct Answer: 900 C (testing Q = I × t with explicit seconds conversion).
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTab('workspace', 'C01');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface border border-surface-border text-brand-cyan text-xs font-semibold"
                >
                  Practice in Learning Workspace
                </button>
                <button
                  onClick={() => setCurrentStep(7)}
                  className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Next: Inspect Cohort Teacher Gap</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Teacher Dashboard Reflection */}
          {currentStep === 7 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span>SCENARIO STEP 7: Complete Pedagogical Feedback Loop</span>
                <span>Teacher Cohort Aggregation</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                The learning gap is immediately reflected in the Teacher Analytics Dashboard. The teacher sees:
              </p>
              <ul className="space-y-1 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Misconception Distribution:</strong> 4 students identified with Current/Voltage confusion.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span><strong>Actionable Recommendation:</strong> Suggests conducting a hands-on ammeter circuit demonstration in class.</span>
                </li>
              </ul>

              <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                <button
                  onClick={handleLoadPreparedDemoProfile}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Load Demo Learner State
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToTab('teacher');
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-cyan/20 border border-brand-cyan text-brand-cyan text-xs font-bold hover:bg-brand-cyan/30"
                  >
                    Open Teacher Analytics
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold"
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
