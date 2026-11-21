'use client';

import React, { useState } from 'react';
import { CONCEPTS } from '@/data/concepts';
import { LearnerProfile, Attempt } from '@/types/mastery';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Sparkles,
  Target
} from 'lucide-react';

interface MisconceptionViewProps {
  profile: LearnerProfile;
  onPracticeConcept: (conceptId: string) => void;
}

export const MisconceptionView: React.FC<MisconceptionViewProps> = ({
  profile,
  onPracticeConcept
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Filter student attempts with misconceptions
  const misconceptionAttempts = profile.attempts
    .slice()
    .reverse()
    .filter((a) => a.misconceptionDetected);

  const activeAttempt = misconceptionAttempts.find((a) => a.id === selectedAttemptId) || misconceptionAttempts[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-mastery-atRisk" />
              <h2 className="font-heading font-bold text-xl lg:text-2xl text-text-primary">
                Misconception Intelligence & Root-Cause Remediation
              </h2>
            </div>
            <p className="text-xs text-text-secondary mt-1 max-w-2xl">
              MEDHA isolates the precise reason behind mistakes by evaluating your written thought process, distinguishing genuine cognitive fallacies from unit conversion slips or math errors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-mastery-atRisk/15 border border-mastery-atRisk/30 text-mastery-atRisk font-bold">
              {misconceptionAttempts.length} Detected in History
            </span>
          </div>
        </div>
      </div>

      {misconceptionAttempts.length > 0 && activeAttempt ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Attempt History List */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-text-secondary block px-1">
              Evaluated Misconceptions
            </span>

            {misconceptionAttempts.map((att) => {
              const isSelected = activeAttempt.id === att.id;
              const status = att.misconceptionStatus || 'detected';

              return (
                <div
                  key={att.id}
                  onClick={() => setSelectedAttemptId(att.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-surface-elevated border-accent-primary shadow-neonPrimary'
                      : 'bg-surface border-outline-variant/30 hover:border-outline-variant/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-accent-primary">
                      {att.targetConceptIds.join(', ')}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        status === 'detected'
                          ? 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40'
                          : 'bg-mastery-learning/20 text-mastery-learning border-mastery-learning/40'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-text-primary line-clamp-1">
                    {att.misconceptionTitle || 'Conceptual confusion'}
                  </h4>

                  <p className="text-[11px] text-text-secondary line-clamp-2 italic">
                    &ldquo;{att.writtenReasoning}&rdquo;
                  </p>

                  <div className="text-[10px] text-text-secondary font-mono pt-1">
                    Confidence: {Math.round(att.confidence * 100)}% • {new Date(att.timestamp).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Remediation Card */}
          <div className="lg:col-span-8 bg-surface rounded-3xl border border-outline-variant/40 p-6 lg:p-8 space-y-6 shadow-xl">
            {/* Status & Confidence Badge */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border uppercase ${
                    (activeAttempt.misconceptionStatus || 'detected') === 'detected'
                      ? 'bg-mastery-atRisk/20 text-mastery-atRisk border-mastery-atRisk/40'
                      : 'bg-mastery-learning/20 text-mastery-learning border-mastery-learning/40'
                  }`}
                >
                  Status: {activeAttempt.misconceptionStatus || 'detected'}
                </span>
                <span className="text-xs font-mono text-text-secondary">
                  Diagnostic Confidence: {Math.round(activeAttempt.confidence * 100)}%
                </span>
              </div>

              <span className="text-xs font-mono text-accent-primary font-bold">
                Target Concepts: {activeAttempt.targetConceptIds.join(', ')}
              </span>
            </div>

            {/* Identified Misconception Title */}
            <div>
              <span className="text-[11px] font-mono uppercase text-mastery-atRisk block mb-1">
                Identified Cognitive Misconception
              </span>
              <h3 className="font-heading font-bold text-xl text-text-primary">
                {activeAttempt.misconceptionTitle}
              </h3>
              <p className="text-xs font-mono text-text-secondary mt-0.5">
                Code: {activeAttempt.misconceptionCode || 'COGNITIVE_ERROR'}
              </p>
            </div>

            {/* Student's reasoning & Highlighted problematic statements */}
            <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 space-y-2">
              <span className="text-xs font-mono uppercase text-accent-secondary flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Submitted Student Reasoning & Problematic Text
              </span>
              <p className="text-xs text-text-primary italic p-3 rounded-xl bg-surface/80 border border-outline-variant/20">
                &ldquo;{activeAttempt.writtenReasoning}&rdquo;
              </p>

              {activeAttempt.evidence && activeAttempt.evidence.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase text-mastery-atRisk block mb-1">
                    Problematic Excerpts Flagged by Diagnostic Engine:
                  </span>
                  <ul className="space-y-1">
                    {activeAttempt.evidence.map((ev, i) => (
                      <li key={i} className="text-xs text-mastery-atRisk flex items-start gap-2">
                        <span>•</span>
                        <span className="underline decoration-mastery-atRisk/60">{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Explanation of Error & Correct Physics Principle */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-elevated border border-outline-variant/30 space-y-1.5">
                <span className="text-[11px] font-mono uppercase text-text-secondary flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-mastery-atRisk" />
                  Why This Reasoning is Flawed
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeAttempt.explanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-elevated border border-mastery-mastered/40 space-y-1.5">
                <span className="text-[11px] font-mono uppercase text-mastery-mastered flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-mastery-mastered" />
                  Correct Physics Principle
                </span>
                <p className="text-xs text-text-primary leading-relaxed">
                  {activeAttempt.correctPrinciple ||
                    'Electric charge is strictly conserved. Voltage provides electrical pressure; charges deliver energy without being consumed.'}
                </p>
              </div>
            </div>

            {/* Actionable Next Step CTA */}
            <div className="p-4 rounded-2xl bg-surface-deep border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-accent-secondary">
                  Targeted Learning Action:
                </span>
                <p className="text-xs font-semibold text-text-primary">
                  {activeAttempt.nextLearningAction}
                </p>
              </div>

              <button
                onClick={() => onPracticeConcept(activeAttempt.targetConceptIds[0])}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-primaryContainer to-accent-secondaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-90 shrink-0 flex items-center gap-1.5"
              >
                <span>Practice Remediation Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-surface rounded-3xl border border-outline-variant/30 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-outline-variant/40 flex items-center justify-center text-accent-secondary mx-auto">
            <CheckCircle2 className="w-8 h-8 text-mastery-mastered" />
          </div>
          <h3 className="font-heading font-bold text-lg text-text-primary">
            No Active Misconceptions Detected
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Your evaluated attempts show sound reasoning or you have not yet completed the baseline diagnostic. Start the diagnostic to detect any latent conceptual misunderstandings.
          </p>
          <button
            onClick={() => onPracticeConcept('C01')}
            className="px-6 py-2.5 rounded-xl bg-accent-primaryContainer text-white text-xs font-bold shadow-neonPrimary hover:opacity-90"
          >
            Practice In Learning Workspace
          </button>
        </div>
      )}

      {/* Common Physics Misconception Catalog */}
      <section className="space-y-4 pt-4 border-t border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-accent-primary uppercase tracking-wider">
              CLASS 10 PHYSICS CURRICULUM
            </span>
            <h3 className="font-heading font-bold text-lg text-text-primary mt-0.5">
              Known Cognitive Misconception Taxonomy
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONCEPTS.flatMap((c) =>
            c.commonMisconceptions.map((m) => (
              <div
                key={m.code}
                className="p-4 rounded-2xl bg-surface border border-outline-variant/30 space-y-2 hover:border-accent-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] font-bold text-accent-primary px-2 py-0.5 rounded bg-surface-deep border border-outline-variant/30">
                    {c.code}
                  </span>
                  <span className="font-mono text-[10px] text-text-secondary">
                    {m.code}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-mastery-atRisk">
                  ⚠️ {m.title}
                </h4>
                <p className="text-xs text-text-secondary">
                  {m.description}
                </p>
                <p className="text-[11px] text-mastery-mastered font-medium pt-1">
                  <strong>Scientific Truth:</strong> {m.correction}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
