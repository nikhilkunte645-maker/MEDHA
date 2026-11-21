'use client';

import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnosticQuestions';
import { CONCEPTS } from '@/data/concepts';
import { Attempt, LearnerProfile, MisconceptionAnalysis } from '@/types/mastery';
import { calculateDiagnosticBaseline } from '@/lib/masteryEngine';
import { saveLearnerProfile, loadLearnerProfile } from '@/lib/storage';
import { AIFeedbackCard } from './AIFeedbackCard';
import {
  HelpCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  BarChart3,
  Layers,
  RotateCcw
} from 'lucide-react';

interface DiagnosticViewProps {
  onCompleteDiagnostic: () => void;
  onViewGraph: () => void;
}

export const DiagnosticView: React.FC<DiagnosticViewProps> = ({
  onCompleteDiagnostic,
  onViewGraph
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [writtenReasonings, setWrittenReasonings] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosticCompleted, setDiagnosticCompleted] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<MisconceptionAnalysis | null>(null);
  const [recordedAttempts, setRecordedAttempts] = useState<Attempt[]>([]);
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  const handleSelectOption = (option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleReasoningChange = (reasoning: string) => {
    setWrittenReasonings((prev) => ({
      ...prev,
      [currentQuestion.id]: reasoning
    }));
  };

  // Submit current question and evaluate AI reasoning
  const handleNextOrSubmit = async () => {
    const selected = selectedAnswers[currentQuestion.id];
    if (!selected) {
      alert('Please select an answer option before continuing.');
      return;
    }

    if (currentQuestion.reasoningRequired && (!writtenReasonings[currentQuestion.id] || writtenReasonings[currentQuestion.id].trim().length < 5)) {
      alert('Please provide a brief written explanation of your reasoning to evaluate conceptual understanding.');
      return;
    }

    setIsSubmitting(true);
    setEvaluatingQuestionId(currentQuestion.id);

    try {
      const reasoning = writtenReasonings[currentQuestion.id] || '';
      const isCorrect = selected.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

      // Call server-side diagnose-reasoning
      const res = await fetch('/api/diagnose-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPrompt: currentQuestion.prompt,
          expectedAnswer: currentQuestion.correctAnswer,
          studentAnswer: selected,
          studentReasoning: reasoning,
          targetConceptIds: currentQuestion.conceptIds
        })
      });

      const data = await res.json();
      const analysis: MisconceptionAnalysis = data.analysis;
      setLastAnalysis(analysis);

      // Create Attempt Record
      const newAttempt: Attempt = {
        id: `att_diag_${currentQuestion.id}_${Date.now()}`,
        learnerId: 'active_student',
        questionId: currentQuestion.id,
        selectedAnswer: selected,
        writtenReasoning: reasoning,
        isCorrect: analysis.is_correct,
        targetConceptIds: currentQuestion.conceptIds,
        difficulty: currentQuestion.difficulty,
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

      const updatedAttempts = [...recordedAttempts, newAttempt];
      setRecordedAttempts(updatedAttempts);

      // Advance or Finish
      if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setLastAnalysis(null);
      } else {
        // Complete Diagnostic Assessment!
        finishDiagnostic(updatedAttempts);
      }
    } catch (err) {
      console.error('Error during diagnostic question evaluation:', err);
    } finally {
      setIsSubmitting(false);
      setEvaluatingQuestionId(null);
    }
  };

  const finishDiagnostic = (allAttempts: Attempt[]) => {
    const profile = loadLearnerProfile();
    profile.attempts.push(...allAttempts);
    profile.diagnosticCompleted = true;

    // Calculate baseline mastery deterministically across all 8 concepts
    const conceptIds = CONCEPTS.map((c) => c.id);
    const baselineMap = calculateDiagnosticBaseline(allAttempts, conceptIds);
    profile.masteryMap = baselineMap;

    saveLearnerProfile(profile);
    setDiagnosticCompleted(true);
  };

  // Completion Screen
  if (diagnosticCompleted) {
    const profile = loadLearnerProfile();
    const weakConcepts = CONCEPTS.filter((c) => (profile.masteryMap[c.id]?.score || 0) < 40);
    const developingConcepts = CONCEPTS.filter((c) => {
      const s = profile.masteryMap[c.id]?.score || 0;
      return s >= 40 && s < 70;
    });
    const proficientConcepts = CONCEPTS.filter((c) => (profile.masteryMap[c.id]?.score || 0) >= 70);

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-4">
        <div className="bg-surface rounded-2xl border border-surface-border p-6 lg:p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-violet to-brand-cyan mx-auto flex items-center justify-center shadow-lg shadow-brand-violet/25">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>

          <h2 className="font-heading text-2xl lg:text-3xl font-extrabold text-white">
            Diagnostic Baseline Calibrated!
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            MASTERY has analyzed your answers and conceptual reasoning across all 8 Electricity concepts.
            Your baseline concept mastery graph has been generated.
          </p>

          {/* Quick Mastery Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
            {/* Weak Concepts */}
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
              <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 font-semibold block mb-1">
                Priority Gaps (&lt;40%)
              </span>
              <div className="text-xl font-bold text-white mb-2">
                {weakConcepts.length} Concept{weakConcepts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1">
                {weakConcepts.map((c) => (
                  <li key={c.id} className="text-xs text-red-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="font-mono">{c.code}:</span>
                    <span className="truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developing Concepts */}
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-1">
                Developing (40-69%)
              </span>
              <div className="text-xl font-bold text-white mb-2">
                {developingConcepts.length} Concept{developingConcepts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1">
                {developingConcepts.map((c) => (
                  <li key={c.id} className="text-xs text-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-mono">{c.code}:</span>
                    <span className="truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Proficient Concepts */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold block mb-1">
                Proficient (70%+)
              </span>
              <div className="text-xl font-bold text-white mb-2">
                {proficientConcepts.length} Concept{proficientConcepts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1">
                {proficientConcepts.map((c) => (
                  <li key={c.id} className="text-xs text-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-mono">{c.code}:</span>
                    <span className="truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <button
              onClick={onViewGraph}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface-border text-white text-sm font-semibold border border-surface-border transition-all"
            >
              <Layers className="w-4 h-4 text-brand-cyan" />
              <span>Inspect Concept Knowledge Graph</span>
            </button>
            <button
              onClick={onCompleteDiagnostic}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-sm font-bold shadow-lg shadow-brand-violet/25 hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Begin Adaptive Targeted Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Assessment Header / Progress */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-brand-violet font-bold">
              QUESTION {currentIndex + 1} OF {DIAGNOSTIC_QUESTIONS.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-slate-400 font-mono text-[10px]">
              Difficulty: {currentQuestion.difficulty}/3
            </span>
            <span className="px-2 py-0.5 rounded bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan font-mono text-[10px]">
              {currentQuestion.conceptIds.join(', ')}
            </span>
          </div>
          <span className="font-mono text-slate-400">{progressPercent}% Completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-surface-border overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-2xl space-y-6">
        <div>
          <span className="text-xs text-brand-cyan font-medium block mb-1">
            Learning Objective: {currentQuestion.learningObjective}
          </span>
          <h3 className="font-heading text-lg lg:text-xl font-bold text-white leading-relaxed">
            {currentQuestion.prompt}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option;
            const letter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-brand-violet/20 border-brand-violet text-white shadow-md shadow-brand-violet/20 font-medium'
                    : 'bg-background hover:bg-surface-elevated border-surface-border text-slate-300'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-brand-violet text-white'
                      : 'bg-surface-border text-slate-400'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm leading-normal">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Reasoning Text Input (Required for reasoning questions) */}
        {currentQuestion.reasoningRequired && (
          <div className="p-4 rounded-xl bg-background border border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                Explain Your Thinking & Reasoning (AI Evaluated):
              </label>
              <span className="text-[10px] text-brand-violet font-mono font-bold uppercase">
                Mandatory for Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Why did you select this option? If there is a calculation or physical law, write out your thought process.
            </p>
            <textarea
              rows={3}
              value={writtenReasonings[currentQuestion.id] || ''}
              onChange={(e) => handleReasoningChange(e.target.value)}
              placeholder="e.g. By Ohm's law V = IR, when temperature is constant... or because charge cannot be destroyed inside the lamp..."
              className="w-full rounded-lg bg-surface border border-surface-border p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet transition-colors resize-none"
            />
            {currentQuestion.hint && (
              <p className="text-[11px] text-amber-400/90 italic flex items-center gap-1">
                💡 Hint: {currentQuestion.hint}
              </p>
            )}
          </div>
        )}

        {/* Navigation & Submit Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-border">
          <button
            type="button"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <button
            type="button"
            disabled={isSubmitting || !selectedAnswers[currentQuestion.id]}
            onClick={handleNextOrSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Evaluating Reasoning...
              </span>
            ) : currentIndex === DIAGNOSTIC_QUESTIONS.length - 1 ? (
              <span className="flex items-center gap-1.5">
                Complete Diagnostic <Sparkles className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Submit & Next <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
