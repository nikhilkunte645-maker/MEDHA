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
  Target
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

  const getQualityBadge = (quality: MisconceptionAnalysis['reasoning_quality']) => {
    switch (quality) {
      case 'exceptional':
        return { label: 'Exceptional Reasoning', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'good':
        return { label: 'Sound Reasoning', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' };
      case 'fair':
        return { label: 'Partial Reasoning', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'poor':
        return { label: 'Flawed Reasoning', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      case 'insufficient_evidence':
      default:
        return { label: 'Insufficient Evidence', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  const qualityBadge = getQualityBadge(analysis.reasoning_quality);

  return (
    <div className="rounded-2xl bg-surface-elevated border border-surface-border p-5 lg:p-6 shadow-2xl space-y-5">
      {/* Engine Source Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          {analysis.is_offline_fallback ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-amber-950/60 text-amber-300 border border-amber-500/40">
              <Cpu className="w-3 h-3 text-amber-400" />
              Verified Diagnostic Heuristic (Demo Mode)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
              <Cpu className="w-3 h-3 text-emerald-400" />
              Live Gemini 2.5 Flash Reasoning Analysis
            </span>
          )}
          <span className="text-xs text-slate-400 font-mono">
            Confidence: {Math.round(analysis.confidence * 100)}%
          </span>
        </div>

        {/* Score Change Badge */}
        {typeof scoreChange === 'number' && (
          <div
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              scoreChange >= 0
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/40'
                : 'bg-red-950/50 text-red-400 border-red-500/40'
            }`}
          >
            Mastery {scoreChange >= 0 ? `+${scoreChange}` : scoreChange} pts
          </div>
        )}
      </div>

      {/* Outcome Banner */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          isCorrect
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            : isMisconception
            ? 'bg-red-950/30 border-red-500/40 text-red-200'
            : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
        }`}
      >
        {isCorrect ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        ) : isMisconception ? (
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-heading font-bold text-base text-white">
              {isCorrect
                ? 'Accurate Conceptual Reasoning'
                : isMisconception
                ? `Specific Misconception Detected: ${analysis.misconception_title || 'Cognitive Confusion'}`
                : 'Incorrect Answer - Review Concept Foundations'}
            </h4>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${qualityBadge.color}`}>
              {qualityBadge.label}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {analysis.explanation}
          </p>
        </div>
      </div>

      {/* Reasoning & Evidence Comparison Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Student's reasoning & extracted evidence */}
        <div className="p-4 rounded-xl bg-background border border-surface-border space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-brand-cyan" />
            Your Submitted Reasoning
          </span>
          <p className="text-xs text-slate-200 italic bg-surface/60 p-2.5 rounded-lg border border-surface-border/50">
            &ldquo;{studentReasoning || studentAnswer}&rdquo;
          </p>

          {analysis.evidence.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono uppercase text-amber-400 block mb-1">
                Extracted Evidence Points:
              </span>
              <ul className="space-y-1">
                {analysis.evidence.map((ev, i) => (
                  <li key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-brand-violet font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Scientific Truth / Next Action */}
        <div className="p-4 rounded-xl bg-background border border-surface-border space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Pedagogical Next Action
          </span>
          <div className="p-2.5 rounded-lg bg-surface/60 border border-surface-border/50">
            <p className="text-xs font-semibold text-white mb-1">
              {analysis.next_learning_action}
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-400">Target Concept Nodes:</span>
              {analysis.recommended_concept_ids.map((cId) => (
                <span
                  key={cId}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-violet/20 border border-brand-violet/40 text-brand-violet"
                >
                  {cId}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-1 text-[11px] text-slate-400">
            <strong>Expected Answer:</strong> {expectedAnswer}
          </div>
        </div>
      </div>

      {/* Continue Action */}
      {onContinue && (
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
          >
            <span>{continueLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
