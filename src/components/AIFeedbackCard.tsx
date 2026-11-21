'use client';

import React from 'react';
import { MisconceptionAnalysis } from '@/types/mastery';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  Cpu
} from 'lucide-react';

interface AIFeedbackCardProps {
  analysis: MisconceptionAnalysis;
  questionPrompt: string;
  studentAnswer: string;
  expectedAnswer: string;
  studentReasoning?: string;
  scoreChange?: number;
  onContinue?: () => void;
  continueLabel?: string;
}

export const AIFeedbackCard: React.FC<AIFeedbackCardProps> = ({
  analysis,
  studentAnswer,
  expectedAnswer,
  studentReasoning,
  scoreChange,
  onContinue,
  continueLabel = 'Continue Learning'
}) => {
  const isCorrect = analysis.is_correct;
  const isMisconception = analysis.misconception_detected;
  const status = analysis.misconception_status || (isMisconception ? 'detected' : 'unverified');

  const getQualityBadge = (quality: MisconceptionAnalysis['reasoning_quality']) => {
    switch (quality) {
      case 'exceptional':
        return { label: 'Exceptional Reasoning', color: 'bg-mastery-mastered/20 text-mastery-mastered border-mastery-mastered/40' };
      case 'good':
        return { label: 'Sound Reasoning', color: 'bg-mastery-mastered/20 text-mastery-mastered border-mastery-mastered/40' };
      case 'fair':
        return { label: 'Partial Reasoning', color: 'bg-mastery-learning/20 text-mastery-learning border-mastery-learning/40' };
      case 'poor':
        return { label: 'Flawed Reasoning', color: 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40' };
      case 'insufficient_evidence':
      default:
        return { label: 'Insufficient Evidence', color: 'bg-mastery-unassessed/20 text-mastery-unassessed border-mastery-unassessed/40' };
    }
  };

  const qualityBadge = getQualityBadge(analysis.reasoning_quality);

  return (
    <div className="rounded-3xl bg-surface-elevated border border-outline-variant/40 p-5 lg:p-7 shadow-2xl space-y-5">
      {/* Engine Source & Confidence Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {analysis.is_offline_fallback ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-mastery-learning/15 text-mastery-learning border border-mastery-learning/30">
              <Cpu className="w-3 h-3" />
              Verified Diagnostic Heuristic (Demo Mode)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-mastery-mastered/15 text-mastery-mastered border border-mastery-mastered/30">
              <Cpu className="w-3 h-3" />
              Live Gemini 2.5 Flash Reasoning Analysis
            </span>
          )}
          <span className="text-xs text-text-secondary font-mono">
            Confidence: {Math.round(analysis.confidence * 100)}%
          </span>
        </div>

        {/* Score Change Badge */}
        {typeof scoreChange === 'number' && (
          <div
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              scoreChange >= 0
                ? 'bg-mastery-mastered/20 text-mastery-mastered border-mastery-mastered/40'
                : 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40'
            }`}
          >
            Mastery {scoreChange >= 0 ? `+${scoreChange}` : scoreChange} pts
          </div>
        )}
      </div>

      {/* Outcome Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
          isCorrect
            ? 'bg-mastery-mastered/10 border-mastery-mastered/30 text-mastery-mastered'
            : isMisconception
            ? 'bg-mastery-atRisk/10 border-mastery-atRisk/30 text-mastery-atRisk'
            : 'bg-mastery-learning/10 border-mastery-learning/30 text-mastery-learning'
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-6 h-6 text-mastery-mastered shrink-0 mt-0.5" />
        ) : isMisconception ? (
          <ShieldAlert className="w-6 h-6 text-mastery-atRisk shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-mastery-learning shrink-0 mt-0.5" />
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-heading font-bold text-base text-text-primary">
              {isCorrect
                ? 'Accurate Conceptual Reasoning'
                : isMisconception
                ? `Specific Misconception: ${analysis.misconception_title || 'Cognitive Confusion'}`
                : 'Incorrect Answer - Review Concept Foundations'}
            </h4>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${qualityBadge.color}`}>
              {qualityBadge.label}
            </span>
            {isMisconception && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-outline-variant/30 text-text-secondary">
                {status}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {analysis.explanation}
          </p>
        </div>
      </div>

      {/* Reasoning & Correct Principle Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Student reasoning and evidence */}
        <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-2">
          <span className="text-[11px] font-mono uppercase text-accent-secondary flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Your Submitted Reasoning
          </span>
          <p className="text-xs text-text-primary italic bg-surface p-2.5 rounded-xl border border-outline-variant/20">
            &ldquo;{studentReasoning || studentAnswer}&rdquo;
          </p>

          {analysis.evidence.length > 0 && (
            <div className="pt-1">
              <span className="text-[10px] font-mono uppercase text-mastery-learning block mb-1">
                Extracted Evidence Points:
              </span>
              <ul className="space-y-1">
                {analysis.evidence.map((ev, i) => (
                  <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                    <span className="text-accent-primary font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Correct Physics Principle & Action */}
        <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-2">
          <span className="text-[11px] font-mono uppercase text-mastery-mastered flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-mastery-mastered" />
            Correct Physics Principle & Next Step
          </span>
          <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 space-y-1.5">
            <p className="text-xs font-semibold text-text-primary">
              {analysis.correct_principle || analysis.next_learning_action}
            </p>
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              <span className="text-[10px] text-text-secondary font-mono">Target Concepts:</span>
              {analysis.recommended_concept_ids.map((cId) => (
                <span
                  key={cId}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent-primary/15 border border-accent-primary/30 text-accent-primary"
                >
                  {cId}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1 text-[11px] text-text-secondary">
            <strong>Expected Answer:</strong> {expectedAnswer}
          </div>
        </div>
      </div>

      {/* Continue Action */}
      {onContinue && (
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer hover:opacity-90 text-white text-xs font-bold shadow-neonPrimary transition-all"
          >
            <span>{continueLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
