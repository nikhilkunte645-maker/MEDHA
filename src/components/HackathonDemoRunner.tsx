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
  X,
  Target,
  Brain,
  Layers,
  HelpCircle
} from 'lucide-react';

interface HackathonDemoRunnerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: string, conceptId?: string) => void;
  onComplete?: () => void;
}

export const HackathonDemoRunner: React.FC<HackathonDemoRunnerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onComplete
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
        headers: {
          'Content-Type': 'application/json',
          'x-medha-demo': 'true'
        },
        credentials: 'include',
        body: JSON.stringify({
          questionPrompt: demoQuestion.prompt,
          expectedAnswer: demoQuestion.expectedAnswer,
          studentAnswer: demoQuestion.studentAnswer,
          studentReasoning: demoQuestion.studentReasoning,
          targetConceptIds: demoQuestion.conceptIds
        })
      });

      const data = await res.json();
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || 'Demo reasoning diagnosis failed');
      }

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

  const handleFinish = () => {
    if (onComplete) onComplete();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-float max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent-primary text-white flex items-center justify-center shadow-sm">
              <Play className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-text-primary">
                MEDHA 60s Interactive Walkthrough
              </h3>
              <p className="text-xs text-text-secondary">
                Step-by-step verification of the 7-stage learning intelligence loop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Step Pill Tracker */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
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
                  ? 'bg-accent-primary text-white font-bold shadow-sm'
                  : currentStep > s.num
                  ? 'bg-mastery-masteredLight text-mastery-mastered border border-mastery-mastered/30 font-semibold'
                  : 'bg-canvas text-text-muted border border-outline-variant'
              }`}
            >
              {s.num}. {s.label}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-5 rounded-2xl bg-canvas border border-outline-variant space-y-4">
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-secondary font-mono">
                <span>SCENARIO STEP 1: Assessment Question</span>
                <span>Concepts: C01, C02</span>
              </div>
              <h4 className="text-sm font-semibold text-text-primary leading-relaxed">
                {demoQuestion.prompt}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                The student faces a fundamental physical dilemma: distinguishing between electric current (rate of flow of charge) and potential difference (energy push per unit charge).
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt flex items-center gap-1.5"
                >
                  <span>Next: Student Submits Flawed Reasoning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-warm font-mono">
                <span>SCENARIO STEP 2: Reasoning Capture</span>
                <span>Submitting to AI Diagnosis</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface border border-outline-variant text-xs text-text-primary italic">
                &ldquo;{demoQuestion.studentReasoning}&rdquo;
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                A conventional multiple-choice quiz would just mark this incorrect. MEDHA passes the written reasoning to the diagnostic engine to isolate the mental model failure.
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleExecuteReasoningDiagnosis}
                  disabled={isExecuting}
                  className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt flex items-center gap-2"
                >
                  {isExecuting ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      <span>Running Cognitive Diagnosis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Diagnose Reasoning with AI</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-mastery-atRisk font-mono">
                <span>SCENARIO STEP 3: Cognitive Diagnosis Result</span>
                <span>{analysisResult?.is_offline_fallback ? 'Verified Heuristic' : 'Live Gemini 2.5'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-mastery-atRiskLight/60 border border-mastery-atRisk/30 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-mastery-atRisk block">
                  Identified Misconception:
                </span>
                <p className="text-xs font-bold text-text-primary">
                  {analysisResult?.misconception_title || 'Current-as-Consumable-Energy Fallacy'}
                </p>
                <p className="text-xs text-text-secondary leading-relaxed pt-1">
                  {analysisResult?.explanation}
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt flex items-center gap-1.5"
                >
                  <span>Next: Update Evidence-Based Mastery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-secondary font-mono">
                <span>SCENARIO STEP 4: Bayesian Moving-Average Mastery</span>
                <span>Inertia & Dampening</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Unlike primitive platforms that overwrite a score based on a single click, MEDHA updates concept mastery using mathematical inertia:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-surface border border-outline-variant">
                  <span className="text-text-muted text-[10px] block">C01 (Charge & Current)</span>
                  <span className="text-mastery-atRisk font-bold text-lg block">35% At Risk</span>
                  <span className="text-text-muted text-[10px]">Misconception flagged</span>
                </div>
                <div className="p-3 rounded-xl bg-surface border border-outline-variant">
                  <span className="text-text-muted text-[10px] block">C02 (Potential Difference)</span>
                  <span className="text-mastery-learning font-bold text-lg block">52% Developing</span>
                  <span className="text-text-muted text-[10px]">Partial understanding</span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt flex items-center gap-1.5"
                >
                  <span>Next: Propagate to Topology Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-primary font-mono">
                <span>SCENARIO STEP 5: Knowledge Dependency Topology</span>
                <span>DAG Propagation</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Because C01 is at risk, MEDHA&apos;s prerequisite graph restricts advancing to C04 (Ohm&apos;s Law) and C06 (Resistors in Series) until C01 is stabilized.
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt flex items-center gap-1.5"
                >
                  <span>Next: Targeted Remediation Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-accent-secondary font-mono">
                <span>SCENARIO STEP 6: Dynamic Remediation Generation</span>
                <span>Calibrated Question</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                MEDHA generates a targeted counter-question aimed specifically at breaking the &quot;used up current&quot; misconception.
              </p>
              <div className="p-3 rounded-xl bg-surface border border-outline-variant text-xs space-y-1">
                <span className="font-bold text-text-primary block">
                  &quot;If an ammeter is placed before an electric bulb and another after it in series, what will the two ammeters read?&quot;
                </span>
                <span className="text-[11px] text-mastery-mastered font-medium block">
                  Correct Insight: They read identical current, demonstrating charge conservation.
                </span>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setCurrentStep(7)}
                  className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt flex items-center gap-1.5"
                >
                  <span>Next: Teacher Analytics Feedback Loop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-mastery-mastered font-mono">
                <span>SCENARIO STEP 7: Teacher Cohort Feedback Loop</span>
                <span>Class Telemetry</span>
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
              <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                <button
                  onClick={handleLoadPreparedDemoProfile}
                  className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Demo State</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt"
                >
                  Complete Walkthrough
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};