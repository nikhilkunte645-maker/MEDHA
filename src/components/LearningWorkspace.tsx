'use client';

import React, { useState, useEffect } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { Concept, ConceptMastery, GeneratedQuestion, MisconceptionAnalysis, Attempt } from '@/types/mastery';
import { loadLearnerProfile, recordAttemptAndUpdateMastery } from '@/lib/storage';
import { AIFeedbackCard } from './AIFeedbackCard';
import {
  Sparkles,
  Target,
  Brain,
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
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

    try {
      const currentScore = masteryMap[cId]?.score || 50;
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
      alert('Please explain your reasoning. MASTERY evaluates your step-by-step thinking to detect misconceptions!');
      return;
    }

    setIsEvaluating(true);

    try {
      const previousScore = masteryMap[selectedConceptId]?.score || 0;

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

      // Record attempt and update deterministic mastery model
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
        evidence: analysis.evidence,
        explanation: analysis.explanation,
        recommendedConceptIds: analysis.recommended_concept_ids,
        confidence: analysis.confidence,
        nextLearningAction: analysis.next_learning_action,
        isOfflineFallback: analysis.is_offline_fallback
      };

      const updatedProfile = recordAttemptAndUpdateMastery(attempt);
      setMasteryMap(updatedProfile.masteryMap);
      const newScore = updatedProfile.masteryMap[selectedConceptId]?.score || 0;
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
      {/* Workspace Header / Concept Selector */}
      <div className="bg-surface rounded-2xl border border-surface-border p-5 lg:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-violet" />
              <h2 className="font-heading font-bold text-xl text-white">
                Adaptive Learning Workspace
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select a concept node, calibrate difficulty, and submit your reasoning for AI cognitive diagnosis.
            </p>
          </div>

          {/* Quick Concept Score Card */}
          <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-xl border border-surface-border">
            <span className="text-xs text-slate-400">Current Mastery:</span>
            <span className="font-heading text-lg font-bold text-white">
              {currentConceptMastery?.score || 0}%
            </span>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                (currentConceptMastery?.score || 0) < 40
                  ? 'bg-red-950/60 text-red-400 border border-red-500/30'
                  : (currentConceptMastery?.score || 0) < 70
                  ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentConceptMastery?.status || 'unassessed'}
            </span>
          </div>
        </div>

        {/* Concept Pill Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CONCEPTS.map((c) => {
            const isSelected = c.id === selectedConceptId;
            const score = masteryMap[c.id]?.score || 0;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedConceptId(c.id);
                  handleGenerateQuestion(c.id, difficulty);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap border transition-all ${
                  isSelected
                    ? 'bg-brand-violet text-white border-brand-violet shadow-md shadow-brand-violet/20 font-bold'
                    : 'bg-background hover:bg-surface-elevated text-slate-300 border-surface-border'
                }`}
              >
                <span className="font-mono text-[11px]">{c.code}</span>
                <span className="max-w-[120px] truncate">{c.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({score}%)</span>
              </button>
            );
          })}
        </div>

        {/* Difficulty Calibration & Question Generation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-surface-border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Difficulty Calibration:</span>
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
                    ? 'bg-brand-cyan/20 border border-brand-cyan text-brand-cyan font-bold'
                    : 'bg-background text-slate-400 hover:text-white border border-surface-border'
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleGenerateQuestion(selectedConceptId, difficulty)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold shadow-lg shadow-brand-violet/20 hover:opacity-90 disabled:opacity-50 transition-all"
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

      {/* Main Practice Card */}
      {activeQuestion ? (
        <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-2xl space-y-6">
          {/* Question Prompt */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-brand-cyan font-bold">
                Target Concept: {currentConcept.code} — {currentConcept.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-slate-400 font-mono text-[10px]">
                Difficulty {activeQuestion.difficulty}/3
              </span>
            </div>
            <h3 className="font-heading text-lg lg:text-xl font-bold text-white leading-relaxed">
              {activeQuestion.question}
            </h3>
            <p className="text-xs text-brand-cyan/80 mt-1">
              Objective: {activeQuestion.learning_objective}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const letter = String.fromCharCode(65 + idx);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={Boolean(analysisResult)}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-brand-violet/20 border-brand-violet text-white font-medium shadow-md shadow-brand-violet/20'
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
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Reasoning TextArea */}
          <div className="p-4 rounded-xl bg-background border border-surface-border space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-brand-cyan" />
                Write Out Your Reasoning Step-by-Step (Mandatory for Misconception Analysis):
              </label>
              <span className="text-[10px] text-brand-violet font-mono font-bold uppercase">
                AI Diagnostics
              </span>
            </div>
            <textarea
              rows={3}
              disabled={Boolean(analysisResult)}
              value={studentReasoning}
              onChange={(e) => setStudentReasoning(e.target.value)}
              placeholder="State which scientific principles or formulas you used and why other choices are ruled out..."
              className="w-full rounded-lg bg-surface border border-surface-border p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet transition-colors resize-none disabled:opacity-70"
            />
          </div>

          {/* Submit Action */}
          {!analysisResult && (
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                disabled={isEvaluating || !selectedOption}
                onClick={handleSubmitAnswer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
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

          {/* AI Analysis Feedback Card */}
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
        /* Empty / Initial State */
        <div className="bg-surface rounded-2xl border border-surface-border p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-brand-violet/20 border border-brand-violet/30 mx-auto flex items-center justify-center text-brand-violet">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">
            Ready to Practice: {currentConcept.name} ({currentConcept.code})
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Generate Targeted Question&quot; above to synthesize a fresh question calibrated to your current mastery and previous cognitive errors.
          </p>
          <button
            onClick={() => handleGenerateQuestion(selectedConceptId, difficulty)}
            className="px-6 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-bold shadow-lg shadow-brand-violet/20 transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate First Question</span>
          </button>
        </div>
      )}

      {/* Recent Activity Log */}
      {recentAttempts.length > 0 && (
        <div className="bg-surface rounded-2xl border border-surface-border p-5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            Recent Evaluated Attempts
          </h4>
          <div className="space-y-2">
            {recentAttempts.map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-xl bg-background border border-surface-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      att.isCorrect ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.6)]'
                    }`}
                  ></span>
                  <div>
                    <span className="font-mono text-brand-violet font-semibold mr-2">
                      {att.targetConceptIds.join(', ')}
                    </span>
                    <span className="text-slate-300">
                      {att.isCorrect ? 'Correct reasoning' : att.misconceptionTitle || 'Incorrect attempt'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      att.isCorrect ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
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
