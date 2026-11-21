'use client';

import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnosticQuestions';
import { CONCEPTS } from '@/data/concepts';
import { Attempt, MisconceptionAnalysis } from '@/types/mastery';
import { calculateDiagnosticBaseline } from '@/lib/masteryEngine';
import { saveLearnerProfile, loadLearnerProfile } from '@/lib/storage';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Layers,
  Brain,
  Lightbulb
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
  const [recordedAttempts, setRecordedAttempts] = useState<Attempt[]>([]);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  const handleSelectOption = (option: string) => {
    setErrorBanner(null);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option
    }));
  };

  const handleReasoningChange = (reasoning: string) => {
    setErrorBanner(null);
    setWrittenReasonings((prev) => ({
      ...prev,
      [currentQuestion.id]: reasoning
    }));
  };

  const handleNextOrSubmit = async () => {
    const selected = selectedAnswers[currentQuestion.id];
    if (!selected) {
      setErrorBanner('Please select an answer option before continuing.');
      return;
    }

    if (currentQuestion.reasoningRequired && (!writtenReasonings[currentQuestion.id] || writtenReasonings[currentQuestion.id].trim().length < 5)) {
      setErrorBanner('Please write a brief explanation of your reasoning to enable conceptual diagnosis.');
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    try {
      const reasoning = writtenReasonings[currentQuestion.id] || '';

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
        misconceptionStatus: analysis.misconception_status,
        evidence: analysis.evidence,
        explanation: analysis.explanation,
        correctPrinciple: analysis.correct_principle,
        recommendedConceptIds: analysis.recommended_concept_ids,
        confidence: analysis.confidence,
        nextLearningAction: analysis.next_learning_action,
        isOfflineFallback: analysis.is_offline_fallback
      };

      const existingFiltered = recordedAttempts.filter((a) => a.questionId !== currentQuestion.id);
      const updatedAttempts = [...existingFiltered, newAttempt];
      setRecordedAttempts(updatedAttempts);

      if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        finishDiagnostic(updatedAttempts);
      }
    } catch (err) {
      console.error('Error during diagnostic evaluation:', err);
      setErrorBanner('Diagnostic evaluation service experienced a temporary network issue. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishDiagnostic = (allAttempts: Attempt[]) => {
    const profile = loadLearnerProfile();
    profile.attempts.push(...allAttempts);
    profile.diagnosticCompleted = true;

    const conceptIds = CONCEPTS.map((c) => c.id);
    const baselineMap = calculateDiagnosticBaseline(allAttempts, conceptIds);
    profile.masteryMap = baselineMap;

    saveLearnerProfile(profile);
    setDiagnosticCompleted(true);
  };

  if (diagnosticCompleted) {
    const profile = loadLearnerProfile();
    const atRiskConcepts = CONCEPTS.filter((c) => profile.masteryMap[c.id]?.status === 'atRisk');
    const learningConcepts = CONCEPTS.filter((c) => profile.masteryMap[c.id]?.status === 'learning');
    const masteredConcepts = CONCEPTS.filter((c) => profile.masteryMap[c.id]?.status === 'mastered');

    return (
      <div className="max-w-4xl mx-auto space-y-6 py-6">
        <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primaryContainer to-accent-secondaryContainer mx-auto flex items-center justify-center shadow-neonPrimary">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl lg:text-3xl font-extrabold text-text-primary">
              Diagnostic Baseline Successfully Calibrated
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
              MEDHA has evaluated your answers and conceptual reasoning across all 9 Electricity concepts. Your individualized prerequisite knowledge topology has been initialized.
            </p>
          </div>

          {/* 3 Status Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-left">
            {/* At Risk */}
            <div className="p-4 rounded-2xl bg-mastery-atRisk/10 border border-mastery-atRisk/30 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mastery-atRisk font-bold block">
                At Risk (&lt;50%)
              </span>
              <div className="text-xl font-bold font-heading text-text-primary">
                {atRiskConcepts.length} Concept{atRiskConcepts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1">
                {atRiskConcepts.map((c) => (
                  <li key={c.id} className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-mastery-atRisk"></span>
                    <span className="font-mono text-accent-primary font-bold">{c.code}:</span>
                    <span className="truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning */}
            <div className="p-4 rounded-2xl bg-mastery-learning/10 border border-mastery-learning/30 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mastery-learning font-bold block">
                Learning (50–79%)
              </span>
              <div className="text-xl font-bold font-heading text-text-primary">
                {learningConcepts.length} Concept{learningConcepts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1">
                {learningConcepts.map((c) => (
                  <li key={c.id} className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-mastery-learning"></span>
                    <span className="font-mono text-accent-primary font-bold">{c.code}:</span>
                    <span className="truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mastered */}
            <div className="p-4 rounded-2xl bg-mastery-mastered/10 border border-mastery-mastered/30 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mastery-mastered font-bold block">
                Mastered (≥80%)
              </span>
              <div className="text-xl font-bold font-heading text-text-primary">
                {masteredConcepts.length} Concept{masteredConcepts.length !== 1 ? 's' : ''}
              </div>
              <ul className="space-y-1">
                {masteredConcepts.map((c) => (
                  <li key={c.id} className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-mastery-mastered"></span>
                    <span className="font-mono text-accent-primary font-bold">{c.code}:</span>
                    <span className="truncate">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={onViewGraph}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-elevated hover:bg-surface-higher text-text-primary border border-outline-variant/60 font-semibold text-xs transition-all"
            >
              <Layers className="w-4 h-4 text-accent-secondary" />
              <span>Inspect Concept Graph</span>
            </button>
            <button
              onClick={onCompleteDiagnostic}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white font-bold text-xs shadow-neonPrimary hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Begin Adaptive Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Question Progress Header */}
      <div className="bg-surface rounded-3xl border border-outline-variant/40 p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-accent-primary">
              QUESTION {currentIndex + 1} OF {DIAGNOSTIC_QUESTIONS.length}
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-elevated border border-outline-variant/30 text-text-secondary font-mono text-[10px]">
              Difficulty Level {currentQuestion.difficulty}/3
            </span>
            <span className="px-2 py-0.5 rounded bg-accent-secondary/15 border border-accent-secondary/30 text-accent-secondary font-mono text-[10px]">
              {currentQuestion.conceptIds.join(', ')}
            </span>
          </div>
          <span className="font-mono text-text-secondary">{progressPercent}% Completed</span>
        </div>

        <div className="w-full h-2 rounded-full bg-surface-deep overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-mono text-accent-secondary block mb-1">
            Learning Objective: {currentQuestion.learningObjective}
          </span>
          <h3 className="font-heading text-lg lg:text-xl font-bold text-text-primary leading-relaxed">
            {currentQuestion.prompt}
          </h3>
        </div>

        {/* Error Banner */}
        {errorBanner && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-mastery-atRisk/15 border border-mastery-atRisk/40 text-mastery-atRisk text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-mastery-atRisk" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-text-secondary hover:text-text-primary text-xs underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Options Selection */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option;
            const letter = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(option)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-accent-primaryContainer/20 border-accent-primary text-text-primary shadow-neonPrimary font-semibold'
                    : 'bg-surface-elevated hover:bg-surface-higher border-outline-variant/40 text-text-secondary'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-accent-primaryContainer text-white'
                      : 'bg-surface text-text-secondary border border-outline-variant/40'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm leading-normal">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Reasoning Text Input */}
        {currentQuestion.reasoningRequired && (
          <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-accent-primary" />
                Explain Your Thinking & Reasoning:
              </label>
              <span className="text-[10px] text-accent-primary font-mono font-bold uppercase">
                AI Diagnostic Input
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Why did you select this option? If there is a calculation or physical law, write out your thought process.
            </p>
            <textarea
              rows={3}
              value={writtenReasonings[currentQuestion.id] || ''}
              onChange={(e) => handleReasoningChange(e.target.value)}
              placeholder="e.g. By Ohm's law V = IR, when temperature is constant... or because charge cannot be destroyed inside the lamp..."
              className="w-full rounded-xl bg-surface border border-outline-variant/40 p-3 text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary transition-colors resize-none"
            />
            {currentQuestion.hint && (
              <p className="text-[11px] text-mastery-learning italic flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-mastery-learning" /> Hint: {currentQuestion.hint}
              </p>
            )}
          </div>
        )}

        {/* Navigation & Submit Action */}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
          <button
            type="button"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <button
            type="button"
            disabled={isSubmitting || !selectedAnswers[currentQuestion.id]}
            onClick={handleNextOrSubmit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-neonPrimary transition-all"
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
