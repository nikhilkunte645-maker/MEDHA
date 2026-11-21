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
  Cpu,
  Sparkles,
  Award
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
  questionPrompt,
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
        return { label: 'Exceptional Reasoning', color: 'bg-mastery-masteredLight text-mastery-mastered border-mastery-mastered/30' };
      case 'good':
        return { label: 'Sound Reasoning', color: 'bg-mastery-masteredLight text-mastery-mastered border-mastery-mastered/30' };
      case 'fair':
        return { label: 'Partial Reasoning', color: 'bg-mastery-learningLight text-mastery-learning border-mastery-learning/30' };
      case 'poor':
        return { label: 'Flawed Intuition', color: 'bg-mastery-atRiskLight text-mastery-atRisk border-mastery-atRisk/30' };
      case 'insufficient_evidence':
      default:
        return { label: 'Insufficient Evidence', color: 'bg-surface-secondary text-text-muted border-outline-variant' };
    }
  };

  const qualityBadge = getQualityBadge(analysis.reasoning_quality);

  return (
    <div className="rounded-3xl bg-surface border border-outline-variant p-6 sm:p-8 shadow-card space-y-6">
      {/* Engine Source & Confidence Header */}
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          {analysis.is_offline_fallback ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono bg-accent-warmLight text-accent-warm border border-accent-warm/20 font-semibold">
              <Cpu className="w-3 h-3" />
              Diagnostic Heuristic Engine (Offline)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono bg-accent-primaryLight text-accent-primary border border-accent-primary/20 font-semibold">
              <Sparkles className="w-3 h-3" />
              Live Gemini Reasoning Diagnosis
            </span>
          )}
          <span className="text-text-muted font-mono">
            Confidence: {Math.round(analysis.confidence * 100)}%
          </span>
        </div>

        {/* Score Change Badge */}
        {typeof scoreChange === 'number' && (
          <span
            className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${
              scoreChange >= 0
                ? 'bg-mastery-masteredLight text-mastery-mastered border border-mastery-mastered/30'
                : 'bg-mastery-atRiskLight text-mastery-atRisk border border-mastery-atRisk/30'
            }`}
          >
            {scoreChange >= 0 ? `+${scoreChange}%` : `${scoreChange}%`} Mastery
          </span>
        )}
      </div>

      {/* Main Diagnostic Verdict */}
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isCorrect && !isMisconception
              ? 'bg-mastery-masteredLight text-mastery-mastered border border-mastery-mastered/30'
              : isMisconception
              ? 'bg-mastery-atRiskLight text-mastery-atRisk border border-mastery-atRisk/30'
              : 'bg-mastery-learningLight text-mastery-learning border border-mastery-learning/30'
          }`}
        >
          {isCorrect && !isMisconception ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : isMisconception ? (
            <ShieldAlert className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${qualityBadge.color}`}>
              {qualityBadge.label}
            </span>
            {isCorrect ? (
              <span className="text-[10px] font-mono font-bold text-mastery-mastered bg-mastery-masteredLight px-2 py-0.5 rounded border border-mastery-mastered/20">
                Correct Answer
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold text-mastery-atRisk bg-mastery-atRiskLight px-2 py-0.5 rounded border border-mastery-atRisk/20">
                Incorrect Option
              </span>
            )}
          </div>

          <h3 className="font-heading font-extrabold text-xl text-text-primary">
            {isMisconception
              ? analysis.misconception_title || 'Latent Misconception Detected'
              : isCorrect
              ? 'Sound Conceptual Understanding Demonstrated'
              : 'Partial Understanding Observed'}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            {analysis.explanation}
          </p>
        </div>
      </div>

      {/* Reasoning Analysis Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Student Reasoning & Flagged Excerpts */}
        <div className="p-4 rounded-2xl bg-canvas border border-outline-variant space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">
            Your Submitted Reasoning:
          </span>
          <p className="italic text-text-primary leading-relaxed">
            &ldquo;{studentReasoning || 'No written reasoning captured'}&rdquo;
          </p>

          {analysis.evidence && analysis.evidence.length > 0 && (
            <div className="pt-2 border-t border-outline-variant space-y-1">
              <span className="text-[10px] font-mono font-bold text-mastery-atRisk uppercase block">
                Flagged Cognitive Statement:
              </span>
              <p className="text-mastery-atRisk font-medium">
                &ldquo;{analysis.evidence.join('; ')}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Physical Principle / Clarification */}
        <div className="p-4 rounded-2xl bg-mastery-masteredLight/40 border border-mastery-mastered/30 space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-mastery-mastered block">
            Scientific Truth & Physical Principle:
          </span>
          <p className="text-text-primary leading-relaxed font-medium">
            {analysis.correct_principle ||
              'Electric charge is strictly conserved. Voltage acts as electrical pressure while current is the conserved rate of flow.'}
          </p>
        </div>
      </div>

      {/* Next Learning Action & Continue Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant">
        <div className="text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">Next Action: </span>
          <span>{analysis.next_learning_action || 'Generate next targeted adaptive question to test mastery.'}</span>
        </div>

        {onContinue && (
          <button
            onClick={onContinue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-semibold shadow-cobalt hover:bg-accent-primaryHover transition-all shrink-0"
          >
            <span>{continueLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};