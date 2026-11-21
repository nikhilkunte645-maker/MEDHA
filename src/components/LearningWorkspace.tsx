'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import {
  ConceptMastery,
  GeneratedQuestion,
  MisconceptionAnalysis,
  Attempt,
  LearnerProfile
} from '@/types/mastery';
import { loadLearnerProfile, recordAttemptAndUpdateMastery } from '@/lib/storage';
import { AIFeedbackCard } from './AIFeedbackCard';
import { Formula, MathText } from './MathRenderer';
import {
  Sparkles,
  Target,
  Brain,
  Layers,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Zap,
  RotateCcw
} from 'lucide-react';

interface LearningWorkspaceProps {
  initialConceptId?: string;
  profile?: LearnerProfile;
  onProfileUpdate?: (updatedProfile: LearnerProfile) => void;
  onViewGraph?: () => void;
  onViewRevision?: () => void;
}

export const LearningWorkspace: React.FC<LearningWorkspaceProps> = ({
  initialConceptId,
  profile: propProfile,
  onProfileUpdate,
  onViewGraph,
  onViewRevision
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialConceptId || 'C01');
  const [difficulty, setDifficulty] = useState<number>(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<GeneratedQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [studentReasoning, setStudentReasoning] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MisconceptionAnalysis | null>(null);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [masteryMap, setMasteryMap] = useState<Record<string, ConceptMastery>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    refreshLearnerData();
  }, [propProfile]);

  useEffect(() => {
    if (initialConceptId) {
      setSelectedConceptId(initialConceptId);
    }
  }, [initialConceptId]);

  const refreshLearnerData = () => {
    const profile = propProfile || loadLearnerProfile();
    setMasteryMap(profile.masteryMap);
    setRecentAttempts(profile.attempts.slice(-5).reverse());
  };

  const currentConcept = CONCEPTS.find((c) => c.id === selectedConceptId) || CONCEPTS[0];
  const currentConceptMastery = masteryMap[selectedConceptId];

  // Request new question generation
  const handleGenerateQuestion = async (cId = selectedConceptId, diff = difficulty) => {
    setIsGenerating(true);
    setActiveQuestion(null);
    setSelectedOption('');
    setStudentReasoning('');
    setAnalysisResult(null);
    setScoreDelta(null);
    setShowHint(false);
    setValidationError(null);
    setApiError(null);

    try {
      const currentScore = masteryMap[cId]?.score ?? 50;
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conceptId: cId,
          currentMastery: currentScore,
          requestedDifficulty: diff,
          previousMistakeCodes: []
        })
      });

      const data = await res.json();
      if (!res.ok || !data.question) {
        throw new Error(data.error || 'Failed to generate targeted adaptive question');
      }

      setActiveQuestion(data.question);
    } catch (err: unknown) {
      console.error('Failed to generate adaptive question:', err);
      const msg = err instanceof Error ? err.message : 'Unable to generate targeted adaptive question';
      setApiError(`${msg}. Please check connectivity or retry.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Answer & Evaluate Reasoning
  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !selectedOption) {
      setValidationError('Please select an answer option.');
      return;
    }

    if (!studentReasoning || studentReasoning.trim().length < 5) {
      setValidationError('Please explain your reasoning (at least 5 characters). MEDHA evaluates your step-by-step thinking to detect misconceptions!');
      return;
    }

    setIsEvaluating(true);
    setValidationError(null);
    setApiError(null);

    try {
      const previousScore = masteryMap[selectedConceptId]?.score ?? 0;

      const res = await fetch('/api/diagnose-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questionPrompt: activeQuestion.question,
          expectedAnswer: activeQuestion.correct_answer,
          studentAnswer: selectedOption,
          studentReasoning,
          targetConceptIds: [selectedConceptId]
        })
      });

      const data = await res.json();
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || 'Failed to complete reasoning diagnosis from server');
      }

      const analysis: MisconceptionAnalysis = data.analysis;
      setAnalysisResult(analysis);

      const attempt: Attempt = {
        id: `att_${Date.now()}`,
        learnerId: 'active_student',
        questionId: activeQuestion.question_id,
        selectedAnswer: selectedOption,
        writtenReasoning: studentReasoning,
        isCorrect: analysis.is_correct,
        targetConceptIds: [selectedConceptId],
        difficulty: activeQuestion.difficulty,
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

      const updatedProfile = recordAttemptAndUpdateMastery(attempt);
      setMasteryMap(updatedProfile.masteryMap);
      const newScore = updatedProfile.masteryMap[selectedConceptId]?.score ?? 0;
      setScoreDelta(newScore - previousScore);
      setRecentAttempts(updatedProfile.attempts.slice(-5).reverse());

      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      // Sync attempt to authenticated server endpoint
      try {
        await fetch('/api/student/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...attempt, attempt })
        });
      } catch (syncErr) {
        console.error('Server attempt sync error:', syncErr);
      }

      // Smoothly scroll to the AI feedback section so the student immediately sees their diagnosis
      setTimeout(() => {
        const feedbackEl = document.getElementById('ai-feedback-section');
        if (feedbackEl) {
          feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } catch (err: unknown) {
      console.error('Error submitting answer:', err);
      const msg = err instanceof Error ? err.message : 'Unable to complete reasoning diagnosis';
      setApiError(`${msg}. Please check network connectivity or retry.`);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* 1. Concept Horizontal Carousel Selector */}
      <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-primary">
            Adaptive Workspace
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary tracking-tight mt-1">
            Targeted Conceptual Practice
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Select any concept from the Class 10 curriculum. MEDHA generates calibrated challenges and diagnoses your physical reasoning.
          </p>
        </div>

        {/* 9-Concept Horizontal Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {CONCEPTS.map((concept) => {
            const isSelected = concept.id === selectedConceptId;
            const mastery = masteryMap[concept.id];
            const score = mastery?.score;

            return (
              <button
                key={concept.id}
                onClick={() => {
                  setSelectedConceptId(concept.id);
                  setActiveQuestion(null);
                  setAnalysisResult(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-accent-primary text-white shadow-cobalt font-bold'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-outline-variant hover:bg-outline-variant/40'
                }`}
              >
                <span>{concept.id}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    score === null || score === undefined
                      ? 'bg-mastery-unassessed'
                      : score >= 80
                      ? 'bg-mastery-mastered'
                      : score >= 50
                      ? 'bg-mastery-learning'
                      : 'bg-mastery-atRisk'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Concept Overview Banner */}
        <div className="p-5 rounded-2xl bg-canvas border border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primaryLight px-2 py-0.5 rounded">
                {currentConcept.id}
              </span>
              <h3 className="font-heading font-bold text-lg text-text-primary">
                {currentConcept.name}
              </h3>
            </div>
            <div className="text-xs text-text-secondary line-clamp-2">
              <MathText text={currentConcept.description} />
            </div>
            <div className="text-xs text-text-muted pt-1 flex items-center gap-2 flex-wrap">
              <span className="font-mono text-text-secondary">Formula:</span>
              <div className="flex items-center gap-3 flex-wrap">
                {currentConcept.formulas.length > 0 ? (
                  currentConcept.formulas.map((f, i) => (
                    <Formula key={i} latex={f.latex} />
                  ))
                ) : (
                  <span className="italic text-text-muted">Descriptive / Schematic</span>
                )}
              </div>
            </div>
          </div>

          {/* Difficulty Selection & Generate CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-surface p-1 rounded-xl border border-outline-variant">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    difficulty === lvl
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleGenerateQuestion()}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Generate Challenge'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Question Workspace */}
      {activeQuestion ? (
        <div className="bg-surface rounded-3xl border border-outline-variant p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <span className="text-xs font-mono font-bold text-accent-primary bg-accent-primaryLight px-2.5 py-1 rounded">
              {selectedConceptId} · Level {activeQuestion.difficulty} Challenge
            </span>

            {/* Hint Toggle */}
            {activeQuestion.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="inline-flex items-center gap-1.5 text-xs text-accent-warm hover:underline font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Reveal Guiding Hint'}</span>
              </button>
            )}
          </div>

          {/* Guiding Hint Accordion */}
          {showHint && activeQuestion.hint && (
            <div className="p-4 rounded-xl bg-accent-warmLight/70 border border-accent-warm/30 text-xs text-text-primary space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-accent-warm block">
                Guiding Conceptual Hint:
              </span>
              <MathText text={activeQuestion.hint} as="p" className="leading-relaxed" />
            </div>
          )}

          {/* Question Prompt */}
          <div className="font-heading font-bold text-xl sm:text-2xl text-text-primary leading-snug">
            <MathText text={activeQuestion.question} />
          </div>

          {/* Option Cards */}
          <div className="space-y-2.5">
            {activeQuestion.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === opt;
              const isLocked = Boolean(analysisResult);

              return (
                <div
                  key={opt}
                  onClick={() => {
                    if (!isLocked) setSelectedOption(opt);
                  }}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isLocked ? 'cursor-default opacity-85' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'border-accent-primary bg-accent-primaryLight text-accent-primary shadow-sm'
                      : 'border-outline-variant bg-surface hover:border-outline-variant/80 hover:bg-surface-secondary/40'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-accent-primary text-white shadow-sm'
                        : 'bg-surface-secondary text-text-secondary border border-outline-variant'
                    }`}
                  >
                    {letter}
                  </div>
                  <div className={`text-sm leading-relaxed ${isSelected ? 'font-semibold text-text-primary' : 'text-text-primary'}`}>
                    <MathText text={opt} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reasoning Canvas */}
          <div className="space-y-2 pt-2 border-t border-outline-variant">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-accent-warm" />
                <span>Explain your thinking step-by-step:</span>
              </label>
              <span className="text-[10px] font-mono text-text-muted">
                {studentReasoning.length} characters
              </span>
            </div>

            <textarea
              value={studentReasoning}
              onChange={(e) => setStudentReasoning(e.target.value)}
              placeholder="State your physical reasoning or formula manipulation. E.g. 'Since resistors are in series, current is identical across both...'"
              rows={3}
              className="w-full p-3.5 rounded-xl border border-outline-variant bg-canvas focus:bg-surface focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none text-sm text-text-primary placeholder:text-text-muted font-sans resize-none transition-colors"
            />
          </div>

          {/* Validation or API Errors */}
          {validationError && (
            <div className="p-3.5 rounded-xl bg-mastery-atRiskLight border border-mastery-atRisk/20 flex items-center gap-2.5 text-xs text-mastery-atRisk">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
          {apiError && (
            <div className="p-3.5 rounded-xl bg-mastery-atRiskLight border border-mastery-atRisk/20 flex items-center gap-2.5 text-xs text-mastery-atRisk">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => handleGenerateQuestion()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate Different Question</span>
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating || Boolean(analysisResult)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover disabled:opacity-50 transition-all"
            >
              {isEvaluating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  <span>Diagnosing Reasoning...</span>
                </>
              ) : analysisResult ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Diagnosed & Recorded</span>
                </>
              ) : (
                <>
                  <span>Submit & Diagnose</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : !isGenerating && (
        <div className="p-12 text-center bg-surface rounded-3xl border border-outline-variant space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-accent-primaryLight border border-accent-primary/20 flex items-center justify-center mx-auto text-accent-primary">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-text-primary">
            Ready to Practice {currentConcept.id} · {currentConcept.name}
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
            Click below to generate a calibrated adaptive question based on your current evidence score ({currentConceptMastery?.score ?? 0}%).
          </p>
          <button
            onClick={() => handleGenerateQuestion()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Adaptive Challenge</span>
          </button>
        </div>
      )}

      {/* 3. Diagnostic Feedback Card */}
      {analysisResult && activeQuestion && (
        <div id="ai-feedback-section" className="scroll-mt-6">
          <AIFeedbackCard
            analysis={analysisResult}
            questionPrompt={activeQuestion.question}
            studentAnswer={selectedOption}
            expectedAnswer={activeQuestion.correct_answer}
            studentReasoning={studentReasoning}
            scoreChange={scoreDelta ?? undefined}
            onContinue={() => {
              handleGenerateQuestion();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            continueLabel="Next Adaptive Challenge"
          />
        </div>
      )}
    </div>
  );
};