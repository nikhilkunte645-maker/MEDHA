'use client';

import React, { useState } from 'react';
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnosticQuestions';
import { CONCEPTS } from '@/data/concepts';
import { Attempt, MisconceptionAnalysis } from '@/types/mastery';
import { calculateDiagnosticBaseline } from '@/lib/masteryEngine';
import { saveLearnerProfile, loadLearnerProfile } from '@/lib/storage';
import { MathText } from '@/components/MathRenderer';
import {
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Layers,
  Brain,
  Lightbulb,
  Check,
  AlertTriangle,
  Award,
  BookOpen
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
  const [calibratedProfile, setCalibratedProfile] = useState<import('@/types/mastery').LearnerProfile | null>(null);
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
      setErrorBanner('Please select an answer option to proceed.');
      return;
    }

    if (
      currentQuestion.reasoningRequired &&
      (!writtenReasonings[currentQuestion.id] || writtenReasonings[currentQuestion.id].trim().length < 5)
    ) {
      setErrorBanner('Please explain your reasoning (at least 5 characters) so MEDHA can diagnose conceptual understanding.');
      return;
    }

    setIsSubmitting(true);
    setErrorBanner(null);

    try {
      const reasoning = writtenReasonings[currentQuestion.id] || '';

      const res = await fetch('/api/diagnose-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionPrompt: currentQuestion.prompt,
          expectedAnswer: currentQuestion.correctAnswer,
          studentAnswer: selected,
          studentReasoning: reasoning,
          targetConceptIds: currentQuestion.conceptIds
        })
      });

      const data = await res.json();
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || 'Failed to complete diagnostic evaluation');
      }

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
        await finishDiagnostic(updatedAttempts);
      }
    } catch (err) {
      console.error('Error during diagnostic evaluation:', err);
      setErrorBanner('Diagnostic evaluation service experienced a temporary network issue. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishDiagnostic = async (allAttempts: Attempt[]) => {
    const profile = loadLearnerProfile();
    profile.attempts.push(...allAttempts);
    profile.diagnosticCompleted = true;

    const conceptIds = CONCEPTS.map((c) => c.id);
    const baselineMap = calculateDiagnosticBaseline(allAttempts, conceptIds);
    profile.masteryMap = baselineMap;

    saveLearnerProfile(profile);
    setCalibratedProfile(profile);
    setDiagnosticCompleted(true);

    // Sync to authenticated server session
    try {
      await fetch('/api/student/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ attempts: allAttempts })
      });
    } catch (e) {
      console.error('Server diagnostic sync error:', e);
    }
  };

  // --------------------------------------------------------------------------
  // COMPLETED STATE
  // --------------------------------------------------------------------------
  if (diagnosticCompleted) {
    const profile = calibratedProfile || loadLearnerProfile();
    const atRiskConcepts = CONCEPTS.filter((c) => profile.masteryMap[c.id]?.status === 'atRisk');
    const learningConcepts = CONCEPTS.filter((c) => profile.masteryMap[c.id]?.status === 'learning');
    const masteredConcepts = CONCEPTS.filter((c) => profile.masteryMap[c.id]?.status === 'mastered');

    return (
      <div className="max-w-3xl mx-auto space-y-8 py-6">
        <div className="bg-surface rounded-3xl border border-outline-variant p-8 sm:p-12 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-mastery-masteredLight border border-mastery-mastered/20 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-mastery-mastered" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-primary">
              Diagnostic Complete
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Conceptual Baseline Established
            </h2>
            <p className="text-sm text-text-secondary max-w-lg mx-auto">
              MEDHA has analyzed your answers and underlying reasoning across all 9 Electricity concepts. Your individualized cognitive map is now active.
            </p>
          </div>

          {/* Calibrated Baseline Summary Cards */}
          <div className="grid grid-cols-3 gap-3 pt-4 text-left">
            <div className="p-4 rounded-xl bg-mastery-masteredLight/60 border border-mastery-mastered/20">
              <span className="text-[11px] font-mono font-bold text-mastery-mastered uppercase block">
                Mastered
              </span>
              <span className="font-heading font-extrabold text-2xl text-text-primary mt-1 block">
                {masteredConcepts.length}
              </span>
              <span className="text-[11px] text-text-secondary">Concepts validated</span>
            </div>

            <div className="p-4 rounded-xl bg-mastery-learningLight/60 border border-mastery-learning/20">
              <span className="text-[11px] font-mono font-bold text-mastery-learning uppercase block">
                Developing
              </span>
              <span className="font-heading font-extrabold text-2xl text-text-primary mt-1 block">
                {learningConcepts.length}
              </span>
              <span className="text-[11px] text-text-secondary">Ready for practice</span>
            </div>

            <div className="p-4 rounded-xl bg-mastery-atRiskLight/60 border border-mastery-atRisk/20">
              <span className="text-[11px] font-mono font-bold text-mastery-atRisk uppercase block">
                Requires Focus
              </span>
              <span className="font-heading font-extrabold text-2xl text-text-primary mt-1 block">
                {atRiskConcepts.length}
              </span>
              <span className="text-[11px] text-text-secondary">Friction detected</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onCompleteDiagnostic}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
            >
              <span>Begin Targeted Practice</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewGraph}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-secondary hover:bg-outline-variant/60 text-text-primary text-xs font-semibold border border-outline-variant transition-colors"
            >
              <Layers className="w-4 h-4 text-accent-secondary" />
              <span>Inspect Concept Topology</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ACTIVE QUESTION WORKSPACE
  // --------------------------------------------------------------------------
  const selectedOption = selectedAnswers[currentQuestion.id] || '';
  const currentReasoning = writtenReasonings[currentQuestion.id] || '';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-text-primary">
              Question {currentIndex + 1} of {DIAGNOSTIC_QUESTIONS.length}
            </span>
            <span className="text-text-muted">·</span>
            <span className="font-mono text-accent-primary font-bold">
              {progressPercent}% Complete
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentQuestion.conceptIds.map((cId) => (
              <span
                key={cId}
                className="px-2 py-0.5 rounded bg-accent-secondaryLight text-accent-secondary text-[10px] font-mono font-bold"
              >
                {cId}
              </span>
            ))}
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-surface-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-6">
        {/* Question Prompt */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
            Concept Diagnostic
          </span>
          <h3 className="font-heading font-bold text-xl sm:text-2xl text-text-primary leading-snug">
            <MathText text={currentQuestion.prompt} />
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === option;

            return (
              <div
                key={option}
                onClick={() => handleSelectOption(option)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${isSelected
                  ? 'border-accent-primary bg-accent-primaryLight text-accent-primary shadow-sm'
                  : 'border-outline-variant bg-surface hover:border-outline-variant/80 hover:bg-surface-secondary/40'
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${isSelected
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'bg-surface-secondary text-text-secondary border border-outline-variant'
                    }`}
                >
                  {letter}
                </div>
                <span className={`text-sm leading-relaxed ${isSelected ? 'font-semibold text-text-primary' : 'text-text-primary'}`}>
                  <MathText text={option} />
                </span>
              </div>
            );
          })}
        </div>

        {/* Reasoning Capture Canvas */}
        <div className="space-y-2 pt-2 border-t border-outline-variant">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-accent-warm" />
              <span>How did you arrive at this answer?</span>
            </label>
            <span className="text-[10px] font-mono text-text-muted">
              {currentReasoning.length} characters
            </span>
          </div>

          <textarea
            value={currentReasoning}
            onChange={(e) => handleReasoningChange(e.target.value)}
            placeholder="Explain your scientific thinking or calculation steps. MEDHA uses this to diagnose what you understand..."
            rows={3}
            className="w-full p-3.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none text-sm text-text-primary placeholder:text-text-muted font-sans resize-none transition-colors"
          />
        </div>

        {/* Error Notification */}
        {errorBanner && (
          <div className="p-3.5 rounded-xl bg-mastery-atRiskLight border border-mastery-atRisk/20 flex items-center gap-2.5 text-xs text-mastery-atRisk">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-outline-variant text-text-secondary hover:text-text-primary hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNextOrSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover disabled:opacity-50 transition-all"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Diagnosing Understanding...</span>
              </>
            ) : currentIndex === DIAGNOSTIC_QUESTIONS.length - 1 ? (
              <>
                <span>Complete Assessment</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};