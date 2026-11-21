'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { ConceptMastery, GeneratedQuestion, MisconceptionAnalysis, Attempt } from '@/types/mastery';
import { loadLearnerProfile, recordAttemptAndUpdateMastery } from '@/lib/storage';
import { AIFeedbackCard } from './AIFeedbackCard';
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
  Clock
} from 'lucide-react';

interface LearningWorkspaceProps {
  initialConceptId?: string;
  onViewGraph?: () => void;
  onViewRevision?: () => void;
}

export const LearningWorkspace: React.FC<LearningWorkspaceProps> = ({
  initialConceptId,
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

  useEffect(() => {
    refreshLearnerData();
  }, []);

  useEffect(() => {
    if (initialConceptId) {
      setSelectedConceptId(initialConceptId);
    }
  }, [initialConceptId]);

  const refreshLearnerData = () => {
    const profile = loadLearnerProfile();
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

    try {
      const currentScore = masteryMap[cId]?.score ?? 50;
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conceptId: cId,
          currentMastery: currentScore,
          requestedDifficulty: diff,
          previousMistakeCodes: []
        })
      });

      const data = await res.json();
      if (data.question) {
        setActiveQuestion(data.question);
      }
    } catch (err) {
      console.error('Failed to generate adaptive question:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Answer & Evaluate Reasoning
  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !selectedOption) {
      alert('Please select an answer option.');
      return;
    }

    if (!studentReasoning || studentReasoning.trim().length < 5) {
      alert('Please explain your reasoning. MEDHA evaluates your step-by-step thinking to detect misconceptions!');
      return;
    }

    setIsEvaluating(true);

    try {
      const previousScore = masteryMap[selectedConceptId]?.score ?? 0;

      const res = await fetch('/api/diagnose-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionPrompt: activeQuestion.question,
          expectedAnswer: activeQuestion.correct_answer,
          studentAnswer: selectedOption,
          studentReasoning,
          targetConceptIds: [selectedConceptId]
        })
      });

      const data = await res.json();
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
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Workspace Header & Concept Selection */}
      <div className="bg-surface rounded-3xl border border-outline-variant/40 p-5 lg:p-7 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-primary" />
              <h2 className="font-heading font-bold text-xl text-text-primary">
                Adaptive Learning Workspace
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Select a concept node, calibrate difficulty, and explain your reasoning to receive AI cognitive diagnosis.
            </p>
          </div>

          {/* Current Concept Status Badge */}
          <div className="flex items-center gap-3 bg-surface-deep px-4 py-2 rounded-2xl border border-outline-variant/30">
            <span className="text-xs text-text-secondary">Current Mastery:</span>
            <span className="font-heading text-lg font-bold text-text-primary">
              {currentConceptMastery?.score !== null && currentConceptMastery?.score !== undefined
                ? `${currentConceptMastery?.score}%`
                : 'Unassessed'}
            </span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                currentConceptMastery?.status === 'atRisk'
                  ? 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40'
                  : currentConceptMastery?.status === 'learning'
                  ? 'bg-mastery-learning/20 text-mastery-learning border-mastery-learning/40'
                  : currentConceptMastery?.status === 'mastered'
                  ? 'bg-mastery-mastered/20 text-mastery-mastered border-mastery-mastered/40'
                  : 'bg-mastery-unassessed/20 text-mastery-unassessed border-mastery-unassessed/40'
              }`}
            >
              {currentConceptMastery?.status || 'unassessed'}
            </span>
          </div>
        </div>

        {/* 9 Concept Selector Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CONCEPTS.map((c) => {
            const isSelected = c.id === selectedConceptId;
            const m = masteryMap[c.id];
            const hasScore = m && m.score !== null;

            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedConceptId(c.id);
                  handleGenerateQuestion(c.id, difficulty);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-accent-primaryContainer text-white border-accent-primary shadow-neonPrimary font-bold'
                    : 'bg-surface-elevated hover:bg-surface-higher text-text-secondary border-outline-variant/30'
                }`}
              >
                <span className="font-mono text-[11px] font-bold">{c.code}</span>
                <span className="max-w-[130px] truncate">{c.name}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({hasScore ? `${m.score}%` : '---'})
                </span>
              </button>
            );
          })}
        </div>

        {/* Difficulty Calibration & Question Action */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-mono">Difficulty:</span>
            {[
              { level: 1, label: 'Level 1 (Foundational)' },
              { level: 2, label: 'Level 2 (Application)' },
              { level: 3, label: 'Level 3 (Challenging)' }
            ].map((diff) => (
              <button
                key={diff.level}
                onClick={() => setDifficulty(diff.level)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  difficulty === diff.level
                    ? 'bg-accent-secondary/20 border border-accent-secondary text-accent-secondary font-bold'
                    : 'bg-surface-deep text-text-secondary hover:text-text-primary border border-outline-variant/30'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerateQuestion(selectedConceptId, difficulty)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {isGenerating ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Synthesizing Question...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Generate Targeted Question
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Practice Question */}
      {activeQuestion ? (
        <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 shadow-2xl space-y-6">
          {/* Explanation of Why Selected Banner */}
          {activeQuestion.selection_reason && (
            <div className="p-3 rounded-xl bg-surface-deep border border-outline-variant/30 flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-accent-secondary" />
                <strong>Why this question was selected:</strong> {activeQuestion.selection_reason}
              </span>
              <span className="font-mono text-[10px] text-accent-primary">
                Target: {currentConcept.code}
              </span>
            </div>
          )}

          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
              <span className="font-mono text-accent-primary font-bold">
                {currentConcept.code} — {currentConcept.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-deep border border-outline-variant/30 font-mono text-[10px]">
                Difficulty {activeQuestion.difficulty}/3
              </span>
            </div>
            <h3 className="font-heading text-lg lg:text-xl font-bold text-text-primary leading-relaxed">
              {activeQuestion.question}
            </h3>
            <p className="text-xs text-accent-secondary/90 mt-1 font-mono">
              Objective: {activeQuestion.learning_objective}
            </p>
          </div>

          {/* Hint Toggle Button */}
          {activeQuestion.hint && (
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs font-mono text-mastery-learning hover:underline flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {showHint ? 'Hide Physics Hint' : 'Show Physics Hint'}
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-mastery-learning/10 border border-mastery-learning/30 text-xs text-mastery-learning">
                  💡 {activeQuestion.hint}
                </div>
              )}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={Boolean(analysisResult)}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-accent-primaryContainer/20 border-accent-primary text-text-primary font-semibold shadow-neonPrimary'
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
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Reasoning Input */}
          <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-accent-primary" />
                Write Out Your Reasoning Step-by-Step (Evaluated by AI Engine):
              </label>
              <span className="text-[10px] text-accent-primary font-mono font-bold uppercase">
                Cognitive Diagnosis
              </span>
            </div>
            <textarea
              rows={3}
              disabled={Boolean(analysisResult)}
              value={studentReasoning}
              onChange={(e) => setStudentReasoning(e.target.value)}
              placeholder="State which scientific principles or formulas you used and why other choices are ruled out..."
              className="w-full rounded-xl bg-surface border border-outline-variant/40 p-3 text-xs text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-primary transition-colors resize-none disabled:opacity-70"
            />
          </div>

          {/* Submit Action */}
          {!analysisResult && (
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={isEvaluating || !selectedOption}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-neonPrimary transition-all"
              >
                {isEvaluating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Diagnosing Reasoning with AI...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Submit Reasoning for AI Diagnosis <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* AI Feedback Card */}
          {analysisResult && (
            <AIFeedbackCard
              analysis={analysisResult}
              questionPrompt={activeQuestion.question}
              studentAnswer={selectedOption}
              expectedAnswer={activeQuestion.correct_answer}
              studentReasoning={studentReasoning}
              scoreChange={scoreDelta || undefined}
              onContinue={() => handleGenerateQuestion(selectedConceptId, difficulty)}
              continueLabel="Generate Next Adaptive Question"
            />
          )}
        </div>
      ) : (
        <div className="bg-surface rounded-3xl border border-outline-variant/40 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/15 border border-accent-primary/30 mx-auto flex items-center justify-center text-accent-primary">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-text-primary">
            Ready to Practice: {currentConcept.name} ({currentConcept.code})
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Click &quot;Generate Targeted Question&quot; above to synthesize a fresh question calibrated to your current mastery and previous cognitive errors.
          </p>
          <button
            onClick={() => handleGenerateQuestion(selectedConceptId, difficulty)}
            className="px-6 py-2.5 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-90 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate First Question</span>
          </button>
        </div>
      )}

      {/* Recent Evaluated Attempts History */}
      {recentAttempts.length > 0 && (
        <div className="bg-surface rounded-3xl border border-outline-variant/40 p-5 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-accent-secondary" />
            Recent Evaluated Attempts
          </h4>
          <div className="space-y-2">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-xl bg-surface-deep border border-outline-variant/30 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      att.isCorrect ? 'bg-mastery-mastered' : 'bg-mastery-atRisk'
                    }`}
                  ></span>
                  <div>
                    <span className="font-mono text-accent-primary font-semibold mr-2">
                      {att.targetConceptIds.join(', ')}
                    </span>
                    <span className="text-text-secondary">
                      {att.isCorrect ? 'Correct reasoning' : att.misconceptionTitle || 'Incorrect attempt'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-text-secondary font-mono">
                    {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      att.isCorrect
                        ? 'bg-mastery-mastered/20 text-mastery-mastered'
                        : 'bg-mastery-atRisk/20 text-mastery-atRisk'
                    }`}
                  >
                    {att.reasoningQuality}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
